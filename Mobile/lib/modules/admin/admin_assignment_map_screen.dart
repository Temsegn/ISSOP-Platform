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
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)))),
            const SizedBox(height: 24),
            Row(children: [
               Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.green.shade50, shape: BoxShape.circle), child: const Text('A', style: TextStyle(color: Colors.green, fontWeight: FontWeight.w900, fontSize: 24))),
               const SizedBox(width: 16),
               Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                 Text(agent.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
                 Text(agent.email, style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.w600)),
               ]),
            ]),
            const SizedBox(height: 32),
            const Text('AGENT DETAILS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.blueAccent, letterSpacing: 1.2)),
            const SizedBox(height: 12),
            ListTile(leading: const Icon(Icons.phone), title: Text(agent.phone ?? 'No phone listed')),
            ListTile(leading: const Icon(Icons.my_location), title: Text('Lat: ${agent.latitude}, Lng: ${agent.longitude}')),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  await vm.assignTask(widget.request.id, agent.id);
                  if (context.mounted) {
                    Navigator.pop(context); // Close sheet
                    Navigator.pop(context); // Back to detail
                    Navigator.pop(context); // Back to home
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Dispatched Successfully!'), backgroundColor: Colors.green));
                  }
                },
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1A1A2E), padding: const EdgeInsets.symmetric(vertical: 20), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
                child: const Text('ASSIGN TASK NOW', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
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
              // Nearby Agents (Ensures all with coordinates are visible)
              ...adminVm.agents.where((a) => a.latitude != null).map((agent) {
                final bool isOnline = agent.lastLocationUpdate != null && 
                                     DateTime.now().difference(agent.lastLocationUpdate!).inMinutes < 15;
                final Color statusColor = isOnline ? Colors.green : Colors.redAccent;
                
                return Marker(
                  width: 45,
                  height: 45,
                  point: LatLng(agent.latitude!, agent.longitude!),
                  child: GestureDetector(
                    onTap: () => _showAgentPopup(agent, adminVm),
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9), 
                        shape: BoxShape.circle, 
                        boxShadow: [BoxShadow(color: statusColor.withOpacity(0.4), blurRadius: 12, spreadRadius: 2, offset: const Offset(0, 4))]
                      ),
                      child: Container(
                        decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                        alignment: Alignment.center,
                        child: const Text('A', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
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
