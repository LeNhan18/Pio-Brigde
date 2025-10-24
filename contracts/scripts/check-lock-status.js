const { ethers } = require('hardhat')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: './validator.env' })

async function checkLockStatus() {
  try {
    console.log('🔍 Checking PIOLock Contract Status...')
    
    // Connect to Pione Zero
    const provider = new ethers.JsonRpcProvider(process.env.RPC_PIONE_ZERO)
    const lockAddress = process.env.PIOLOCK_ADDRESS
    
    if (!lockAddress) {
      console.error('❌ PIOLOCK_ADDRESS not found in environment')
      return
    }
    
    console.log(`📋 Contract Address: ${lockAddress}`)
    
    // Load contract ABI
    const lockABI = require('../artifacts/contracts/PIOLock.sol/PIOLock.json').abi
    const lockContract = new ethers.Contract(lockAddress, lockABI, provider)
    
    // Check contract info
    console.log('\n📊 Contract Information:')
    
    try {
      const pioToken = await lockContract.pioToken()
      console.log(`🪙 PIO Token: ${pioToken}`)
    } catch (error) {
      console.log('⚠️ Could not get PIO token address')
    }
    
    try {
      const validatorCount = await lockContract.validatorCount()
      console.log(`👥 Validator Count: ${validatorCount}`)
    } catch (error) {
      console.log('⚠️ Could not get validator count')
    }
    
    // Check recent events
    console.log('\n📅 Recent Locked Events:')
    try {
      const filter = lockContract.filters.Locked()
      const events = await lockContract.queryFilter(filter, -1000) // Last 1000 blocks
      
      if (events.length === 0) {
        console.log('📭 No Locked events found')
      } else {
        console.log(`📈 Found ${events.length} Locked events:`)
        
        events.slice(-5).forEach((event, index) => {
          console.log(`\n${index + 1}. Event Details:`)
          console.log(`   Block: ${event.blockNumber}`)
          console.log(`   TX: ${event.transactionHash}`)
          console.log(`   Lock ID: ${event.args.lockId.toString()}`)
          console.log(`   Amount: ${ethers.formatEther(event.args.amount)} PZO`)
          console.log(`   To: ${event.args.to}`)
        })
      }
    } catch (error) {
      console.log('⚠️ Could not fetch events:', error.message)
    }
    
    // Check network status
    console.log('\n🌐 Network Status:')
    try {
      const blockNumber = await provider.getBlockNumber()
      console.log(`📦 Current Block: ${blockNumber}`)
      
      const network = await provider.getNetwork()
      console.log(`🔗 Network: ${network.name} (Chain ID: ${network.chainId})`)
    } catch (error) {
      console.log('❌ Network connection failed:', error.message)
    }
    
    console.log('\n✅ PIOLock status check completed!')
    
  } catch (error) {
    console.error('❌ Error checking lock status:', error)
  }
}

if (require.main === module) {
  checkLockStatus()
}

module.exports = checkLockStatus
