const { ethers } = require("hardhat");

async function main() {
  const privateKey = "de74617a549774e8bddf79621ba71ce7b3d600bab0a2ce814d0510fddb88e65d";
  
  try {
    const wallet = new ethers.Wallet(privateKey);
    console.log("🔑 Private Key:", privateKey);
    console.log("📍 Address:", wallet.address);
    console.log("✅ Address extracted successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
