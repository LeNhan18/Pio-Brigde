import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:glassmorphism/glassmorphism.dart';

class Bridge3DCard extends StatefulWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color primaryColor;
  final Color secondaryColor;
  final VoidCallback? onTap;
  final bool isActive;

  const Bridge3DCard({
    Key? key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.primaryColor,
    required this.secondaryColor,
    this.onTap,
    this.isActive = false,
  }) : super(key: key);

  @override
  State<Bridge3DCard> createState() => _Bridge3DCardState();
}

class _Bridge3DCardState extends State<Bridge3DCard>
    with TickerProviderStateMixin {
  late AnimationController _hoverController;
  late AnimationController _pulseController;
  late Animation<double> _hoverAnimation;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _hoverController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _hoverAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _hoverController,
      curve: Curves.easeInOut,
    ));

    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.1,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    if (widget.isActive) {
      _pulseController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _hoverController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => _hoverController.forward(),
      onExit: (_) => _hoverController.reverse(),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedBuilder(
          animation: Listenable.merge([_hoverAnimation, _pulseAnimation]),
          builder: (context, child) {
            final scale = 1.0 + (_hoverAnimation.value * 0.05) + 
                (widget.isActive ? (_pulseAnimation.value - 1.0) * 0.1 : 0.0);
            final elevation = 8.0 + (_hoverAnimation.value * 12.0);
            
            return Transform.scale(
              scale: scale,
              child: Container(
                margin: const EdgeInsets.all(16),
                child: GlassmorphicContainer(
                  width: 300,
                  height: 200,
                  borderRadius: 20,
                  blur: 20,
                  alignment: Alignment.bottomCenter,
                  border: 2,
                  linearGradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      widget.primaryColor.withOpacity(0.3),
                      widget.secondaryColor.withOpacity(0.3),
                    ],
                  ),
                  borderGradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      widget.primaryColor.withOpacity(0.8),
                      widget.secondaryColor.withOpacity(0.8),
                    ],
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          widget.primaryColor.withOpacity(0.1),
                          widget.secondaryColor.withOpacity(0.1),
                        ],
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            widget.icon,
                            size: 48,
                            color: widget.primaryColor,
                          ).animate()
                            .scale(duration: 600.ms, curve: Curves.elasticOut)
                            .fadeIn(duration: 400.ms),
                          const SizedBox(height: 16),
                          Text(
                            widget.title,
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: widget.primaryColor,
                            ),
                            textAlign: TextAlign.center,
                          ).animate()
                            .slideY(duration: 600.ms, curve: Curves.easeOut)
                            .fadeIn(duration: 500.ms),
                          const SizedBox(height: 8),
                          Text(
                            widget.subtitle,
                            style: TextStyle(
                              fontSize: 14,
                              color: widget.primaryColor.withOpacity(0.8),
                            ),
                            textAlign: TextAlign.center,
                          ).animate()
                            .slideY(duration: 800.ms, curve: Curves.easeOut)
                            .fadeIn(duration: 600.ms),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
