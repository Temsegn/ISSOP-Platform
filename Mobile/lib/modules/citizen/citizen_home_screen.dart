import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';

class CitizenHomeScreen extends StatelessWidget {
  const CitizenHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthViewModel>().user;
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('ISSOP Citizen', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          IconButton(
            onPressed: () => context.read<AuthViewModel>().logout(), 
            icon: const Icon(Icons.logout_rounded, color: Colors.indigo),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Hello, ${user?.name ?? 'Citizen'}!', 
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.indigo)),
            const Text('What would you like to report today?', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 30),
            
            _categoryCard('Road Issues', Icons.car_repair_rounded, Colors.orange),
            _categoryCard('Waste Management', Icons.delete_outline_rounded, Colors.green),
            _categoryCard('Public Lighting', Icons.lightbulb_outline_rounded, Colors.amber),
            _categoryCard('Water & Sanitation', Icons.water_drop_outlined, Colors.blue),
            
            const SizedBox(height: 30),
            const Text('Recent Reports', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const Card(
              child: ListTile(
                leading: Icon(Icons.history_rounded, color: Colors.indigo),
                title: Text('No reports yet'),
                subtitle: Text('Start contributing to your community'),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        label: const Text('New Report', style: TextStyle(fontWeight: FontWeight.bold)),
        icon: const Icon(Icons.add),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _categoryCard(String title, IconData icon, Color color) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey[200]!)),
      child: ListTile(
        leading: CircleAvatar(backgroundColor: color.withOpacity(0.1), child: Icon(icon, color: color)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        trailing: const Icon(Icons.chevron_right_rounded, color: Colors.grey),
        onTap: () {},
      ),
    );
  }
}
