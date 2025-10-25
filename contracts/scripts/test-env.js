require("dotenv").config();

console.log("🔍 Environment Variables:");
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? " Found" : " Not found");
console.log("RPC_PIONE_ZERO:", process.env.RPC_PIONE_ZERO ? " Found" : " Not found");
console.log("VALIDATORS:", process.env.VALIDATORS ? " Found" : " Not found");

if (process.env.PRIVATE_KEY) {
  console.log("Private key length:", process.env.PRIVATE_KEY.length);
  console.log("Private key starts with:", process.env.PRIVATE_KEY.substring(0, 10) + "...");
}
