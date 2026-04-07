import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';
import 'package:issop_mobile/viewmodels/admin_viewmodel.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/core/models/user_model.dart';
import 'package:intl/intl.dart';

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminViewModel>().fetchUsers();
      context.read<AdminViewModel>().fetchRequests();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authVm = context.watch<AuthViewModel>();
    final adminVm = context.watch<AdminViewModel>();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFD),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('SuperAdmin Hub', style: TextStyle(color: Color(0xFF1A1A2E), fontWeight: FontWeight.w900, fontSize: 20)),
            Text('Welcome, ${authVm.user?.name ?? 'Admin'}', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF1A1A2E)),
            onPressed: () {
              adminVm.fetchUsers();
              adminVm.fetchRequests();
            },
          ),
          IconButton(
            onPressed: () => authVm.logout(),
            icon: const Icon(Icons.logout, color: Colors.redAccent),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF1A1A2E),
          unselectedLabelColor: Colors.grey,
          indicatorColor: const Color(0xFF1A1A2E),
          indicatorWeight: 3,
          tabs: const [
            Tab(text: 'Requests', icon: Icon(Icons.list_alt_rounded)),
            Tab(text: 'Users', icon: Icon(Icons.people_alt_rounded)),
            Tab(text: 'Map View', icon: Icon(Icons.map_rounded)),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildRequestList(adminVm),
          _buildUserList(adminVm),
          _buildMapView(adminVm),
        ],
      ),
    );
  }

  Widget _buildRequestList(AdminViewModel vm) {
    if (vm.loading && vm.requests.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: vm.requests.length,
      itemBuilder: (context, index) {
        final request = vm.requests[index];
        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            title: Text(request.title, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text(request.description, maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _buildStatusChip(request.status),
                    const SizedBox(width: 8),
                    Text(DateFormat('MMM dd').format(request.createdAt), style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                  ],
                ),
              ],
            ),
            trailing: request.status == 'PENDING'
                ? const Icon(Icons.assignment_ind_rounded, color: Colors.blueAccent)
                : null,
            onTap: () => _showRequestDetails(request, vm),
          ),
        );
      },
    );
  }

  Widget _buildUserList(AdminViewModel vm) {
    if (vm.loading && vm.users.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: vm.users.length,
      itemBuilder: (context, index) {
        final user = vm.users[index];
        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: user.role == 'AGENT' ? Colors.blue.shade100 : Colors.grey.shade100,
              child: Icon(user.role == 'AGENT' ? Icons.badge_rounded : Icons.person_rounded, color: user.role == 'AGENT' ? Colors.blue : Colors.grey),
            ),
            title: Text(user.name, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${user.email} • ${user.role}'),
            trailing: user.role == 'USER'
                ? TextButton(
                    onPressed: () => vm.upgradeUserToAgent(user.id),
                    child: const Text('MANAGE'),
                  )
                : null,
            onTap: () => _showUserManagement(user, vm),
          ),
        );
      },
    );
  }

  Widget _buildMapView(AdminViewModel vm) {
    return FlutterMap(
      options: const MapOptions(
        initialCenter: LatLng(9.03, 38.74), // Addis Ababa
        initialZoom: 13,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.issop.app',
        ),
        MarkerLayer(
          markers: [
            // Request Markers
            ...vm.requests.map((r) => Marker(
                  point: LatLng(r.latitude, r.longitude),
                  child: GestureDetector(
                    onTap: () => _showRequestDetails(r, vm),
                    child: const Icon(Icons.location_on, color: Colors.red, size: 30),
                  ),
                )),
            // Agent Markers
            ...vm.agents.where((a) => a.latitude != null).map((a) => Marker(
                  point: LatLng(a.latitude!, a.longitude!),
                  child: const Tooltip(
                    message: 'Agent Online',
                    child: Icon(Icons.person_pin_circle, color: Colors.blue, size: 35),
                  ),
                )),
          ],
        ),
      ],
    );
  }

  void _showRequestDetails(RequestModel request, AdminViewModel vm) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(request.title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              _buildStatusChip(request.status),
              const SizedBox(height: 16),
              Text(request.description),
              const SizedBox(height: 24),
              const Text('Assign Agent', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 12),
              if (vm.agents.isEmpty)
                 const Text('No agents identified for this area.')
              else
                 SizedBox(
                   height: 150,
                   child: ListView.builder(
                     scrollDirection: Axis.horizontal,
                     itemCount: vm.agents.length,
                     itemBuilder: (context, i) {
                       final agent = vm.agents[i];
                       return GestureDetector(
                         onTap: () {
                           vm.assignTask(request.id, agent.id);
                           Navigator.pop(context);
                         },
                         child: Container(
                           width: 100,
                           margin: const EdgeInsets.only(right: 12),
                           decoration: BoxDecoration(
                             color: Colors.blue.shade50,
                             borderRadius: BorderRadius.circular(12),
                             border: Border.all(color: Colors.blue.shade100),
                           ),
                           child: Column(
                             mainAxisAlignment: MainAxisAlignment.center,
                             children: [
                               const CircleAvatar(child: Icon(Icons.person)),
                               const SizedBox(height: 8),
                               Text(agent.name.split(' ').first, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                               const Text('Online', style: TextStyle(fontSize: 10, color: Colors.green)),
                             ],
                           ),
                         ),
                       );
                     },
                   ),
                 ),
            ],
          ),
        );
      },
    );
  }

  void _showUserManagement(UserModel user, AdminViewModel vm) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Manage ${user.name}'),
        content: Text('Would you like to promote this user to a field agent role?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              vm.upgradeUserToAgent(user.id);
              Navigator.pop(context);
            },
            child: const Text('Promote to Agent'),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color = Colors.grey;
    if (status == 'PENDING') color = Colors.orange;
    if (status == 'ASSIGNED') color = Colors.blue;
    if (status == 'IN_PROGRESS') color = Colors.indigo;
    if (status == 'COMPLETED') color = Colors.green;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
      child: Text(status, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }
}

