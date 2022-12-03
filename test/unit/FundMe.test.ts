import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { deployments, ethers, network } from "hardhat"
import { developmentChains, INITIAL_ANSWER } from "../../helper-hardhat.config"
import { FundMe, MockV3Aggregator } from "../../typechain-types"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let mockV3Aggregator: MockV3Aggregator
      let fundMe: FundMe
      let deployer: SignerWithAddress
      let user: SignerWithAddress

      const ETHER_AMOUNT = 1
      const sendAmount = ethers.utils.parseEther(ETHER_AMOUNT.toString())

      beforeEach(async function () {
        // run all deployments from 'deploy/*'
        await deployments.fixture(["all"])
        // get most recent contracts
        fundMe = await ethers.getContract("FundMe")
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")

        const signers = await ethers.getSigners()
        deployer = signers[0]
        user = signers[1]
      })

      describe("constructor", async function () {
        it(`should set the 'i_owner' to the deployer's address`, async function () {
          const owner = await fundMe.getOwner()
          expect(owner).to.equal(deployer.address)
        })

        it(`should set the price feed address to the mock's address`, async function () {
          const priceFeed = await fundMe.getPriceFeed()
          expect(priceFeed).to.equal(mockV3Aggregator.address)
        })
      })

      describe("fund", async function () {
        it(`should fail if not enough ETH is sent`, async function () {
          await expect(fundMe.fund()).to.be.revertedWithCustomError(
            fundMe,
            "FundMe__NotEnoughEther"
          )
        })

        it(`should add the funder to 's_funders' if new`, async function () {
          await fundMe.fund({ value: sendAmount })
          await fundMe.connect(user).fund({ value: sendAmount })
          const funderAddress = await fundMe.getFunder("1")
          expect(funderAddress).to.equal(user.address)
        })

        it(`should not add the funder to 's_funders' if already exists`, async function () {
          await fundMe.fund({ value: sendAmount })
          await fundMe.fund({ value: sendAmount })
          await expect(fundMe.getFunder("1")).to.be.reverted
        })

        it(`should return the total amount funded - (once)`, async function () {
          await fundMe.fund({ value: sendAmount })
          const amount = await fundMe.getAmountFunded(deployer.address)
          expect(amount).to.equal(sendAmount)
        })

        it(`should return the total amount funded - (twice)`, async function () {
          await fundMe.fund({ value: sendAmount })
          await fundMe.fund({ value: sendAmount })
          const amount = await fundMe.getAmountFunded(deployer.address)
          expect(amount).to.equal(sendAmount.mul(2))
        })
      })

      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendAmount })
        })

        it(`should not allow other users to call withdraw`, async function () {
          await fundMe.withdraw()
          await expect(
            fundMe.connect(user).withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__Unauthorized")
        })

        it(`should reset the 's_funderToAmountFunded' state`, async function () {
          await fundMe.withdraw()
          const amount = await fundMe.getAmountFunded(deployer.address)
          expect(amount.toString()).to.equal("0")
        })

        it(`should reset the 's_funders' state`, async function () {
          await fundMe.withdraw()
          await expect(fundMe.getFunder("0")).to.be.reverted
        })

        it(`should withdraw the whole balance`, async function () {
          const initialFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const initialDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          )

          const tx = await fundMe.withdraw()
          const txReceipt = await tx.wait()

          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const newFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const newDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          )
          const deployerBalance = initialDeployerBalance
            .add(initialFundMeBalance)
            .sub(gasCost)

          expect(newDeployerBalance).to.equal(deployerBalance)
          expect(newFundMeBalance.toString()).to.equal("0")
        })

        it(`allows withdraw from multiple funders`, async function () {
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 5; i++) {
            const fundMeConnected = fundMe.connect(accounts[i])
            await fundMeConnected.fund({ value: sendAmount })
          }
          const initialFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const initialDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          )

          const tx = await fundMe.withdraw()
          const txReceipt = await tx.wait()

          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const newFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const newDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          )
          const deployerBalance = initialDeployerBalance
            .add(initialFundMeBalance)
            .sub(gasCost)

          expect(newDeployerBalance).to.equal(deployerBalance)
          expect(newFundMeBalance.toString()).to.equal("0")

          await expect(fundMe.getFunder(0)).to.be.reverted
          for (let i = 1; i < 5; i++) {
            const amount = await fundMe.getAmountFunded(accounts[i].address)
            expect(amount.toString()).to.equal("0")
          }
        })
      })

      describe("getCurrentPrice", async function () {
        it(`should return the current price of ETH`, async function () {
          const price = await fundMe.getCurrentPrice()
          expect(price.toString()).to.equal(INITIAL_ANSWER.toString())
        })
      })

      describe("get funders length", async function () {
        it(`should return the correct number of funders - (deployer only - once)`, async function () {
          await fundMe.fund({ value: sendAmount })
          const length = await ethers.provider.getStorageAt(fundMe.address, 0)
          const fundersLength = parseInt(length, 16)
          expect(fundersLength).to.equal(1)
        })

        it(`should return the correct number of funders - (deployer only - twice)`, async function () {
          await fundMe.fund({ value: sendAmount })
          await fundMe.fund({ value: sendAmount })
          const length = await ethers.provider.getStorageAt(fundMe.address, 0)
          const fundersLength = parseInt(length, 16)
          expect(fundersLength).to.equal(1)
        })

        it(`should return the correct number of funders - (deployer and user)`, async function () {
          await fundMe.fund({ value: sendAmount })
          await fundMe.connect(user).fund({ value: sendAmount })
          const length = await ethers.provider.getStorageAt(fundMe.address, 0)
          const fundersLength = parseInt(length, 16)
          expect(fundersLength).to.equal(2)
        })
      })

      // for `hardhat coverage` only
      describe(`receive`, async function () {
        it(`should call fund function`, async function () {
          await deployer.sendTransaction({
            to: fundMe.address,
            value: sendAmount,
          })
        })
      })

      // for `hardhat coverage` only
      describe(`fallback`, async function () {
        it(`should call fund function`, async function () {
          await deployer.sendTransaction({
            to: fundMe.address,
            value: sendAmount,
            data: "0x00",
          })
        })
      })
    })
