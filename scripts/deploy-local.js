/* eslint-disable no-console */
const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  const [deployer, v1, v2, v3, v4, v5, user] = await ethers.getSigners();
  const validators = [v1.address, v2.address, v3.address, v4.address, v5.address];

  const Mock = await ethers.getContractFactory("MockPIO");
  const mock = await Mock.deploy("PIO", "PIO");
  await mock.deployed();
  console.log("MockPIO:", mock.address);

  // Mint cho user để test
  await mock.mint(user.address, ethers.utils.parseEther("1000"));

  const Lock = await ethers.getContractFactory("PIOLock");
  const lock = await Lock.deploy(mock.address, validators);
  await lock.deployed();
  console.log("PIOLock:", lock.address);

  const Mint = await ethers.getContractFactory("PIOMint");
  const mint = await Mint.deploy(validators);
  await mint.deployed();
  console.log("PIOMint:", mint.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


