import { ethers, getNamedAccounts } from "hardhat"
import { FundMe } from "../typechain-types"

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe: FundMe = await ethers.getContract("FundMe", deployer)
  console.log("\n----------------------------------------")
  console.log("Withdrawing...")
  const tx = await fundMe.withdraw()
  await tx.wait(1)
  console.log("✅ Success!")
  console.log("----------------------------------------\n")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
