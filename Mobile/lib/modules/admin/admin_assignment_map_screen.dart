import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/admin_viewmodel.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/core/models/user_model.dart';

class AdminAssignmentMapScreen extends StatefulWidget {
  final RequestModel request;
  const AdminAssignmentMapScreen({super.key, required this.request});

  @override
  State<AdminAssignmentMapScreen> createState() => _AdminAssignmentMapScreenState();
}

class _AdminAssignmentMapScreenState extends State<AdminAssignmentMapScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminViewModel>().fetchUsers(); // To get all agents
    });
  }

  void _showAgentPopup(UserModel agent, AdminViewModel vm) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.person_pin_circle, color: Colors.blueAccent),
            const SizedBox(width: 10),
            Text(agent.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Email: ${agent.email}', style: TextStyle(color: Colors.grey.shade600)),
            const SizedBox(height: 10),
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)), child: const Text('Online & Available', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12))),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          ElevatedButton(
            onPressed: () async {
              await vm.assignTask(widget.request.id, agent.id);
              if (mounted) {
                Navigator.pop(context); // Close popup
                Navigator.pop(context); // Back to detail
                Navigator.pop(context); // Back to home
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Task assigned successfully!'), backgroundColor: Colors.green));
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1A1A2E), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: const Text('ASSIGN TASK', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final adminVm = context.watch<AdminViewModel>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Assign Nearest Agent', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context)),
      ),
      body: FlutterMap(
        options: MapOptions(
          initialCenter: LatLng(widget.request.latitude, widget.request.longitude),
          initialZoom: 15,
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.issop.app',
          ),
          MarkerLayer(
            markers: [
              // Damage location marker
              Marker(
                point: LatLng(widget.request.latitude, widget.request.longitude),
                child: const Icon(Icons.report_problem_rounded, color: Colors.redAccent, size: 40),
              ),
              // Nearby Agents
              ...adminVm.agents.where((a) => a.latitude != null).map((agent) {
                final bool isOnline = agent.lastLocationUpdate != null && 
                                     DateTime.now().difference(agent.lastLocationUpdate!).inMinutes < 15;
                final Color statusColor = isOnline ? Colors.green : Colors.redAccent;
                
                return Marker(
                  point: LatLng(agent.latitude!, agent.longitude!),
                  child: GestureDetector(
                    onTap: () => _showAgentPopup(agent, adminVm),
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 4))]),
                      child: Container(
                        decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                        alignment: Alignment.center,
                        child: const Text('A', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        ],
      ),
    );
  }
}
