#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

console.log('🚀 Setting up PIO Bridge for Testnet...\n')

// Check if .env.local exists
const envLocalPath = '.env.local'
const envExamplePath = 'env.example'

if (!fs.existsSync(envLocalPath)) {
  console.log('📝 Creating .env.local from template...')
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envLocalPath)
    console.log('✅ Created .env.local - Please update contract addresses after deployment')
  } else {
    console.log('❌ env.example not found')
    process.exit(1)
  }
} else {
  console.log('✅ .env.local already exists')
}

// Read current .env.local
const envContent = fs.readFileSync(envLocalPath, 'utf8')

// Check contract addresses
const pioLockMatch = envContent.match(/VITE_PIOLOCK_ADDRESS=(.+)/)
const pioMintMatch = envContent.match(/VITE_PIOMINT_ADDRESS=(.+)/)

const pioLockAddress = pioLockMatch ? pioLockMatch[1].trim() : ''
const pioMintAddress = pioMintMatch ? pioMintMatch[1].trim() : ''

console.log('\n🔍 Checking contract deployment status...')

if (!pioLockAddress || pioLockAddress === '0x0000000000000000000000000000000000000000') {
  console.log('⚠️  PIOLock contract not deployed yet')
  console.log('💡 Run: cd ../contracts && npm run deploy:pionezero')
} else {
  console.log(`✅ PIOLock deployed at: ${pioLockAddress}`)
}

if (!pioMintAddress || pioMintAddress === '0x0000000000000000000000000000000000000000') {
  console.log('⚠️  PIOMint contract not deployed yet')
  console.log('💡 Run: cd ../contracts && npm run deploy:goerli')
} else {
  console.log(`✅ PIOMint deployed at: ${pioMintAddress}`)
}

console.log('\n🎯 Next Steps:')
console.log('1. Deploy smart contracts (see TESTNET_GUIDE.md)')
console.log('2. Update contract addresses in .env.local')
console.log('3. Start development server: npm run dev')
console.log('4. Connect MetaMask to testnet networks')
console.log('5. Get testnet tokens from faucets')
console.log('\n📚 Read TESTNET_GUIDE.md for detailed instructions')
console.log('🤖 Use AI Assistant in the app for help')

// Check if contracts directory exists
const contractsPath = '../contracts'
if (fs.existsSync(contractsPath)) {
  console.log('\n📁 Contracts directory found')
  console.log('💡 You can deploy contracts from the contracts/ directory')
} else {
  console.log('\n⚠️  Contracts directory not found')
  console.log('💡 Make sure you\'re in the webapp/ directory')
}
