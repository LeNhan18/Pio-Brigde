/* eslint-disable no-console */
const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  const [deployer, v1, v2, v3, v4, v5, user] = await ethers.getSigners();
  const validators = [v1.address, v2.address, v3.address, v4.address, v5.address];

  console.log("🚀 Deploying to local Hardhat network...");
  console.log(`📝 Deployer: ${deployer.address}`);
  console.log(`👥 Validators: ${validators.join(", ")}`);

  // Deploy MockPIO
  const Mock = await ethers.getContractFactory("MockPIO");
  const mock = await Mock.deploy("PZO", "PZO");
  await mock.deployed();
  console.log("✅ MockPIO deployed:", mock.address);

  // Mint PZO for user
  await mock.mint(user.address, ethers.utils.parseEther("1000"));
  console.log("💰 Minted 1000 PZO for user:", user.address);

  // Deploy PIOLock
  const Lock = await ethers.getContractFactory("PIOLock");
  const lock = await Lock.deploy(mock.address, validators);
  await lock.deployed();
  console.log("✅ PIOLock deployed:", lock.address);

  // Deploy PIOMint
  const Mint = await ethers.getContractFactory("PIOMint");
  const mint = await Mint.deploy(validators);
  await mint.deployed();
  console.log("✅ PIOMint deployed:", mint.address);

  console.log("\n🎉 Local deployment completed!");
  console.log("📋 Contract Addresses:");
  console.log(`   MockPIO: ${mock.address}`);
  console.log(`   PIOLock: ${lock.address}`);
  console.log(`   PIOMint: ${mint.address}`);
  
  console.log("\n💡 Next steps:");
  console.log("1. Update webapp/.env.local with these addresses");
  console.log("2. Test bridge functionality");
}

main().catch((e) => {
  console.error("❌ Deployment failed:", e);
  process.exit(1);
});
