import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/core/services/request_service.dart';
import 'package:issop_mobile/core/services/socket_service.dart';
import 'package:geolocator/geolocator.dart';

class RequestViewModel extends ChangeNotifier {
  final RequestService _requestService;
  final SocketService _socketService;
  late SharedPreferences _prefs;
  bool _initialized = false;

  RequestViewModel(this._requestService, this._socketService) {
    _initSocket();
    _initPrefs();
  }

  Future<void> _initPrefs() async {
    _prefs = await SharedPreferences.getInstance();
    _initialized = true;
    syncPendingRequests();
  }

  void _initSocket() {

    _socketService.events.listen((event) {
      if (event.name == 'status_updated' || event.name == 'reconnected') {
        fetchMyRequests();
      }
    });
  }

  List<RequestModel> _requests = [];
  List<RequestModel> get requests => _requests;

  bool _loading = false;
  bool get loading => _loading;

  Position? _currentPosition;
  Position? get currentPosition => _currentPosition;

  Future<void> syncPendingRequests() async {
    if (!_initialized) return;
    final json = _prefs.getString('pending_requests');
    if (json == null) return;

    try {
      final List pending = jsonDecode(json);
      final List remaining = [];
      
      for (var data in pending) {
        try {
          // Robust type conversion for coordinates
          final double lat = (data['lat'] as num).toDouble();
          final double lng = (data['lng'] as num).toDouble();
          
          await _requestService.createRequest(
            title: data['title'],
            description: data['description'] ?? '',
            category: data['category'],
            latitude: lat,
            longitude: lng,
            address: data['address'],
          );
        } catch (e) {
          remaining.add(data); // Keep failing ones for later
        }
      }
      
      if (remaining.isEmpty) {
        await _prefs.remove('pending_requests');
      } else {
        await _prefs.setString('pending_requests', jsonEncode(remaining));
      }
      notifyListeners();
    } catch (e) {
      // ignore JSON parse errors
    }
  }

  Future<void> fetchMyRequests() async {
    _loading = true;
    notifyListeners();
    try {
      await syncPendingRequests();
      _requests = await _requestService.getMyRequests();
    } catch (e) {
      // Offline, keep existing _requests
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    _currentPosition = await Geolocator.getCurrentPosition();
    notifyListeners();
  }

  Future<String?> createRequest({
    required String title,
    required String description,
    required String category,
    required double lat,
    required double lng,
    String? address,
    List<File>? files,
  }) async {
    _loading = true;
    notifyListeners();
    try {
      await _requestService.createRequest(
        title: title,
        description: description,
        category: category,
        latitude: lat,
        longitude: lng,
        address: address,
        files: files,
      );
      await fetchMyRequests();
      _loading = false;
      notifyListeners();
      return null;
    } catch (e) {
      _loading = false;
      notifyListeners();
      // Detect offline or network-related failures
      bool isNetworkError = e is DioException && 
          (e.type == DioExceptionType.connectionTimeout || 
           e.type == DioExceptionType.sendTimeout || 
           e.type == DioExceptionType.receiveTimeout ||
           e.type == DioExceptionType.connectionError ||
           e.type == DioExceptionType.unknown);
           
      if (isNetworkError || (e is DioException && e.response == null)) {
         _queueRequest(title, description, category, lat, lng, address);
         return 'DRAFT: Report saved locally! It will sync automatically when you are back online.';
      }
      return e.toString();
    }
  }

  void _queueRequest(String t, String d, String c, double lat, double lng, String? a) {
    if (!_initialized) return;
    final json = _prefs.getString('pending_requests');
    final List list = json != null ? jsonDecode(json) : [];
    list.add({
      'title': t,
      'description': d,
      'category': c,
      'lat': lat,
      'lng': lng,
      'address': a,
      'createdAt': DateTime.now().toIso8601String(),
    });
    _prefs.setString('pending_requests', jsonEncode(list));
  }
}
