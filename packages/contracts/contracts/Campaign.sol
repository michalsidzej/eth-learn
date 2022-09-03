// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;
import "hardhat/console.sol";

contract CampaignCreator {
    uint256 private id;

    struct Params {
        uint256 balance;
        uint256 untilTimestamp;
        uint256 payout;
    }

    struct Campaign {
        uint256 id;
        address parent;
        address payable student;
        Params params;
    }

    struct Solution {
        string ipfsHash;
        bool isCancelled;
        bool isWithdrawn;
    }

    mapping(address => Campaign[]) public ownerToCampaignMapping;
    mapping(uint256 => Campaign) public idToCampaignMapping;

    mapping(uint256 => Solution[]) public idToSolutionsMapping;
    mapping(uint256 => uint256) public idToWithdrawed;

    constructor() {}

    function createCampaign(
        address payable student,
        uint256 untilTimestamp,
        uint256 payout
    ) public payable {
        Params memory params = Params(msg.value, untilTimestamp, payout);
        Campaign memory campaign = Campaign(id, msg.sender, student, params);
        ownerToCampaignMapping[msg.sender].push(campaign);
        idToCampaignMapping[id] = campaign;
        idToSolutionsMapping[id] = [];
        id++;
    }

    function submitSolution(uint256 campaignId, string memory ipfsHash)
        public
        returns (uint256 id)
    {
        id = idToSolutionsMapping[campaignId].length;
        Solution memory solution = Solution(ipfsHash, false, false);
        idToSolutionsMapping[campaignId].push(solution);

        Campaign memory campaign = idToCampaignMapping[campaignId];
        uint256 solutionsAmount = idToSolutionsMapping[campaignId].length;

        require(
            campaign.params.balance >= solutionsAmount * campaign.params.payout,
            "No funds left on the campaign"
        );
    }

    function withdraw(uint256 campaignId, uint256[] memory solutionIds)
        public
        onlyExistingSolutionIds(campaignId, solutionIds)
    {
        Solution[] memory solutions = idToSolutionsMapping[campaignId];

        for (uint256 id; id < solutions.length; id++) {
            if (
                solutions[id].isCancelled == true &&
                solutions[id].isWithdrawn == false
            ) {
                revert("Cannot withdraw, there is a cancelled solution");
            }
        }

        Campaign memory campaign = idToCampaignMapping[campaignId];
        uint256 toWithdraw = 0;
        for (uint256 id = 0; id < solutionIds.length; id++) {
            uint256 solutionId = solutionIds[id];
            require(
                idToSolutionsMapping[campaignId][solutionId].isCancelled !=
                    true,
                "Cannot withdraw cancelled solution"
            );
            idToSolutionsMapping[campaignId][solutionId].isWithdrawn = true;
            toWithdraw += campaign.params.payout;
        }
        campaign.params.balance -= toWithdraw;
        campaign.student.transfer(toWithdraw);
    }

    function cancelSolution(uint256 campaignId, uint256 solutionId)
        public
        onlyExistingId(campaignId, solutionId)
    {
        Campaign memory campaign = idToCampaignMapping[campaignId];
        require(
            msg.sender == campaign.parent,
            "Only parent can cancel solution"
        );

        idToSolutionsMapping[campaignId][solutionId].isCancelled = true;
    }

    function resolveCancelled(uint256 campaignId, uint256[] memory solutionIds)
        public
        payable
        onlyExistingSolutionIds(campaignId, solutionIds)
    {
        Campaign memory campaign = idToCampaignMapping[campaignId];
        uint256 resolveAmount = solutionIds.length * campaign.params.payout;
        require(
            msg.value == resolveAmount,
            "Too little or too much ether provided to resolve those solutions"
        );

        campaign.params.balance += resolveAmount;

        for (uint256 id = 0; id < solutionIds.length; id++) {
            uint256 solutionId = solutionIds[id];
            idToSolutionsMapping[campaignId][solutionId].isWithdrawn = true;
        }
    }

    modifier onlyExistingSolutionIds(
        uint256 campaignId,
        uint256[] memory solutionIds
    ) {
        uint256 maxIndex = idToSolutionsMapping[campaignId].length - 1;
        for (uint256 id = 0; id < solutionIds.length; id++) {
            require(
                solutionIds[id] <= maxIndex,
                "Provided solutionIds include non-exisitng ID"
            );
        }
        _;
    }

    modifier onlyExistingId(uint256 campaignId, uint256 solutionId) {
        uint256 maxIndex = idToSolutionsMapping[campaignId].length - 1;
        require(
            solutionId <= maxIndex,
            "Solution with given ID does not exist"
        );
        _;
    }
}
