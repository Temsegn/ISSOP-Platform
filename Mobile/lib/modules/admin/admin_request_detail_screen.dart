import 'package:flutter/material.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:intl/intl.dart';
import 'package:issop_mobile/modules/admin/admin_assignment_map_screen.dart';

class AdminRequestDetailScreen extends StatelessWidget {
  final RequestModel request;
  const AdminRequestDetailScreen({super.key, required this.request});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFD),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            backgroundColor: const Color(0xFF1A1A2E),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: request.mediaUrls.isNotEmpty
                  ? PageView.builder(
                      itemCount: request.mediaUrls.length,
                      itemBuilder: (context, index) {
                        return Image.network(
                          request.mediaUrls[index],
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const Center(child: Icon(Icons.broken_image, size: 50, color: Colors.white54)),
                        );
                      },
                    )
                  : Container(
                      color: const Color(0xFF1A1A2E),
                      child: const Icon(Icons.image_not_supported_outlined, color: Colors.white24, size: 80),
                    ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildStatusChip(request.status),
                      Text(DateFormat('MMM dd, yyyy').format(request.createdAt), style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.w600)),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(request.title, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF1A1A2E))),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                    child: Text(request.category, style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.w800, fontSize: 13)),
                  ),
                  const SizedBox(height: 24),
                  const _SectionHeader(title: 'DESCRIPTION'),
                  const SizedBox(height: 12),
                  Text(request.description, style: TextStyle(fontSize: 16, color: Colors.grey.shade800, height: 1.6)),
                  const SizedBox(height: 32),
                  const _SectionHeader(title: 'REPORTER DETAILS'),
                  const SizedBox(height: 12),
                  _buildDetailRow(Icons.person_outline, 'Citizen Name', request.citizenName ?? 'Unknown Citizen'),
                  const SizedBox(height: 32),
                  const _SectionHeader(title: 'LOCATION'),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 20)]),
                    child: Row(
                      children: [
                        Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: Colors.redAccent.withOpacity(0.1), shape: BoxShape.circle), child: const Icon(Icons.location_on, color: Colors.redAccent)),
                        const SizedBox(width: 16),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          const Text('Address', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          const SizedBox(height: 4),
                          Text(request.address ?? 'Unavailable', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                        ])),
                      ],
                    ),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: request.status == 'PENDING' 
        ? Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(30))),
            child: ElevatedButton(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => AdminAssignmentMapScreen(request: request)));
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1A1A2E),
                padding: const EdgeInsets.symmetric(vertical: 20),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 4
              ),
              child: const Text('ASSIGN TASK', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1.2, color: Colors.white)),
            ),
          )
        : null,
    );
  }

  Widget _buildStatusChip(String status) {
    Color color = Colors.grey;
    if (status == 'PENDING') color = Colors.orange;
    if (status == 'ASSIGNED') color = Colors.blue;
    if (status == 'IN_PROGRESS') color = Colors.indigo;
    if (status == 'COMPLETED') color = Colors.green;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
      child: Text(status, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.blueGrey),
        const SizedBox(width: 12),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.blueGrey)),
          Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
        ]),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});
  @override
  Widget build(BuildContext context) {
    return Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.blueAccent.withOpacity(0.6), letterSpacing: 1.5));
  }
}
