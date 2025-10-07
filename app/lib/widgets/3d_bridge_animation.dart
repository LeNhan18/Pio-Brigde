import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:ui';
import 'dart:math';

class Bridge3DAnimation extends StatefulWidget {
  final Widget child;
  final bool isAnimating;
  final Duration duration;

  const Bridge3DAnimation({
    Key? key,
    required this.child,
    this.isAnimating = false,
    this.duration = const Duration(seconds: 2),
  }) : super(key: key);

  @override
  State<Bridge3DAnimation> createState() => _Bridge3DAnimationState();
}

class _Bridge3DAnimationState extends State<Bridge3DAnimation>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _rotationAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _rotationAnimation = Tween<double>(
      begin: 0.0,
      end: 0.1,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.05,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));

    _opacityAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));

    if (widget.isAnimating) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(Bridge3DAnimation oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isAnimating && !oldWidget.isAnimating) {
      _controller.repeat(reverse: true);
    } else if (!widget.isAnimating && oldWidget.isAnimating) {
      _controller.stop();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..setEntry(3, 2, 0.001)
            ..rotateX(_rotationAnimation.value)
            ..rotateY(_rotationAnimation.value),
          child: Transform.scale(
            scale: _scaleAnimation.value,
            child: Opacity(
              opacity: _opacityAnimation.value,
              child: widget.child,
            ),
          ),
        );
      },
    );
  }
}

class Floating3DParticles extends StatefulWidget {
  final int particleCount;
  final Color particleColor;
  final double speed;

  const Floating3DParticles({
    Key? key,
    this.particleCount = 20,
    this.particleColor = Colors.white,
    this.speed = 1.0,
  }) : super(key: key);

  @override
  State<Floating3DParticles> createState() => _Floating3DParticlesState();
}

class _Floating3DParticlesState extends State<Floating3DParticles>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  List<Particle> particles = [];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: (10 / widget.speed).round()),
      vsync: this,
    );

    _generateParticles();
    _controller.repeat();
  }

  void _generateParticles() {
    particles.clear();
    for (int i = 0; i < widget.particleCount; i++) {
      particles.add(Particle(
        x: (i / widget.particleCount) * 2 - 1,
        y: (i * 0.1) % 2 - 1,
        z: (i * 0.3) % 2 - 1,
        size: 2.0 + (i % 3) * 1.0,
        speed: widget.speed,
      ));
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: ParticlePainter(
            particles: particles,
            progress: _controller.value,
            color: widget.particleColor,
          ),
          size: Size.infinite,
        );
      },
    );
  }
}

class Particle {
  double x, y, z;
  double size;
  double speed;

  Particle({
    required this.x,
    required this.y,
    required this.z,
    required this.size,
    required this.speed,
  });
}

class ParticlePainter extends CustomPainter {
  final List<Particle> particles;
  final double progress;
  final Color color;

  ParticlePainter({
    required this.particles,
    required this.progress,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withOpacity(0.6)
      ..style = PaintingStyle.fill;

    for (final particle in particles) {
      final animatedZ = particle.z + progress * particle.speed;
      final scale = 1.0 / (1.0 + animatedZ);
      
      final screenX = (particle.x * scale + 1) * size.width / 2;
      final screenY = (particle.y * scale + 1) * size.height / 2;
      final screenSize = particle.size * scale;

      if (animatedZ < 1.0 && screenSize > 0.1) {
        canvas.drawCircle(
          Offset(screenX, screenY),
          screenSize,
          paint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class StarfieldPainter extends CustomPainter {
  final int starCount;
  final double twinkle;
  StarfieldPainter({this.starCount = 400, this.twinkle = 0.2});

  @override
  void paint(Canvas canvas, Size size) {
    final rnd = Random(42);
    final paint = Paint()..style = PaintingStyle.fill;
    for (int i = 0; i < starCount; i++) {
      final x = rnd.nextDouble() * size.width;
      final y = rnd.nextDouble() * size.height;
      final radius = rnd.nextDouble() * 1.4 + 0.2;
      final alpha = (150 + rnd.nextInt(105)).clamp(0, 255);
      paint.color = Colors.white.withAlpha(alpha);
      canvas.drawCircle(Offset(x, y), radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class NebulaLayer extends StatelessWidget {
  final List<Color> colors;
  final double blurSigma;
  final double opacity;
  const NebulaLayer({Key? key, required this.colors, this.blurSigma = 120, this.opacity = 0.25}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Opacity(
        opacity: opacity,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
          child: Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: const Alignment(-0.6, -0.5),
                radius: 1.2,
                colors: colors,
                stops: const [0.0, 0.5, 1.0],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class ParallaxBackground extends StatelessWidget {
  final Widget child;
  const ParallaxBackground({Key? key, required this.child}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      return Listener(
        onPointerHover: (_) {},
        child: Stack(
          children: [
            CustomPaint(
              size: Size.infinite,
              painter: StarfieldPainter(starCount: 500, twinkle: 0.15),
            ),
            const Positioned.fill(
              child: IgnorePointer(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF0B1020), Color(0xFF060812)],
                    ),
                  ),
                ),
              ),
            ),
            NebulaLayer(colors: const [Color(0xFF6D28D9), Color(0xFF0EA5E9), Colors.transparent], opacity: 0.22),
            NebulaLayer(colors: const [Color(0xFF9333EA), Color(0xFF06B6D4), Colors.transparent], opacity: 0.18),
            child,
          ],
        ),
      );
    });
  }
}

class FloatingComets extends StatefulWidget {
  final int count;
  const FloatingComets({Key? key, this.count = 3}) : super(key: key);
  @override
  State<FloatingComets> createState() => _FloatingCometsState();
}

class _FloatingCometsState extends State<FloatingComets> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final rnd = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 12))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return CustomPaint(
          size: Size.infinite,
          painter: _CometPainter(progress: _controller.value, count: widget.count),
        );
      },
    );
  }
}

class _CometPainter extends CustomPainter {
  final double progress;
  final int count;
  _CometPainter({required this.progress, required this.count});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..strokeCap = StrokeCap.round;
    for (int i = 0; i < count; i++) {
      final t = (progress + i / count) % 1.0;
      final x = size.width * (1.1 - t);
      final y = size.height * (0.2 + 0.6 * (i + 1) / (count + 1));
      paint.shader = const LinearGradient(
        colors: [Color(0xFF93C5FD), Color(0xFFA78BFA), Colors.transparent],
      ).createShader(Rect.fromLTWH(x - 120, y - 2, 120, 4));
      paint.strokeWidth = 2;
      canvas.drawLine(Offset(x, y), Offset(x - 120, y - 2), paint);
      canvas.drawCircle(Offset(x, y), 2.5, Paint()..color = const Color(0xFF93C5FD));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
