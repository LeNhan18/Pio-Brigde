PIO Bridge (Pione Zero -> Goerli)

1) Cài đặt
- npm i
- npx hardhat compile
- npx hardhat test

2) Biến môi trường (.env)
- PRIVATE_KEY=0x...
- RPC_PIONE_ZERO=...
- RPC_GOERLI=https://rpc.ankr.com/eth_goerli
- PIO_TOKEN=0x... (địa chỉ PIO trên Pione Zero)
- VALIDATORS=0xv1,0xv2,0xv3,0xv4,0xv5

3) Deploy
- Pione Zero (PIOLock): npx hardhat run scripts/deploy.js --network pionezero
- Goerli (PIOMint): npx hardhat run scripts/deploy.js --network goerli

4) Frontend
- cd frontend && npm i && npm start
- Thiết lập REACT_APP_LOCK_ADDRESS và REACT_APP_MINT_ADDRESS khi build

5) Quy trình Bridge
- User lock PIO trên Pione Zero -> validators 3/5 approve -> finalize
- Relayer chuyển lockId sang Goerli -> validators 3/5 approve -> mint wPIO
- Sau 24h chưa finalize ở nguồn, user có thể rollback

6) Gợi ý AI (LSTM/Autoencoder)
- Thu thập đặc trưng giao dịch, huấn luyện autoencoder phát hiện bất thường
- Tính điểm rủi ro real-time để throttle hoặc chặn mint


