# 🤖 Validator Bot Setup Guide

## 📋 **Tổng quan**

Validator Bot là một chương trình chạy 24/7 để:
- **Lắng nghe** sự kiện `Locked` từ contract `PIOLock` trên Pione Zero
- **Tự động approve** mint requests trên contract `PIOMint` trên Sepolia
- **Đảm bảo** ít nhất 3/5 validators approve trước khi mint wPZO

## 🔧 **Cài đặt**

### **Bước 1: Cài đặt dependencies**
```bash
cd contracts
npm install
```

### **Bước 2: Cấu hình environment**
```bash
# Copy file cấu hình
cp validator.env.example validator.env

# Chỉnh sửa validator.env với thông tin thực tế
nano validator.env
```

### **Bước 3: Điền thông tin vào validator.env**
```env
# Pione Zero Network (Lock Contract)
RPC_PIONE_ZERO=https://rpc.pione.tech
PIOLOCK_ADDRESS=0xA4fD2552fC138217101D1A86AE143924309025fB

# Sepolia Network (Mint Contract)  
RPC_SEPOLIA=https://ethereum-sepolia-rpc.publicnode.com
PIOMINT_ADDRESS=0x70403AD5749E8a70246eC7f80d974BBB41968E9E

# Validator Private Keys (5 validators)
VALIDATOR_1_PRIVATE_KEY=0x...
VALIDATOR_2_PRIVATE_KEY=0x...
VALIDATOR_3_PRIVATE_KEY=0x...
VALIDATOR_4_PRIVATE_KEY=0x...
VALIDATOR_5_PRIVATE_KEY=0x...
```

## 🚀 **Chạy Validator Bot**

### **Cách 1: Chạy trực tiếp**
```bash
npm run validator:start
```

### **Cách 2: Chạy với PM2 (Production)**
```bash
# Cài đặt PM2
npm install -g pm2

# Chạy bot với PM2
pm2 start scripts/start-validator.js --name "validator-bot"

# Xem logs
pm2 logs validator-bot

# Restart bot
pm2 restart validator-bot

# Stop bot
pm2 stop validator-bot
```

### **Cách 3: Chạy với Docker**
```bash
# Tạo Dockerfile
cat > Dockerfile << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "validator:start"]
EOF

# Build và chạy
docker build -t validator-bot .
docker run -d --name validator-bot --env-file validator.env validator-bot
```

## 🔍 **Kiểm tra hoạt động**

### **Logs**
```bash
# Xem logs real-time
tail -f validator-bot.log

# Xem logs với PM2
pm2 logs validator-bot
```

### **Test bot**
```bash
# Test bot (không chạy liên tục)
npm run validator:test
```

## 📊 **Monitoring**

### **Các metrics quan trọng:**
- **Events processed**: Số sự kiện đã xử lý
- **Approvals sent**: Số lần approve đã gửi
- **Success rate**: Tỷ lệ thành công
- **Error rate**: Tỷ lệ lỗi

### **Health check:**
```bash
# Kiểm tra bot có đang chạy không
pm2 status validator-bot

# Restart nếu cần
pm2 restart validator-bot
```

## 🚨 **Troubleshooting**

### **Lỗi thường gặp:**

#### **1. "Missing required environment variables"**
```bash
# Kiểm tra file validator.env
cat validator.env

# Đảm bảo có ít nhất 3 validators
grep VALIDATOR_.*_PRIVATE_KEY validator.env
```

#### **2. "Contract not found"**
```bash
# Kiểm tra contract addresses
echo "PIOLock: $PIOLOCK_ADDRESS"
echo "PIOMint: $PIOMINT_ADDRESS"

# Verify contracts trên blockchain
npx hardhat verify --network pionezero $PIOLOCK_ADDRESS
npx hardhat verify --network sepolia $PIOMINT_ADDRESS
```

#### **3. "Insufficient funds"**
```bash
# Kiểm tra balance của validators
npx hardhat run scripts/check-validator-balances.js
```

#### **4. "RPC connection failed"**
```bash
# Test RPC connections
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $RPC_PIONE_ZERO

curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $RPC_SEPOLIA
```

## 🔒 **Security**

### **Best practices:**
- **Không commit** private keys vào git
- **Sử dụng** environment variables
- **Rotate** private keys định kỳ
- **Monitor** logs để phát hiện bất thường
- **Backup** private keys an toàn

### **Firewall:**
```bash
# Chỉ cho phép RPC connections
ufw allow from 0.0.0.0/0 to any port 8545
ufw deny from 0.0.0.0/0 to any port 22
```

## 📈 **Scaling**

### **Multiple instances:**
```bash
# Chạy nhiều instances
pm2 start scripts/start-validator.js --name "validator-bot-1" --instances 3
pm2 start scripts/start-validator.js --name "validator-bot-2" --instances 3
```

### **Load balancing:**
- Sử dụng **nginx** để load balance
- **Redis** để sync state giữa các instances
- **Database** để lưu trữ processed events

## 🎯 **Kết quả mong đợi**

Khi bot hoạt động đúng:
1. **User** bridge PZO → MetaMask popup → User ký
2. **PZO** bị khóa → Event `Locked` được emit
3. **Bot** detect event → Tự động approve mint
4. **Contract** mint wPZO cho user (tự động)
5. **User** nhận wPZO mà không cần ký thêm

**Bot chạy 24/7 để đảm bảo bridge hoạt động liên tục!** 🚀
