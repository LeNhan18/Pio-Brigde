# 🧪 Bridge System Test Guide

## 📋 **Test Checklist**

### **✅ Bước 1: Chuẩn bị Test Environment**

#### **1.1 Kiểm tra Contracts đã deploy:**
```bash
cd contracts
npm run compile

# Kiểm tra PIOLock trên Pione Zero
npx hardhat verify --network pionezero 0xA4fD2552fC138217101D1A86AE143924309025fB

# Kiểm tra PIOMint trên Sepolia  
npx hardhat verify --network sepolia 0x70403AD5749E8a70246eC7f80d974BBB41968E9E
```

#### **1.2 Kiểm tra Validator Bot:**
```bash
# Test validator bot
npm run validator:start

# Kiểm tra logs
tail -f validator-bot.log
```

#### **1.3 Kiểm tra Webapp:**
```bash
cd ../webapp
npm run dev
# Mở http://localhost:5173
```

### **✅ Bước 2: Test User Flow**

#### **2.1 Kết nối ví:**
1. **Mở webapp** → http://localhost:5173
2. **Click "Connect Wallet"** → Chọn MetaMask
3. **Import private key** vào MetaMask (nếu cần)
4. **Switch network** sang Pione Zero (Chain ID: 5080)

#### **2.2 Kiểm tra Balance:**
- **PZO Balance**: Phải có PZO tokens để test
- **ETH Balance**: Phải có ETH để trả gas fee
- **Network**: Phải ở Pione Zero (5080)

#### **2.3 Test Bridge Transaction:**
1. **Nhập amount**: 0.1 PZO (số nhỏ để test)
2. **Nhập destination address**: Địa chỉ Sepolia của bạn
3. **Click "Bridge PZO"**
4. **Ký transaction** trong MetaMask
5. **Chờ confirmation**

### **✅ Bước 3: Test Validator Bot**

#### **3.1 Kiểm tra Bot Status:**
```bash
# Xem bot có đang chạy không
ps aux | grep validator

# Xem logs
tail -f validator-bot.log | grep "Locked event"
```

#### **3.2 Test Event Detection:**
1. **Thực hiện bridge transaction** từ webapp
2. **Kiểm tra logs** của validator bot:
```bash
tail -f validator-bot.log | grep "New Locked event"
```

#### **3.3 Test Auto Approval:**
1. **Chờ bot detect** sự kiện Locked
2. **Kiểm tra approval transactions** trên Sepolia
3. **Verify** wPZO được mint cho user

### **✅ Bước 4: Test End-to-End Flow**

#### **4.1 Complete Bridge Test:**
```
User Action → MetaMask → PZO Locked → Event Emitted → 
Bot Detects → Auto Approve → wPZO Minted → User Receives
```

#### **4.2 Verification Steps:**
1. **Pione Zero**: PZO balance giảm
2. **Sepolia**: wPZO balance tăng  
3. **Transaction History**: Hiển thị "Đã mint wPZO"
4. **Explorer**: Có thể view transactions

### **✅ Bước 5: Test Error Scenarios**

#### **5.1 Test Insufficient Funds:**
- Bridge với amount > PZO balance
- Kiểm tra error message

#### **5.2 Test Wrong Network:**
- Bridge khi không ở Pione Zero
- Kiểm tra network switch

#### **5.3 Test Invalid Address:**
- Bridge với địa chỉ không hợp lệ
- Kiểm tra validation

#### **5.4 Test Bot Failure:**
- Stop validator bot
- Bridge transaction
- Kiểm tra pending status

### **✅ Bước 6: Performance Testing**

#### **6.1 Multiple Transactions:**
- Bridge nhiều transactions liên tiếp
- Kiểm tra bot xử lý được không

#### **6.2 Large Amounts:**
- Bridge với amount lớn
- Kiểm tra gas estimation

#### **6.3 Network Congestion:**
- Test khi network bị lag
- Kiểm tra retry mechanism

## 🔍 **Debug Commands**

### **Kiểm tra Contract Status:**
```bash
# PIOLock status
npx hardhat run scripts/check-lock-status.js --network pionezero

# PIOMint status  
npx hardhat run scripts/check-mint-status.js --network sepolia
```

### **Kiểm tra Validator Balances:**
```bash
# Check validator ETH balances
npx hardhat run scripts/check-validator-balances.js
```

### **Kiểm tra Recent Events:**
```bash
# Get recent Locked events
npx hardhat run scripts/get-recent-events.js --network pionezero
```

## 📊 **Expected Results**

### **✅ Successful Test:**
- **User**: PZO → wPZO bridge thành công
- **Bot**: Auto-detect và approve mint
- **UI**: Transaction status "Đã mint wPZO"
- **Explorer**: Có thể view tất cả transactions

### **❌ Failed Test:**
- **User**: Error message rõ ràng
- **Bot**: Logs error và retry
- **UI**: Retry button xuất hiện
- **Recovery**: Có thể retry transaction

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. "Contract not found"**
```bash
# Recompile contracts
npm run compile

# Redeploy if needed
npm run deploy:pionezero
npm run deploy:sepolia
```

#### **2. "Validator bot not responding"**
```bash
# Restart bot
pm2 restart validator-bot

# Check logs
pm2 logs validator-bot
```

#### **3. "RPC connection failed"**
```bash
# Test RPC endpoints
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://zeroscan.org/api/eth-rpc
```

#### **4. "Transaction stuck"**
```bash
# Check transaction status
npx hardhat run scripts/check-transaction.js --network pionezero <txHash>
```

## 🎯 **Test Success Criteria**

### **✅ Must Pass:**
- [ ] User có thể kết nối ví
- [ ] User có thể bridge PZO → wPZO
- [ ] MetaMask popup cho user ký
- [ ] Bot auto-detect Locked events
- [ ] Bot auto-approve mint requests
- [ ] wPZO được mint cho user
- [ ] UI hiển thị transaction status đúng
- [ ] Error handling hoạt động
- [ ] Retry mechanism hoạt động

### **🎉 Perfect Test:**
- **End-to-end bridge** hoạt động mượt mà
- **User experience** tốt
- **Bot reliability** cao
- **Error recovery** nhanh
- **Performance** ổn định

**Chúc bạn test thành công!** 🚀
