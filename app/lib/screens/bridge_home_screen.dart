import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../widgets/3d_bridge_card.dart';
import '../widgets/3d_bridge_animation.dart';
import '../theme/app_theme.dart';
import '../models/bridge_state.dart';

class BridgeHomeScreen extends StatefulWidget {
  const BridgeHomeScreen({Key? key}) : super(key: key);

  @override
  State<BridgeHomeScreen> createState() => _BridgeHomeScreenState();
}

class _BridgeHomeScreenState extends State<BridgeHomeScreen>
    with TickerProviderStateMixin {
  late AnimationController _backgroundController;
  late AnimationController _contentController;

  @override
  void initState() {
    super.initState();
    _backgroundController = AnimationController(
      duration: const Duration(seconds: 20),
      vsync: this,
    );
    _contentController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _backgroundController.repeat();
    _contentController.forward();
  }

  @override
  void dispose() {
    _backgroundController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: Stack(
          children: [
            // Background particles
            Positioned.fill(
              child: Floating3DParticles(
                particleCount: 30,
                particleColor: AppTheme.primaryColor,
                speed: 0.5,
              ),
            ),
            
            // Main content
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    // Header
                    _buildHeader(),
                    const SizedBox(height: 40),
                    
                    // Bridge status
                    _buildBridgeStatus(),
                    const SizedBox(height: 40),
                    
                    // Action cards
                    Expanded(
                      child: _buildActionCards(),
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

  Widget _buildHeader() {
    return Column(
      children: [
        Text(
          'PIO Bridge',
          style: Theme.of(context).textTheme.headlineLarge?.copyWith(
            background: Paint()
              ..shader = AppTheme.primaryGradient.createShader(
                const Rect.fromLTWH(0, 0, 200, 50),
              ),
          ),
        ).animate()
          .fadeIn(duration: 800.ms)
          .slideY(begin: -0.3, end: 0),
        
        const SizedBox(height: 8),
        
        Text(
          'Cross-chain Bridge với AI Security',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: Colors.white70,
          ),
        ).animate()
          .fadeIn(duration: 1000.ms, delay: 200.ms)
          .slideY(begin: 0.3, end: 0),
      ],
    );
  }

  Widget _buildBridgeStatus() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: AppTheme.glassmorphismDecoration,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bridge Status',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: const BoxDecoration(
                          color: Colors.green,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Active & Secure',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'AI Protection',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.accentColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '99.9% Uptime',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ).animate()
      .fadeIn(duration: 800.ms, delay: 400.ms)
      .slideX(begin: -0.3, end: 0);
  }

  Widget _buildActionCards() {
    return GridView.count(
      crossAxisCount: 2,
      childAspectRatio: 1.2,
      children: [
        Bridge3DCard(
          title: 'Bridge PIO',
          subtitle: 'Pione Zero → Goerli',
          icon: Icons.swap_horiz,
          primaryColor: AppTheme.primaryColor,
          secondaryColor: AppTheme.secondaryColor,
          onTap: () => _navigateToBridge(),
          isActive: true,
        ),
        Bridge3DCard(
          title: 'History',
          subtitle: 'Transaction Records',
          icon: Icons.history,
          primaryColor: AppTheme.accentColor,
          secondaryColor: AppTheme.primaryColor,
          onTap: () => _navigateToHistory(),
        ),
        Bridge3DCard(
          title: 'Security',
          subtitle: 'AI Protection',
          icon: Icons.security,
          primaryColor: Colors.green,
          secondaryColor: Colors.greenAccent,
          onTap: () => _navigateToSecurity(),
        ),
        Bridge3DCard(
          title: 'Settings',
          subtitle: 'Preferences',
          icon: Icons.settings,
          primaryColor: Colors.orange,
          secondaryColor: Colors.deepOrange,
          onTap: () => _navigateToSettings(),
        ),
      ],
    );
  }

  void _navigateToBridge() {
    // TODO: Navigate to bridge screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Navigating to Bridge...')),
    );
  }

  void _navigateToHistory() {
    // TODO: Navigate to history screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Navigating to History...')),
    );
  }

  void _navigateToSecurity() {
    // TODO: Navigate to security screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Navigating to Security...')),
    );
  }

  void _navigateToSettings() {
    // TODO: Navigate to settings screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Navigating to Settings...')),
    );
  }
}
