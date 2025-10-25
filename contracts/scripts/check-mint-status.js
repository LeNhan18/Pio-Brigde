const { ethers } = require('hardhat')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: './validator.env' })

async function checkMintStatus() {
  try {
    console.log('🔍 Checking PIOMint Contract Status...')
    
    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider(process.env.RPC_SEPOLIA)
    const mintAddress = process.env.PIOMINT_ADDRESS
    
    if (!mintAddress) {
      console.error('❌ PIOMINT_ADDRESS not found in environment')
      return
    }
    
    console.log(`📋 Contract Address: ${mintAddress}`)
    
    // Load contract ABI
    const mintABI = require('../artifacts/contracts/PIOMint.sol/PIOMint.json').abi
    const mintContract = new ethers.Contract(mintAddress, mintABI, provider)
    
    // Check contract info
    console.log('\n📊 Contract Information:')
    
    try {
      const approvalThreshold = await mintContract.APPROVAL_THRESHOLD()
      console.log(`🎯 Approval Threshold: ${approvalThreshold}`)
    } catch (error) {
      console.log('⚠️ Could not get approval threshold')
    }
    
    try {
      const validatorCount = await mintContract.validatorCount()
      console.log(`👥 Validator Count: ${validatorCount}`)
    } catch (error) {
      console.log('⚠️ Could not get validator count')
    }
    
    // Check recent events
    console.log('\n📅 Recent Events:')
    
    try {
      // Check Minted events
      const mintedFilter = mintContract.filters.Minted()
      const mintedEvents = await mintContract.queryFilter(mintedFilter, -1000)
      
      if (mintedEvents.length === 0) {
        console.log('📭 No Minted events found')
      } else {
        console.log(`📈 Found ${mintedEvents.length} Minted events:`)
        
        mintedEvents.slice(-5).forEach((event, index) => {
          console.log(`\n${index + 1}. Minted Event:`)
          console.log(`   Block: ${event.blockNumber}`)
          console.log(`   TX: ${event.transactionHash}`)
          console.log(`   Lock ID: ${event.args.lockId.toString()}`)
          console.log(`   Amount: ${ethers.formatEther(event.args.amount)} wPZO`)
          console.log(`   To: ${event.args.to}`)
        })
      }
    } catch (error) {
      console.log('⚠️ Could not fetch Minted events:', error.message)
    }
    
    try {
      // Check Approval events
      const approvalFilter = mintContract.filters.Approval()
      const approvalEvents = await mintContract.queryFilter(approvalFilter, -1000)
      
      if (approvalEvents.length > 0) {
        console.log(`\n📈 Found ${approvalEvents.length} Approval events:`)
        
        approvalEvents.slice(-3).forEach((event, index) => {
          console.log(`\n${index + 1}. Approval Event:`)
          console.log(`   Block: ${event.blockNumber}`)
          console.log(`   TX: ${event.transactionHash}`)
          console.log(`   Lock ID: ${event.args.lockId.toString()}`)
          console.log(`   Validator: ${event.args.validator}`)
        })
      }
    } catch (error) {
      console.log('⚠️ Could not fetch Approval events:', error.message)
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
    
    console.log('\n✅ PIOMint status check completed!')
    
  } catch (error) {
    console.error('❌ Error checking mint status:', error)
  }
}

if (require.main === module) {
  checkMintStatus()
}

module.exports = checkMintStatus
