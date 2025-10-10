# PIO Bridge - Smart Contracts

## 🚀 Quick Deploy

### 1. Setup Environment
```bash
cd contracts
npm install
cp env.example .env
```

### 2. Configure .env
```bash
# Private key for deployment
PRIVATE_KEY=your_private_key_here

# RPC URLs
RPC_PIONE_ZERO=https://rpc.zeroscan.org
RPC_GOERLI=https://rpc.ankr.com/eth_goerli

# PIO Token address on Pione Zero
PIO_TOKEN=0x...

# 5 Validators
VALIDATORS=0x...,0x...,0x...,0x...,0x...

# Optional: Verify contracts
VERIFY=true
```

### 3. Deploy to Testnet

#### Deploy PIOLock to Pione Zero:
```bash
npm run deploy:pionezero
```

#### Deploy PIOMint to Goerli:
```bash
npm run deploy:goerli
```

### 4. Local Testing
```bash
npm run deploy:local
```

## 📋 Contract Addresses

After deployment, update `webapp/.env.local`:
```bash
VITE_PIOLOCK_ADDRESS=0x...
VITE_PIOMINT_ADDRESS=0x...
```

## 🔧 Commands

- `npm run compile` - Compile contracts
- `npm run test` - Run tests
- `npm run deploy:goerli` - Deploy to Goerli
- `npm run deploy:pionezero` - Deploy to Pione Zero
- `npm run verify:goerli` - Verify on Etherscan
- `npm run verify:pionezero` - Verify on ZeroScan

## 💰 Get Test Tokens

- **PZO Faucet**: https://dex.pionechain.com/testnet/faucet/
- **Goerli Faucet**: https://goerlifaucet.com/

## 🔍 Verification

Contracts will be automatically verified if `VERIFY=true` in .env

## 📊 Deployment Flow

1. **Pione Zero**: Deploy PIOLock with PIO token address
2. **Goerli**: Deploy PIOMint with same validators
3. **Update Webapp**: Add contract addresses to .env.local
4. **Test Bridge**: Connect wallet and test bridge functionality
