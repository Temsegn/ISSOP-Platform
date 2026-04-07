import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';
import 'package:issop_mobile/viewmodels/request_viewmodel.dart';
import 'package:issop_mobile/modules/user/create_request_screen.dart';
import 'package:issop_mobile/core/models/request_model.dart';

class UserHomeScreen extends StatefulWidget {
  const UserHomeScreen({super.key});

  @override
  State<UserHomeScreen> createState() => _UserHomeScreenState();
}

class _UserHomeScreenState extends State<UserHomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<RequestViewModel>().fetchMyRequests());
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthViewModel>();
    final requestVM = context.watch<RequestViewModel>();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('ISSOP Platform', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Text('Hello, ${auth.user?.name ?? "User"}', style: const TextStyle(fontSize: 12, color: Colors.indigo)),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.black),
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => requestVM.fetchMyRequests(),
        child: Column(
          children: [
            _buildHeroStats(requestVM.requests),
            Expanded(
              child: requestVM.loading 
                ? const Center(child: CircularProgressIndicator())
                : requestVM.requests.isEmpty 
                  ? _buildEmptyState()
                  : _buildRequestList(requestVM.requests),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateRequestScreen())),
        backgroundColor: Colors.black,
        label: const Text('Report Issue', style: TextStyle(color: Colors.white)),
        icon: const Icon(Icons.add_location_alt_rounded, color: Colors.white),
      ),
    );
  }

  Widget _buildHeroStats(List<RequestModel> requests) {
    final pending = requests.where((r) => r.status == 'PENDING').length;
    final inProgress = requests.where((r) => r.status == 'IN_PROGRESS' || r.status == 'ASSIGNED').length;
    final solved = requests.where((r) => r.status == 'COMPLETED').length;

    return Container(
      padding: const EdgeInsets.all(24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildStatItem('Pending', pending.toString(), Colors.orange),
          _buildStatItem('In Progress', inProgress.toString(), Colors.blueAccent),
          _buildStatItem('Solved', solved.toString(), Colors.green),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.assignment_turned_in_rounded, size: 80, color: Colors.grey[200]),
        const SizedBox(height: 16),
        const Text('No reports yet', style: TextStyle(color: Colors.grey, fontSize: 18)),
        const Text('Be the change in your city!', style: TextStyle(color: Colors.grey, fontSize: 14)),
      ],
    );
  }

  Widget _buildRequestList(List<RequestModel> requests) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
      itemCount: requests.length,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final request = requests[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
          ),
          child: Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.blueAccent.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Icon(_getCategoryIcon(request.category), color: Colors.blueAccent),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(request.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 4),
                    Text(request.category, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
              ),
              _buildStatusBadge(request.status),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status) {
      case 'PENDING': color = Colors.orange; break;
      case 'ASSIGNED':
      case 'IN_PROGRESS': color = Colors.blueAccent; break;
      case 'COMPLETED': color = Colors.green; break;
      default: color = Colors.red;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'Road Issues': return Icons.add_road_rounded;
      case 'Waste Management': return Icons.delete_sweep_rounded;
      case 'Public Lighting': return Icons.lightbulb_rounded;
      case 'Water & Sanitation': return Icons.water_drop_rounded;
      default: return Icons.report_problem_rounded;
    }
  }
}
