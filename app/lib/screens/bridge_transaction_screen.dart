import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../models/bridge_state.dart';
import '../theme/app_theme.dart';
import '../widgets/3d_bridge_animation.dart';

class BridgeTransactionScreen extends StatefulWidget {
  const BridgeTransactionScreen({Key? key}) : super(key: key);

  @override
  State<BridgeTransactionScreen> createState() => _BridgeTransactionScreenState();
}

class _BridgeTransactionScreenState extends State<BridgeTransactionScreen> {
  final TextEditingController _amountController = TextEditingController();
  double _selectedAmount = 0.0;
  bool _isProcessing = false;

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bridge PIO'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: Stack(
          children: [
            // Background particles
            Positioned.fill(
              child: Floating3DParticles(
                particleCount: 20,
                particleColor: AppTheme.primaryColor,
                speed: 0.3,
              ),
            ),
            
            // Main content
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    // Bridge visualization
                    _buildBridgeVisualization(),
                    const SizedBox(height: 40),
                    
                    // Transaction form
                    Expanded(
                      child: _buildTransactionForm(),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBridgeVisualization() {
    return Container(
      height: 200,
      decoration: AppTheme.glassmorphismDecoration,
      child: Stack(
        children: [
          // Bridge path
          Center(
            child: Container(
              width: 300,
              height: 4,
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          
          // Source chain
          Positioned(
            left: 20,
            top: 50,
            child: _buildChainNode('Pione Zero', Icons.account_balance_wallet, AppTheme.primaryColor),
          ),
          
          // Destination chain
          Positioned(
            right: 20,
            top: 50,
            child: _buildChainNode('Goerli', Icons.public, AppTheme.secondaryColor),
          ),
          
          // Bridge animation
          Center(
            child: Bridge3DAnimation(
              isAnimating: _isProcessing,
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  gradient: AppTheme.accentGradient,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.accentColor.withOpacity(0.3),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.swap_horiz,
                  color: Colors.white,
                  size: 30,
                ),
              ),
            ),
          ),
        ],
      ),
    ).animate()
      .fadeIn(duration: 800.ms)
      .slideY(begin: -0.3, end: 0);
  }

  Widget _buildChainNode(String label, IconData icon, Color color) {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [color, color.withOpacity(0.7)],
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.3),
                blurRadius: 15,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Icon(icon, color: Colors.white, size: 40),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: color,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildTransactionForm() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: AppTheme.glassmorphismDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Bridge Transaction',
            style: Theme.of(context).textTheme.headlineSmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          
          // Amount input
          _buildAmountInput(),
          const SizedBox(height: 24),
          
          // Quick amount buttons
          _buildQuickAmountButtons(),
          const SizedBox(height: 24),
          
          // Balance info
          _buildBalanceInfo(),
          const SizedBox(height: 32),
          
          // Bridge button
          _buildBridgeButton(),
        ],
      ),
    ).animate()
      .fadeIn(duration: 800.ms, delay: 400.ms)
      .slideY(begin: 0.3, end: 0);
  }

  Widget _buildAmountInput() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Amount to Bridge',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _amountController,
          keyboardType: TextInputType.number,
          style: Theme.of(context).textTheme.headlineSmall,
          decoration: InputDecoration(
            hintText: '0.0',
            suffixText: 'PIO',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: AppTheme.primaryColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: AppTheme.primaryColor, width: 2),
            ),
          ),
          onChanged: (value) {
            setState(() {
              _selectedAmount = double.tryParse(value) ?? 0.0;
            });
          },
        ),
      ],
    );
  }

  Widget _buildQuickAmountButtons() {
    final amounts = [0.25, 0.5, 0.75, 1.0];
    return Row(
      children: amounts.map((amount) {
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: ElevatedButton(
              onPressed: () {
                _amountController.text = amount.toString();
                setState(() {
                  _selectedAmount = amount;
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: _selectedAmount == amount
                    ? AppTheme.primaryColor
                    : AppTheme.surfaceColor,
                foregroundColor: Colors.white,
              ),
              child: Text('${(amount * 100).toInt()}%'),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildBalanceInfo() {
    return Consumer<BridgeState>(
      builder: (context, bridgeState, child) {
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surfaceColor.withOpacity(0.5),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'PIO Balance',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Text(
                    '${bridgeState.pioBalance.toStringAsFixed(4)} PIO',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'wPIO Balance',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Text(
                    '${bridgeState.wpioBalance.toStringAsFixed(4)} wPIO',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: AppTheme.secondaryColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBridgeButton() {
    return Consumer<BridgeState>(
      builder: (context, bridgeState, child) {
        return ElevatedButton(
          onPressed: bridgeState.isLoading || _selectedAmount <= 0
              ? null
              : () => _performBridge(),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primaryColor,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: bridgeState.isLoading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : Text(
                  'Bridge ${_selectedAmount.toStringAsFixed(4)} PIO',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
        );
      },
    );
  }

  void _performBridge() async {
    final bridgeState = Provider.of<BridgeState>(context, listen: false);
    setState(() {
      _isProcessing = true;
    });

    await bridgeState.bridgePIO(_selectedAmount);

    setState(() {
      _isProcessing = false;
    });

    if (bridgeState.errorMessage.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Bridge transaction successful!'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(bridgeState.errorMessage),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
