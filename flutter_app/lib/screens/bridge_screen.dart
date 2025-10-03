import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/wallet_service.dart';
import '../services/contract_service.dart';

class BridgeScreen extends StatefulWidget {
  const BridgeScreen({super.key});

  @override
  State<BridgeScreen> createState() => _BridgeScreenState();
}

class _BridgeScreenState extends State<BridgeScreen> {
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _destinationController = TextEditingController();
  final TextEditingController _privateKeyController = TextEditingController();
  
  bool _isLoading = false;
  String _status = '';
  BigInt _pioBalance = BigInt.zero;
  BigInt _wpioBalance = BigInt.zero;

  @override
  void initState() {
    super.initState();
    _loadBalances();
  }

  Future<void> _loadBalances() async {
    final walletService = Provider.of<WalletService>(context, listen: false);
    final contractService = Provider.of<ContractService>(context, listen: false);
    
    if (walletService.isConnected) {
      try {
        final pioBalance = await contractService.getPIOBalance();
        final wpioBalance = await contractService.getWPIOBalance();
        
        setState(() {
          _pioBalance = pioBalance;
          _wpioBalance = wpioBalance;
        });
      } catch (e) {
        setState(() {
          _status = 'Error loading balances: $e';
        });
      }
    }
  }

  Future<void> _connectWallet() async {
    if (_privateKeyController.text.isEmpty) {
      setState(() {
        _status = 'Please enter private key';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _status = 'Connecting wallet...';
    });

    try {
      final walletService = Provider.of<WalletService>(context, listen: false);
      await walletService.connectWallet(_privateKeyController.text);
      
      setState(() {
        _status = 'Wallet connected successfully!';
      });
      
      await _loadBalances();
    } catch (e) {
      setState(() {
        _status = 'Failed to connect wallet: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _lockPIO() async {
    if (_amountController.text.isEmpty || _destinationController.text.isEmpty) {
      setState(() {
        _status = 'Please fill all fields';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _status = 'Locking PIO...';
    });

    try {
      final amount = BigInt.parse(_amountController.text);
      final contractService = Provider.of<ContractService>(context, listen: false);
      
      final txHash = await contractService.lockPIO(
        amount,
        _destinationController.text,
      );
      
      setState(() {
        _status = 'PIO locked successfully! TX: $txHash';
      });
      
      await _loadBalances();
    } catch (e) {
      setState(() {
        _status = 'Failed to lock PIO: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _switchNetwork(String network) async {
    setState(() {
      _isLoading = true;
      _status = 'Switching network...';
    });

    try {
      final walletService = Provider.of<WalletService>(context, listen: false);
      await walletService.switchNetwork(network);
      
      setState(() {
        _status = 'Switched to $network';
      });
      
      await _loadBalances();
    } catch (e) {
      setState(() {
        _status = 'Failed to switch network: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PIO Bridge'),
        actions: [
          Consumer<WalletService>(
            builder: (context, walletService, child) {
              if (walletService.isConnected) {
                return PopupMenuButton<String>(
                  onSelected: _switchNetwork,
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'Pione Zero',
                      child: Text('Pione Zero'),
                    ),
                    const PopupMenuItem(
                      value: 'Goerli',
                      child: Text('Goerli'),
                    ),
                  ],
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      walletService.network,
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Wallet Connection Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Wallet Connection',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _privateKeyController,
                      decoration: const InputDecoration(
                        labelText: 'Private Key',
                        hintText: '0x...',
                        border: OutlineInputBorder(),
                      ),
                      obscureText: true,
                    ),
                    const SizedBox(height: 16),
                    Consumer<WalletService>(
                      builder: (context, walletService, child) {
                        if (walletService.isConnected) {
                          return Column(
                            children: [
                              Text('Connected: ${walletService.address?.hex}'),
                              Text('Network: ${walletService.network}'),
                              const SizedBox(height: 8),
                              ElevatedButton(
                                onPressed: () async {
                                  await walletService.disconnect();
                                  setState(() {
                                    _status = 'Wallet disconnected';
                                    _pioBalance = BigInt.zero;
                                    _wpioBalance = BigInt.zero;
                                  });
                                },
                                child: const Text('Disconnect'),
                              ),
                            ],
                          );
                        } else {
                          return ElevatedButton(
                            onPressed: _isLoading ? null : _connectWallet,
                            child: _isLoading
                                ? const CircularProgressIndicator()
                                : const Text('Connect Wallet'),
                          );
                        }
                      },
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Balance Section
            if (_pioBalance > BigInt.zero || _wpioBalance > BigInt.zero)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Balances',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text('PIO Balance: ${_pioBalance.toString()}'),
                      Text('wPIO Balance: ${_wpioBalance.toString()}'),
                    ],
                  ),
                ),
              ),
            
            const SizedBox(height: 16),
            
            // Bridge Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Bridge PIO → wPIO',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _amountController,
                      decoration: const InputDecoration(
                        labelText: 'Amount (PIO)',
                        hintText: 'Enter amount to bridge',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _destinationController,
                      decoration: const InputDecoration(
                        labelText: 'Destination Address',
                        hintText: '0x...',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _lockPIO,
                      child: _isLoading
                          ? const CircularProgressIndicator()
                          : const Text('Lock PIO'),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Status Section
            if (_status.isNotEmpty)
              Card(
                color: _status.contains('Error') || _status.contains('Failed')
                    ? Colors.red.shade50
                    : Colors.green.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    _status,
                    style: TextStyle(
                      color: _status.contains('Error') || _status.contains('Failed')
                          ? Colors.red.shade700
                          : Colors.green.shade700,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _amountController.dispose();
    _destinationController.dispose();
    _privateKeyController.dispose();
    super.dispose();
  }
}
