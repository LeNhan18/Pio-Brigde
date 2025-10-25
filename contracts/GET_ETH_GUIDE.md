# 💰 Hướng dẫn lấy ETH cho Validators

## 🎯 **Mục tiêu:**
Cần ít nhất 3/5 validators có ETH để approve mint transactions.

## 📋 **Validator Addresses cần ETH:**

```
1. 0x167bdc31866eE7a4BfACCb22f42712729bC19212
2. 0xf46Ada76EE5952F9E7306123d88442092F62D630  
3. 0x8918f188F18c6F50B548fdF753EF3cA80E34d355
4. 0x449FD950c2F417784e1b99A0EB80822DeA7E2e49
5. 0x39a89C61baDae6cbE8db23d09a58D03Ffeeb4cac
```

## 🚰 **Cách lấy Sepolia ETH:**

### **Option 1: Sepolia Faucets (Khuyến nghị)**
1. **Alchemy Faucet**: https://sepoliafaucet.com/
2. **Chainlink Faucet**: https://faucets.chain.link/sepolia
3. **QuickNode Faucet**: https://faucet.quicknode.com/ethereum/sepolia

### **Option 2: Social Media Faucets**
1. **Twitter Faucet**: https://sepolia-faucet.pk910.de/
2. **Discord Faucet**: https://discord.gg/ethereum
3. **Reddit Faucet**: https://www.reddit.com/r/ethereum

### **Option 3: Testnet Faucets**
1. **Infura Faucet**: https://infura.io/faucet/sepolia
2. **Moralis Faucet**: https://moralis.io/faucet/sepolia

## 💡 **Chiến lược:**

### **Minimum Setup (3 validators):**
- Chọn 3 validators bất kỳ
- Mỗi validator cần ít nhất **0.01 ETH**
- Tổng cần: **0.03 ETH**

### **Full Setup (5 validators):**
- Tất cả 5 validators
- Mỗi validator cần ít nhất **0.01 ETH**  
- Tổng cần: **0.05 ETH**

## 🔄 **Quy trình:**

### **Bước 1: Chọn Faucet**
1. Vào một trong các faucet links ở trên
2. Connect wallet hoặc nhập address
3. Request ETH

### **Bước 2: Import Validator Keys**
1. Mở MetaMask
2. Import Account → Private Key
3. Paste private key của validator
4. Repeat cho 3-5 validators

### **Bước 3: Request ETH**
1. Copy validator address
2. Paste vào faucet
3. Request ETH
4. Wait for confirmation

### **Bước 4: Verify**
```bash
npm run test:validators
```

## ⚡ **Quick Commands:**

### **Check validator balances:**
```bash
npm run test:validators
```

### **Check specific validator:**
```bash
# Check validator 1
npx hardhat run scripts/check-validator-balances.js
```

## 🚨 **Troubleshooting:**

### **"Faucet rate limited"**
- Thử faucet khác
- Đợi 24h rồi thử lại
- Sử dụng social media faucets

### **"Insufficient funds"**
- Kiểm tra address đúng chưa
- Đợi transaction confirm
- Thử faucet khác

### **"Network error"**
- Kiểm tra internet connection
- Thử faucet khác
- Đợi vài phút rồi thử lại

## 🎯 **Success Criteria:**

### **✅ Ready to Test:**
- Ít nhất 3 validators có ETH > 0.001
- Tất cả validators có thể connect được
- Network connections ổn định

### **🚀 Ready for Production:**
- Tất cả 5 validators có ETH
- Mỗi validator có ít nhất 0.01 ETH
- Backup validators sẵn sàng

**Sau khi có ETH, chạy lại test để verify!** 🎉
