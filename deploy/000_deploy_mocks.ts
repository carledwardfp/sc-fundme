import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import {
  DECIMALS,
  INITIAL_ANSWER,
  developmentChains,
} from "../helper-hardhat.config"

const deployMocks: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  if (developmentChains.includes(network.name)) {
    log("\n----------------------------------------")
    log("🛠️ Local network detected...")
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    })
    log("✅ Mocks deployed")
    log("----------------------------------------\n")
  }
}

export default deployMocks
deployMocks.tags = ["all", "mocks"]
