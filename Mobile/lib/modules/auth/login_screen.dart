import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';
import 'package:issop_mobile/modules/auth/register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passController = TextEditingController();

  void _onLogin() async {
    final vm = context.read<AuthViewModel>();
    final success = await vm.login(_emailController.text, _passController.text);
    if (success && mounted) {
      // Role-based navigation would happen here
      final role = vm.user?.role;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Logged in as $role')),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Login Failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<AuthViewModel>().loading;

    return Scaffold(
      appBar: AppBar(title: const Text('ISSOP Login')),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email')),
            TextField(controller: _passController, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
            const SizedBox(height: 20),
            loading 
              ? const CircularProgressIndicator()
              : ElevatedButton(onPressed: _onLogin, child: const Text('Login')),
            TextButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())), 
              child: const Text('Create Account'),
            ),
          ],
        ),
      ),
    );
  }
}
