# 🚀 PIO Bridge - Testnet Deployment Guide

## 📋 Prerequisites

### 1. **Environment Setup**
```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env
```

### 2. **Configure .env File**
```bash
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
RPC_PIONE_ZERO=https://rpc.pioneer-zero.invalid
RPC_GOERLI=https://rpc.ankr.com/eth_goerli

# PIO Token address on Pione Zero
PIO_TOKEN=0x...

# Validators (5 addresses separated by commas)
VALIDATORS=0x...,0x...,0x...,0x...,0x...

# Optional: Verify contracts
VERIFY=true
```

### 3. **Get Testnet ETH**
- **Goerli**: [Goerli Faucet](https://goerlifaucet.com/)
- **Pione Zero**: [Pione Zero Faucet](https://faucet.pioneer-zero.invalid)

## 🔧 Deployment Steps

### Step 1: Compile Contracts
```bash
npx hardhat compile
```

### Step 2: Deploy to Goerli Testnet
```bash
# Deploy PIOMint to Goerli
npx hardhat run scripts/deploy-testnet.js --network goerli
```

### Step 3: Deploy to Pione Zero Testnet
```bash
# Deploy PIOLock to Pione Zero
npx hardhat run scripts/deploy-testnet.js --network pionezero
```

### Step 4: Verify Contracts (Optional)
```bash
# Verify on Goerli
npx hardhat verify --network goerli <CONTRACT_ADDRESS> <VALIDATORS>

# Verify on Pione Zero
npx hardhat verify --network pionezero <CONTRACT_ADDRESS> <PIO_TOKEN> <VALIDATORS>
```

## 🧪 Testing Deployment

### 1. **Local Testing**
```bash
# Run local tests
npx hardhat test

# Deploy locally
npx hardhat run scripts/deploy-local.js --network hardhat
```

### 2. **Testnet Testing**
```bash
# Test lock function
npx hardhat console --network pionezero
> const lock = await ethers.getContractAt("PIOLock", "CONTRACT_ADDRESS")
> await lock.lock(ethers.utils.parseEther("1"), "DESTINATION_ADDRESS")
```

## 📊 Deployment Checklist

### Before Deployment:
- [ ] ✅ Private key configured
- [ ] ✅ RPC URLs working
- [ ] ✅ Validators addresses set
- [ ] ✅ PIO token address (for Pione Zero)
- [ ] ✅ Sufficient ETH balance
- [ ] ✅ Contracts compiled

### After Deployment:
- [ ] ✅ Contract addresses saved
- [ ] ✅ Validators can approve
- [ ] ✅ Events are emitted
- [ ] ✅ Contracts verified
- [ ] ✅ Integration tests passed

## 🔍 Troubleshooting

### Common Issues:

#### 1. **"Insufficient funds"**
```bash
# Check balance
npx hardhat console --network goerli
> const [account] = await ethers.getSigners()
> await account.getBalance()
```

#### 2. **"Invalid validator"**
```bash
# Check validators format
echo $VALIDATORS
# Should be: 0x123...,0x456...,0x789...,0xabc...,0xdef...
```

#### 3. **"PIO_TOKEN not found"**
```bash
# Check PIO token address
echo $PIO_TOKEN
# Should be: 0x...
```

## 📱 Integration with Flutter App

### Update Flutter App Configuration:
```dart
// lib/config/contract_config.dart
class ContractConfig {
  static const String pioneZeroRPC = 'https://rpc.pioneer-zero.invalid';
  static const String goerliRPC = 'https://rpc.ankr.com/eth_goerli';
  
  // Update with deployed addresses
  static const String pioLockAddress = '0x...'; // From Pione Zero deployment
  static const String pioMintAddress = '0x...';  // From Goerli deployment
  
  static const List<String> validators = [
    '0x...', '0x...', '0x...', '0x...', '0x...'
  ];
}
```

## 🎯 Next Steps

1. **Deploy to Testnet** ✅
2. **Update Flutter App** with contract addresses
3. **Test Bridge Functionality**
4. **Deploy to Mainnet** (when ready)

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify your .env configuration
3. Ensure you have sufficient testnet ETH
4. Check network connectivity

---

**Happy Deploying! 🚀**
