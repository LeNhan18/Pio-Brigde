import 'package:flutter/foundation.dart';

class BridgeState extends ChangeNotifier {
  bool _isConnected = false;
  String _walletAddress = '';
  double _pioBalance = 0.0;
  double _wpioBalance = 0.0;
  bool _isLoading = false;
  String _errorMessage = '';

  // Getters
  bool get isConnected => _isConnected;
  String get walletAddress => _walletAddress;
  double get pioBalance => _pioBalance;
  double get wpioBalance => _wpioBalance;
  bool get isLoading => _isLoading;
  String get errorMessage => _errorMessage;

  // Actions
  void connectWallet(String address) {
    _walletAddress = address;
    _isConnected = true;
    notifyListeners();
  }

  void disconnectWallet() {
    _walletAddress = '';
    _isConnected = false;
    _pioBalance = 0.0;
    _wpioBalance = 0.0;
    notifyListeners();
  }

  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = '';
    notifyListeners();
  }

  void updateBalances(double pioBalance, double wpioBalance) {
    _pioBalance = pioBalance;
    _wpioBalance = wpioBalance;
    notifyListeners();
  }

  Future<void> bridgePIO(double amount) async {
    if (!_isConnected) {
      setError('Wallet not connected');
      return;
    }

    if (amount > _pioBalance) {
      setError('Insufficient PIO balance');
      return;
    }

    setLoading(true);
    clearError();

    try {
      // TODO: Implement actual bridge transaction
      await Future.delayed(const Duration(seconds: 2)); // Simulate API call
      
      // Update balances after successful bridge
      _pioBalance -= amount;
      _wpioBalance += amount;
      
      notifyListeners();
    } catch (e) {
      setError('Bridge transaction failed: $e');
    } finally {
      setLoading(false);
    }
  }
}
