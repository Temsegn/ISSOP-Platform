import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/core/services/auth_service.dart';
import 'package:issop_mobile/core/services/network_service.dart';
import 'package:issop_mobile/core/services/storage_service.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';
import 'package:issop_mobile/core/services/request_service.dart';
import 'package:issop_mobile/viewmodels/request_viewmodel.dart';
import 'package:issop_mobile/core/services/agent_service.dart';
import 'package:issop_mobile/viewmodels/agent_viewmodel.dart';
import 'package:issop_mobile/core/services/admin_service.dart';
import 'package:issop_mobile/viewmodels/admin_viewmodel.dart';
import 'package:issop_mobile/viewmodels/notification_viewmodel.dart';
import 'package:issop_mobile/modules/auth/login_screen.dart';
import 'package:issop_mobile/modules/user/user_home_screen.dart';
import 'package:issop_mobile/modules/agent/agent_home_screen.dart';
import 'package:issop_mobile/modules/admin/admin_home_screen.dart';
import 'package:issop_mobile/modules/onboarding/onboarding_screen.dart';

import 'package:issop_mobile/core/services/socket_service.dart';

class App extends StatefulWidget {
  const App({super.key});

  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider(create: (_) => StorageService()),
        ProxyProvider<StorageService, NetworkService>(
          update: (_, storage, __) => NetworkService(storage),
        ),
        ProxyProvider<StorageService, SocketService>(
          update: (_, storage, __) => SocketService(storage),
        ),
        ProxyProvider<NetworkService, AuthService>(
          update: (_, network, __) => AuthService(network),
        ),
        ProxyProvider<NetworkService, RequestService>(
          update: (_, network, __) => RequestService(network),
        ),
        ProxyProvider<NetworkService, AgentService>(
          update: (_, network, __) => AgentService(network),
        ),
        ProxyProvider<NetworkService, AdminService>(
          update: (_, network, __) => AdminService(network),
        ),
        ChangeNotifierProxyProvider3<AuthService, StorageService, SocketService, AuthViewModel>(
          create: (context) => AuthViewModel(
            context.read<AuthService>(),
            context.read<StorageService>(),
            context.read<SocketService>(),
          ),
          update: (_, authSvc, storage, socket, vm) => vm ?? AuthViewModel(authSvc, storage, socket),
        ),
        ChangeNotifierProxyProvider2<RequestService, SocketService, RequestViewModel>(
          create: (context) => RequestViewModel(context.read<RequestService>(), context.read<SocketService>()),
          update: (_, svc, socket, vm) => vm ?? RequestViewModel(svc, socket),
        ),
        ChangeNotifierProxyProvider2<AgentService, SocketService, AgentViewModel>(
          create: (context) => AgentViewModel(context.read<AgentService>(), context.read<SocketService>()),
          update: (_, svc, socket, vm) => vm ?? AgentViewModel(svc, socket),
        ),
        ChangeNotifierProxyProvider2<AdminService, SocketService, AdminViewModel>(
          create: (context) => AdminViewModel(context.read<AdminService>(), context.read<SocketService>()),
          update: (_, svc, socket, vm) => vm ?? AdminViewModel(svc, socket),
        ),
        ChangeNotifierProxyProvider2<NetworkService, SocketService, NotificationViewModel>(
          create: (context) => NotificationViewModel(context.read<NetworkService>(), context.read<SocketService>()),
          update: (_, svc, socket, vm) => vm ?? NotificationViewModel(svc, socket),
        ),
      ],
      child: FutureBuilder(
        future: null, // We'll use the Consumer below to manage state
        builder: (context, snapshot) {
          return const AppRoot();
        },
      ),
    );
  }
}

class AppRoot extends StatefulWidget {
  const AppRoot({super.key});

  @override
  State<AppRoot> createState() => _AppRootState();
}

