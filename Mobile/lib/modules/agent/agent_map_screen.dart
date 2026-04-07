import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/agent_viewmodel.dart';
import 'package:issop_mobile/core/models/request_model.dart';

class AgentMapScreen extends StatelessWidget {
  const AgentMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AgentViewModel>();
    final activeTasks = vm.tasks.where((t) => t.status == 'ASSIGNED' || t.status == 'IN_PROGRESS').toList();
    
    LatLng center = const LatLng(3.8480, 11.5021);
    if (activeTasks.isNotEmpty) {
      center = LatLng(activeTasks.first.latitude, activeTasks.first.longitude);
    }

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Container(
          margin: const EdgeInsets.all(8),
          decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
          child: IconButton(icon: const Icon(Icons.arrow_back, color: Color(0xFF1A1A2E)), onPressed: () => Navigator.pop(context)),
        ),
        title: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10)]),
          child: const Text('Mission Map', style: TextStyle(color: Color(0xFF1A1A2E), fontWeight: FontWeight.bold, fontSize: 16)),
        ),
      ),
      body: FlutterMap(
        options: MapOptions(initialCenter: center, initialZoom: 14),
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.issop.issop_mobile',
          ),
          MarkerLayer(
            markers: activeTasks.map((t) => Marker(
              point: LatLng(t.latitude, t.longitude),
              width: 50,
              height: 50,
              child: GestureDetector(
                onTap: () => _showTaskPeek(context, t),
                child: Container(
                  decoration: BoxDecoration(
                    color: t.status == 'IN_PROGRESS' ? Colors.blueAccent : Colors.orange,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 3),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 8)],
                  ),
                  child: const Icon(Icons.navigation_rounded, color: Colors.white, size: 24),
                ),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }

  void _showTaskPeek(BuildContext context, RequestModel task) {
    showModalBottomSheet(
      context: context, 
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        margin: const EdgeInsets.all(20),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
             Text(task.title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
             const SizedBox(height: 8),
             Text(task.address ?? 'No address provided', style: TextStyle(color: Colors.grey.shade600)),
             const SizedBox(height: 20),
             ElevatedButton(
               onPressed: () => Navigator.pop(context), 
               child: const Text('Close Preview', style: TextStyle(fontWeight: FontWeight.bold)),
             ),
          ],
        ),
      )
    );
  }
}
