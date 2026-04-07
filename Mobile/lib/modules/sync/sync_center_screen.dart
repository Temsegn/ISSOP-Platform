import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:issop_mobile/viewmodels/request_viewmodel.dart';
import 'package:issop_mobile/viewmodels/agent_viewmodel.dart';
import 'package:intl/intl.dart';

class SyncCenterScreen extends StatefulWidget {
  const SyncCenterScreen({super.key});

  @override
  State<SyncCenterScreen> createState() => _SyncCenterScreenState();
}

class _SyncCenterScreenState extends State<SyncCenterScreen> {
  List<dynamic> _citizenDrafts = [];
  List<dynamic> _agentUpdates = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSyncData();
  }

  Future<void> _loadSyncData() async {
    final prefs = await SharedPreferences.getInstance();
    final cJson = prefs.getString('pending_requests');
    final aJson = prefs.getString('offline_task_updates');

    setState(() {
      _citizenDrafts = cJson != null ? jsonDecode(cJson) : [];
      _agentUpdates = aJson != null ? jsonDecode(aJson) : [];
      _loading = false;
    });
  }

  Future<void> _syncNow() async {
    setState(() => _loading = true);
    // Trigger sync in viewmodels
    await context.read<RequestViewModel>().fetchMyRequests();
    await context.read<AgentViewModel>().fetchTasks();
    await _loadSyncData();
    if (mounted) {
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sync process completed.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final total = _citizenDrafts.length + _agentUpdates.length;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FC),
      appBar: AppBar(
        title: const Text('Sync Center', style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1A1A2E))),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(onPressed: _syncNow, icon: const Icon(Icons.sync_rounded, color: Colors.blueAccent)),
        ],
      ),
      body: _loading 
          ? const Center(child: CircularProgressIndicator())
          : CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.all(24),
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A1A2E),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [BoxShadow(color: Colors.blueAccent.withOpacity(0.2), blurRadius: 20)],
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.cloud_off_rounded, color: Colors.white, size: 48),
                        const SizedBox(height: 16),
                        Text('$total Unsynced Items', style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        const Text('These items are saved locally and will upload automatically when online.', 
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ),
                if (_citizenDrafts.isNotEmpty) ...[
                  const SliverToBoxAdapter(padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12), child: Text('Citizen Missions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18))),
                  SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final d = _citizenDrafts[index];
                        return _buildSyncCard(
                          title: d['title'] ?? 'Request',
                          subtitle: d['category'] ?? 'Draft',
                          icon: Icons.assignment_rounded,
                          color: Colors.orange,
                          info: 'Saved: ${DateFormat('MMM dd, hh:mm a').format(DateTime.parse(d['createdAt']))}',
                        );
                      },
                      childCount: _citizenDrafts.length,
                    ),
                  ),
                ],
                if (_agentUpdates.isNotEmpty) ...[
                  const SliverToBoxAdapter(padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12), child: Text('Agent Updates', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18))),
                  SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final u = _agentUpdates[index];
                        return _buildSyncCard(
                          title: 'Status: ${u['status']}',
                          subtitle: 'ID: ${u['requestId']}',
                          icon: Icons.update_rounded,
                          color: Colors.blueAccent,
                          info: 'Queued',
                        );
                      },
                      childCount: _agentUpdates.length,
                    ),
                  ),
                ],
                if (total == 0)
                  const SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.check_circle_outline, color: Colors.green, size: 60),
                          SizedBox(height: 16),
                          Text('All caught up!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.grey)),
                          Text('Everything is synchronized with the server.', style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                const SliverToBoxAdapter(child: SizedBox(height: 40)),
              ],
            ),
    );
  }

  Widget _buildSyncCard({required String title, required String subtitle, required IconData icon, required Color color, required String info}) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
      child: Row(
        children: [
          Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle), child: Icon(icon, color: color, size: 24)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                Text(subtitle, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
              ],
            ),
          ),
          Text(info, style: TextStyle(color: Colors.grey.shade400, fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
