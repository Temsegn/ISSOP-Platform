import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';
import 'package:issop_mobile/viewmodels/admin_viewmodel.dart';
import 'package:issop_mobile/viewmodels/notification_viewmodel.dart';
import 'package:issop_mobile/modules/admin/admin_request_detail_screen.dart';
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
    _tabController = TabController(length: 2, vsync: this);
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

  void _showNotifications(BuildContext context, NotificationViewModel notif) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.7,
          decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(30))),
          child: Column(
            children: [
              const SizedBox(height: 16),
              Container(width: 50, height: 5, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10))),
              const Padding(
                padding: EdgeInsets.all(20.0),
                child: Row(
                  children: [
                    Icon(Icons.notifications_active, color: Color(0xFF1A1A2E)),
                    SizedBox(width: 12),
                    Text('System Alerts', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: notif.notifications.isEmpty
                    ? const Center(child: Text('No system alerts'))
                    : ListView.builder(
                        itemCount: notif.notifications.length,
                        itemBuilder: (context, index) {
                          final n = notif.notifications[index];
                          return ListTile(
                            title: Text(n['message'] ?? ''),
                            subtitle: Text(DateFormat('hh:mm a').format(DateTime.parse(n['createdAt']))),
                          );
                        },
                      ),
              )
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authVm = context.watch<AuthViewModel>();
    final adminVm = context.watch<AdminViewModel>();

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FC),
      appBar: AppBar(
        toolbarHeight: 140,
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('SuperAdmin Terminal', style: TextStyle(color: Color(0xFF1A1A2E), fontWeight: FontWeight.w900, fontSize: 28, letterSpacing: -1)),
            const SizedBox(height: 4),
            Row(children: [
              Container(width: 10, height: 10, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
              const SizedBox(width: 8),
              Text('System Active', style: TextStyle(color: Colors.grey.shade500, fontSize: 13, fontWeight: FontWeight.w700)),
            ]),
          ],
        ),
        actions: [
          Consumer<NotificationViewModel>(builder: (context, n, _) {
            return IconButton(
              icon: Icon(Icons.notifications_none_rounded, color: Colors.blueGrey.shade700),
              onPressed: () => _showNotifications(context, n),
            );
          }),
          const SizedBox(width: 8),
          IconButton(
            onPressed: () => authVm.logout(),
            icon: const Icon(Icons.logout_rounded, color: Colors.redAccent),
          ),
          const SizedBox(width: 16),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF1A1A2E),
          unselectedLabelColor: Colors.grey.shade400,
          indicatorColor: const Color(0xFF1A1A2E),
          indicatorWeight: 4,
          labelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 1),
          tabs: const [
            Tab(text: 'CITIZEN REPORTS'),
            Tab(text: 'TEAM ROSTER'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildRequestPanel(adminVm),
          _buildUserPanel(adminVm),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () { adminVm.fetchUsers(); adminVm.fetchRequests(); },
        backgroundColor: const Color(0xFF1A1A2E),
        child: const Icon(Icons.refresh_rounded, color: Colors.white),
      ),
    );
  }

  Widget _buildRequestPanel(AdminViewModel vm) {
    if (vm.loading && vm.requests.isEmpty) return const Center(child: CircularProgressIndicator());
    if (vm.requests.isEmpty) return _buildEmptyState('No reports currently active');

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      itemCount: vm.requests.length,
      itemBuilder: (context, index) {
        final r = vm.requests[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 8))],
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.all(20),
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => AdminRequestDetailScreen(request: r))),
            title: Text(r.title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF1A1A2E))),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 8),
                Text(r.status, style: TextStyle(color: _getStatusColor(r.status), fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                const SizedBox(height: 12),
                Row(children: [
                  const Icon(Icons.person_pin, size: 14, color: Colors.grey),
                  const SizedBox(width: 6),
                  Text(r.citizenName ?? 'Citizen', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey)),
                  const Spacer(),
                  Text(DateFormat('MMM dd').format(r.createdAt), style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ]),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildUserPanel(AdminViewModel vm) {
    if (vm.loading && vm.users.isEmpty) return const Center(child: CircularProgressIndicator());
    final filtered = vm.users.where((u) => u.role != 'SUPERADMIN').toList();

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      itemCount: filtered.length,
      itemBuilder: (context, index) {
        final u = filtered[index];
        final bool isAgent = u.role == 'AGENT';
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
          child: Row(
            children: [
              _buildUserIcon(isAgent),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(u.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF1A1A2E))),
                    Text(u.email, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                  ],
                ),
              ),
              if (!isAgent)
                TextButton(
                  onPressed: () => _confirmPromotion(context, u, vm),
                  child: const Text('UPGRADE', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.blueAccent)),
                )
              else
                const Icon(Icons.check_circle_rounded, color: Colors.green, size: 20),
            ],
          ),
        );
      },
    );
  }

  Widget _buildUserIcon(bool isAgent) {
    if (isAgent) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: Colors.green.shade50, shape: BoxShape.circle),
        child: const Text('A', style: TextStyle(color: Colors.green, fontWeight: FontWeight.w900, fontSize: 20)),
      );
    }
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.grey.shade50, shape: BoxShape.circle),
      child: const Icon(Icons.person_rounded, color: Colors.grey),
    );
  }

  Widget _buildEmptyState(String msg) {
    return Center(child: Text(msg, style: TextStyle(color: Colors.grey.shade400)));
  }

  void _confirmPromotion(BuildContext context, dynamic user, AdminViewModel vm) {
    showDialog(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Promote User?'),
      content: Text('Assign ${user.name} to Field Operations?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('NO')),
        ElevatedButton(onPressed: () { vm.upgradeUserToAgent(user.id); Navigator.pop(ctx); }, child: const Text('YES')),
      ],
    ));
  }

  Color _getStatusColor(String status) {
    if (status == 'PENDING') return Colors.orange;
    if (status == 'ASSIGNED') return Colors.blue;
    if (status == 'IN_PROGRESS') return Colors.indigo;
    if (status == 'COMPLETED') return Colors.green;
    return Colors.grey;
  }
}


