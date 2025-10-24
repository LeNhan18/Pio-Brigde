require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { PRIVATE_KEY, RPC_PIONE_ZERO, RPC_SEPOLIA } = process.env;

// Fallback private key if env not loaded
const FALLBACK_PRIVATE_KEY = "de74617a549774e8bddf79621ba71ce7b3d600bab0a2ce814d0510fddb88e65d";
const FALLBACK_VALIDATORS = "0xc8772666Ef3114032189A3248DaC177ED2995D45,0xc8772666Ef3114032189A3248DaC177ED2995D45,0xc8772666Ef3114032189A3248DaC177ED2995D45,0xc8772666Ef3114032189A3248DaC177ED2995D45,0xc8772666Ef3114032189A3248DaC177ED2995D45";

const privateKey = PRIVATE_KEY || FALLBACK_PRIVATE_KEY;
const validators = (PRIVATE_KEY ? process.env.VALIDATORS : FALLBACK_VALIDATORS) || FALLBACK_VALIDATORS;

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
      accounts: [privateKey]
    },
    sepolia: {
      url: RPC_SEPOLIA || "https://sepolia.gateway.tenderly.co",
      chainId: 11155111,
      accounts: [privateKey]
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
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
