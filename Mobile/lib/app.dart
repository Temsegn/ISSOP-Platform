import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/core/services/auth_service.dart';
import 'package:issop_mobile/core/services/network_service.dart';
import 'package:issop_mobile/core/services/storage_service.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';
import 'package:issop_mobile/core/services/request_service.dart';
import 'package:issop_mobile/viewmodels/request_viewmodel.dart';
import 'package:issop_mobile/modules/auth/login_screen.dart';
import 'package:issop_mobile/modules/user/user_home_screen.dart';
import 'package:issop_mobile/modules/agent/agent_home_screen.dart';
import 'package:issop_mobile/modules/admin/admin_home_screen.dart';
import 'package:issop_mobile/modules/onboarding/onboarding_screen.dart';

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
        ProxyProvider<NetworkService, AuthService>(
          update: (_, network, __) => AuthService(network),
        ),
        ProxyProvider<NetworkService, RequestService>(
          update: (_, network, __) => RequestService(network),
        ),
        ChangeNotifierProxyProvider2<AuthService, StorageService, AuthViewModel>(
          create: (context) => AuthViewModel(
            context.read<AuthService>(),
            context.read<StorageService>(),
          ),
          update: (_, authSvc, storage, vm) => vm ?? AuthViewModel(authSvc, storage),
        ),
        ChangeNotifierProxyProvider<RequestService, RequestViewModel>(
          create: (context) => RequestViewModel(context.read<RequestService>()),
          update: (_, svc, vm) => vm ?? RequestViewModel(svc),
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
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<AuthViewModel>().checkAuth());
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
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
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1A1A2E),
              Color(0xFF16213E),
              Color(0xFF0F3460),
            ],
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withOpacity(0.2)),
              ),
              child: const Icon(Icons.location_on_rounded, size: 60, color: Colors.white),
            ),
            const SizedBox(height: 32),
            const Text(
              'ISSOP',
              style: TextStyle(
                color: Colors.white,
                fontSize: 40,
                fontWeight: FontWeight.w900,
                letterSpacing: 8,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'SMART CITY PLATFORM',
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 12,
                fontWeight: FontWeight.w500,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 60),
            const SizedBox(
              width: 40,
              height: 2,
              child: LinearProgressIndicator(
                backgroundColor: Colors.transparent,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
