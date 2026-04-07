import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:issop_mobile/viewmodels/request_viewmodel.dart';

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

  void _onSubmit() async {
    final vm = context.read<RequestViewModel>();
    final success = await vm.createRequest(
      title: _titleController.text,
      description: _descController.text,
      category: _selectedCategory,
      lat: _selectedLocation.latitude,
      lng: _selectedLocation.longitude,
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
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Create New Request',
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle('Issue Details'),
            const SizedBox(height: 16),
            _buildTextField(_titleController, 'Title', Icons.title_rounded),
            const SizedBox(height: 16),
            _buildTextField(_descController, 'Description', Icons.description_rounded, maxLines: 3),
            const SizedBox(height: 16),
            _buildDropdown(),
            
            const SizedBox(height: 32),
            _buildSectionTitle('Media Attachments'),
            const SizedBox(height: 16),
            _buildImageGrid(),
            
            const SizedBox(height: 32),
            _buildSectionTitle('Location'),
            const SizedBox(height: 16),
            _buildMapContainer(),
            
            const SizedBox(height: 40),
            loading 
              ? const Center(child: CircularProgressIndicator(color: Colors.black))
              : ElevatedButton(
                  onPressed: _onSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Center(
                    child: Text('Submit Report', 
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black));
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon, {int maxLines = 1}) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: Colors.blueAccent),
        filled: true,
        fillColor: Colors.grey[50],
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
      ),
    );
  }

  Widget _buildDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(16),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedCategory,
          isExpanded: true,
          items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
          onChanged: (val) => setState(() => _selectedCategory = val!),
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
                color: Colors.blueAccent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.blueAccent, width: 1),
              ),
              child: const Icon(Icons.add_a_photo_rounded, color: Colors.blueAccent),
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

  Widget _buildMapContainer() {
    return Container(
      height: 250,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          FlutterMap(
            options: MapOptions(
              initialCenter: _selectedLocation,
              initialZoom: 15,
              onTap: (tapPosition, latlng) => setState(() => _selectedLocation = latlng),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.issop.issop_mobile',
              ),
              MarkerLayer(
                markers: [
                  Marker(
                    point: _selectedLocation,
                    width: 80,
                    height: 80,
                    child: const Icon(Icons.location_on_rounded, color: Colors.red, size: 40),
                  ),
                ],
              ),
            ],
          ),
          Positioned(
            bottom: 16,
            right: 16,
            child: FloatingActionButton.small(
              heroTag: 'gps',
              onPressed: _initLocation,
              backgroundColor: Colors.white,
              child: const Icon(Icons.my_location_rounded, color: Colors.blueAccent),
            ),
          ),
        ],
      ),
    );
  }
}
