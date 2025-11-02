// Use ethers directly (installed locally)
const { ethers } = require('ethers')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'validator.env') })

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
      const lockABI = require('../contracts/artifacts/contracts/PIOLock.sol/PIOLock.json').abi
      this.lockContract = new ethers.Contract(
        CONFIG.PIONE_ZERO.lockContract,
        lockABI,
        this.pioneProvider
      )
      
      // Load PIOMint ABI
      const mintABI = require('../contracts/artifacts/contracts/PIOMint.sol/PIOMint.json').abi
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
    
    // 🚀 Start realtime event listener
    console.log('⚡ Setting up realtime event listener...')
    this.lockContract.on('Locked', async (lockId, sender, to, amount, event) => {
      console.log('🎉 REALTIME Locked event received!', {
        lockId: lockId.toString(),
        sender: sender,
        to: to,
        amount: ethers.formatEther(amount),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      })
      
      const eventId = `${event.transactionHash}-${event.logIndex}`
      if (!this.processedEvents.has(eventId)) {
        await this.processLockEvent(event)
        this.processedEvents.add(eventId)
      }
    })
    
    // 🔍 Check recent blocks on startup
    console.log('🔄 Checking recent blocks for any missed events...')
    try {
      const latestBlock = await this.pioneProvider.getBlockNumber()
      const fromBlock = Math.max(0, latestBlock - 100) // Check last 100 blocks on startup
      const filter = this.lockContract.filters.Locked()
      const recentEvents = await this.lockContract.queryFilter(filter, fromBlock, latestBlock)
      
      if (recentEvents.length > 0) {
        console.log(`📨 Found ${recentEvents.length} recent Locked events in blocks ${fromBlock}-${latestBlock}`)
        for (const event of recentEvents) {
          console.log('📋 Recent event:', {
            lockId: event.args.lockId.toString(),
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          })
        }
      } else {
        console.log(`📝 No recent Locked events found in blocks ${fromBlock}-${latestBlock}`)
      }
    } catch (error) {
      console.error('❌ Error checking recent blocks:', error.message)
    }
    
    // Start polling as backup
    this.monitorLockEvents()
    
    // Setup stdin for manual commands
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', async (input) => {
      const command = input.trim()
      if (command.startsWith('check ')) {
        const txHash = command.substring(6).trim()
        await this.checkSpecificTransaction(txHash)
      } else if (command === 'status') {
        console.log('📊 Validator Status:', {
          isRunning: this.isRunning,
          processedEvents: this.processedEvents.size,
          validators: this.validators.length
        })
      } else if (command === 'help') {
        console.log('📋 Available commands:')
        console.log('  check <txHash> - Check specific transaction')
        console.log('  status - Show validator status')
        console.log('  help - Show this help')
      }
    })
    
    console.log('💡 Type "help" for available commands')
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down Validator Bot...')
      this.isRunning = false
      process.exit(0)
    })
  }

  async checkSpecificTransaction(txHash) {
    console.log(`🔍 Checking specific transaction: ${txHash}`)
    try {
      const receipt = await this.pioneProvider.getTransactionReceipt(txHash)
      if (receipt) {
        console.log('✅ Transaction found:', {
          status: receipt.status,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed?.toString(),
          logs: receipt.logs.length
        })
        
        // Parse logs for Locked events
        const lockInterface = new ethers.Interface(require('../contracts/artifacts/contracts/PIOLock.sol/PIOLock.json').abi)
        receipt.logs.forEach((log, index) => {
          try {
            const parsed = lockInterface.parseLog(log)
            if (parsed.name === 'Locked') {
              console.log(`🎉 Found Locked event in log ${index}:`, {
                lockId: parsed.args.lockId.toString(),
                sender: parsed.args.sender,
                to: parsed.args.to,
                amount: ethers.formatEther(parsed.args.amount)
              })
            }
          } catch (e) {
            // Not a PIOLock event
          }
        })
      } else {
        console.log('❌ Transaction not found or not confirmed yet')
      }
    } catch (error) {
      console.error('❌ Error checking transaction:', error.message)
    }
  }

  async monitorLockEvents() {
    console.log('👂 Listening for Locked events...')
    
    while (this.isRunning) {
      try {
        // Get latest block number
        const latestBlock = await this.pioneProvider.getBlockNumber()
        const fromBlock = Math.max(0, latestBlock - 10) // Check last 10 blocks (more recent)
        
        console.log(`🔍 Checking blocks ${fromBlock} to ${latestBlock} for Locked events...`)
        
        // Get Locked events
        const filter = this.lockContract.filters.Locked()
        const events = await this.lockContract.queryFilter(filter, fromBlock, latestBlock)
        
        if (events.length === 0) {
          console.log(`📝 No Locked events found in blocks ${fromBlock}-${latestBlock}`)
        } else {
          console.log(`📨 Found ${events.length} Locked events in blocks ${fromBlock}-${latestBlock}`)
        }
        
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
    const { lockId, sender, destination, amount } = event.args
    
    this.log(`🔄 Processing Locked event: lockId=${lockId}, sender=${sender}, destination=${destination}, amount=${ethers.formatEther(amount)}`)
    
    try {
      // Enhanced validation
      await this.verifyLockEventIntegrity(event)
      
      // Check if already processed or approved
      const isProcessed = await this.mintContract.processed(lockId)
      if (isProcessed) {
        this.log(`⚠️ LockId ${lockId} already processed, skipping`)
        return
      }
      
      const approvalCount = await this.mintContract.approvalCount(lockId)
      this.log(`📊 Current approval count: ${approvalCount}/${CONFIG.APPROVAL_THRESHOLD}`)
      
      if (approvalCount >= CONFIG.APPROVAL_THRESHOLD) {
        this.log(`✅ LockId ${lockId} already approved by enough validators`)
        return
      }
      
      // Process approvals with enhanced security
      await this.processValidatorApprovals(lockId, destination, amount)
      
    } catch (error) {
      this.log(`❌ Error processing lock event: ${error.message}`)
      console.error(error)
    }
  }

  async processValidatorApprovals(lockId, destination, amount) {
    // Get validators who haven't approved yet
    const validatorsToApprove = []
    
    for (const validator of this.validators) {
      try {
        const hasApproved = await this.mintContract.hasApproved(lockId, validator.address)
        if (!hasApproved) {
          validatorsToApprove.push(validator)
        }
      } catch (error) {
        this.log(`⚠️ Error checking validator ${validator.index} approval status: ${error.message}`)
      }
    }
    
    this.log(`👥 Validators to approve: ${validatorsToApprove.length}`)
    
    // Process approvals sequentially to avoid nonce conflicts
    for (const validator of validatorsToApprove) {
      try {
        await this.executeValidatorApproval(validator, lockId, destination, amount)
        
        // Check if threshold reached after each approval
        const currentApprovalCount = await this.mintContract.approvalCount(lockId)
        this.log(`📊 Updated approval count: ${currentApprovalCount}/${CONFIG.APPROVAL_THRESHOLD}`)
        
        if (currentApprovalCount >= CONFIG.APPROVAL_THRESHOLD) {
          this.log(`🎉 Threshold reached! Monitoring for mint execution...`)
          await this.monitorMintExecution(lockId, destination)
          break
        }
        
        // Add delay between approvals to prevent network congestion
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        this.log(`❌ Validator ${validator.index} approval failed: ${error.message}`)
      }
    }
  }

  async executeValidatorApproval(validator, lockId, destination, amount) {
    this.log(`🔐 Validator ${validator.index} (${validator.address}) approving lockId=${lockId}`)
    
    // Estimate gas first
    const gasEstimate = await this.mintContract
      .connect(validator.wallet)
      .estimateGas.approveMint(lockId, destination, amount)
    
    this.log(`⛽ Gas estimate for validator ${validator.index}: ${gasEstimate.toString()}`)
    
    // Execute with higher gas limit for safety
    const tx = await this.mintContract
      .connect(validator.wallet)
      .approveMint(lockId, destination, amount, {
        gasLimit: gasEstimate * BigInt(120) / BigInt(100) // 20% buffer
      })
    
    this.log(`✅ Validator ${validator.index} approval tx submitted: ${tx.hash}`)
    
    // Wait for confirmation
    const receipt = await tx.wait()
    this.log(`✅ Validator ${validator.index} approval confirmed in block ${receipt.blockNumber}`)
    
    return receipt
  }

  async monitorMintExecution(lockId, destination) {
    this.log(`👀 Monitoring mint execution for lockId=${lockId}`)
    
    // Listen for Minted events
    const filter = this.mintContract.filters.Minted(lockId)
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.log(`⏰ Mint monitoring timeout for lockId=${lockId}`)
        resolve()
      }, 30000) // 30 second timeout
      
      this.mintContract.once(filter, (lockId, to, amount, event) => {
        clearTimeout(timeout)
        this.log(`🚀 Mint executed! lockId=${lockId}, to=${to}, amount=${ethers.formatEther(amount)}`)
        this.log(`📝 Mint transaction hash: ${event.transactionHash}`)
        resolve()
      })
    })
  }

  async verifyLockEventIntegrity(event) {
    // Verify transaction exists and is confirmed
    const tx = await this.pioneProvider.getTransaction(event.transactionHash)
    const receipt = await this.pioneProvider.getTransactionReceipt(event.transactionHash)
    
    if (!tx || !receipt || !receipt.status) {
      throw new Error(`Invalid or failed transaction: ${event.transactionHash}`)
    }
    
    if (receipt.confirmations < 3) {
      throw new Error(`Insufficient confirmations: ${receipt.confirmations}`)
    }
    
    // Verify the event came from correct contract
    if (event.address.toLowerCase() !== CONFIG.PIONE_ZERO.lockContract.toLowerCase()) {
      throw new Error(`Event from unexpected contract: ${event.address}`)
    }
    
    this.log(`✅ Lock event integrity verified: tx=${event.transactionHash}`)
  }

  log(message) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`
    
    console.log(logMessage)
    
    // Write to log file with error handling
    try {
      fs.appendFileSync(path.join(__dirname, CONFIG.LOG_FILE), logMessage + '\n')
    } catch (error) {
      console.error('❌ Failed to write to log file:', error.message)
    }
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
