import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';
import 'package:issop_mobile/viewmodels/agent_viewmodel.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:intl/intl.dart';

class AgentHomeScreen extends StatefulWidget {
  const AgentHomeScreen({super.key});

  @override
  State<AgentHomeScreen> createState() => _AgentHomeScreenState();
}

class _AgentHomeScreenState extends State<AgentHomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AgentViewModel>().fetchTasks();
      context.read<AgentViewModel>().startLocationTracking();
    });
  }

  void _uploadProof(RequestModel task) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.camera, imageQuality: 80);
    
    if (pickedFile != null && mounted) {
      final file = File(pickedFile.path);
      await context.read<AgentViewModel>().updateTaskStatus(task.id, 'COMPLETED', proof: file);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Row(
            children: [Icon(Icons.check_circle, color: Colors.white), SizedBox(width: 8), Text('Task completed with proof!')],
          ),
          backgroundColor: Colors.green.shade600,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ));
      }
    }
  }

  void _showTaskDetails(RequestModel task) {
    showModalBottomSheet(
      context: context, 
      isScrollControlled: true, 
      backgroundColor: Colors.transparent,
      builder: (context) {
      return Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        ),
        padding: const EdgeInsets.all(24.0).copyWith(bottom: MediaQuery.of(context).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
               child: Container(width: 50, height: 5, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)))
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: Text(task.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF1A1A2E)))),
                _buildStatusChip(task.status),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: Colors.blueAccent.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
              child: Text('Category: ${task.category}', style: const TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.w700, fontSize: 13)),
            ),
            const SizedBox(height: 20),
            Text(task.description, style: TextStyle(color: Colors.grey.shade700, height: 1.5, fontSize: 15)),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: Colors.redAccent.withOpacity(0.1), shape: BoxShape.circle),
                    child: const Icon(Icons.location_on, color: Colors.redAccent),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                         const Text('Location', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey)),
                         const SizedBox(height: 4),
                         Text(task.address ?? 'Lat: ${task.latitude}, Lng: ${task.longitude}', style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF1A1A2E), fontSize: 14)),
                      ],
                    )
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            if (task.status == 'ASSIGNED') ...[
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () { 
                        context.read<AgentViewModel>().updateTaskStatus(task.id, 'REJECTED');
                        Navigator.pop(context);
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: Colors.redAccent, width: 2),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))
                      ),
                      child: const Text('REJECT', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w800, letterSpacing: 1)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () { 
                        context.read<AgentViewModel>().updateTaskStatus(task.id, 'IN_PROGRESS');
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade600,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 4
                      ),
                      child: const Text('ACCEPT & START', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, letterSpacing: 1)),
                    ),
                  ),
                ],
              )
            ] else if (task.status == 'IN_PROGRESS') ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    _uploadProof(task);
                  },
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('UPLOAD PROOF & COMPLETE', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: 1)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blueAccent, 
                    foregroundColor: Colors.white, 
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 5
                  ),
                ),
              )
            ]
          ],
        )
      );
    });
  }

  Widget _buildStatusChip(String status) {
    Color color = Colors.grey;
    if (status == 'ASSIGNED') color = Colors.orange;
    if (status == 'IN_PROGRESS') color = Colors.blueAccent;
    if (status == 'COMPLETED') color = Colors.green;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(20), border: Border.all(color: color.withOpacity(0.3))),
      child: Text(status, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AgentViewModel>();
    final user = context.read<AuthViewModel>().user;

    final activeTasks = vm.tasks.where((t) => t.status == 'ASSIGNED' || t.status == 'IN_PROGRESS').length;
    final compTasks = vm.tasks.where((t) => t.status == 'COMPLETED').length;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FC),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        toolbarHeight: 80,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Hello, ${user?.name?.split(' ').first ?? 'Agent'}', style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Color(0xFF1A1A2E), letterSpacing: -0.5)),
            const Text('Here is your field dashboard', style: TextStyle(fontSize: 14, color: Colors.grey, fontWeight: FontWeight.w500)),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
            child: IconButton(
              icon: const Icon(Icons.refresh, color: Color(0xFF1A1A2E)),
              onPressed: () => vm.fetchTasks(),
            ),
          ),
          Container(
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
            child: IconButton(
              onPressed: () {
                vm.stopLocationTracking();
                context.read<AuthViewModel>().logout();
              },
              icon: const Icon(Icons.logout, color: Colors.redAccent)
            ),
          )
        ],
      ),
      body: vm.loading && vm.tasks.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async => await vm.fetchTasks(),
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10),
                      child: Row(
                        children: [
                          Expanded(
                            child: _buildStatCard('Active Tasks', activeTasks.toString(), Icons.assignment_late, Colors.orange),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildStatCard('Completed', compTasks.toString(), Icons.check_circle, Colors.green),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 24, 20, 10),
                      child: Row(
                        children: [
                           const Text('Your Missions', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF1A1A2E))),
                           const Spacer(),
                           if (vm.tasks.isNotEmpty)
                             Text('${vm.tasks.length} Total', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.grey)),
                        ],
                      )
                    ),
                  ),
                  vm.tasks.isEmpty
                      ? SliverFillRemaining(
                          hasScrollBody: false,
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.assignment_turned_in, size: 80, color: Colors.grey.shade300),
                                const SizedBox(height: 16),
                                Text('Clean Slate!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.grey.shade600)),
                                const SizedBox(height: 8),
                                Text('No tasks assigned to you right now.', style: TextStyle(fontSize: 15, color: Colors.grey.shade500)),
                              ],
                            ),
                          ),
                        )
                      : SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final task = vm.tasks[index];
                              return Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(20),
                                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 8))],
                                  ),
                                  child: Material(
                                    color: Colors.transparent,
                                    child: InkWell(
                                      onTap: () => _showTaskDetails(task),
                                      borderRadius: BorderRadius.circular(20),
                                      child: Padding(
                                        padding: const EdgeInsets.all(20.0),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Container(
                                                  height: 50,
                                                  width: 50,
                                                  decoration: BoxDecoration(
                                                    color: _getIconColor(task.status).withOpacity(0.1),
                                                    borderRadius: BorderRadius.circular(14),
                                                  ),
                                                  child: Icon(_getIcon(task.status), color: _getIconColor(task.status), size: 24),
                                                ),
                                                const SizedBox(width: 16),
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      Text(task.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E)), maxLines: 1, overflow: TextOverflow.ellipsis),
                                                      const SizedBox(height: 4),
                                                      Text(DateFormat('MMM dd, yyyy • hh:mm a').format(task.createdAt), style: TextStyle(fontSize: 12, color: Colors.grey.shade500, fontWeight: FontWeight.w500)),
                                                    ],
                                                  ),
                                                ),
                                                _buildStatusChip(task.status),
                                              ],
                                            ),
                                            const Padding(
                                              padding: EdgeInsets.symmetric(vertical: 16.0),
                                              child: Divider(height: 1, color: Color(0xFFF0F0F0)),
                                            ),
                                            Row(
                                              children: [
                                                const Icon(Icons.place, size: 16, color: Colors.grey),
                                                const SizedBox(width: 6),
                                                Expanded(child: Text(task.address ?? 'Lat: ${task.latitude}, Lng: ${task.longitude}', style: TextStyle(color: Colors.grey.shade600, fontSize: 13, fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            },
                            childCount: vm.tasks.length,
                          ),
                        ),
                  const SliverToBoxAdapter(child: SizedBox(height: 80))
                ],
              ),
            ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: color.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, 10))],
        border: Border.all(color: color.withOpacity(0.1), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 16),
          Text(value, style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: color, height: 1)),
          const SizedBox(height: 4),
          Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.grey.shade600)),
        ],
      ),
    );
  }

  IconData _getIcon(String status) {
    if (status == 'ASSIGNED') return Icons.new_releases_rounded;
    if (status == 'IN_PROGRESS') return Icons.directions_run_rounded;
    if (status == 'COMPLETED') return Icons.task_alt_rounded;
    return Icons.assignment;
  }

  Color _getIconColor(String status) {
    if (status == 'ASSIGNED') return Colors.orange;
    if (status == 'IN_PROGRESS') return Colors.blueAccent;
    if (status == 'COMPLETED') return Colors.green;
    return Colors.grey;
  }
}

