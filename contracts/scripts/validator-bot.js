const { ethers } = require('hardhat')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../validator.env') })

// Configuration
const CONFIG = {
  // Network configurations
  PIONE_ZERO: {
    rpc: process.env.RPC_PIONE_ZERO || 'https://rpc.pione.tech',
    chainId: 5080,
    lockContract: process.env.PIOLOCK_ADDRESS
  },
  SEPOLIA: {
    rpc: process.env.RPC_SEPOLIA || 'https://ethereum-sepolia-rpc.publicnode.com',
    chainId: 11155111,
    mintContract: process.env.PIOMINT_ADDRESS
  },
  
  // Validator configuration
  VALIDATORS: [
    process.env.VALIDATOR_1_PRIVATE_KEY,
    process.env.VALIDATOR_2_PRIVATE_KEY,
    process.env.VALIDATOR_3_PRIVATE_KEY,
    process.env.VALIDATOR_4_PRIVATE_KEY,
    process.env.VALIDATOR_5_PRIVATE_KEY
  ].filter(key => key && key !== '0x...'),
  
  // Approval threshold (3 out of 5)
  APPROVAL_THRESHOLD: 3,
  
  // Monitoring interval (seconds)
  MONITOR_INTERVAL: 5000, // 5 seconds
  
  // Log file
  LOG_FILE: 'validator-bot.log'
}

class ValidatorBot {
  constructor() {
    this.pioneProvider = null
    this.sepoliaProvider = null
    this.lockContract = null
    this.mintContract = null
    this.validators = []
    this.isRunning = false
    this.processedEvents = new Set()
  }

