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
  }

  mapping (address => Campaign[]) public ownerToCampaignMapping;
  mapping (uint256 => Campaign) public idToCampaignMapping;

  mapping (uint256 => Solution[]) public idToSolutionsMapping;
  mapping (uint256 => uint256) public idToWithdrawed;

  constructor() {}

  function createCampaign(address payable student, uint256 untilTimestamp, uint256 payout) public payable {
    Params memory params = Params(msg.value, untilTimestamp, payout);
    Campaign memory campaign = Campaign(id, msg.sender, student, params);
    ownerToCampaignMapping[msg.sender].push(campaign); 
    idToCampaignMapping[id] = campaign;
    id++;
  }

  function submitSolution(uint256 campaignId, string memory ipfsHash) public returns(uint256 id) {
    id = idToSolutionsMapping[campaignId].length;
    Solution memory solution = Solution(ipfsHash, false);
    idToSolutionsMapping[campaignId].push(solution);

    Campaign memory campaign = idToCampaignMapping[campaignId];
    uint256 solutionsAmount = idToSolutionsMapping[campaignId].length;

    require(campaign.params.balance >= solutionsAmount * campaign.params.payout, 'No funds left on the campaign');
  }

  function getWithdrawableAmount(uint256 campaignId) public view returns(uint256 amount) {
    Campaign memory campaign = idToCampaignMapping[campaignId];
    require(campaign.params.untilTimestamp >= block.timestamp, 'Your campaign expired');

    uint256 solutionsAmount = idToSolutionsMapping[campaignId].length;
    uint256 withdrawed = idToWithdrawed[campaignId];

    amount = solutionsAmount * campaign.params.payout - withdrawed;
  }

  function withdraw(uint256 campaignId) public {
    Solution[] memory solutions = idToSolutionsMapping[campaignId];

    for(uint256 id; id < solutions.length; id++) {
      require(solutions[id].isCancelled != true, 'Cannot withdraw, there is a cancelled solution');
    }
    uint256 withdrawableAmount = getWithdrawableAmount(campaignId);
    idToWithdrawed[campaignId] += withdrawableAmount;

    Campaign memory campaign = idToCampaignMapping[campaignId];
    campaign.student.transfer(withdrawableAmount);  
  }

  function cancelSolution(uint256 campaignId, uint256 solutionId) public {
    Campaign memory campaign =  idToCampaignMapping[campaignId];
    require(msg.sender == campaign.parent, 'Only parent can cancel solution');

    idToSolutionsMapping[campaignId][solutionId].isCancelled = true;
  }
}