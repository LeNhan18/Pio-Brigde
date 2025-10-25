/* eslint-disable no-console */
const hre = require("hardhat");

async function main() {
  const { ethers, network } = hre;
  const name = network.name;
  console.log(` Deploying SimpleUSDT to ${name} testnet...`);

  // Get deployer account
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    console.log(" No signers found. Check your private key in .env file");
    process.exit(1);
  }
  const deployer = signers[0];
  console.log(` Deploying with account: ${deployer.address}`);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(` Account balance: ${ethers.formatEther(balance)} ETH`);

  console.log(" Deploying SimpleUSDT...");
  
  const SimpleUSDT = await ethers.getContractFactory("SimpleUSDT");
  const usdt = await SimpleUSDT.deploy();
  await usdt.waitForDeployment();
  const contractAddress = await usdt.getAddress();
  
  console.log("SimpleUSDT deployed successfully!");
  
  // Display deployment results
  console.log("\n Deployment Summary:");
  console.log(` Network: ${name}`);
  console.log(` Contract: SimpleUSDT`);
  console.log(` Address: ${contractAddress}`);
  console.log(` Deployer: ${deployer.address}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: name,
    contract: "SimpleUSDT",
    address: contractAddress,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
  };

  console.log("\n Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main().catch((e) => {
  console.error("❌ Deployment failed:", e);
  process.exit(1);
});
