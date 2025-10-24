# 🚀 Hướng dẫn Deploy Contracts

## 📋 **Bước 1: Chuẩn bị môi trường**

```bash
# Vào thư mục contracts
cd contracts

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp env.example .env
```

## 🔧 **Bước 2: Cấu hình .env**

Mở file `.env` và thêm private key:

```env
# Private key của ví (có thể dùng ví test)
PRIVATE_KEY=your_private_key_here

# RPC URLs (đã có sẵn)
PIONEZERO_RPC=https://rpc.zeroscan.org
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
```

## 🎯 **Bước 3: Deploy Contracts**

### Deploy PIOLock trên Pione Zero:
```bash
npm run deploy:pionezero
```

### Deploy PIOMint trên BSC Testnet:
```bash
npm run deploy:bscTestnet
```

## 📝 **Bước 4: Cập nhật Contract Addresses**

Sau khi deploy, copy các địa chỉ contract và thêm vào file `.env` trong thư mục `webapp`:

```env
# Contract addresses (từ kết quả deploy)
VITE_PIOLOCK_ADDRESS=0x...
VITE_PIOMINT_ADDRESS=0x...
```

## ✅ **Bước 5: Test Bridge**

1. **Refresh webapp**
2. **Kết nối ví** 
3. **Chuyển sang Pione Zero** (Chain ID: 5080)
4. **Thử bridge** một lượng nhỏ PZO

## 🆘 **Troubleshooting**

### Lỗi "Contract chưa được deploy":
- Kiểm tra file `.env` có đúng contract addresses
- Restart webapp sau khi cập nhật .env

### Lỗi "Insufficient funds":
- Lấy PZO từ faucet: https://faucet.zeroscan.org
- Lấy tBNB từ faucet: https://testnet.bnbchain.org/faucet-smart

### Lỗi "Network not supported":
- Thêm mạng BSC Testnet vào MetaMask
- Chuyển đúng mạng khi cần
