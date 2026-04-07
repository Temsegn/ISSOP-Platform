import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';
import 'package:issop_mobile/viewmodels/admin_viewmodel.dart';
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

  @override
  Widget build(BuildContext context) {
    final authVm = context.watch<AuthViewModel>();
    final adminVm = context.watch<AdminViewModel>();

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FC),
      appBar: AppBar(
        toolbarHeight: 120,
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('SuperAdmin Terminal', style: TextStyle(color: Color(0xFF1A1A2E), fontWeight: FontWeight.w900, fontSize: 26, letterSpacing: -0.5)),
            const SizedBox(height: 4),
            Row(children: [
               Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
               const SizedBox(width: 8),
               Text('System Monitoring: Online', style: TextStyle(color: Colors.grey.shade600, fontSize: 13, fontWeight: FontWeight.w600)),
            ]),
          ],
        ),
        actions: [
          Container(
            padding: const EdgeInsets.all(8),
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(12)),
            child: IconButton(onPressed: () => authVm.logout(), icon: const Icon(Icons.power_settings_new_rounded, color: Colors.redAccent)),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF1A1A2E),
          unselectedLabelColor: Colors.blueGrey.shade300,
          indicator: const UnderlineTabIndicator(borderSide: BorderSide(width: 4, color: Color(0xFF1A1A2E)), insets: EdgeInsets.symmetric(horizontal: 60)),
          labelStyle: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
          tabs: const [
            Tab(text: 'CITIZEN REPORTS'),
            Tab(text: 'FIELD PERSONNEL'),
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          adminVm.fetchUsers();
          adminVm.fetchRequests();
        },
        backgroundColor: const Color(0xFF1A1A2E),
        icon: const Icon(Icons.sync_rounded, color: Colors.white),
        label: const Text('REFRESH SYSTEM', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildRequestPanel(AdminViewModel vm) {
    if (vm.loading && vm.requests.isEmpty) return const Center(child: CircularProgressIndicator());
    
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: vm.requests.length,
      itemBuilder: (context, index) {
        final r = vm.requests[index];
        final bool isPending = r.status == 'PENDING';
        
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 10))],
            border: isPending ? Border.all(color: Colors.orange.shade200, width: 1) : null,
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => AdminRequestDetailScreen(request: r)));
              },
              borderRadius: BorderRadius.circular(24),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(color: _getStatusColor(r.status).withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
                          child: Text(r.status, style: TextStyle(color: _getStatusColor(r.status), fontWeight: FontWeight.w900, fontSize: 10)),
                        ),
                        const Spacer(),
                        Text(DateFormat('MMM dd').format(r.createdAt), style: TextStyle(color: Colors.grey.shade500, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(r.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1A1A2E))),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.grey.shade100, shape: BoxShape.circle), child: const Icon(Icons.person, size: 14, color: Colors.blueGrey)),
                        const SizedBox(width: 8),
                        Text('By: ${r.citizenName ?? 'Unknown citizen'}', style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade600, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    const SizedBox(height: 20),
                    if (isPending)
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(12)),
                        child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Icon(Icons.assignment_ind_rounded, size: 18, color: Colors.blueAccent),
                          SizedBox(width: 8),
                          Text('URGENT: ASSIGNMENT NEEDED', style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 0.5)),
                        ]),
                      )
                    else 
                      Row(children: [
                         const Icon(Icons.badge_rounded, size: 16, color: Colors.green),
                         const SizedBox(width: 8),
                         Text('Handled by: ${r.agentName ?? 'N/A'}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.green)),
                      ])
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildUserPanel(AdminViewModel vm) {
    if (vm.loading && vm.users.isEmpty) return const Center(child: CircularProgressIndicator());
    
    // Filter out SUPERADMIN as requested
    final personnel = vm.users.where((u) => u.role != 'SUPERADMIN').toList();

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: personnel.length,
      itemBuilder: (context, index) {
        final u = personnel[index];
        final bool isAgent = u.role == 'AGENT';

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: isAgent ? Border.all(color: Colors.blue.shade100, width: 1.5) : null),
          child: Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: isAgent ? Colors.blue.shade50 : Colors.grey.shade50,
                child: Icon(isAgent ? Icons.engineering_rounded : Icons.person_rounded, color: isAgent ? Colors.blueAccent : Colors.grey.shade400, size: 30),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(u.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF1A1A2E))),
                    const SizedBox(height: 4),
                    Text(u.email, style: TextStyle(color: Colors.blueGrey.shade400, fontSize: 12)),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: isAgent ? Colors.blueAccent.withOpacity(0.1) : Colors.grey.shade100, borderRadius: BorderRadius.circular(6)),
                      child: Text(u.role, style: TextStyle(color: isAgent ? Colors.blueAccent : Colors.grey.shade600, fontSize: 10, fontWeight: FontWeight.w900)),
                    ),
                  ],
                ),
              ),
              if (!isAgent)
                ElevatedButton(
                  onPressed: () => _confirmPromotion(context, u, vm),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1A1A2E), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)), elevation: 0),
                  child: const Text('PROMOTE', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                )
            ],
          ),
        );
      },
    );
  }

  void _confirmPromotion(BuildContext context, dynamic user, AdminViewModel vm) {
     showDialog(context: context, builder: (ctx) => AlertDialog(
        title: const Text('Confirm Promotion', style: TextStyle(fontWeight: FontWeight.w900)),
        content: Text('Activate agent status for ${user.name}? This will grant them field operations access.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL')),
          ElevatedButton(onPressed: () { vm.upgradeUserToAgent(user.id); Navigator.pop(ctx); }, child: const Text('ACTIVATE AGENT')),
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

