import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { developmentChains, networkConfig } from "../helper-hardhat.config"
import { verify } from "../utils/verify"

const deployFundMe: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, get, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId: number = network.config.chainId!

  let ethUsdPriceFeedAddress: string
  // if in local development, mock the aggregator
  if (chainId === 31337) {
    const ethUsdAggregator = await get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!
  }

  log("\n----------------------------------------")
  const args = [ethUsdPriceFeedAddress]
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })
  const isDev = developmentChains.includes(network.name)
  log(
    `✅ FundMe deployed using ${
      isDev ? "Mock Aggregator" : `${network.name} Aggregator`
    } (${ethUsdPriceFeedAddress})`
  )
  log("----------------------------------------\n")

  if (!isDev && process.env.ETHERSCAN_KEY) {
    log("\n----------------------------------------")
    log("Verifying Contract...")
    await verify(fundMe.address, args)
    log("----------------------------------------\n")
  }
}

export default deployFundMe
deployFundMe.tags = ["all", "fundMe"]
