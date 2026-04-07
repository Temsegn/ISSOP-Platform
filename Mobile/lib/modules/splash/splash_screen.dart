import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  String _statusMessage = 'INITIALIZING ENGINE';
  double _progress = 0.0;
  bool _hasError = false;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.5, curve: Curves.easeIn)),
    );

    _controller.forward();
    _startInitialization();
  }

  Future<void> _startInitialization() async {
    try {
      // Step 1: Connectivity Check
      setState(() {
        _statusMessage = 'VERIFYING CONNECTIVITY';
        _progress = 0.25;
      });
      await Future.delayed(const Duration(milliseconds: 800)); // Smooth transition
      final List<ConnectivityResult> connectivity = await Connectivity().checkConnectivity();
      if (connectivity.contains(ConnectivityResult.none)) {
         throw Exception('NO INTERNET CONNECTION DETECTED');
      }

      // Step 2: Safe Mode / Integrity Check
      setState(() {
        _statusMessage = 'SECURING APP INSTANCE';
        _progress = 0.50;
      });
      await Future.delayed(const Duration(milliseconds: 1000));
      // Mock Integrity Check (for production, use safe_device or root_checker)
      bool isSecure = true; 
      if (!isSecure) {
        throw Exception('SECURITY EXCEPTION: INSECURE ENVIRONMENT');
      }

      // Step 3: Internationalization (i18n) Loading
      setState(() {
        _statusMessage = 'ENABLING LOCALIZATION';
        _progress = 0.75;
      });
      await Future.delayed(const Duration(milliseconds: 800));
      // Mock i18n loading
      
      // Step 4: Login & Profile Preload
      setState(() {
        _statusMessage = 'RECOVARING SESSION';
        _progress = 0.90;
      });
      if (mounted) {
         await context.read<AuthViewModel>().checkAuth();
      }

      // Finalizing
      setState(() {
        _statusMessage = 'READY FOR DEPLOYMENT';
        _progress = 1.0;
      });
      await Future.delayed(const Duration(milliseconds: 500));

    } catch (e) {
      if (mounted) {
        setState(() {
          _hasError = true;
          _errorMessage = e.toString().replaceFirst('Exception: ', '');
          _progress = 0.0;
        });
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF030303), // Ultra Obsidian
      body: Stack(
        alignment: Alignment.center,
        children: [
          // Background Aesthetic Glows
          Positioned(
            top: -150,
            right: -100,
            child: _buildGlow(Colors.blue.withOpacity(0.08), 400),
          ),
          Positioned(
            bottom: -200,
            left: -150,
            child: _buildGlow(const Color(0xFF00D2FF).withOpacity(0.12), 500),
          ),

          FadeTransition(
            opacity: _fadeAnimation,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ScaleTransition(
                  scale: _scaleAnimation,
                  child: _buildLogo(),
                ),
                const SizedBox(height: 60),
                _buildLoader(),
                const SizedBox(height: 24),
                _buildStatusSection(),
              ],
            ),
          ),
          
          if (_hasError) _buildErrorOverlay(),
        ],
      ),
    );
  }

  Widget _buildLogo() {
    return Container(
      width: 140,
      height: 140,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(40),
        border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
      ),
      padding: const EdgeInsets.all(2),
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0F0F0F),
          borderRadius: BorderRadius.circular(38),
          boxShadow: [
             BoxShadow(
               color: const Color(0xFF00D2FF).withOpacity(0.2),
               blurRadius: 40,
               spreadRadius: -10,
             ),
          ],
        ),
        child: const Center(
          child: Icon(
            Icons.account_tree_outlined, // Modern connectivity icon
            size: 60,
            color: Color(0xFF00D2FF),
          ),
        ),
      ),
    );
  }

  Widget _buildLoader() {
    return Container(
      width: 240,
      height: 4,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(10),
      ),
      child: UnconstrainedBox(
        alignment: Alignment.centerLeft,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 500),
          width: 240 * _progress,
          height: 4,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF00D2FF), Color(0xFF3A7BD5)],
            ),
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF00D2FF).withOpacity(0.5),
                blurRadius: 10,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusSection() {
    return Column(
      children: [
        Text(
          'ISSOP',
          style: TextStyle(
            color: Colors.white.withOpacity(0.9),
            fontSize: 32,
            fontWeight: FontWeight.w900,
            letterSpacing: 8,
          ),
        ),
        const SizedBox(height: 8),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          child: Text(
            _statusMessage,
            key: ValueKey(_statusMessage),
            style: TextStyle(
              color: const Color(0xFF00D2FF).withOpacity(0.7),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 2,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildErrorOverlay() {
    return Container(
      color: Colors.black.withOpacity(0.9),
      width: double.infinity,
      height: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.warning_amber_rounded, size: 80, color: Colors.redAccent),
          const SizedBox(height: 24),
          const Text(
            'SYSTEM MALFUNCTION',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _errorMessage,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _hasError = false;
                _progress = 0.0;
              });
              _startInitialization();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white.withOpacity(0.1),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('RETRY INITIALIZATION'),
          ),
        ],
      ),
    );
  }

  Widget _buildGlow(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: color,
            blurRadius: 100,
            spreadRadius: 50,
          ),
        ],
      ),
    );
  }
}
