import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:intl/intl.dart';

class RequestDetailsScreen extends StatelessWidget {
  final RequestModel request;
  const RequestDetailsScreen({super.key, required this.request});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFF),
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(context),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStatusOverview(),
                  const SizedBox(height: 24),
                  if (request.address != null) ...[
                    _buildAddressCard(),
                    const SizedBox(height: 32),
                  ],
                  _buildSectionTitle('Description'),
                  const SizedBox(height: 12),
                  Text(
                    request.description,
                    style: TextStyle(fontSize: 15, color: Colors.grey[700], height: 1.6),
                  ),
                  const SizedBox(height: 32),
                  _buildSectionTitle('Location Profile'),
                  const SizedBox(height: 16),
                  _buildMapPreview(),
                  const SizedBox(height: 32),
                  if (request.mediaUrls != null && request.mediaUrls!.isNotEmpty) ...[
                    _buildSectionTitle('Evidence Portfoli'),
                    const SizedBox(height: 16),
                    _buildMediaGallery(),
                  ],
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 200.0,
      pinned: true,
      backgroundColor: const Color(0xFF1A1A2E),
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
        onPressed: () => Navigator.pop(context),
      ),
      flexibleSpace: FlexibleSpaceBar(
        title: Text(request.title, 
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Colors.white)),
        background: Stack(
          fit: StackFit.expand,
          children: [
            Container(color: const Color(0xFF1A1A2E)),
            Positioned(
              right: -20,
              bottom: -20,
              child: Icon(_getCategoryIcon(request.category), size: 150, color: Colors.white.withOpacity(0.05)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusOverview() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('CURRENT STATUS', style: TextStyle(fontSize: 10, color: Colors.grey[400], fontWeight: FontWeight.bold, letterSpacing: 1.5)),
              const SizedBox(height: 4),
              Text(request.status, style: TextStyle(fontSize: 18, color: _getStatusColor(request.status), fontWeight: FontWeight.w900)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('REPORTED ON', style: TextStyle(fontSize: 10, color: Colors.grey[400], fontWeight: FontWeight.bold, letterSpacing: 1.5)),
              const SizedBox(height: 4),
              Text(DateFormat('MMM dd, yyyy').format(request.createdAt), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1A1A2E)));
  }

  Widget _buildMapPreview() {
    return Container(
      height: 200,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white, width: 4),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15)],
      ),
      clipBehavior: Clip.antiAlias,
      child: FlutterMap(
        options: MapOptions(
          initialCenter: LatLng(request.latitude, request.longitude),
          initialZoom: 15,
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.issop.app',
          ),
          MarkerLayer(
            markers: [
              Marker(
                point: LatLng(request.latitude, request.longitude),
                width: 60,
                height: 60,
                child: const Icon(Icons.location_on_rounded, color: Colors.redAccent, size: 40),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMediaGallery() {
    return SizedBox(
      height: 120,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: request.mediaUrls!.length,
        itemBuilder: (context, index) {
          return Container(
            width: 120,
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              image: DecorationImage(
                image: NetworkImage(request.mediaUrls![index]),
                fit: BoxFit.cover,
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildAddressCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF4facfe).withOpacity(0.1), width: 1),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: const Color(0xFF4facfe).withOpacity(0.1), shape: BoxShape.circle),
            child: const Icon(Icons.place_rounded, color: Color(0xFF4facfe), size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('VERIFIED LOCATION', style: TextStyle(fontSize: 9, color: Colors.grey[400], fontWeight: FontWeight.bold, letterSpacing: 1)),
                const SizedBox(height: 4),
                Text(request.address!, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1A1A2E), height: 1.4)),
              ],
            ),
          ),
        ],
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

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING': return Colors.orange;
      case 'IN_PROGRESS': return const Color(0xFF4facfe);
      case 'COMPLETED': return Colors.greenAccent[700]!;
      default: return Colors.redAccent;
    }
  }
}
