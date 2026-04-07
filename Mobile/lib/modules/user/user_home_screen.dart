import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';
import 'package:issop_mobile/viewmodels/request_viewmodel.dart';
import 'package:issop_mobile/modules/user/create_request_screen.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/modules/user/request_details_screen.dart';
import 'package:issop_mobile/modules/sync/sync_center_screen.dart';

class UserHomeScreen extends StatefulWidget {
  const UserHomeScreen({super.key});

  @override
  State<UserHomeScreen> createState() => _UserHomeScreenState();
}

class _UserHomeScreenState extends State<UserHomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<RequestViewModel>().fetchMyRequests());
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthViewModel>();
    final requestVM = context.watch<RequestViewModel>();
    final filteredRequests = requestVM.requests.where((r) => 
      r.title.toLowerCase().contains(_searchQuery.toLowerCase()) || 
      r.category.toLowerCase().contains(_searchQuery.toLowerCase())
    ).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFF),
      body: RefreshIndicator(
        onRefresh: () => requestVM.fetchMyRequests(),
        child: CustomScrollView(
          slivers: [
            _buildSliverAppBar(auth),
            SliverToBoxAdapter(child: _buildHeroStats(requestVM.requests)),
            SliverToBoxAdapter(child: _buildQuickActions()),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Track Reports', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF1A1A2E))),
                    Text('${filteredRequests.length} Total', style: TextStyle(color: Colors.grey[400], fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(child: _buildSearchBar()),
            requestVM.loading 
              ? const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
              : filteredRequests.isEmpty 
                ? SliverFillRemaining(child: _buildEmptyState())
                : SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => _buildRequestCard(filteredRequests[index]),
                        childCount: filteredRequests.length,
                      ),
                    ),
                  ),
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateRequestScreen())),
        backgroundColor: const Color(0xFF1A1A2E),
        elevation: 10,
        label: const Text('NEW REPORT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
        icon: const Icon(Icons.add_location_alt_rounded, color: Colors.white),
      ),
    );
  }

  Widget _buildSliverAppBar(AuthViewModel auth) {
    return SliverAppBar(
      expandedHeight: 140.0,
      floating: false,
      pinned: true,
      backgroundColor: const Color(0xFF1A1A2E),
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        titlePadding: const EdgeInsets.only(left: 24, right: 24, bottom: 16),
        centerTitle: false,
        title: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Welcome back,', style: TextStyle(fontSize: 10, color: Colors.white70, fontWeight: FontWeight.w400)),
                  Text(auth.user?.name ?? 'User', style: const TextStyle(fontSize: 16, color: Colors.white, fontWeight: FontWeight.w900), overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: Colors.blueAccent.withOpacity(0.15), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.blueAccent.withOpacity(0.3))),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.radar, color: Colors.blueAccent, size: 8),
                  SizedBox(width: 4),
                  Text('ACTIVE TRACKING', style: TextStyle(color: Colors.blueAccent, fontSize: 7, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                ],
              ),
            ),
          ],
        ),
        background: Stack(
          children: [
            Positioned(
              right: -50,
              top: -50,
              child: _buildGlow(Colors.blueAccent.withOpacity(0.1), 200),
            ),
          ],
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.sync_problem_rounded, color: Colors.orangeAccent),
          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SyncCenterScreen())),
        ),
        IconButton(
          icon: const Icon(Icons.logout_rounded, color: Colors.white),
          onPressed: () => auth.logout(),
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)],
        ),
        child: TextField(
          controller: _searchController,
          onChanged: (val) => setState(() => _searchQuery = val),
          decoration: const InputDecoration(
            hintText: 'Search by title or category...',
            prefixIcon: Icon(Icons.search_rounded, color: Color(0xFF1A1A2E)),
            border: InputBorder.none,
            contentPadding: EdgeInsets.all(20),
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
      child: Row(
        children: [
          _buildActionCard(Icons.map_rounded, 'Map View', const Color(0xFF4facfe)),
          _buildActionCard(Icons.notifications_active_rounded, 'Alerts', Colors.orange),
          _buildActionCard(Icons.support_agent_rounded, 'Support', Colors.purpleAccent),
          _buildActionCard(Icons.history_rounded, 'History', Colors.teal),
        ],
      ),
    );
  }

  Widget _buildActionCard(IconData icon, String label, Color color) {
    return Container(
      width: 110,
      margin: const EdgeInsets.only(right: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 12),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: Color(0xFF1A1A2E))),
        ],
      ),
    );
  }

  Widget _buildHeroStats(List<RequestModel> requests) {
    final pending = requests.where((r) => r.status == 'PENDING').length;
    final inProgress = requests.where((r) => r.status == 'IN_PROGRESS' || r.status == 'ASSIGNED').length;
    final solved = requests.where((r) => r.status == 'COMPLETED').length;

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
      child: Row(
        children: [
          _buildStatCard('Pending', pending.toString(), Colors.orange),
          const SizedBox(width: 12),
          _buildStatCard('In Progress', inProgress.toString(), const Color(0xFF4facfe)),
          const SizedBox(width: 12),
          _buildStatCard('Solved', solved.toString(), Colors.greenAccent[700]!),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.15), width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: color)),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(color: Colors.grey[500], fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off_rounded, size: 80, color: Colors.grey[200]),
          const SizedBox(height: 16),
          Text('No matching reports', style: TextStyle(color: Colors.grey[400], fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildRequestCard(RequestModel request) {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => RequestDetailsScreen(request: request))),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A2E).withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(_getCategoryIcon(request.category), color: const Color(0xFF1A1A2E)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(request.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Color(0xFF1A1A2E))),
                  const SizedBox(height: 4),
                  Text(request.category, style: TextStyle(color: Colors.grey[500], fontSize: 12, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
            _buildStatusBadge(request.status),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status) {
      case 'PENDING': color = Colors.orange; break;
      case 'ASSIGNED':
      case 'IN_PROGRESS': color = const Color(0xFF4facfe); break;
      case 'COMPLETED': color = Colors.greenAccent[700]!; break;
      default: color = Colors.redAccent;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5),
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

  Widget _buildGlow(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: color,
            blurRadius: 100,
            spreadRadius: 50,
          ),
        ],
      ),
    );
  }
}
