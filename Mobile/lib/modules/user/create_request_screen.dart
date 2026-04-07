import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:latlong2/latlong.dart';
import 'package:issop_mobile/viewmodels/request_viewmodel.dart';
import 'package:issop_mobile/modules/user/map_picker_screen.dart';

class CreateRequestScreen extends StatefulWidget {
  const CreateRequestScreen({super.key});

  @override
  State<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  String _selectedCategory = 'Road Issues';
  final List<File> _selectedFiles = [];
  LatLng _selectedLocation = const LatLng(0, 0);
  String _selectedAddress = 'No location selected';
  
  final List<String> _categories = [
    'Road Issues',
    'Waste Management',
    'Public Lighting',
    'Water & Sanitation'
  ];

  @override
  void initState() {
    super.initState();
    _initLocation();
  }

  void _initLocation() async {
    final vm = context.read<RequestViewModel>();
    await vm.getCurrentLocation();
    if (vm.currentPosition != null) {
      setState(() {
        _selectedLocation = LatLng(
            vm.currentPosition!.latitude, vm.currentPosition!.longitude);
      });
    }
  }

  void _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.camera);
    if (pickedFile != null) {
      setState(() {
        _selectedFiles.add(File(pickedFile.path));
      });
    }
  }

  void _openMapPicker() async {
    final result = await Navigator.push(
      context, 
      MaterialPageRoute(
        builder: (_) => MapPickerScreen(initialLocation: _selectedLocation),
      ),
    );
    if (result != null && result is Map<String, dynamic>) {
      setState(() {
        _selectedLocation = result['location'];
        _selectedAddress = result['address'];
      });
    }
  }

  void _onSubmit() async {
    final vm = context.read<RequestViewModel>();
    final success = await vm.createRequest(
      title: _titleController.text,
      description: _descController.text,
      category: _selectedCategory,
      lat: _selectedLocation.latitude,
      lng: _selectedLocation.longitude,
      address: _selectedAddress,
      files: _selectedFiles,
    );
    if (success && mounted) {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<RequestViewModel>().loading;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFF),
      appBar: AppBar(
        title: const Text('New Request', style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1A1A2E), letterSpacing: 1.5)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Color(0xFF1A1A2E)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle('What is your issue?'),
            const SizedBox(height: 16),
            _buildTextField(_titleController, 'Brief Title', Icons.title_rounded),
            const SizedBox(height: 16),
            _buildDropdown(),
            const SizedBox(height: 16),
            _buildTextField(_descController, 'Provide detailed information...', Icons.notes_rounded, maxLines: 4),
            
            const SizedBox(height: 32),
            _buildSectionTitle('Where is this located?'),
            const SizedBox(height: 16),
            _buildLocationCard(),
            
            const SizedBox(height: 32),
            _buildSectionTitle('Media Evidence'),
            const SizedBox(height: 16),
            _buildImageGrid(),
            
            const SizedBox(height: 48),
            loading 
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF1A1A2E)))
              : ElevatedButton(
                  onPressed: _onSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1A1A2E),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    elevation: 10,
                    shadowColor: const Color(0xFF1A1A2E).withOpacity(0.4),
                  ),
                  child: const Center(
                    child: Text('SUBMIT REPORT', 
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 2)),
                  ),
                ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF1A1A2E), letterSpacing: 0.5));
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon, {int maxLines = 1}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        decoration: InputDecoration(
          hintText: label,
          prefixIcon: Icon(icon, color: const Color(0xFF1A1A2E), size: 22),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
          contentPadding: const EdgeInsets.all(20),
        ),
      ),
    );
  }

  Widget _buildDropdown() {
    return Container(
      padding: const EdgeInsets.only(left: 20, right: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedCategory,
          isExpanded: true,
          items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontWeight: FontWeight.w600)))).toList(),
          onChanged: (val) => setState(() => _selectedCategory = val!),
        ),
      ),
    );
  }

  Widget _buildLocationCard() {
    return GestureDetector(
      onTap: _openMapPicker,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFF4facfe).withOpacity(0.2), width: 1.5),
          boxShadow: [BoxShadow(color: const Color(0xFF4facfe).withOpacity(0.05), blurRadius: 15)],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0xFF4facfe).withOpacity(0.1), shape: BoxShape.circle),
              child: const Icon(Icons.location_on_rounded, color: Color(0xFF4facfe), size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Selected Location', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(0xFF1A1A2E))),
                  const SizedBox(height: 4),
                  Text(_selectedAddress, 
                    style: TextStyle(color: Colors.grey[600], fontSize: 13, height: 1.4),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _buildImageGrid() {
    return SizedBox(
      height: 100,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          GestureDetector(
            onTap: _pickImage,
            child: Container(
              width: 100,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey[300]!, width: 1, style: BorderStyle.solid),
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add_a_photo_rounded, color: Color(0xFF1A1A2E), size: 28),
                  SizedBox(height: 4),
                  Text('Add Photo', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
          ..._selectedFiles.map((f) => Container(
            width: 100,
            margin: const EdgeInsets.only(left: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              image: DecorationImage(image: FileImage(f), fit: BoxFit.cover),
            ),
          )),
        ],
      ),
    );
  }
}