  async initialize() {
    console.log('🚀 Initializing Validator Bot...')
    
    try {
      // Initialize providers
      this.pioneProvider = new ethers.JsonRpcProvider(CONFIG.PIONE_ZERO.rpc)
      this.sepoliaProvider = new ethers.JsonRpcProvider(CONFIG.SEPOLIA.rpc)
      
      // Initialize contracts
      console.log('📋 Loading contract ABIs...')
      
      // Load PIOLock ABI
      const lockABI = require('../artifacts/contracts/PIOLock.sol/PIOLock.json').abi
      this.lockContract = new ethers.Contract(
        CONFIG.PIONE_ZERO.lockContract,
        lockABI,
        this.pioneProvider
      )
      
      // Load PIOMint ABI
      const mintABI = require('../artifacts/contracts/PIOMint.sol/PIOMint.json').abi
      this.mintContract = new ethers.Contract(
        CONFIG.SEPOLIA.mintContract,
        mintABI,
        this.sepoliaProvider
      )
      
      // Initialize validators
      for (let i = 0; i < CONFIG.VALIDATORS.length; i++) {
        const wallet = new ethers.Wallet(CONFIG.VALIDATORS[i], this.sepoliaProvider)
        this.validators.push({
          index: i + 1,
          wallet: wallet,
          address: wallet.address
        })
        console.log(`✅ Validator ${i + 1}: ${wallet.address}`)
      }
      
      console.log(`✅ Initialized ${this.validators.length} validators`)
      console.log(`✅ Lock Contract: ${CONFIG.PIONE_ZERO.lockContract}`)
      console.log(`✅ Mint Contract: ${CONFIG.SEPOLIA.mintContract}`)
      
    } catch (error) {
      console.error('❌ Initialization failed:', error)
      throw error
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Bot is already running')
      return
    }
    
    console.log('🤖 Starting Validator Bot...')
    this.isRunning = true
    
    // Start monitoring
    this.monitorLockEvents()
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down Validator Bot...')
      this.isRunning = false
      process.exit(0)
    })
  }

  async monitorLockEvents() {
    console.log('👂 Listening for Locked events...')
    
    while (this.isRunning) {
      try {
        // Get latest block number
        const latestBlock = await this.pioneProvider.getBlockNumber()
        const fromBlock = Math.max(0, latestBlock - 100) // Check last 100 blocks
        
        // Get Locked events
        const filter = this.lockContract.filters.Locked()
        const events = await this.lockContract.queryFilter(filter, fromBlock, latestBlock)
        
        for (const event of events) {
          const eventId = `${event.transactionHash}-${event.logIndex}`
          
          if (this.processedEvents.has(eventId)) {
            continue // Already processed
          }
          
          console.log(`🔍 New Locked event detected:`, {
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            lockId: event.args.lockId.toString(),
            amount: ethers.formatEther(event.args.amount),
            to: event.args.to
          })
          
          // Process the event
          await this.processLockEvent(event)
          
          // Mark as processed
          this.processedEvents.add(eventId)
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, CONFIG.MONITOR_INTERVAL))
        
      } catch (error) {
        console.error('❌ Error monitoring events:', error)
        await new Promise(resolve => setTimeout(resolve, CONFIG.MONITOR_INTERVAL))
      }
    }
  }

  async processLockEvent(event) {
    const { lockId, to, amount } = event.args
    
    console.log(`🔄 Processing Locked event:`, {
      lockId: lockId.toString(),
      to: to,
      amount: ethers.formatEther(amount)
    })
    
    try {
      // Check if already approved by enough validators
      const approvalCount = await this.mintContract.approvalCount(lockId)
      console.log(`📊 Current approval count: ${approvalCount}/${CONFIG.APPROVAL_THRESHOLD}`)
      
      if (approvalCount >= CONFIG.APPROVAL_THRESHOLD) {
        console.log('✅ Already approved by enough validators')
        return
      }
      
      // Get validators who haven't approved yet
      const validatorsToApprove = []
      
      for (const validator of this.validators) {
        const hasApproved = await this.mintContract.hasApproved(lockId, validator.address)
        if (!hasApproved) {
          validatorsToApprove.push(validator)
        }
      }
      
      console.log(`👥 Validators to approve: ${validatorsToApprove.length}`)
      
      // Approve with available validators
      for (const validator of validatorsToApprove) {
        try {
          console.log(`🔐 Validator ${validator.index} approving...`)
          
          const tx = await this.mintContract
            .connect(validator.wallet)
            .approveMint(lockId, to, amount)
          
          console.log(`✅ Validator ${validator.index} approval tx: ${tx.hash}`)
          
          // Wait for transaction confirmation
          await tx.wait()
          console.log(`✅ Validator ${validator.index} approval confirmed`)
          
          // Check if we've reached the threshold
          const newApprovalCount = await this.mintContract.approvalCount(lockId)
          console.log(`📊 New approval count: ${newApprovalCount}/${CONFIG.APPROVAL_THRESHOLD}`)
          
          if (newApprovalCount >= CONFIG.APPROVAL_THRESHOLD) {
            console.log('🎉 Threshold reached! Minting should happen automatically...')
            break
          }
          
        } catch (error) {
          console.error(`❌ Validator ${validator.index} approval failed:`, error.message)
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing lock event:', error)
    }
  }

  log(message) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`
    
    console.log(logMessage)
    
    // Write to log file
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage + '\n')
  }

  // Enhanced security monitoring
  async verifyTransactionIntegrity(txHash) {
    try {
      // Get transaction details
      const tx = await this.pioneProvider.getTransaction(txHash)
      const receipt = await this.pioneProvider.getTransactionReceipt(txHash)
      
      if (!tx || !receipt) {
        throw new Error('Transaction not found')
      }
      
      // Security checks
      if (receipt.status !== 1) {
        throw new Error('Transaction failed')
      }
      
      // Check for suspicious patterns
      if (tx.value > ethers.parseEther('1000')) {
        this.logSecurityAlert('LARGE_VALUE', { txHash, value: tx.value.toString() })
      }
      
      // Verify gas usage is reasonable
      const gasUsed = receipt.gasUsed
      const gasLimit = tx.gasLimit
      const gasUsageRatio = Number(gasUsed) / Number(gasLimit)
      
      if (gasUsageRatio > 0.95) {
        this.logSecurityAlert('HIGH_GAS_USAGE', { txHash, ratio: gasUsageRatio })
      }
      
      console.log('✅ Transaction integrity verified:', txHash)
      
    } catch (error) {
      console.error('❌ Transaction integrity check failed:', error)
      this.logSecurityAlert('INTEGRITY_CHECK_FAILED', { txHash, error: error.message })
    }
  }

  // Security alert logging
  logSecurityAlert(alertType, data) {
    const timestamp = new Date().toISOString()
    const alert = {
      timestamp,
      type: alertType,
      data,
      severity: this.getAlertSeverity(alertType)
    }
    
    console.warn(`🚨 SECURITY ALERT [${alert.severity}]:`, alert)
    
    // Log to file
    fs.appendFileSync('security-alerts.log', JSON.stringify(alert) + '\n')
  }

  getAlertSeverity(alertType) {
    const severityMap = {
      'MONITORING_ERROR': 'LOW',
      'LARGE_VALUE': 'MEDIUM',
      'HIGH_GAS_USAGE': 'MEDIUM',
      'INTEGRITY_CHECK_FAILED': 'HIGH',
      'RAPID_APPROVALS': 'HIGH',
      'UNUSUAL_AMOUNT': 'MEDIUM'
    }
    return severityMap[alertType] || 'LOW'
  }
}

// Main execution
async function main() {
  const bot = new ValidatorBot()
  
  try {
    await bot.initialize()
    await bot.start()
  } catch (error) {
    console.error('❌ Bot failed to start:', error)
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

if (require.main === module) {
  main()
}

module.exports = ValidatorBot
