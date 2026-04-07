import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/request_viewmodel.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/modules/user/request_details_screen.dart';

class UserMapScreen extends StatelessWidget {
  const UserMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<RequestViewModel>();
    
    // Default to first request or center
    LatLng center = const LatLng(3.8480, 11.5021);
    if (vm.requests.isNotEmpty) {
      center = LatLng(vm.requests.first.latitude, vm.requests.first.longitude);
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
          child: const Text('City Issues Map', style: TextStyle(color: Color(0xFF1A1A2E), fontWeight: FontWeight.bold, fontSize: 16)),
        ),
      ),
      body: FlutterMap(
        options: MapOptions(initialCenter: center, initialZoom: 13),
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.issop.issop_mobile',
          ),
          MarkerLayer(
            markers: vm.requests.map((r) => Marker(
              point: LatLng(r.latitude, r.longitude),
              width: 45,
              height: 45,
              child: GestureDetector(
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => RequestDetailsScreen(request: r))),
                child: Container(
                  decoration: BoxDecoration(
                    color: _getStatusColor(r.status),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 4)],
                  ),
                  child: Icon(_getCategoryIcon(r.category), color: Colors.white, size: 20),
                ),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    if (status == 'PENDING') return Colors.orange;
    if (status == 'ASSIGNED' || status == 'IN_PROGRESS') return Colors.blueAccent;
    if (status == 'COMPLETED') return Colors.green;
    return Colors.redAccent;
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
}
