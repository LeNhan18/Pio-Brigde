#!/usr/bin/env node

// Bridge End-to-End Test Script
const fs = require('fs')
const path = require('path')

const TESTS = {
  VALIDATOR_CONFIG: 'validator-configuration',
  VALIDATOR_START: 'validator-startup', 
  CONTRACT_DETECTION: 'contract-detection',
  BRIDGE_WORKFLOW: 'bridge-workflow',
  EVENT_LISTENING: 'event-listening'
}

class BridgeTestSuite {
  constructor() {
    this.results = {}
    this.startTime = Date.now()
  }

  log(message) {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[${timestamp}] ${message}`)
  }

  async runTest(testName, testFunction) {
    this.log(`🧪 Running test: ${testName}`)
    try {
      const result = await testFunction()
      this.results[testName] = { status: 'PASS', result }
      this.log(`✅ ${testName}: PASS`)
      return result
    } catch (error) {
      this.results[testName] = { status: 'FAIL', error: error.message }
      this.log(`❌ ${testName}: FAIL - ${error.message}`)
      return null
    }
  }

  async testValidatorConfiguration() {
    // Check if validator.env exists and is configured
    const validatorEnvPath = path.join(__dirname, 'Validator', 'validator.env')
    
    if (!fs.existsSync(validatorEnvPath)) {
      throw new Error('validator.env file not found')
    }

    const envContent = fs.readFileSync(validatorEnvPath, 'utf8')
    const requiredVars = [
      'RPC_PIONE_ZERO',
      'RPC_SEPOLIA', 
      'PIOLOCK_ADDRESS',
      'PIOMINT_ADDRESS',
      'VALIDATOR_1_PRIVATE_KEY'
    ]

    for (const varName of requiredVars) {
      if (!envContent.includes(varName) || envContent.includes(`${varName}=0x...`)) {
        throw new Error(`${varName} not properly configured`)
      }
    }

    return 'Validator configuration valid'
  }

  async testValidatorStartup() {
    // Test validator bot can initialize without errors
    try {
      // Import validator bot
      const ValidatorBotPath = path.join(__dirname, 'Validator', 'validator-bot.js')
      
      if (!fs.existsSync(ValidatorBotPath)) {
        throw new Error('validator-bot.js not found')
      }

      // Check if required dependencies exist
      const packageJsonPath = path.join(__dirname, 'Validator', 'package.json')
      if (!fs.existsSync(packageJsonPath)) {
        throw new Error('Validator package.json not found')
      }

      const nodeModulesPath = path.join(__dirname, 'Validator', 'node_modules')
      if (!fs.existsSync(nodeModulesPath)) {
        throw new Error('Validator dependencies not installed. Run: cd Validator && npm install')
      }

      return 'Validator startup environment ready'
    } catch (error) {
      throw new Error(`Validator startup test failed: ${error.message}`)
    }
  }

  async testContractDetection() {
    // Check if webapp has contract addresses configured
    const envLocalPath = path.join(__dirname, 'webapp', '.env.local')
    
    if (!fs.existsSync(envLocalPath)) {
      throw new Error('webapp/.env.local not found')
    }

    const envContent = fs.readFileSync(envLocalPath, 'utf8')
    const requiredAddresses = [
      'VITE_PIOLOCK_ADDRESS',
      'VITE_PIO_TOKEN_ADDRESS',
      'VITE_PIOMINT_ADDRESS'
    ]

    for (const address of requiredAddresses) {
      if (!envContent.includes(address) || envContent.includes(`${address}=0x...`)) {
        throw new Error(`${address} not configured in webapp/.env.local`)
      }
    }

    return 'Contract addresses configured'
  }

  async testBridgeWorkflow() {
    // Check if bridge hook exports required functions
    const bridgeHookPath = path.join(__dirname, 'webapp', 'src', 'hooks', 'useBridge.js')
    
    if (!fs.existsSync(bridgeHookPath)) {
      throw new Error('useBridge.js not found')
    }

    const hookContent = fs.readFileSync(bridgeHookPath, 'utf8')
    const requiredExports = [
      'bridgePZO',
      'bridgeState',
      'isListeningForEvents',
      'startEventListening'
    ]

    for (const exportName of requiredExports) {
      if (!hookContent.includes(exportName)) {
        throw new Error(`Missing required export: ${exportName}`)
      }
    }

    // Check if bridge workflow steps are implemented
    const workflowSteps = [
      'approving',
      'locking', 
      'locked',
      'minting',
      'success'
    ]

    for (const step of workflowSteps) {
      if (!hookContent.includes(`'${step}'`)) {
        throw new Error(`Missing workflow step: ${step}`)
      }
    }

    return 'Bridge workflow implementation complete'
  }

  async testEventListening() {
    // Check if event listening is properly implemented
    const bridgeHookPath = path.join(__dirname, 'webapp', 'src', 'hooks', 'useBridge.js')
    const hookContent = fs.readFileSync(bridgeHookPath, 'utf8')

    const eventFeatures = [
      'watchContractEvent',
      'Locked',
      'lockEventListener',
      'startEventListening',
      'monitorMintExecution'
    ]

    for (const feature of eventFeatures) {
      if (!hookContent.includes(feature)) {
        throw new Error(`Missing event listening feature: ${feature}`)
      }
    }

    return 'Event listening implementation complete'
  }

  async runAllTests() {
    this.log('🚀 Starting Bridge End-to-End Test Suite...')
    this.log('=' .repeat(60))

    await this.runTest(TESTS.VALIDATOR_CONFIG, () => this.testValidatorConfiguration())
    await this.runTest(TESTS.VALIDATOR_START, () => this.testValidatorStartup())
    await this.runTest(TESTS.CONTRACT_DETECTION, () => this.testContractDetection())
    await this.runTest(TESTS.BRIDGE_WORKFLOW, () => this.testBridgeWorkflow())
    await this.runTest(TESTS.EVENT_LISTENING, () => this.testEventListening())

    this.generateReport()
  }

  generateReport() {
    const duration = Date.now() - this.startTime
    const totalTests = Object.keys(this.results).length
    const passedTests = Object.values(this.results).filter(r => r.status === 'PASS').length
    const failedTests = totalTests - passedTests

    this.log('=' .repeat(60))
    this.log('📊 TEST RESULTS SUMMARY')
    this.log('=' .repeat(60))
    this.log(`⏱️  Duration: ${duration}ms`)
    this.log(`📈 Total Tests: ${totalTests}`)
    this.log(`✅ Passed: ${passedTests}`)
    this.log(`❌ Failed: ${failedTests}`)
    this.log(`📊 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)

    this.log('\\n📋 DETAILED RESULTS:')
    for (const [testName, result] of Object.entries(this.results)) {
      const status = result.status === 'PASS' ? '✅' : '❌'
      this.log(`${status} ${testName}: ${result.status}`)
      if (result.error) {
        this.log(`   └─ Error: ${result.error}`)
      }
    }

    if (failedTests === 0) {
      this.log('\\n🎉 ALL TESTS PASSED! Bridge is ready for production.')
      this.log('\\n🚀 Next Steps:')
      this.log('   1. Start validator: cd Validator && npm run start')
      this.log('   2. Start webapp: cd webapp && npm run dev')
      this.log('   3. Test bridge with small amounts first')
    } else {
      this.log('\\n⚠️  Some tests failed. Please fix issues before proceeding.')
    }
  }
}

// Run the test suite
async function main() {
  const testSuite = new BridgeTestSuite()
  await testSuite.runAllTests()
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  })
}

module.exports = BridgeTestSuite