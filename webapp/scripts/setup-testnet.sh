#!/bin/bash

echo "🚀 Setting up PIO Bridge for Testnet..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp env.example .env.local
    echo "✅ Created .env.local - Please update contract addresses after deployment"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if contracts are deployed
echo "🔍 Checking contract deployment status..."

PIOLOCK_ADDRESS=$(grep "VITE_PIOLOCK_ADDRESS" .env.local | cut -d '=' -f2)
PIOMINT_ADDRESS=$(grep "VITE_PIOMINT_ADDRESS" .env.local | cut -d '=' -f2)

if [ "$PIOLOCK_ADDRESS" = "0x0000000000000000000000000000000000000000" ]; then
    echo "⚠️  PIOLock contract not deployed yet"
    echo "💡 Run: cd ../contracts && npm run deploy:pionezero"
else
    echo "✅ PIOLock deployed at: $PIOLOCK_ADDRESS"
fi

if [ "$PIOMINT_ADDRESS" = "0x0000000000000000000000000000000000000000" ]; then
    echo "⚠️  PIOMint contract not deployed yet"
    echo "💡 Run: cd ../contracts && npm run deploy:goerli"
else
    echo "✅ PIOMint deployed at: $PIOMINT_ADDRESS"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Deploy smart contracts (see TESTNET_GUIDE.md)"
echo "2. Update contract addresses in .env.local"
echo "3. Start development server: npm run dev"
echo "4. Connect MetaMask to testnet networks"
echo "5. Get testnet tokens from faucets"
echo ""
echo "📚 Read TESTNET_GUIDE.md for detailed instructions"
echo "🤖 Use AI Assistant in the app for help"
