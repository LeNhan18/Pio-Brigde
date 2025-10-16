# 🚀 Hướng dẫn Deploy Smart Contracts

## ⚠️ Lỗi đã sửa
- ✅ Cập nhật ethers từ v5 lên v6
- ✅ Sửa script deploy tương thích ethers v6
- ✅ Tạo env.example cho contracts

## 🔧 Bước 1: Cài đặt Dependencies

```bash
cd contracts
npm install
```

Nếu vẫn gặp lỗi, thử:
```bash
npm install --legacy-peer-deps
```

## 🔑 Bước 2: Cấu hình Environment

Tạo file `.env` trong thư mục `contracts/`:

```bash
cp env.example .env
```

Sửa file `.env`:
```env
# Private key của bạn (không có 0x)
PRIVATE_KEY=your_private_key_here

# 5 địa chỉ validator (cách nhau bởi dấu phẩy)
VALIDATORS=0x123...,0x456...,0x789...,0xabc...,0xdef...

# Địa chỉ PIO token trên Pione Zero
PIO_TOKEN=0x0000000000000000000000000000000000000000

# Bật verify contract (tùy chọn)
VERIFY=false
```

## 💰 Bước 3: Chuẩn bị Testnet Tokens

### **Pione Zero:**
- Faucet: https://faucet.zeroscan.org
- Cần PZO để deploy PIOLock

### **Goerli:**
- Faucet: https://goerlifaucet.com
- Cần ETH để deploy PIOMint

## 🚀 Bước 4: Deploy Contracts

### **Deploy PIOLock (Pione Zero):**
```bash
npm run deploy:pionezero
```

### **Deploy PIOMint (Goerli):**
```bash
npm run deploy:goerli
```

## 📝 Bước 5: Cập nhật Webapp

Sau khi deploy thành công, copy contract addresses vào `webapp/.env.local`:

```env
VITE_PIOLOCK_ADDRESS=0x[PIOLock_Address_from_deploy]
VITE_PIOMINT_ADDRESS=0x[PIOMint_Address_from_deploy]
```

## 🎯 Bước 6: Test Bridge

```bash
cd webapp
npm run dev
```

## 🔍 Troubleshooting

### **Lỗi "Insufficient Balance"**
- Kiểm tra balance trên testnet
- Get thêm tokens từ faucet

### **Lỗi "Invalid Private Key"**
- Đảm bảo private key không có 0x prefix
- Kiểm tra format địa chỉ validator

### **Lỗi "Network Not Found"**
- Kiểm tra hardhat.config.js
- Đảm bảo RPC URLs đúng

### **Lỗi "Contract Not Deployed"**
- Kiểm tra transaction trên explorer
- Verify contract addresses

## 📞 Hỗ trợ

- **Discord**: [Link Discord]
- **Telegram**: [Link Telegram]
- **AI Assistant**: Click 🤖 trong app

---

**Chúc bạn deploy thành công! 🎉**
