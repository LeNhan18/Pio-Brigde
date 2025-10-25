#!/usr/bin/env node

const ValidatorBot = require('./validator-bot')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables
const envPath = path.join(__dirname, '../validator.env')
console.log('📁 Loading environment from:', envPath)
dotenv.config({ path: envPath })

// Debug environment variables
console.log('🔍 Environment check:')
console.log('PIOLOCK_ADDRESS:', process.env.PIOLOCK_ADDRESS)
console.log('PIOMINT_ADDRESS:', process.env.PIOMINT_ADDRESS)
console.log('VALIDATOR_1_PRIVATE_KEY:', process.env.VALIDATOR_1_PRIVATE_KEY ? 'Set' : 'Not set')

// Validate required environment variables
const requiredVars = [
  'PIOLOCK_ADDRESS',
  'PIOMINT_ADDRESS',
  'VALIDATOR_1_PRIVATE_KEY',
  'VALIDATOR_2_PRIVATE_KEY',
  'VALIDATOR_3_PRIVATE_KEY'
]

const missingVars = requiredVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingVars.forEach(varName => console.error(`  - ${varName}`))
  console.error('\n📝 Please copy validator.env.example to validator.env and fill in your values')
  process.exit(1)
}

// Check if at least 3 validators are configured
const validatorKeys = [
  process.env.VALIDATOR_1_PRIVATE_KEY,
  process.env.VALIDATOR_2_PRIVATE_KEY,
  process.env.VALIDATOR_3_PRIVATE_KEY,
  process.env.VALIDATOR_4_PRIVATE_KEY,
  process.env.VALIDATOR_5_PRIVATE_KEY
].filter(key => key && key !== '0x...')

if (validatorKeys.length < 3) {
  console.error(' At least 3 validators are required')
  console.error(` Configured validators: ${validatorKeys.length}/5`)
  process.exit(1)
}

console.log(' Starting Validator Bot...')
console.log(` Validators configured: ${validatorKeys.length}/5`)
console.log(` Lock Contract: ${process.env.PIOLOCK_ADDRESS}`)
console.log(` Mint Contract: ${process.env.PIOMINT_ADDRESS}`)

// Start the bot
async function startBot() {
  const bot = new ValidatorBot()
  
  try {
    await bot.initialize()
    await bot.start()
  } catch (error) {
    console.error(' Failed to start validator bot:', error)
    process.exit(1)
  }
}

startBot()
