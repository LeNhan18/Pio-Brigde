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
      body: ParallaxBackground(
        child: Stack(
          children: [
            const Positioned.fill(child: FloatingComets(count: 4)),
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    _buildHeader(),
                    const SizedBox(height: 28),
                    _buildBridgeStatus(),
                    const SizedBox(height: 24),
                    Expanded(child: _buildActionPlanets()),
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

  Widget _buildActionPlanets() {
    return LayoutBuilder(builder: (context, constraints) {
      final isWide = constraints.maxWidth > 720;
      final children = <Widget>[
        _PlanetAction(
          label: 'Bridge PIO',
          subtitle: 'Pione Zero → Goerli',
          color: AppTheme.primaryColor,
          onTap: _navigateToBridge,
          glow: AppTheme.secondaryColor,
          icon: Icons.swap_horiz,
        ),
        _PlanetAction(
          label: 'History',
          subtitle: 'Transaction Records',
          color: AppTheme.accentColor,
          onTap: _navigateToHistory,
          glow: AppTheme.primaryColor,
          icon: Icons.history,
        ),
        _PlanetAction(
          label: 'Security',
          subtitle: 'AI Protection',
          color: Colors.greenAccent,
          onTap: _navigateToSecurity,
          glow: Colors.green,
          icon: Icons.security,
        ),
        _PlanetAction(
          label: 'Settings',
          subtitle: 'Preferences',
          color: Colors.orangeAccent,
          onTap: _navigateToSettings,
          glow: Colors.deepOrange,
          icon: Icons.settings,
        ),
      ];
      return Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1000),
          child: Wrap(
            spacing: 28,
            runSpacing: 28,
            alignment: WrapAlignment.center,
            children: children,
          ),
        ),
      );
    });
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

class _PlanetAction extends StatefulWidget {
  final String label;
  final String subtitle;
  final Color color;
  final Color glow;
  final IconData icon;
  final VoidCallback onTap;
  const _PlanetAction({
    Key? key,
    required this.label,
    required this.subtitle,
    required this.color,
    required this.glow,
    required this.icon,
    required this.onTap,
  }) : super(key: key);

  @override
  State<_PlanetAction> createState() => _PlanetActionState();
}

class _PlanetActionState extends State<_PlanetAction> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 6))..repeat();
  }
  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          final t = _controller.value;
          final tilt = (sin(t * 2 * pi) * 0.05);
          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001)
              ..rotateX(tilt)
              ..rotateY(-tilt),
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [widget.color.withOpacity(0.95), widget.color.withOpacity(0.4)],
                  radius: 0.85,
                ),
                boxShadow: [
                  BoxShadow(color: widget.glow.withOpacity(0.45), blurRadius: 40, spreadRadius: 6),
                ],
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Positioned(
                    top: 24,
                    child: Icon(widget.icon, size: 36, color: Colors.white),
                  ),
                  Positioned(
                    bottom: 52,
                    child: Text(widget.label, style: Theme.of(context).textTheme.headlineSmall),
                  ),
                  Positioned(
                    bottom: 28,
                    child: Text(widget.subtitle, style: Theme.of(context).textTheme.bodySmall),
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 800.ms).scale(begin: const Offset(0.9,0.9), end: const Offset(1,1), duration: 700.ms),
          );
        },
      ),
    );
  }
}
