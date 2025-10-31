// Script để check transaction hash cụ thể
const { ethers } = require('ethers')
const dotenv = require('dotenv')
const path = require('path')

// Load environment
dotenv.config({ path: path.join(__dirname, 'validator.env') })

async function checkTransaction(txHash) {
  console.log(`🔍 Checking transaction: ${txHash}`)
  
  // Setup provider
  const provider = new ethers.JsonRpcProvider(process.env.RPC_PIONE_ZERO || 'https://rpc.pione.tech')
  
  try {
    // Get transaction
    const tx = await provider.getTransaction(txHash)
    if (!tx) {
      console.log('❌ Transaction not found')
      return
    }
    
    console.log('📝 Transaction found:', {
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value || 0),
      gasLimit: tx.gasLimit?.toString(),
      gasPrice: tx.gasPrice?.toString(),
      blockNumber: tx.blockNumber,
      blockHash: tx.blockHash
    })
    
    // Get receipt
    const receipt = await provider.getTransactionReceipt(txHash)
    if (!receipt) {
      console.log('⏳ Transaction pending (no receipt yet)')
      return
    }
    
    console.log('📋 Receipt:', {
      status: receipt.status === 1 ? '✅ Success' : '❌ Failed',
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed?.toString(),
      logsCount: receipt.logs.length
    })
    
    // Parse logs
    if (receipt.logs.length > 0) {
      console.log('📜 Logs:')
      const lockInterface = new ethers.Interface(require('../contracts/artifacts/contracts/PIOLock.sol/PIOLock.json').abi)
      
      receipt.logs.forEach((log, index) => {
        try {
          const parsed = lockInterface.parseLog(log)
          console.log(`  Log ${index}: ${parsed.name}`, parsed.args)
        } catch (e) {
          console.log(`  Log ${index}: Unknown event`)
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Get transaction hash from command line
const txHash = process.argv[2]
if (!txHash) {
  console.log('Usage: node check-tx.js <transaction-hash>')
  console.log('Example: node check-tx.js 0x1234...')
  process.exit(1)
}

checkTransaction(txHash)