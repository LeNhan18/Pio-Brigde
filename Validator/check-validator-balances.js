const { ethers } = require('hardhat')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: './validator.env' })

async function checkValidatorBalances() {
  try {
    console.log('🔍 Checking Validator Balances...')
    
    // Get validator private keys
    const validators = [
      process.env.VALIDATOR_1_PRIVATE_KEY,
      process.env.VALIDATOR_2_PRIVATE_KEY,
      process.env.VALIDATOR_3_PRIVATE_KEY,
      process.env.VALIDATOR_4_PRIVATE_KEY,
      process.env.VALIDATOR_5_PRIVATE_KEY
    ].filter(key => key && key !== '0x...')
    
    if (validators.length === 0) {
      console.error(' No validators configured')
      return
    }
    
    console.log(`👥 Found ${validators.length} validators`)
    
    // Connect to Sepolia (where validators need ETH)
    const provider = new ethers.JsonRpcProvider(process.env.RPC_SEPOLIA)
    
    console.log('\n💰 Validator Balances:')
    
    for (let i = 0; i < validators.length; i++) {
      try {
        const wallet = new ethers.Wallet(validators[i], provider)
        const address = wallet.address
        const balance = await provider.getBalance(address)
        const balanceEth = ethers.formatEther(balance)
        
        console.log(`\n${i + 1}. Validator ${i + 1}:`)
        console.log(`   Address: ${address}`)
        console.log(`   Balance: ${balanceEth} ETH`)
        
        if (balance < ethers.parseEther('0.001')) {
          console.log(`LOW BALANCE - Need more ETH for gas!`)
        } else {
          console.log(`Balance OK`)
        }
        
      } catch (error) {
        console.log(`\n${i + 1}. Validator ${i + 1}:`)
        console.log(`  Error: ${error.message}`)
      }
    }
    
    // Check total balance
    console.log('\nSummary:')
    let totalBalance = BigInt(0)
    let activeValidators = 0
    
    for (let i = 0; i < validators.length; i++) {
      try {
        const wallet = new ethers.Wallet(validators[i], provider)
        const balance = await provider.getBalance(wallet.address)
        totalBalance += balance
        
        if (balance >= ethers.parseEther('0.001')) {
          activeValidators++
        }
      } catch (error) {
        // Skip invalid validators
      }
    }
    
    console.log(`💰 Total Balance: ${ethers.formatEther(totalBalance)} ETH`)
    console.log(`✅ Active Validators: ${activeValidators}/${validators.length}`)
    
    if (activeValidators < 3) {
      console.log(`⚠️  WARNING: Need at least 3 validators with ETH for approval threshold!`)
    } else {
      console.log(`✅ Sufficient validators for approval threshold`)
    }
    
    console.log('\n✅ Validator balance check completed!')
    
  } catch (error) {
    console.error('❌ Error checking validator balances:', error)
  }
}

if (require.main === module) {
  checkValidatorBalances()
}

module.exports = checkValidatorBalances
