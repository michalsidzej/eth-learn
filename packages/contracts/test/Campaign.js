const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")
const { expect } = require("chai")

describe("CampaignCreator", function() {
  async function deployCampaignCreator() {
    const CampaignCreator = await ethers.getContractFactory("CampaignCreator")
    const campaignCreator = await CampaignCreator.deploy()
    return campaignCreator
  }

  describe("getWithdrawableAmount", async function() {
    it("returns 0 when no solutions", async function() {
      const ONE_HOUR_IN_SECS = 60 * 60

      const campaignCreator = await deployCampaignCreator()
      const [parent, student] = await ethers.getSigners()
      const timestamp = await time.latest()

      await campaignCreator.createCampaign(
        student.address,
        100,
        timestamp + ONE_HOUR_IN_SECS,
        10
      )

      const campaign = await campaignCreator.ownerToCampaignMapping(
        parent.address,
        0
      )
      const campaignId = campaign[0]

      await expect(
        await campaignCreator.connect(student).getWithdrawableAmount(campaignId)
      ).to.equal(0)
    })
  })
})
