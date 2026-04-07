import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';

class CitizenHomeScreen extends StatelessWidget {
  const CitizenHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthViewModel>().user;
    return Scaffold(
      appBar: AppBar(
        title: const Text('ISSOP Citizen'),
        actions: [
          IconButton(onPressed: () => context.read<AuthViewModel>().logout(), icon: const Icon(Icons.logout))
        ],
      ),
      body: Center(child: Text('Welcome Citizen ${user?.name}')),
    );
  }
}
