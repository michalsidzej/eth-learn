const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("CampaignCreator", function() {
  async function deployCampaignCreator() {
    const CampaignCreator = await ethers.getContractFactory("CampaignCreator");
    const campaignCreator = await CampaignCreator.deploy();
    return campaignCreator;
  }

  async function createCampaign(campaignCreator, payout = 10) {
    const ONE_HOUR_IN_SECS = 60 * 60;
    const [parent, student] = await ethers.getSigners();

    const timestamp = await time.latest();

    await campaignCreator.createCampaign(
      student.address,
      timestamp + ONE_HOUR_IN_SECS,
      payout,
      { value: 10 }
    );

    const campaign = await campaignCreator.ownerToCampaignMapping(
      parent.address,
      0
    );
    const campaignId = campaign[0];

    return campaignId;
  }

  describe("createCampaign", function() {
    it("deposits ether", async function() {
      const [owner, student] = await ethers.getSigners();

      const campaignCreator = await deployCampaignCreator();

      await expect(
        campaignCreator.createCampaign(
          student.address,
          await time.latest(),
          10,
          {
            value: 10,
          }
        )
      ).to.changeEtherBalance(owner, -10);
    });
  });

  describe("withdraw", async function() {
    it("withdraws ether", async function() {
      const campaignCreator = await deployCampaignCreator();
      const payout = 1;
      const campaignId = await createCampaign(campaignCreator, payout);
      const [parent, student] = await ethers.getSigners();

      await campaignCreator.connect(student).submitSolution(campaignId, "FILE");
      await campaignCreator.connect(student).submitSolution(campaignId, "FILE");
      await campaignCreator.connect(student).submitSolution(campaignId, "FILE");

      await expect(
        campaignCreator.connect(student).withdraw(campaignId, [0, 1, 2])
      ).to.changeEtherBalance(student, 3);
    });

    it("throws if solution does not exist", async function() {
      const campaignCreator = await deployCampaignCreator();
      const payout = 1;
      const campaignId = await createCampaign(campaignCreator, payout);
      const [parent, student] = await ethers.getSigners();

      await expect(
        campaignCreator.connect(student).withdraw(campaignId, [69, 420])
      ).to.be.revertedWith("Provided solutionIds include non-exisitng ID");
    })
  });

  describe("cancelSolution", async function() {
    it("student cannot withdraw when having cancelled solution", async function() {
      const campaignCreator = await deployCampaignCreator();
      const payout = 1;
      const campaignId = await createCampaign(campaignCreator, payout);
      const [parent, student] = await ethers.getSigners();

      await campaignCreator
        .connect(student)
        .submitSolution(campaignId, "HASH_OF_FAKE_FILE");

      await campaignCreator.connect(parent).cancelSolution(campaignId, 0);

      await expect(
        campaignCreator.connect(student).withdraw(campaignId, [])
      ).to.be.revertedWith("Cannot withdraw, there is a cancelled solution");
    });

    it("only parent can cancel", async function() {
      const campaignCreator = await deployCampaignCreator();
      const payout = 1;
      const campaignId = await createCampaign(campaignCreator, payout);
      const [parent, student] = await ethers.getSigners();

      await campaignCreator
        .connect(student)
        .submitSolution(campaignId, "HASH_OF_FAKE_FILE");

      await expect(
        campaignCreator.connect(student).cancelSolution(campaignId, 0)
      ).to.be.revertedWith("Only parent can cancel solution");
    });
  });

  describe("resolveCancelled", async function() {
    it("can withdraw other funds after repayments", async function() {
      const campaignCreator = await deployCampaignCreator();
      const payout = 1;
      const campaignId = await createCampaign(campaignCreator, payout);
      const [parent, student] = await ethers.getSigners();

      await campaignCreator
        .connect(student)
        .submitSolution(campaignId, "HASH_OF_FAKE_FILE");
      await campaignCreator
        .connect(student)
        .submitSolution(campaignId, "CORRECT_FILE");
      await campaignCreator
        .connect(student)
        .submitSolution(campaignId, "CORRECT_FILE");

      await campaignCreator.connect(parent).cancelSolution(campaignId, 0);

      await campaignCreator
        .connect(student)
        .resolveCancelled(campaignId, [0], { value: 1 });

      await expect(
        campaignCreator.connect(student).withdraw(campaignId, [1, 2])
      ).to.changeEtherBalance(student, 2);
    });

    it("cannot withdraw cancelled after repayment", async function() {
      const campaignCreator = await deployCampaignCreator();
      const payout = 1;
      const campaignId = await createCampaign(campaignCreator, payout);
      const [parent, student] = await ethers.getSigners();

      await campaignCreator
        .connect(student)
        .submitSolution(campaignId, "HASH_OF_FAKE_FILE");
      await campaignCreator
        .connect(student)
        .submitSolution(campaignId, "CORRECT_FILE");
      await campaignCreator
        .connect(student)
        .submitSolution(campaignId, "CORRECT_FILE");

      await campaignCreator.connect(parent).cancelSolution(campaignId, 0);

      await campaignCreator
        .connect(student)
        .resolveCancelled(campaignId, [0], { value: 1 });

      await expect(
        campaignCreator.connect(student).withdraw(campaignId, [0, 1, 2])
      ).to.be.revertedWith("Cannot withdraw cancelled solution");
    });
  });
});
