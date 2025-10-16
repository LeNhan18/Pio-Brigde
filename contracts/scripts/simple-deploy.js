const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting simple deployment...");
  
  // Get signers
  const signers = await ethers.getSigners();
  console.log("📝 Signers found:", signers.length);
  
  if (signers.length === 0) {
    console.log("❌ No signers found");
    return;
  }
  
  const deployer = signers[0];
  console.log("📝 Deploying with account:", deployer.address);
  
  // Get balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  // Try to get contract factory
  try {
    console.log("🔍 Looking for PIOLock contract...");
    const PIOLock = await ethers.getContractFactory("PIOLock");
    console.log("✅ PIOLock contract found");
    
    // Deploy with dummy values
    const validators = [
      deployer.address,
      deployer.address, 
      deployer.address,
      deployer.address,
      deployer.address
    ];
    
    console.log("🔒 Deploying PIOLock...");
    const lock = await PIOLock.deploy("0x0000000000000000000000000000000000000000", validators);
    await lock.waitForDeployment();
    
    const address = await lock.getAddress();
    console.log("✅ PIOLock deployed to:", address);
    
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
