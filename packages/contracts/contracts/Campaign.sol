// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

contract CampaignCreator {
  uint256 private id;

  struct Params {
    uint256 balance;
    uint256 untilTimestamp;
    uint256 payout;
  }
  
  struct Campaign {
    uint256 id;
    address student;
    Params params;
  }

  struct Solution {
    string ipfsHash;
  }

  mapping (address => Campaign[]) public ownerToCampaignMapping;
  mapping (uint256 => Campaign) public idToCampaignMapping;

  mapping (uint256 => Solution[]) public idToSolutionsMapping;
  mapping (uint256 => uint256) public idToSolutionWithdrawalsAmountMapping;

  constructor() {}

  function createCampaign(address student, uint256 amount, uint256 untilTimestamp, uint256 payout) public  {
    Params memory params = Params(amount, untilTimestamp, payout);
    Campaign memory campaign = Campaign(id, student, params);
    ownerToCampaignMapping[msg.sender].push(campaign); 
    idToCampaignMapping[id] = campaign;
    id++;
  }

  function submitSolution(uint256 campaignId, string memory ipfsHash) public {
    Solution memory solution = Solution(ipfsHash);
    idToSolutionsMapping[campaignId].push(solution);
  }

  function getWithdrawableAmount(uint256 campaignId) public view returns(uint256 amount) {
    Campaign memory campaign = idToCampaignMapping[campaignId];
    require(campaign.student == msg.sender, 'You are not a student of this campaign');
    require(campaign.params.untilTimestamp >= block.timestamp, 'Your campaign expired');

    uint256 solutionsAmount = idToSolutionsMapping[campaignId].length;
    uint256 withdrawedSolutions = idToSolutionWithdrawalsAmountMapping[campaignId];

    amount = (solutionsAmount - withdrawedSolutions) * campaign.params.payout;
  }
}