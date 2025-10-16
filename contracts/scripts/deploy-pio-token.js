const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying PIO Token to Pione Zero...");
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Get balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  // Deploy SimplePIO
  console.log("🪙 Deploying SimplePIO token...");
  const SimplePIO = await ethers.getContractFactory("SimplePIO");
  const pioToken = await SimplePIO.deploy();
  await pioToken.waitForDeployment();
  
  const address = await pioToken.getAddress();
  console.log("✅ SimplePIO deployed to:", address);
  
  // Get token info
  const name = await pioToken.name();
  const symbol = await pioToken.symbol();
  const totalSupply = await pioToken.totalSupply();
  
  console.log("\n📋 Token Info:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Total Supply:", ethers.formatEther(totalSupply), symbol);
  console.log("Owner:", deployer.address);
  
  console.log("\n💡 Update your .env file:");
  console.log(`PIO_TOKEN=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
