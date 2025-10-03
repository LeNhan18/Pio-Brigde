import 'package:flutter/material.dart';
import 'package:web3dart/web3dart.dart';
import 'package:shared_preferences/shared_preferences.dart';

class WalletService extends ChangeNotifier {
  EthereumAddress? _address;
  String? _privateKey;
  Web3Client? _client;
  bool _isConnected = false;
  String _network = 'Pione Zero';
  
  // Getters
  EthereumAddress? get address => _address;
  String? get privateKey => _privateKey;
  bool get isConnected => _isConnected;
  String get network => _network;
  Web3Client? get client => _client;

  // Network configurations
  static const Map<String, String> networks = {
    'Pione Zero': 'https://rpc.pioneer-zero.invalid', // Thay bằng RPC thực tế
    'Goerli': 'https://rpc.ankr.com/eth_goerli',
  };

  Future<void> connectWallet(String privateKey) async {
    try {
      _privateKey = privateKey;
      final credentials = EthPrivateKey.fromHex(privateKey);
      _address = await credentials.extractAddress();
      
      // Connect to Pione Zero by default
      await switchNetwork('Pione Zero');
      
      _isConnected = true;
      
      // Save to preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('private_key', privateKey);
      await prefs.setString('network', _network);
      
      notifyListeners();
    } catch (e) {
      throw Exception('Failed to connect wallet: $e');
    }
  }

  Future<void> switchNetwork(String networkName) async {
    if (!networks.containsKey(networkName)) {
      throw Exception('Unsupported network: $networkName');
    }
    
    _network = networkName;
    _client = Web3Client(
      networks[networkName]!,
      const HttpClient(),
    );
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('network', networkName);
    
    notifyListeners();
  }

  Future<void> disconnect() async {
    _address = null;
    _privateKey = null;
    _client = null;
    _isConnected = false;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('private_key');
    await prefs.remove('network');
    
    notifyListeners();
  }

  Future<void> loadSavedWallet() async {
    final prefs = await SharedPreferences.getInstance();
    final savedPrivateKey = prefs.getString('private_key');
    final savedNetwork = prefs.getString('network');
    
    if (savedPrivateKey != null) {
      await connectWallet(savedPrivateKey);
      if (savedNetwork != null && savedNetwork != _network) {
        await switchNetwork(savedNetwork);
      }
    }
  }

  Future<EtherAmount> getBalance() async {
    if (!_isConnected || _client == null || _address == null) {
      throw Exception('Wallet not connected');
    }
    
    return await _client!.getBalance(_address!);
  }

  Future<String> getNetworkName() async {
    if (_client == null) return 'Unknown';
    
    try {
      final chainId = await _client!.getNetworkId();
      switch (chainId) {
        case 5080:
          return 'Pione Zero';
        case 5:
          return 'Goerli';
        default:
          return 'Unknown (Chain ID: $chainId)';
      }
    } catch (e) {
      return 'Unknown';
    }
  }
}
