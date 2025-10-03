/* eslint-disable no-console */
const hre = require("hardhat");

async function main() {
  const { ethers, network } = hre;
  const name = network.name;
  console.log(`Network: ${name}`);

  const validatorsEnv = process.env.VALIDATORS || "";
  const validators = validatorsEnv
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

  if (validators.length !== 5) {
    throw new Error("Please provide 5 validators via VALIDATORS=addr1,addr2,addr3,addr4,addr5");
  }

  if (name === "pionezero") {
    const pioToken = process.env.PIO_TOKEN;
    if (!pioToken) throw new Error("PIO_TOKEN is required for pionezero deploy");
    const Lock = await ethers.getContractFactory("PIOLock");
    const lock = await Lock.deploy(pioToken, validators);
    await lock.deployed();
    console.log("PIOLock deployed:", lock.address);
  } else if (name === "goerli") {
    const Mint = await ethers.getContractFactory("PIOMint");
    const mint = await Mint.deploy(validators);
    await mint.deployed();
    console.log("PIOMint deployed:", mint.address);
  } else if (name === "hardhat") {
    console.log("Use deploy-local.js for local end-to-end");
  } else {
    throw new Error("Unsupported network for this deploy script");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


