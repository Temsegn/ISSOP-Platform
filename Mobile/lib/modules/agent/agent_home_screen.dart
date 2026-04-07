import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';

class AgentHomeScreen extends StatelessWidget {
  const AgentHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthViewModel>().user;
    return Scaffold(
      appBar: AppBar(
        title: const Text('ISSOP Agent'),
        actions: [
          IconButton(onPressed: () => context.read<AuthViewModel>().logout(), icon: const Icon(Icons.logout))
        ],
      ),
      body: Center(child: Text('Welcome Agent ${user?.name}')),
    );
  }
}
