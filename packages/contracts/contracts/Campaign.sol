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

  mapping (address => Campaign[]) public campaignMapping;

  constructor() {}

  function createCampaign(address student, uint256 amount, uint256 untilTimestamp, uint256 payout) public {
    Params memory params = Params(amount, untilTimestamp, payout);
    campaignMapping[msg.sender].push(Campaign(id, student, params)); 
  }
}