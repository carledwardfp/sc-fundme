import { ethers, getNamedAccounts } from "hardhat"
import { FundMe } from "../typechain-types"

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe: FundMe = await ethers.getContract("FundMe", deployer)
  console.log("\n----------------------------------------")
  console.log("Funding...")
  const tx = await fundMe.fund({ value: ethers.utils.parseEther("0.007") })
  await tx.wait(1)
  console.log("✅ Success!")
  console.log("----------------------------------------\n")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
