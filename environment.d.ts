declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ALCHEMY_API_KEY: string
      GOERLI_PRIVATE_KEY: string
      ETHERSCAN_KEY: string
      COINMARKETCAP_KEY: string

      // default
      NODE_ENV: "development" | "production"
      PORT?: string
      PWD: string
    }
  }
}

export {}
