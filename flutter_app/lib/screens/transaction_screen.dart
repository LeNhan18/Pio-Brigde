import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/wallet_service.dart';

class TransactionScreen extends StatefulWidget {
  const TransactionScreen({super.key});

  @override
  State<TransactionScreen> createState() => _TransactionScreenState();
}

class _TransactionScreenState extends State<TransactionScreen> {
  List<TransactionItem> _transactions = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadTransactions();
  }

  Future<void> _loadTransactions() async {
    setState(() {
      _isLoading = true;
    });

    // Simulate loading transactions
    await Future.delayed(const Duration(seconds: 1));
    
    setState(() {
      _transactions = [
        TransactionItem(
          id: '0x1234...',
          type: 'Lock',
          amount: '100 PIO',
          status: 'Completed',
          timestamp: DateTime.now().subtract(const Duration(hours: 2)),
          network: 'Pione Zero',
        ),
        TransactionItem(
          id: '0x5678...',
          type: 'Mint',
          amount: '100 wPIO',
          status: 'Completed',
          timestamp: DateTime.now().subtract(const Duration(hours: 1)),
          network: 'Goerli',
        ),
        TransactionItem(
          id: '0x9abc...',
          type: 'Lock',
          amount: '50 PIO',
          status: 'Pending',
          timestamp: DateTime.now().subtract(const Duration(minutes: 30)),
          network: 'Pione Zero',
        ),
      ];
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Transactions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadTransactions,
          ),
        ],
      ),
      body: Consumer<WalletService>(
        builder: (context, walletService, child) {
          if (!walletService.isConnected) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.wallet, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text(
                    'Connect your wallet to view transactions',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                ],
              ),
            );
          }

          if (_isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (_transactions.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text(
                    'No transactions found',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            itemCount: _transactions.length,
            itemBuilder: (context, index) {
              final transaction = _transactions[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: _getStatusColor(transaction.status),
                    child: Icon(
                      _getTransactionIcon(transaction.type),
                      color: Colors.white,
                    ),
                  ),
                  title: Text(transaction.type),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(transaction.amount),
                      Text(
                        '${transaction.timestamp.day}/${transaction.timestamp.month} ${transaction.timestamp.hour}:${transaction.timestamp.minute.toString().padLeft(2, '0')}',
                        style: const TextStyle(fontSize: 12),
                      ),
                      Text(
                        transaction.network,
                        style: const TextStyle(fontSize: 12, color: Colors.blue),
                      ),
                    ],
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _getStatusColor(transaction.status),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          transaction.status,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        transaction.id,
                        style: const TextStyle(fontSize: 10, color: Colors.grey),
                      ),
                    ],
                  ),
                  onTap: () => _showTransactionDetails(transaction),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getTransactionIcon(String type) {
    switch (type.toLowerCase()) {
      case 'lock':
        return Icons.lock;
      case 'mint':
        return Icons.add_circle;
      case 'rollback':
        return Icons.undo;
      default:
        return Icons.swap_horiz;
    }
  }

  void _showTransactionDetails(TransactionItem transaction) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Transaction ${transaction.type}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ID: ${transaction.id}'),
            Text('Amount: ${transaction.amount}'),
            Text('Status: ${transaction.status}'),
            Text('Network: ${transaction.network}'),
            Text('Time: ${transaction.timestamp}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          TextButton(
            onPressed: () {
              // Copy to clipboard or open in explorer
              Navigator.pop(context);
            },
            child: const Text('View on Explorer'),
          ),
        ],
      ),
    );
  }
}

class TransactionItem {
  final String id;
  final String type;
  final String amount;
  final String status;
  final DateTime timestamp;
  final String network;

  TransactionItem({
    required this.id,
    required this.type,
    required this.amount,
    required this.status,
    required this.timestamp,
    required this.network,
  });
}
