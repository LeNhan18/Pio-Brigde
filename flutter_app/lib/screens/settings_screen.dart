import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/wallet_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String _selectedNetwork = 'Pione Zero';
  bool _notificationsEnabled = true;
  bool _autoApprove = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final walletService = Provider.of<WalletService>(context, listen: false);
    setState(() {
      _selectedNetwork = walletService.network;
    });
  }

  Future<void> _switchNetwork(String network) async {
    setState(() {
      _selectedNetwork = network;
    });

    try {
      final walletService = Provider.of<WalletService>(context, listen: false);
      await walletService.switchNetwork(network);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Switched to $network')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to switch network: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          // Network Settings
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Network Settings',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Consumer<WalletService>(
                    builder: (context, walletService, child) {
                      return Column(
                        children: [
                          ListTile(
                            title: const Text('Pione Zero'),
                            subtitle: const Text('Chain ID: 5080'),
                            leading: Radio<String>(
                              value: 'Pione Zero',
                              groupValue: _selectedNetwork,
                              onChanged: (value) {
                                if (value != null) {
                                  _switchNetwork(value);
                                }
                              },
                            ),
                            trailing: walletService.network == 'Pione Zero'
                                ? const Icon(Icons.check_circle, color: Colors.green)
                                : null,
                          ),
                          ListTile(
                            title: const Text('Goerli'),
                            subtitle: const Text('Chain ID: 5'),
                            leading: Radio<String>(
                              value: 'Goerli',
                              groupValue: _selectedNetwork,
                              onChanged: (value) {
                                if (value != null) {
                                  _switchNetwork(value);
                                }
                              },
                            ),
                            trailing: walletService.network == 'Goerli'
                                ? const Icon(Icons.check_circle, color: Colors.green)
                                : null,
                          ),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ),

          // Wallet Settings
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Wallet Settings',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Consumer<WalletService>(
                    builder: (context, walletService, child) {
                      if (walletService.isConnected) {
                        return Column(
                          children: [
                            ListTile(
                              title: const Text('Connected Address'),
                              subtitle: Text(walletService.address?.hex ?? 'Unknown'),
                              leading: const Icon(Icons.account_balance_wallet),
                            ),
                            ListTile(
                              title: const Text('Current Network'),
                              subtitle: Text(walletService.network),
                              leading: const Icon(Icons.network_check),
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () async {
                                  await walletService.disconnect();
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Wallet disconnected')),
                                    );
                                  }
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red,
                                  foregroundColor: Colors.white,
                                ),
                                child: const Text('Disconnect Wallet'),
                              ),
                            ),
                          ],
                        );
                      } else {
                        return const ListTile(
                          title: Text('No wallet connected'),
                          subtitle: Text('Connect your wallet to view details'),
                          leading: Icon(Icons.wallet_outlined),
                        );
                      }
                    },
                  ),
                ],
              ),
            ),
          ),

          // App Settings
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'App Settings',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    title: const Text('Notifications'),
                    subtitle: const Text('Receive transaction notifications'),
                    value: _notificationsEnabled,
                    onChanged: (value) {
                      setState(() {
                        _notificationsEnabled = value;
                      });
                    },
                    secondary: const Icon(Icons.notifications),
                  ),
                  SwitchListTile(
                    title: const Text('Auto Approve'),
                    subtitle: const Text('Automatically approve small transactions'),
                    value: _autoApprove,
                    onChanged: (value) {
                      setState(() {
                        _autoApprove = value;
                      });
                    },
                    secondary: const Icon(Icons.auto_awesome),
                  ),
                ],
              ),
            ),
          ),

          // About Section
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'About',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  const ListTile(
                    title: Text('Version'),
                    subtitle: Text('1.0.0'),
                    leading: Icon(Icons.info),
                  ),
                  ListTile(
                    title: const Text('Network Status'),
                    subtitle: const Text('All networks operational'),
                    leading: const Icon(Icons.check_circle, color: Colors.green),
                    trailing: IconButton(
                      icon: const Icon(Icons.refresh),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Network status refreshed')),
                        );
                      },
                    ),
                  ),
                  ListTile(
                    title: const Text('Support'),
                    subtitle: const Text('Contact support team'),
                    leading: const Icon(Icons.help),
                    onTap: () {
                      // Open support page or email
                    },
                  ),
                ],
              ),
            ),
          ),

          // Contract Addresses
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Contract Addresses',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  const ListTile(
                    title: Text('PIO Lock Contract'),
                    subtitle: Text('0x0000000000000000000000000000000000000000'),
                    leading: Icon(Icons.lock),
                  ),
                  const ListTile(
                    title: Text('PIO Mint Contract'),
                    subtitle: Text('0x0000000000000000000000000000000000000000'),
                    leading: Icon(Icons.add_circle),
                  ),
                  const ListTile(
                    title: Text('PIO Token Contract'),
                    subtitle: Text('0x0000000000000000000000000000000000000000'),
                    leading: Icon(Icons.token),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
