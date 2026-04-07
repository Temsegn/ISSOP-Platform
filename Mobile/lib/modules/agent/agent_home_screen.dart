import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:issop_mobile/viewmodels/auth_viewmodel.dart';
import 'package:issop_mobile/viewmodels/agent_viewmodel.dart';
import 'package:issop_mobile/core/models/request_model.dart';

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
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Task completed with proof!')));
      }
    }
  }

  void _showTaskDetails(RequestModel task) {
    showModalBottomSheet(context: context, isScrollControlled: true, shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))), builder: (context) {
      return Padding(
        padding: const EdgeInsets.all(24.0).copyWith(bottom: MediaQuery.of(context).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(task.title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Text('Category: ${task.category}', style: const TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            Text(task.description),
            const SizedBox(height: 20),
            Row(
              children: [
                const Icon(Icons.location_on, color: Colors.red),
                const SizedBox(width: 8),
                Expanded(child: Text(task.address ?? 'Lat: ${task.latitude}, Lng: ${task.longitude}')),
              ],
            ),
            const SizedBox(height: 30),
            if (task.status == 'ASSIGNED') ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () { 
                      context.read<AgentViewModel>().updateTaskStatus(task.id, 'REJECTED');
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
                    child: const Text('REJECT', style: TextStyle(color: Colors.white)),
                  ),
                  ElevatedButton(
                    onPressed: () { 
                      context.read<AgentViewModel>().updateTaskStatus(task.id, 'IN_PROGRESS');
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                    child: const Text('ACCEPT (START)', style: TextStyle(color: Colors.white)),
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
                  label: const Text('UPLOAD PROOF & COMPLETE'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16)),
                ),
              )
            ] else ...[
               Center(child: Chip(label: Text('Status: ${task.status}')))
            ]
          ],
        )
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AgentViewModel>();
    final user = context.read<AuthViewModel>().user;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FC),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Agent Dashboard', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            Text('Welcome, ${user?.name}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.normal)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => vm.fetchTasks(),
          ),
          IconButton(
            onPressed: () {
              vm.stopLocationTracking();
              context.read<AuthViewModel>().logout();
            },
            icon: const Icon(Icons.logout)
          )
        ],
      ),
      body: vm.loading && vm.tasks.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async => await vm.fetchTasks(),
              child: vm.tasks.isEmpty
                  ? ListView(
                      children: const [
                        SizedBox(height: 200),
                        Center(child: Text('No assigned tasks at the moment.')),
                      ],
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: vm.tasks.length,
                      itemBuilder: (context, index) {
                        final task = vm.tasks[index];
                        Color statusColor = Colors.grey;
                        if (task.status == 'ASSIGNED') statusColor = Colors.orange;
                        if (task.status == 'IN_PROGRESS') statusColor = Colors.blue;
                        if (task.status == 'COMPLETED') statusColor = Colors.green;

                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          child: InkWell(
                            onTap: () => _showTaskDetails(task),
                            borderRadius: BorderRadius.circular(16),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(child: Text(task.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold))),
                                      Chip(
                                        label: Text(task.status, style: const TextStyle(fontSize: 10, color: Colors.white)),
                                        backgroundColor: statusColor,
                                        visualDensity: VisualDensity.compact,
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      const Icon(Icons.map, size: 16, color: Colors.grey),
                                      const SizedBox(width: 4),
                                      Expanded(child: Text(task.address ?? 'Lat: ${task.latitude}, Lng: ${task.longitude}', style: TextStyle(color: Colors.grey.shade600), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                    ],
                                  ),
                                  if (task.status == 'ASSIGNED' || task.status == 'IN_PROGRESS')
                                    const Padding(
                                      padding: EdgeInsets.only(top: 12.0),
                                      child: Text('Tap to take action', style: TextStyle(color: Colors.blueAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                                    )
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}

