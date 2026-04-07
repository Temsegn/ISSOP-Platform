import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';
import 'package:issop_mobile/modules/auth/register_screen.dart';
import 'package:issop_mobile/core/utils/ui_utils.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passController = TextEditingController();
  bool _obscure = true;

  void _onLogin() async {
    final vm = context.read<AuthViewModel>();
    final success = await vm.login(_emailController.text, _passController.text);
    if (!success && mounted) {
      ISSOPAlert.showError(
        context,
        'Access Denied',
        vm.errorMessage ?? 'Please check your credentials and try again.',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<AuthViewModel>().loading;

    return Scaffold(
      body: Container(
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFF8FAFF), Colors.white],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'SIGN IN',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF1A1A2E),
                    letterSpacing: 4,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFF4facfe),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Access your smart city dashboard.',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.blueGrey[400],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 48),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF1A1A2E).withOpacity(0.06),
                        blurRadius: 30,
                        offset: const Offset(0, 10),
                      )
                    ],
                  ),
                  padding: const EdgeInsets.all(28),
                  child: Column(
                    children: [
                      TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText: 'Email Address',
                          prefixIcon: Icon(Icons.email_outlined, color: Color(0xFF1A1A2E)),
                        ),
                      ),
                      const SizedBox(height: 24),
                      TextField(
                        controller: _passController,
                        obscureText: _obscure,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: const Icon(Icons.lock_outline_rounded, color: Color(0xFF1A1A2E)),
                          suffixIcon: IconButton(
                            icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, color: Colors.grey),
                            onPressed: () => setState(() => _obscure = !_obscure),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 48),
                loading
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFF1A1A2E)))
                    : ElevatedButton(
                        onPressed: _onLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1A1A2E),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 64),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          elevation: 12,
                          shadowColor: const Color(0xFF1A1A2E).withOpacity(0.5),
                        ),
                        child: const Text(
                          'LOGIN',
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, letterSpacing: 2),
                        ),
                      ),
                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text("New here? ", style: TextStyle(color: Colors.blueGrey[400])),
                    TextButton(
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                      child: const Text(
                        'CREATE ACCOUNT',
                        style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF4facfe)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
