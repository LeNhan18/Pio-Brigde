require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { PRIVATE_KEY, RPC_PIONE_ZERO, RPC_GOERLI } = process.env;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    pionezero: {
      url: RPC_PIONE_ZERO || "https://rpc.zeroscan.org",
      chainId: 5080,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    goerli: {
      url: RPC_GOERLI || "https://rpc.ankr.com/eth_goerli",
      chainId: 5,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY || "",
      pionezero: "dummy" // ZeroScan doesn't need API key
    },
    customChains: [
      {
        network: "pionezero",
        chainId: 5080,
        urls: {
          apiURL: "https://zeroscan.org/api",
          browserURL: "https://zeroscan.org"
        }
      }
    ]
  }
};
