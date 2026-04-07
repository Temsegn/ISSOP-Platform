import 'dart:async';
import 'package:dio/dio.dart';
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

  Timer? _debounce;
  List<Map<String, dynamic>> _searchResults = [];
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _selectedLocation = widget.initialLocation.latitude == 0 && widget.initialLocation.longitude == 0 
        ? const LatLng(37.7749, -122.4194) // Default fallback if no location
        : widget.initialLocation;
    _getAddress(_selectedLocation);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  bool _isOffline = false;

  Future<void> _getAddress(LatLng location) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(location.latitude, location.longitude);
      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        if (mounted) {
          setState(() {
            _isOffline = false;
            _currentAddress = [p.name, p.street, p.subLocality, p.locality].where((e) => e != null && e.isNotEmpty).join(', ');
            if (_currentAddress.isEmpty) _currentAddress = 'Lat: ${location.latitude.toStringAsFixed(4)}, Lng: ${location.longitude.toStringAsFixed(4)}';
          });
        }
      } else {
        if (mounted) setState(() => _currentAddress = 'Unknown Location');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isOffline = true;
          _currentAddress = 'Lat: ${location.latitude.toStringAsFixed(5)}, Lng: ${location.longitude.toStringAsFixed(5)}';
        });
      }
    }
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _isTyping = false;
      });
      return;
    }
    
    setState(() => _isTyping = true);
    _debounce = Timer(const Duration(milliseconds: 600), () {
      _fetchAutocomplete(query);
    });
  }

  Future<void> _fetchAutocomplete(String query) async {
    try {
      final dio = Dio();
      final response = await dio.get(
        'https://nominatim.openstreetmap.org/search',
        queryParameters: {
          'q': query,
          'format': 'jsonv2',
          'addressdetails': 1,
          'limit': 6,
        },
        options: Options(headers: {'User-Agent': 'issop_mobile'})
      );
      if (response.statusCode == 200 && mounted) {
        final List data = response.data;
        setState(() {
          _searchResults = data.cast<Map<String, dynamic>>();
          _isTyping = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isTyping = false);
    }
  }

  Future<void> _onSearch() async {
    if (_isOffline) {
       ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Search is unavailable in offline mode.'),
            behavior: SnackBarBehavior.floating,
          )
       );
       return;
    }
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    FocusScope.of(context).unfocus();
    setState(() {
      _isSearching = true;
      _searchResults = [];
      _currentAddress = 'Finding location...';
    });

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
          const SnackBar(
            content: Text('Address not found, please try a different search'),
            behavior: SnackBarBehavior.floating,
            backgroundColor: Colors.redAccent,
          )
        );
      }
      if (mounted) setState(() => _currentAddress = 'Search failed');
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
            onChanged: _onSearchChanged,
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
              maxZoom: 18.0,
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
                maxZoom: 19,
                errorTileCallback: (tile, error, stackTrace) {
                  if (mounted && !_isOffline) {
                    setState(() => _isOffline = true);
                  }
                },
              ),
            ],
          ),
          if (_isOffline)
            Positioned(
              top: 110,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.orangeAccent.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10)],
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.wifi_off_rounded, color: Colors.white, size: 16),
                      SizedBox(width: 8),
                      Text('OFFLINE GPS MODE ACTIVE', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
                    ],
                  ),
                ),
              ),
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
          if (_searchResults.isNotEmpty || _isTyping)
            Positioned(
              top: 110,
              left: 20,
              right: 20,
              child: Container(
                constraints: const BoxConstraints(maxHeight: 300),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 15, offset: const Offset(0, 5))],
                ),
                child: _isTyping && _searchResults.isEmpty
                  ? const Padding(
                      padding: EdgeInsets.all(20),
                      child: Center(child: CircularProgressIndicator()),
                    )
                  : ListView.separated(
                      padding: EdgeInsets.zero,
                      shrinkWrap: true,
                      itemCount: _searchResults.length,
                      separatorBuilder: (_, __) => Divider(height: 1, color: Colors.grey.shade100),
                      itemBuilder: (context, index) {
                        final place = _searchResults[index];
                        final name = place['display_name'] ?? 'Unknown Place';
                        return ListTile(
                          leading: const Icon(Icons.location_city, color: Colors.blueAccent, size: 24),
                          title: Text(name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500), maxLines: 2, overflow: TextOverflow.ellipsis),
                          onTap: () {
                            FocusScope.of(context).unfocus();
                            setState(() {
                              _searchResults = [];
                              _isTyping = false;
                              _searchController.text = name.split(',').first;
                              _selectedLocation = LatLng(
                                double.parse(place['lat'].toString()),
                                double.parse(place['lon'].toString())
                              );
                            });
                            _mapController.move(_selectedLocation, 17);
                            _getAddress(_selectedLocation);
                          },
                        );
                      },
                    ),
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
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 14, height: 1.3),
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

