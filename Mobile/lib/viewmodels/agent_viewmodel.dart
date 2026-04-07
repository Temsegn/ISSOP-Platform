import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:geolocator/geolocator.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/core/services/agent_service.dart';
import 'package:dio/dio.dart';

class AgentViewModel extends ChangeNotifier {
  final AgentService _agentService;
  late SharedPreferences _prefs;
  bool _prefsInitialized = false;

  AgentViewModel(this._agentService) {
    _initPrefs();
  }

  Future<void> _initPrefs() async {
    _prefs = await SharedPreferences.getInstance();
    _prefsInitialized = true;
    _loadCachedTasks();
  }

  List<RequestModel> _tasks = [];
  List<RequestModel> get tasks => _tasks;

  bool _loading = false;
  bool get loading => _loading;

  Timer? _locationTimer;
  bool _isTrackingLocation = false;

  void _loadCachedTasks() {
    if (!_prefsInitialized) return;
    final cached = _prefs.getString('cached_agent_tasks');
    if (cached != null) {
      try {
        final List data = jsonDecode(cached);
        _tasks = data.map((e) => RequestModel.fromJson(e)).toList();
        notifyListeners();
      } catch (e) {
        // ignore
      }
    }
  }

  Future<void> _saveCachedTasks() async {
    final List<Map<String, dynamic>> jsonList = _tasks.map((e) => e.toJson()).toList();
    await _prefs.setString('cached_agent_tasks', jsonEncode(jsonList));
  }

  Future<void> fetchTasks() async {
    _loading = true;
    notifyListeners();
    try {
      final freshTasks = await _agentService.getMyTasks();
      _tasks = freshTasks;
      await _saveCachedTasks();
      await _syncOfflineUpdates();
    } catch (e) {
      // offline, keep existing cache
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
  
  // Offline Sync Management
  Future<void> _syncOfflineUpdates() async {
    final offlineUpdatesJson = _prefs.getString('offline_task_updates');
    if (offlineUpdatesJson != null) {
      final List updates = jsonDecode(offlineUpdatesJson);
      List remainingUpdates = [];
      for (var update in updates) {
         try {
            await _agentService.updateTaskStatus(
              update['requestId'], 
              update['status']
            );
         } catch (e) {
            remainingUpdates.add(update); // keep failed ones
         }
      }
      if (remainingUpdates.isEmpty) {
         await _prefs.remove('offline_task_updates');
      } else {
         await _prefs.setString('offline_task_updates', jsonEncode(remainingUpdates));
      }
      await fetchTasks(); // refresh again
    }
  }

  Future<void> updateTaskStatus(String requestId, String status, {File? proof}) async {
    _loading = true;
    notifyListeners();
    try {
      await _agentService.updateTaskStatus(requestId, status, proof: proof);
      await fetchTasks();
    } catch (e) {
       // if it's a network error and we are not uploading a file (proof doesn't cache easily)
       if (e is DioException && proof == null) {
          _queueOfflineUpdate(requestId, status);
          // Optimitically update locally
          final idx = _tasks.indexWhere((t) => t.id == requestId);
          if (idx != -1) {
            final RequestModel old = _tasks[idx];
            _tasks[idx] = RequestModel.fromJson({...old.toJson(), 'status': status});
            await _saveCachedTasks();
          }
       } else {
         rethrow;
       }
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void _queueOfflineUpdate(String requestId, String status) {
    final cached = _prefs.getString('offline_task_updates');
    List updates = cached != null ? jsonDecode(cached) : [];
    updates.add({'requestId': requestId, 'status': status});
    _prefs.setString('offline_task_updates', jsonEncode(updates));
  }

  // Location Tracking
  void startLocationTracking() async {
    if (_isTrackingLocation) return;
    
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    _isTrackingLocation = true;
    _sendLocationUpdate();
    _locationTimer = Timer.periodic(const Duration(minutes: 5), (_) => _sendLocationUpdate());
  }

  void stopLocationTracking() {
    _locationTimer?.cancel();
    _isTrackingLocation = false;
  }

  Future<void> _sendLocationUpdate() async {
    try {
      final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      await _agentService.updateLocation(pos.latitude, pos.longitude);
    } catch (e) {
      // ignore silently if fails in background
    }
  }

  @override
  void dispose() {
    stopLocationTracking();
    super.dispose();
  }
}
