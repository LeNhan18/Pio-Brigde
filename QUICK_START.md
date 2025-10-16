# 🚀 Quick Start - Deploy PIO Bridge

## ✅ Files đã tạo sẵn:
- `contracts/.env` - File cấu hình contracts
- `webapp/.env.local` - File cấu hình webapp

## 🔧 Bước 1: Cấu hình Contracts

Mở file `contracts/.env` và sửa:

```env
# 1. Thay PRIVATE_KEY bằng private key của bạn (không có 0x)
PRIVATE_KEY=abc123def456...

# 2. Thay VALIDATORS bằng 5 địa chỉ ví thật
VALIDATORS=0x123...,0x456...,0x789...,0xabc...,0xdef...

# 3. Thay PIO_TOKEN bằng địa chỉ PIO token trên Pione Zero
PIO_TOKEN=0x0000000000000000000000000000000000000000
```

### 🔑 Lấy Private Key từ MetaMask:
1. Mở MetaMask
2. Click 3 chấm → Account details
3. Export private key
4. Copy (không có 0x ở đầu)

### 👥 Tạo 5 Validator Addresses:
- Có thể dùng cùng 1 ví cho tất cả (để test)
- Hoặc tạo 5 ví khác nhau

## 💰 Bước 2: Get Testnet Tokens

### **Pione Zero (PZO):**
- Faucet: https://faucet.zeroscan.org
- Cần để deploy PIOLock

### **Goerli (ETH):**
- Faucet: https://goerlifaucet.com  
- Cần để deploy PIOMint

## 🚀 Bước 3: Deploy Contracts

```bash
cd contracts
npm install --legacy-peer-deps
npm run deploy:pionezero
npm run deploy:goerli
```

## 📝 Bước 4: Cập nhật Webapp

Sau khi deploy, copy addresses vào `webapp/.env.local`:

```env
VITE_PIOLOCK_ADDRESS=0x[Address_from_PIOLock_deploy]
VITE_PIOMINT_ADDRESS=0x[Address_from_PIOMint_deploy]
```

## 🎯 Bước 5: Chạy Webapp

```bash
cd webapp
npm run dev
```

## 🔍 Kiểm tra Deploy

- **Pione Zero**: https://zeroscan.org
- **Goerli**: https://goerli.etherscan.io

## ⚠️ Lưu ý quan trọng:

1. **Private Key**: Không share với ai, chỉ dùng cho testnet
2. **Validators**: Cần đúng 5 địa chỉ, cách nhau bởi dấu phẩy
3. **PIO Token**: Tìm địa chỉ PIO token thật trên Pione Zero
4. **Balance**: Đảm bảo có đủ tokens để deploy

## 🆘 Nếu gặp lỗi:

### **"Insufficient Balance"**
- Get thêm tokens từ faucet

### **"Invalid Private Key"**  
- Kiểm tra format (không có 0x)

### **"Network Error"**
- Kiểm tra RPC URLs trong hardhat.config.js

---

**Bây giờ bạn có thể deploy và test bridge! 🎉**
