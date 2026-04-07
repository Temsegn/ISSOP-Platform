import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _obscure = true;

  void _onRegister() async {
    final vm = context.read<AuthViewModel>();
    final success = await vm.register(
      _nameController.text,
      _emailController.text,
      _passController.text,
      phone: _phoneController.text,
    );
    if (success && mounted) {
      Navigator.pop(context);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(vm.errorMessage ?? 'Registration failed. Try again.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<AuthViewModel>().loading;

    return Scaffold(
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, iconTheme: const IconThemeData(color: Colors.black)),
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 30.0, vertical: 10.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Image.asset(
                  'assets/images/auth_illustration.png',
                  height: 180,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 10),
              Text('Create Account', style: Theme.of(context).textTheme.headlineMedium),
              const Text('Join ISSOP to improve your city.', style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 30),
              
              _inputLabel('Full Name'),
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(
                  hintText: 'John Doe',
                  prefixIcon: Icon(Icons.person_outline_rounded),
                ),
              ),
              const SizedBox(height: 20),
              
              _inputLabel('Email Address'),
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  hintText: 'john@example.com',
                  prefixIcon: Icon(Icons.alternate_email_rounded),
                ),
              ),
              const SizedBox(height: 20),
              
              _inputLabel('Phone Number'),
              TextField(
                controller: _phoneController,
                decoration: const InputDecoration(
                  hintText: '+1 234 567 890',
                  prefixIcon: Icon(Icons.phone_rounded),
                ),
              ),
              const SizedBox(height: 20),
              
              _inputLabel('Password'),
              TextField(
                controller: _passController,
                obscureText: _obscure,
                decoration: InputDecoration(
                  hintText: 'Choose a password',
                  prefixIcon: const Icon(Icons.lock_outline_rounded),
                  suffixIcon: IconButton(
                    icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                ),
              ),
              
              const SizedBox(height: 40),
              
              if (loading)
                const Center(child: CircularProgressIndicator())
              else
                ElevatedButton(
                  onPressed: _onRegister,
                  child: const Text('Register', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
                
              const SizedBox(height: 50),
            ],
          ),
        ),
      ),
    );
  }

  Widget _inputLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: const TextStyle(fontWeight: FontWeight.bold)),
    );
  }
}
