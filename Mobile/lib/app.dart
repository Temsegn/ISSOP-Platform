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
          primary: Colors.indigo[900]!,
          secondary: Colors.blueAccent,
        ),
        textTheme: const TextTheme(
          headlineMedium: TextStyle(fontWeight: FontWeight.bold, color: Colors.black),
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
      backgroundColor: Colors.indigo[900],
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.location_on_rounded, size: 80, color: Colors.white),
            const SizedBox(height: 24),
            const Text(
              'ISSOP',
              style: TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.bold,
                letterSpacing: 4,
              ),
            ),
            const SizedBox(height: 16),
            const CircularProgressIndicator(color: Colors.white),
          ],
        ),
      ),
    );
  }
}
