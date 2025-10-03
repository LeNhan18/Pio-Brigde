# PIO Bridge Flutter App

Ứng dụng mobile Flutter cho cross-chain bridge PIO từ Pione Zero sang Goerli.

## Tính năng

- **Wallet Connection**: Kết nối ví với private key
- **Network Switching**: Chuyển đổi giữa Pione Zero và Goerli
- **Bridge Operations**: Lock PIO, approve transactions, rollback
- **Transaction History**: Xem lịch sử giao dịch
- **Settings**: Cấu hình network và app settings

## Cài đặt

### Yêu cầu
- Flutter SDK >= 3.0.0
- Dart >= 3.0.0
- Android Studio / VS Code

### Bước 1: Clone và cài đặt dependencies
```bash
cd flutter_app
flutter pub get
```

### Bước 2: Cấu hình contract addresses
Chỉnh sửa file `lib/services/contract_service.dart`:
```dart
static const String pioLockAddress = '0x...'; // Địa chỉ PIOLock contract
static const String pioMintAddress = '0x...'; // Địa chỉ PIOMint contract  
static const String pioTokenAddress = '0x...'; // Địa chỉ PIO token contract
```

### Bước 3: Cấu hình RPC endpoints
Chỉnh sửa file `lib/services/wallet_service.dart`:
```dart
static const Map<String, String> networks = {
  'Pione Zero': 'https://rpc.pioneer-zero.invalid', // RPC thực tế
  'Goerli': 'https://rpc.ankr.com/eth_goerli',
};
```

## Chạy ứng dụng

### Development
```bash
flutter run
```

### Build APK
```bash
flutter build apk --release
```

### Build iOS
```bash
flutter build ios --release
```

## Cấu trúc dự án

```
lib/
├── main.dart                 # Entry point
├── screens/
│   ├── bridge_screen.dart    # Màn hình bridge chính
│   ├── transaction_screen.dart # Lịch sử giao dịch
│   └── settings_screen.dart  # Cài đặt
├── services/
│   ├── wallet_service.dart   # Quản lý ví
│   └── contract_service.dart # Tương tác smart contract
└── models/
    └── transaction_item.dart # Model giao dịch
```

## Sử dụng

### 1. Kết nối ví
- Nhập private key vào trường "Private Key"
- Nhấn "Connect Wallet"
- Chọn network (Pione Zero hoặc Goerli)

### 2. Bridge PIO
- Nhập số lượng PIO cần bridge
- Nhập địa chỉ destination trên Goerli
- Nhấn "Lock PIO"
- Chờ validators approve (3/5)

### 3. Xem lịch sử
- Chuyển sang tab "Transactions"
- Xem tất cả giao dịch đã thực hiện
- Nhấn vào giao dịch để xem chi tiết

### 4. Cài đặt
- Chuyển sang tab "Settings"
- Thay đổi network
- Cấu hình notifications
- Xem thông tin contract addresses

## Lưu ý bảo mật

- **Không chia sẻ private key** với bất kỳ ai
- **Backup private key** ở nơi an toàn
- **Kiểm tra địa chỉ destination** trước khi bridge
- **Chỉ sử dụng trên testnet** cho testing

## Troubleshooting

### Lỗi kết nối
- Kiểm tra RPC endpoint
- Đảm bảo private key đúng format
- Kiểm tra network connection

### Lỗi giao dịch
- Kiểm tra balance đủ
- Kiểm tra gas fees
- Đảm bảo contract addresses đúng

### Lỗi build
- Chạy `flutter clean`
- Chạy `flutter pub get`
- Kiểm tra Flutter version

## Tích hợp AI (Future)

- **Risk Assessment**: Đánh giá rủi ro giao dịch
- **Anomaly Detection**: Phát hiện giao dịch bất thường
- **Smart Notifications**: Thông báo thông minh
- **Predictive Analytics**: Dự đoán xu hướng bridge

## Support

- **Documentation**: Xem README.md
- **Issues**: Tạo issue trên GitHub
- **Community**: Tham gia Discord/Telegram
