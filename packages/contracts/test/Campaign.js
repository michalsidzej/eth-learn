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

  async function createCampaign(campaignCreator, payout = 10) {
    const ONE_HOUR_IN_SECS = 60 * 60
    const [parent, student] = await ethers.getSigners()

    const timestamp = await time.latest()

    await campaignCreator.createCampaign(
      student.address,
      100,
      timestamp + ONE_HOUR_IN_SECS,
      payout
    )

    const campaign = await campaignCreator.ownerToCampaignMapping(
      parent.address,
      0
    )
    const campaignId = campaign[0]

    return campaignId
  }

  describe("getWithdrawableAmount", async function() {
    it("returns 0 when no solutions", async function() {
      const campaignCreator = await deployCampaignCreator()
      const campaignId = await createCampaign(campaignCreator)

      const [_, student] = await ethers.getSigners()

      await expect(
        await campaignCreator.connect(student).getWithdrawableAmount(campaignId)
      ).to.equal(0)
    })

    it("return payout when 1 solution", async function() {
      const campaignCreator = await deployCampaignCreator()
      const payout = 10
      const campaignId = await createCampaign(campaignCreator, payout)

      const [_, student] = await ethers.getSigners()
      campaignCreator.connect(student).submitSolution(campaignId, "")

      await expect(
        await campaignCreator.connect(student).getWithdrawableAmount(campaignId)
      ).to.equal(payout)
    })
  })
})
