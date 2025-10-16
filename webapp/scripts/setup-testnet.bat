@echo off
echo 🚀 Setting up PIO Bridge for Testnet...

REM Check if .env.local exists
if not exist ".env.local" (
    echo 📝 Creating .env.local from template...
    copy env.example .env.local
    echo ✅ Created .env.local - Please update contract addresses after deployment
) else (
    echo ✅ .env.local already exists
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if contracts are deployed
echo 🔍 Checking contract deployment status...

REM Note: Windows batch doesn't have grep, so we'll use findstr
findstr "VITE_PIOLOCK_ADDRESS" .env.local > temp.txt
set /p PIOLOCK_LINE=<temp.txt
del temp.txt

findstr "VITE_PIOMINT_ADDRESS" .env.local > temp.txt
set /p PIOINT_LINE=<temp.txt
del temp.txt

echo %PIOLOCK_LINE% | findstr "0x0000000000000000000000000000000000000000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  PIOLock contract not deployed yet
    echo 💡 Run: cd ../contracts ^&^& npm run deploy:pionezero
) else (
    echo ✅ PIOLock contract deployed
)

echo %PIOINT_LINE% | findstr "0x0000000000000000000000000000000000000000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  PIOMint contract not deployed yet
    echo 💡 Run: cd ../contracts ^&^& npm run deploy:goerli
) else (
    echo ✅ PIOMint contract deployed
)

echo.
echo 🎯 Next Steps:
echo 1. Deploy smart contracts (see TESTNET_GUIDE.md)
echo 2. Update contract addresses in .env.local
echo 3. Start development server: npm run dev
echo 4. Connect MetaMask to testnet networks
echo 5. Get testnet tokens from faucets
echo.
echo 📚 Read TESTNET_GUIDE.md for detailed instructions
echo 🤖 Use AI Assistant in the app for help

pause
