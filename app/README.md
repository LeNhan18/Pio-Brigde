# PIO Bridge - Flutter App với Giao Diện 3D

## 🚀 Tính Năng

- **Giao diện 3D đẹp mắt** với animations mượt mà
- **Bridge PIO** từ Pione Zero sang Goerli
- **AI Security** tích hợp bảo mật thông minh
- **Glassmorphism UI** với hiệu ứng kính
- **Particle Effects** tạo không gian 3D
- **Responsive Design** tối ưu cho mobile

## 🎨 Thiết Kế

### Theme
- **Dark Mode** với gradient backgrounds
- **Primary Color**: Indigo (#6366F1)
- **Secondary Color**: Purple (#8B5CF6)
- **Accent Color**: Cyan (#06B6D4)

### Components 3D
- **Bridge3DCard**: Card với hiệu ứng hover và pulse
- **Bridge3DAnimation**: Animation 3D với rotation và scale
- **Floating3DParticles**: Particle system tạo không gian 3D
- **Glassmorphism**: Hiệu ứng kính trong suốt

## 📱 Màn Hình

### 1. Bridge Home Screen
- Header với gradient text
- Bridge status với AI protection
- Grid layout với 4 action cards:
  - Bridge PIO
  - History
  - Security
  - Settings

### 2. Bridge Transaction Screen
- Bridge visualization với animation
- Amount input với quick select buttons
- Balance information
- Bridge button với loading state

## 🛠️ Cài Đặt

```bash
# Di chuyển vào thư mục app
cd app

# Cài đặt dependencies
flutter pub get

# Chạy app
flutter run
```

## 📦 Dependencies

### UI & 3D Effects
- `flutter_animate`: Animations mượt mà
- `lottie`: Lottie animations
- `shimmer`: Shimmer effects
- `glassmorphism`: Glassmorphism UI

### State Management
- `provider`: State management

### Networking
- `http`: HTTP requests
- `web3dart`: Web3 integration

### UI Components
- `flutter_svg`: SVG support
- `cached_network_image`: Image caching

### Animations
- `auto_animated`: Auto animations
- `flutter_staggered_animations`: Staggered animations

## 🎯 Cấu Trúc Project

```
lib/
├── main.dart                 # App entry point
├── models/
│   └── bridge_state.dart    # State management
├── screens/
│   ├── bridge_home_screen.dart
│   └── bridge_transaction_screen.dart
├── widgets/
│   ├── 3d_bridge_card.dart
│   └── 3d_bridge_animation.dart
└── theme/
    └── app_theme.dart       # Theme configuration
```

## 🚀 Tính Năng Nổi Bật

### 1. 3D Animations
- Hover effects trên cards
- Pulse animations cho active states
- Particle system background
- Smooth transitions

### 2. Glassmorphism UI
- Transparent containers
- Gradient borders
- Blur effects
- Shadow effects

### 3. Responsive Design
- Grid layout cho action cards
- Flexible sizing
- Touch-friendly interactions

### 4. State Management
- Provider pattern
- Bridge state management
- Loading states
- Error handling

## 🎨 Customization

### Colors
Chỉnh sửa trong `lib/theme/app_theme.dart`:

```dart
static const Color primaryColor = Color(0xFF6366F1);
static const Color secondaryColor = Color(0xFF8B5CF6);
static const Color accentColor = Color(0xFF06B6D4);
```

### Animations
Tùy chỉnh trong `lib/widgets/3d_bridge_animation.dart`:

```dart
duration: const Duration(seconds: 2),
curve: Curves.easeInOut,
```

## 🔧 Development

### Hot Reload
```bash
flutter run
# Nhấn 'r' để hot reload
# Nhấn 'R' để hot restart
```

### Build APK
```bash
flutter build apk --release
```

### Build iOS
```bash
flutter build ios --release
```

## 📱 Screenshots

App có giao diện 3D với:
- Dark theme với gradient backgrounds
- Glassmorphism cards với hover effects
- Particle animations
- Smooth transitions
- Modern UI/UX

## 🤝 Contributing

1. Fork project
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

---

**PIO Bridge** - Cross-chain Bridge với AI Security và Giao Diện 3D Đẹp Mắt 🚀