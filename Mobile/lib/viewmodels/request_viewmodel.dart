import 'dart:io';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/core/services/request_service.dart';
import 'package:geolocator/geolocator.dart';

class RequestViewModel extends ChangeNotifier {
  final RequestService _requestService;

  RequestViewModel(this._requestService);

  List<RequestModel> _requests = [];
  List<RequestModel> get requests => _requests;

  bool _loading = false;
  bool get loading => _loading;

  Position? _currentPosition;
  Position? get currentPosition => _currentPosition;

  Future<void> fetchMyRequests() async {
    _loading = true;
    notifyListeners();
    try {
      _requests = await _requestService.getMyRequests();
      _loading = false;
      notifyListeners();
    } catch (e) {
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
      return null; // Null means success
    } catch (e) {
      _loading = false;
      notifyListeners();
      if (e is DioException) {
        if (e.response != null && e.response?.data is Map) {
           final Map data = e.response?.data;
           String errorMsg = data['message'] ?? 'Server Error: ${e.response?.statusCode}';
           if (data.containsKey('errors') && data['errors'] is List) {
             final List errors = data['errors'];
             if (errors.isNotEmpty) {
                final firstError = errors.first;
                errorMsg = '${firstError['field']}: ${firstError['message']}';
             }
           }
           return errorMsg;
        }
        return e.message ?? 'Network error';
      }
      return e.toString();
    }
  }
}