class _AppRootState extends State<AppRoot> {
  final GlobalKey<ScaffoldMessengerState> _messengerKey = GlobalKey<ScaffoldMessengerState>();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
       context.read<AuthViewModel>().checkAuth();
       _initNotificationListener();
    });
  }

  void _initNotificationListener() {
    context.read<SocketService>().events.listen((event) {
      String? title;
      String? message;
      Color color = Colors.indigo;

      if (event.name == 'task_assigned') {
        title = 'Task Assigned';
        message = 'A new field mission has been assigned to you.';
        color = Colors.blueAccent;
      } else if (event.name == 'status_updated') {
        title = 'Status Update';
        message = 'A report status has changed: ${event.data['newStatus'] ?? ''}';
        color = Colors.green;
      } else if (event.name == 'request_created') {
        title = 'New Report';
        message = 'A new problem has been reported in your sector.';
        color = Colors.orangeAccent;
      }

      if (title != null) {
        _showInAppNotification(title, message!, color);
      }
    });
  }

  void _showInAppNotification(String title, String message, Color color) {
    _messengerKey.currentState?.showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: Colors.transparent,
        elevation: 0,
        content: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1A1A2E),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withOpacity(0.5), width: 1.5),
            boxShadow: [BoxShadow(color: color.withOpacity(0.2), blurRadius: 20, spreadRadius: 5)],
          ),
          child: Row(
            children: [
              Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle), child: Icon(Icons.notifications_active, color: color, size: 20)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 13)),
                    Text(message, style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 11)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      scaffoldMessengerKey: _messengerKey,
      title: 'ISSOP',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.indigo,
          primary: const Color(0xFF1A1A2E), // Deep Obsidian
          secondary: const Color(0xFF16213E), // Midnight Blue
          tertiary: const Color(0xFF0F3460), // Deep Navy
        ),
        scaffoldBackgroundColor: Colors.white,
        textTheme: const TextTheme(
          headlineMedium: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E), fontSize: 28),
          bodyLarge: TextStyle(color: Color(0xFF1A1A2E), fontSize: 16),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFFF7F7F7),
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFF1A1A2E), width: 1.5)),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1A1A2E),
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 56),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 2,
          ),
        ),
      ),
      home: Consumer<AuthViewModel>(
        builder: (context, auth, _) {
          if (!auth.initialized) {
            return const SplashScreen();
          }

          if (!auth.onboardingCompleted) {
            return const OnboardingScreen();
          }

          if (auth.user == null) {
            return const LoginScreen();
          }

          // Role-based routing
          switch (auth.user!.role) {
            case 'USER':
              return const UserHomeScreen();
            case 'AGENT':
              return const AgentHomeScreen();
            case 'ADMIN':
            case 'SUPERADMIN':
              return const AdminHomeScreen();
            default:
              return const LoginScreen();
          }
        },
      ),
    );
  }
}

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          color: Color(0xFF0A0E21), // Absolute Dark Navy
          image: DecorationImage(
            image: NetworkImage('https://www.transparenttextures.com/patterns/cubes.png'), // Subtle texture
            opacity: 0.05,
            repeat: ImageRepeat.repeat,
          ),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Decorative background glows
            Positioned(
              top: -100,
              right: -100,
              child: _buildGlow(Colors.indigo.withOpacity(0.2), 300),
            ),
            Positioned(
              bottom: -150,
              left: -100,
              child: _buildGlow(Colors.blueAccent.withOpacity(0.15), 400),
            ),
            
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Modern Abstract Icon
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0.0, end: 1.0),
                  duration: const Duration(seconds: 2),
                  curve: Curves.elasticOut,
                  builder: (context, value, child) {
                    return Transform.scale(
                      scale: value,
                      child: child,
                    );
                  },
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF4facfe), Color(0xFF00f2fe)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(35),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF4facfe).withOpacity(0.5),
                          blurRadius: 30,
                          offset: const Offset(0, 15),
                        ),
                      ],
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        const Icon(Icons.bolt_rounded, size: 60, color: Colors.white),
                        // Circular Orbit
                        Container(
                          width: 90,
                          height: 90,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white.withOpacity(0.3), width: 1),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 48),
                // Premium Text
                const Text(
                  'ISSOP',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 52,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 12,
                    height: 1,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'REVOLUTIONIZING CITY SERVICES',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.5),
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 4,
                  ),
                ),
                const SizedBox(height: 80),
                // Minimal Loading
                SizedBox(
                  width: 120,
                  height: 3,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      backgroundColor: Colors.white.withOpacity(0.05),
                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF4facfe)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
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
