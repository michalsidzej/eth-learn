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
  mapping (uint256 => Solution[]) public idToSolutionMapping;

  constructor() {}

  function createCampaign(address student, uint256 amount, uint256 untilTimestamp, uint256 payout) public {
    Params memory params = Params(amount, untilTimestamp, payout);
    Campaign memory campaign = Campaign(id, student, params);
    ownerToCampaignMapping[msg.sender].push(campaign); 
    idToCampaignMapping[id] = campaign;
    id++;
  }

  function submitSolution(uint256 campaignId, string memory ipfsHash) public {
    Solution memory solution = Solution(ipfsHash);
    idToSolutionMapping[campaignId].push(solution);
  }
}