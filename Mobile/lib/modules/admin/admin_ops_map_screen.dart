import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/admin_viewmodel.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/core/models/user_model.dart';
import 'package:issop_mobile/modules/admin/admin_request_detail_screen.dart';

class AdminOpsMapScreen extends StatefulWidget {
  const AdminOpsMapScreen({super.key});

  @override
  State<AdminOpsMapScreen> createState() => _AdminOpsMapScreenState();
}

class _AdminOpsMapScreenState extends State<AdminOpsMapScreen> {
  final MapController _mapController = MapController();
  bool _showAgents = true;
  bool _showRequests = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminViewModel>().fetchRequests();
      context.read<AdminViewModel>().fetchUsers();
    });
  }

  @override
  Widget build(BuildContext context) {
    final adminVm = context.watch<AdminViewModel>();
    
    // Default center to first request or city center
    LatLng center = const LatLng(3.8480, 11.5021); // Yaounde default
    if (adminVm.requests.isNotEmpty) {
      center = LatLng(adminVm.requests.first.latitude, adminVm.requests.first.longitude);
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
          child: const Text('Ops Map Control', style: TextStyle(color: Color(0xFF1A1A2E), fontWeight: FontWeight.bold, fontSize: 16)),
        ),
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: center,
              initialZoom: 13,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.issop.issop_mobile',
              ),
              MarkerLayer(
                markers: [
                  if (_showRequests) ...adminVm.requests.map((r) => _buildRequestMarker(r)),
                  if (_showAgents) ...adminVm.agents.where((a) => a.latitude != null).map((a) => _buildAgentMarker(a)),
                ],
              ),
            ],
          ),
          Positioned(
            bottom: 30,
            left: 20,
            right: 20,
            child: _buildControls(),
          ),
        ],
      ),
    );
  }

  Marker _buildRequestMarker(RequestModel r) {
    return Marker(
      point: LatLng(r.latitude, r.longitude),
      width: 40,
      height: 40,
      child: GestureDetector(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AdminRequestDetailScreen(request: r))),
        child: Container(
          decoration: BoxDecoration(
            color: _getStatusColor(r.status),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 4)],
          ),
          child: const Icon(Icons.report_problem, color: Colors.white, size: 20),
        ),
      ),
    );
  }

  Marker _buildAgentMarker(UserModel a) {
    return Marker(
      point: LatLng(a.latitude!, a.longitude!),
      width: 40,
      height: 40,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.blueAccent,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 4)],
        ),
        child: const Icon(Icons.person, color: Colors.white, size: 20),
      ),
    );
  }

  Widget _buildControls() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20)]),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildToggleButton(Icons.report_problem, 'Requests', _showRequests, (val) => setState(() => _showRequests = val)),
          const VerticalDivider(width: 1),
          _buildToggleButton(Icons.person, 'Agents', _showAgents, (val) => setState(() => _showAgents = val)),
        ],
      ),
    );
  }

  Widget _buildToggleButton(IconData icon, String label, bool active, Function(bool) onChanged) {
    return GestureDetector(
      onTap: () => onChanged(!active),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: active ? const Color(0xFF1A1A2E) : Colors.grey.shade300, size: 28),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: active ? const Color(0xFF1A1A2E) : Colors.grey.shade400)),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    if (status == 'PENDING') return Colors.orange;
    if (status == 'ASSIGNED' || status == 'IN_PROGRESS') return Colors.indigo;
    if (status == 'COMPLETED') return Colors.green;
    return Colors.grey;
  }
}
