import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'models/bridge_state.dart';
import 'screens/bridge_home_screen.dart';

void main() {
  runApp(const PIOBridgeApp());
}

class PIOBridgeApp extends StatelessWidget {
  const PIOBridgeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => BridgeState(),
      child: MaterialApp(
        title: 'PIO Bridge',
        theme: AppTheme.darkTheme,
        home: const BridgeHomeScreen(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
