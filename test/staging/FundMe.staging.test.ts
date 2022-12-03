import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat.config"
import { FundMe } from "../../typechain-types"

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe: FundMe
      let deployer: SignerWithAddress

      const ETHER_AMOUNT = 0.0079
      const sendAmount = ethers.utils.parseEther(ETHER_AMOUNT.toString())

      beforeEach(async function () {
        const signers = await ethers.getSigners()
        deployer = signers[0]
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it(`allows people to fund and withdraw`, async function () {
        await fundMe.fund({ value: sendAmount })
        await fundMe.withdraw()

        const finalBalance = await fundMe.provider.getBalance(fundMe.address)
        expect(finalBalance.toString()).to.equal("0")
      })
    })
