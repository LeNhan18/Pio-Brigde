# 🚀 Hướng dẫn giao dịch thật trên Testnet

## 📋 Yêu cầu trước khi bắt đầu

### 1. **Cài đặt ví MetaMask**
- Tải MetaMask extension cho browser
- Tạo ví mới hoặc import ví hiện có
- **Lưu ý**: Backup seed phrase an toàn!

### 2. **Thêm Testnet Networks**

#### **Pione Zero Testnet**
```
Network Name: Pione Zero Testnet
RPC URL: https://rpc.zeroscan.org
Chain ID: 5080
Currency Symbol: PZO
Block Explorer: https://zeroscan.org
```

#### **Goerli Testnet (Ethereum)**
```
Network Name: Goerli Testnet
RPC URL: https://rpc.ankr.com/eth_goerli
Chain ID: 5
Currency Symbol: ETH
Block Explorer: https://goerli.etherscan.io
```

### 3. **Lấy Testnet Tokens**

#### **PZO Tokens (Pione Zero)**
- Faucet: https://faucet.zeroscan.org
- Hoặc liên hệ team để request PZO testnet

#### **Goerli ETH**
- Faucet: https://goerlifaucet.com
- Hoặc: https://faucet.quicknode.com/ethereum/goerli

## 🔧 Cấu hình Environment

Tạo file `.env.local` trong thư mục `webapp/`:

```env
# Pione Zero Testnet
VITE_PIONEZERO_RPC=https://rpc.zeroscan.org

# Goerli Testnet  
VITE_GOERLI_RPC=https://rpc.ankr.com/eth_goerli

# Contract Addresses (sẽ được cập nhật sau khi deploy)
VITE_PIOLOCK_ADDRESS=0x...
VITE_PIOMINT_ADDRESS=0x...
```

## 🚀 Deploy Smart Contracts

### 1. **Deploy PIOLock Contract (Pione Zero)**
```bash
cd contracts
npm install
npx hardhat run scripts/deploy-testnet.js --network pionezero
```

### 2. **Deploy PIOMint Contract (Goerli)**
```bash
npx hardhat run scripts/deploy-testnet.js --network goerli
```

### 3. **Cập nhật Contract Addresses**
Sau khi deploy, cập nhật addresses trong `.env.local`:
```env
VITE_PIOLOCK_ADDRESS=0x[PIOLock_Address_on_PioneZero]
VITE_PIOMINT_ADDRESS=0x[PIOMint_Address_on_Goerli]
```

## 💰 Quy trình giao dịch thật

### **Bước 1: Chuẩn bị**
1. Kết nối MetaMask với PIO Bridge
2. Đảm bảo có PZO trên Pione Zero
3. Đảm bảo có ETH trên Goerli (cho gas fees)

### **Bước 2: Bridge PZO → wPZO**
1. Chọn tab "Bridge"
2. Nhập số lượng PZO muốn bridge
3. Nhập địa chỉ đích trên Goerli
4. Click "Bridge PZO"
5. Confirm transaction trên MetaMask

### **Bước 3: Validator Approval**
1. Chuyển sang tab "Validator"
2. Nhập Lock ID từ giao dịch bridge
3. Nhập địa chỉ nhận và số lượng
4. Click "Approve Mint"
5. Confirm transaction

## 🔍 Kiểm tra giao dịch

### **Pione Zero (PIOLock)**
- Explorer: https://zeroscan.org
- Tìm transaction hash để xem chi tiết

### **Goerli (PIOMint)**
- Explorer: https://goerli.etherscan.io
- Kiểm tra wPZO token balance

## ⚠️ Lưu ý quan trọng

### **Gas Fees**
- Pione Zero: Rất thấp (~0.001 PZO)
- Goerli: Có thể cao, cần đủ ETH

### **Transaction Times**
- Pione Zero: ~2-5 giây
- Goerli: ~15-30 giây

### **Multisig & Timelock**
- Cần 3/5 validators approve
- Timelock 24h trước khi mint
- AI sẽ monitor và đưa ra cảnh báo

## 🛠️ Troubleshooting

### **Lỗi "Insufficient Balance"**
- Kiểm tra PZO balance trên Pione Zero
- Kiểm tra ETH balance trên Goerli (cho gas)

### **Lỗi "Wrong Network"**
- Đảm bảo đang ở đúng network
- Refresh page sau khi switch network

### **Transaction Pending**
- Kiểm tra gas price
- Có thể cần tăng gas limit
- Đợi network confirm

### **Contract Not Found**
- Kiểm tra contract addresses trong .env
- Đảm bảo contracts đã được deploy
- Restart development server

## 📞 Hỗ trợ

- **Discord**: [Link Discord]
- **Telegram**: [Link Telegram]  
- **Email**: support@pio-bridge.com
- **AI Assistant**: Click button 🤖 trong app

## 🎯 Test Cases

### **Test 1: Basic Bridge**
1. Bridge 1 PZO từ Pione Zero → Goerli
2. Kiểm tra Lock event
3. Approve mint sau 24h
4. Verify wPZO balance

### **Test 2: Large Amount**
1. Bridge 100 PZO
2. Kiểm tra AI risk assessment
3. Verify multisig requirement

### **Test 3: Error Handling**
1. Thử bridge với insufficient balance
2. Thử với invalid address
3. Kiểm tra error messages

---

**Chúc bạn test thành công! 🚀**
