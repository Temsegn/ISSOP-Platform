import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/core/services/auth_service.dart';
import 'package:issop_mobile/core/services/network_service.dart';
import 'package:issop_mobile/core/services/storage_service.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';
import 'package:issop_mobile/modules/auth/login_screen.dart';
import 'package:issop_mobile/modules/citizen/citizen_home_screen.dart';
import 'package:issop_mobile/modules/agent/agent_home_screen.dart';
import 'package:issop_mobile/modules/admin/admin_home_screen.dart';

class App extends StatelessWidget {
  const App({super.key});

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
        ChangeNotifierProxyProvider2<AuthService, StorageService, AuthViewModel>(
          create: (context) => AuthViewModel(
            context.read<AuthService>(),
            context.read<StorageService>(),
          ),
          update: (_, authSvc, storage, vm) => vm ?? AuthViewModel(authSvc, storage),
        ),
      ],
      child: MaterialApp(
        title: 'ISSOP',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.indigo,
            primary: Colors.indigo,
            secondary: Colors.deepOrangeAccent,
          ),
          textTheme: const TextTheme(
            headlineMedium: TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo),
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: Colors.grey[50],
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.indigo, width: 2)),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.indigo,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
        home: Consumer<AuthViewModel>(
          builder: (context, auth, _) {
            if (auth.user == null) {
              return const LoginScreen();
            }
            // Role-based screens
            switch (auth.user!.role) {
              case 'USER':
                return const CitizenHomeScreen();
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
      ),
    );
  }
}
