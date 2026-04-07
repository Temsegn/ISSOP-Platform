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
    if (vm.currentPosition != null && mounted) {
      setState(() {
        _selectedLocation = LatLng(
            vm.currentPosition!.latitude, vm.currentPosition!.longitude);
      });
    }
  }

  void _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.camera, imageQuality: 80);
    if (pickedFile != null && mounted) {
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
    if (result != null && result is Map<String, dynamic> && mounted) {
      setState(() {
        _selectedLocation = result['location'];
        _selectedAddress = result['address'];
      });
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: Colors.redAccent,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ));
    }
  }

  void _onSubmit() async {
    if (_titleController.text.trim().isEmpty) {
      _showError('Please provide a brief title for your request.');
      return;
    }
    if (_selectedLocation.latitude == 0 && _selectedLocation.longitude == 0) {
      _showError('Please select the location of the issue.');
      return;
    }

    final vm = context.read<RequestViewModel>();
    final errorStr = await vm.createRequest(
      title: _titleController.text.trim(),
      description: _descController.text.trim(),
      category: _selectedCategory,
      lat: _selectedLocation.latitude,
      lng: _selectedLocation.longitude,
      address: _selectedAddress,
      files: _selectedFiles,
    );
    
    if (mounted) {
      if (errorStr == null || errorStr.startsWith('DRAFT:')) {
        final isDraft = errorStr?.startsWith('DRAFT:') ?? false;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Row(
            children: [
              Icon(isDraft ? Icons.cloud_queue_rounded : Icons.check_circle, color: Colors.white),
              const SizedBox(width: 8),
              Expanded(child: Text(isDraft ? errorStr! : 'Request submitted successfully!')),
            ],
          ),
          backgroundColor: isDraft ? Colors.orangeAccent : Colors.green,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ));
        Navigator.pop(context);
      } else {
        _showError('Failed: $errorStr');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<RequestViewModel>().loading;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FC), // Soft, premium background
      appBar: AppBar(
        title: const Text('New Request', style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF1A1A2E), letterSpacing: 0.5)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Color(0xFF1A1A2E)),
      ),
      extendBodyBehindAppBar: true,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Report an Issue', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF1A1A2E))),
              const SizedBox(height: 6),
              Text('Help us improve the city by reporting public issues.', style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
              const SizedBox(height: 32),
              
              _buildSectionTitle('Issue Details'),
              const SizedBox(height: 12),
              _buildTextField(_titleController, 'Brief Title (e.g. Broken Streetlight)', Icons.title_rounded),
              const SizedBox(height: 16),
              _buildDropdown(),
              const SizedBox(height: 16),
              _buildTextField(_descController, 'Provide detailed information...', Icons.notes_rounded, maxLines: 4),
              
              const SizedBox(height: 32),
              _buildSectionTitle('Location'),
              const SizedBox(height: 12),
              _buildLocationCard(),
              
              const SizedBox(height: 32),
              _buildSectionTitle('Media Evidence'),
              const SizedBox(height: 12),
              _buildImageGrid(),
              
              const SizedBox(height: 48),
              loading 
                ? const Center(child: CircularProgressIndicator(color: Colors.blueAccent))
                : ElevatedButton(
                    onPressed: _onSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blueAccent,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      elevation: 8,
                      shadowColor: Colors.blueAccent.withOpacity(0.5),
                    ),
                    child: const Center(
                      child: Text('SUBMIT REPORT', 
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                    ),
                  ),
              const SizedBox(height: 40),
            ],
          ),
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
        boxShadow: [BoxShadow(color: Colors.blueAccent.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 5))],
        border: Border.all(color: Colors.grey.shade200, width: 1.5),
      ),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF1A1A2E)),
        decoration: InputDecoration(
          hintText: label,
          hintStyle: TextStyle(color: Colors.grey.shade400, fontWeight: FontWeight.w500),
          prefixIcon: Padding(
            padding: EdgeInsets.only(bottom: maxLines > 1 ? (maxLines * 16.0 - 16) : 0),
            child: Icon(icon, color: Colors.blueAccent, size: 22),
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.all(20),
        ),
      ),
    );
  }

  Widget _buildDropdown() {
    return Container(
      padding: const EdgeInsets.only(left: 20, right: 16, top: 4, bottom: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.blueAccent.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 5))],
        border: Border.all(color: Colors.grey.shade200, width: 1.5),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedCategory,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.blueAccent),
          items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF1A1A2E))))).toList(),
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
          color: Colors.blueAccent.withOpacity(0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.blueAccent.withOpacity(0.3), width: 1.5),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(color: Colors.blueAccent, shape: BoxShape.circle),
              child: const Icon(Icons.location_on_rounded, color: Colors.white, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Selected Location', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1A1A2E))),
                  const SizedBox(height: 4),
                  Text(_selectedAddress, 
                    style: TextStyle(color: Colors.grey.shade700, fontSize: 13, height: 1.4, fontWeight: FontWeight.w500),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const Icon(Icons.edit_location_alt_rounded, color: Colors.blueAccent),
          ],
        ),
      ),
    );
  }

  Widget _buildImageGrid() {
    return SizedBox(
      height: 110,
      child: ListView(
        scrollDirection: Axis.horizontal,
        clipBehavior: Clip.none,
        children: [
          GestureDetector(
            onTap: _pickImage,
            child: Container(
              width: 110,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.blueAccent.withOpacity(0.3), width: 2, style: BorderStyle.solid),
                boxShadow: [BoxShadow(color: Colors.blueAccent.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add_a_photo_rounded, color: Colors.blueAccent, size: 32),
                  SizedBox(height: 8),
                  Text('Add Photo', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.blueAccent)),
                ],
              ),
            ),
          ),
          ..._selectedFiles.map((f) => Container(
            width: 110,
            margin: const EdgeInsets.only(left: 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              image: DecorationImage(image: FileImage(f), fit: BoxFit.cover),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4))],
            ),
            child: Align(
              alignment: Alignment.topRight,
              child: GestureDetector(
                onTap: () => setState(() => _selectedFiles.remove(f)),
                child: Container(
                  margin: const EdgeInsets.all(6),
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                  child: const Icon(Icons.close, size: 16, color: Colors.redAccent),
                ),
              ),
            ),
          )),
        ],
      ),
    );
  }
}
