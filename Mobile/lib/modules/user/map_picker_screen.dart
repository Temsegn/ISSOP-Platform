import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geocoding/geocoding.dart';

class MapPickerScreen extends StatefulWidget {
  final LatLng initialLocation;
  const MapPickerScreen({super.key, required this.initialLocation});

  @override
  State<MapPickerScreen> createState() => _MapPickerScreenState();
}

class _MapPickerScreenState extends State<MapPickerScreen> {
  late LatLng _selectedLocation;
  String _currentAddress = 'Searching...';
  final MapController _mapController = MapController();
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _selectedLocation = widget.initialLocation.latitude == 0 && widget.initialLocation.longitude == 0 
        ? const LatLng(37.7749, -122.4194) // Default fallback if no location
        : widget.initialLocation;
    _getAddress(_selectedLocation);
  }

  Future<void> _getAddress(LatLng location) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(location.latitude, location.longitude);
      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        setState(() {
          _currentAddress = [p.street, p.subLocality, p.locality].where((e) => e != null && e.isNotEmpty).join(', ');
          if (_currentAddress.isEmpty) _currentAddress = 'Unknown Location';
        });
      } else {
        setState(() => _currentAddress = 'Unknown Location');
      }
    } catch (e) {
      setState(() => _currentAddress = 'Location details unavailable');
    }
  }

  Future<void> _onSearch() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    setState(() {
      _isSearching = true;
      _currentAddress = 'Finding location...';
    });

    FocusScope.of(context).unfocus();

    try {
      List<Location> locations = await locationFromAddress(query);
      if (locations.isNotEmpty) {
        final loc = locations.first;
        final target = LatLng(loc.latitude, loc.longitude);
        _mapController.move(target, 16);
        setState(() {
          _selectedLocation = target;
        });
        _getAddress(target);
      } else {
        throw Exception('Not found');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Address not found, please try a different search'),
            behavior: SnackBarBehavior.floating,
            backgroundColor: Colors.redAccent,
          )
        );
      }
      setState(() => _currentAddress = 'Search failed');
    } finally {
      if (mounted) {
        setState(() => _isSearching = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Container(
          margin: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white, 
            shape: BoxShape.circle,
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8)],
          ),
          child: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black, size: 18), 
            onPressed: () => Navigator.pop(context)
          ),
        ),
        title: Container(
          height: 50,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(25),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 15, offset: const Offset(0, 4))],
          ),
          child: TextField(
            controller: _searchController,
            textInputAction: TextInputAction.search,
            decoration: InputDecoration(
              hintText: 'Search for a place...',
              hintStyle: TextStyle(fontSize: 14, color: Colors.grey.shade500),
              border: InputBorder.none,
              prefixIcon: const Icon(Icons.search, size: 22, color: Colors.blueAccent),
              suffixIcon: _isSearching
                ? const Padding(
                    padding: EdgeInsets.all(14.0),
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : IconButton(
                    icon: const Icon(Icons.send_rounded, size: 20, color: Colors.blueAccent), 
                    onPressed: _onSearch
                  ),
              contentPadding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onSubmitted: (_) => _onSearch(),
          ),
        ),
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _selectedLocation,
              initialZoom: 16.0,
              onPositionChanged: (pos, hasGesture) {
                if (hasGesture && pos.center != null) {
                  setState(() => _selectedLocation = pos.center!);
                }
              },
              onPointerUp: (event, point) {
                 _getAddress(_selectedLocation);
              }
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.issop.app',
              ),
            ],
          ),
          // Precision Map Marker
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blueAccent,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: Colors.blueAccent.withOpacity(0.4), blurRadius: 12, spreadRadius: 4)
                    ]
                  ),
                  child: const Icon(Icons.location_on, size: 30, color: Colors.white),
                ),
                Container(
                  width: 4,
                  height: 4,
                  margin: const EdgeInsets.only(top: 2),
                  decoration: const BoxDecoration(color: Colors.black, shape: BoxShape.circle),
                ),
              ],
            ),
          ),
          // Interactive elements below Map
          Positioned(
            bottom: 30,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 25, offset: const Offset(0, 10))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.blueAccent.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.place, color: Colors.blueAccent, size: 24),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Selected Location', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF1A1A2E))),
                            const SizedBox(height: 4),
                            Text(
                              _currentAddress,
                              style: TextStyle(color: Colors.grey[600], fontSize: 14, height: 1.3),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context, {
                      'location': _selectedLocation,
                      'address': _currentAddress,
                    }),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1A1A2E),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 5,
                      shadowColor: const Color(0xFF1A1A2E).withOpacity(0.4),
                    ),
                    child: const Text('CONFIRM THIS PLACE', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, letterSpacing: 1.2)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
