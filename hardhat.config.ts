// import "@nomicfoundation/hardhat-toolbox"
import "@typechain/hardhat"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-ethers"
import "@nomicfoundation/hardhat-chai-matchers"

import "hardhat-gas-reporter"
import "hardhat-deploy"
import "solidity-coverage"
import "dotenv/config"
import { HardhatUserConfig } from "hardhat/config"

import "./tasks/block-number"

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || ""
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY || ""

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.6.6",
      },
    ],
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
      chainId: 5, // https://chainlist.org
    },
    localhost: {
      url: `http://127.0.0.1:8545/`,
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    // coinmarketcap: process.env.COINMARKETCAP_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      // 31337: 0
    },
    user: {
      default: 1,
    },
  },
}

export default config
