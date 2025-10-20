/* eslint-disable no-console */
const hre = require("hardhat");

async function main() {
  const { ethers, network } = hre;
  const name = network.name;
  console.log(`🚀 Deploying to ${name} testnet...`);

  // Get deployer account
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    console.log("❌ No signers found. Check your private key in .env file");
    process.exit(1);
  }
  const deployer = signers[0];
  console.log(`📝 Deploying with account: ${deployer.address}`);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  // Check if we have enough balance
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance! Make sure you have enough ETH for deployment.");
  }

  // Get validators from environment or use fallback
  const validatorsEnv = process.env.VALIDATORS || "0xc8772666Ef3114032189A3248DaC177ED2995D45,0x1234567890123456789012345678901234567890,0x2345678901234567890123456789012345678901,0x3456789012345678901234567890123456789012,0x4567890123456789012345678901234567890123";
  const validators = validatorsEnv
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

  if (validators.length !== 5) {
    console.log("❌ Please provide 5 validators via VALIDATORS=addr1,addr2,addr3,addr4,addr5");
    console.log("💡 Example: VALIDATORS=0x123...,0x456...,0x789...,0xabc...,0xdef...");
    process.exit(1);
  }

  console.log(`👥 Validators: ${validators.join(", ")}`);

  let contractAddress;
  let contractName;

  if (name === "pionezero") {
    // Deploy PIOLock on Pione Zero
    const pioToken = process.env.PIO_TOKEN || "0xdc2436650c1Ab0767aB0eDc1267a219F54cf7147";
    if (pioToken === "0xdc2436650c1Ab0767aB0eDc1267a219F54cf7147") {
      console.log("⚠️  Using zero address for PIO_TOKEN (for testing only)");
      console.log("💡 Update PIO_TOKEN with real address for production");
    }

    console.log(`🔒 Deploying PIOLock with PIO token: ${pioToken}`);
    
    const Lock = await ethers.getContractFactory("PIOLock");
    const lock = await Lock.deploy(pioToken, validators);
    await lock.waitForDeployment();
    
    contractAddress = await lock.getAddress();
    contractName = "PIOLock";
    
    console.log("✅ PIOLock deployed successfully!");
    
  } else if (name === "mumbai") {
    // Deploy PIOMint on Mumbai
    console.log("🪙 Deploying PIOMint...");
    
    const Mint = await ethers.getContractFactory("PIOMint");
    const mint = await Mint.deploy(validators);
    await mint.waitForDeployment();
    
    contractAddress = await mint.getAddress();
    contractName = "PIOMint";
    
    console.log("✅ PIOMint deployed successfully!");
    
  } else {
    console.log("❌ Unsupported network for deployment");
    console.log("💡 Supported networks: pionezero, sepolia");
    process.exit(1);
  }

  // Display deployment results
  console.log("\n🎉 Deployment Summary:");
  console.log(`📋 Network: ${name}`);
  console.log(`📋 Contract: ${contractName}`);
  console.log(`📍 Address: ${contractAddress}`);
  console.log(`👥 Validators: ${validators.length}/5`);
  
  // Verify contract (optional)
  if (process.env.VERIFY === "true") {
    console.log("\n🔍 Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: name === "pionezero" ? [process.env.PIO_TOKEN, validators] : [validators],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: name,
    contract: contractName,
    address: contractAddress,
    validators: validators,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
  };

  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main().catch((e) => {
  console.error("❌ Deployment failed:", e);
  process.exit(1);
});
