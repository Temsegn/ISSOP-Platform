import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:issop_mobile/viewmodels/admin_viewmodel.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/core/models/user_model.dart';
import 'package:issop_mobile/modules/admin/admin_request_detail_screen.dart';
import 'package:intl/intl.dart';

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
    
    LatLng center = const LatLng(3.8480, 11.5021);
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
            options: MapOptions(initialCenter: center, initialZoom: 13),
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
          Positioned(bottom: 30, left: 20, right: 20, child: _buildControls()),
        ],
      ),
    );
  }

  Marker _buildRequestMarker(RequestModel r) {
    return Marker(
      point: LatLng(r.latitude, r.longitude),
      width: 55,
      height: 55,
      child: GestureDetector(
        onTap: () {
          _mapController.move(LatLng(r.latitude, r.longitude), 15);
          _showRequestPeek(context, r);
        },
        child: Container(
          decoration: BoxDecoration(
            color: _getStatusColor(r.status),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 3),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))],
          ),
          child: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 28),
        ),
      ),
    );
  }

  Marker _buildAgentMarker(UserModel a) {
    return Marker(
      point: LatLng(a.latitude!, a.longitude!),
      width: 50,
      height: 50,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.blueAccent, width: 3),
          boxShadow: [BoxShadow(color: Colors.blueAccent.withOpacity(0.3), blurRadius: 12, spreadRadius: 2)],
        ),
        child: const Center(child: Text('A', style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.w900, fontSize: 16))),
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

  void _showRequestPeek(BuildContext context, RequestModel r) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        margin: const EdgeInsets.all(24),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(32), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 40)]),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _buildSimpleStatusChip(r.status),
                const Spacer(),
                Text(DateFormat('MMM dd').format(r.createdAt), style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 16),
            Text(r.title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 22, color: Color(0xFF1A1A2E), letterSpacing: -0.5)),
            const SizedBox(height: 8),
            Text(r.address ?? 'Analyzing location...', style: TextStyle(color: Colors.grey.shade600, fontSize: 14)),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AdminRequestDetailScreen(request: r))),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1A1A2E), padding: const EdgeInsets.symmetric(vertical: 18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
                    child: const Text('OPEN FULL DETAIL', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 1)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSimpleStatusChip(String status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: _getStatusColor(status).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(status, style: TextStyle(color: _getStatusColor(status), fontWeight: FontWeight.w900, fontSize: 9, letterSpacing: 1)),
    );
  }

  Color _getStatusColor(String status) {
    if (status == 'PENDING') return Colors.orange;
    if (status == 'ASSIGNED' || status == 'IN_PROGRESS') return Colors.indigo;
    if (status == 'COMPLETED') return Colors.green;
    return Colors.grey;
  }
}
