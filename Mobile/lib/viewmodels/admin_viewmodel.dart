import 'dart:math';
import 'package:flutter/material.dart';
import 'package:issop_mobile/core/models/user_model.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/core/services/admin_service.dart';
import 'package:issop_mobile/core/services/socket_service.dart';

class AdminViewModel extends ChangeNotifier {
  final AdminService _adminService;
  final SocketService _socketService;

  AdminViewModel(this._adminService, this._socketService) {
    _initSocket();
  }

  void _initSocket() {
    _socketService.events.listen((event) {
      if (event.name == 'request_created') {
        fetchRequests();
      } else if (event.name == 'agent_location_updated') {
        _handleLocationUpdate(event.data);
      }
    });
  }

  void _handleLocationUpdate(dynamic data) {
    try {
      final updatedUser = UserModel.fromJson(data);
      final index = _agents.indexWhere((a) => a.id == updatedUser.id);
      if (index != -1) {
        _agents[index] = updatedUser;
        notifyListeners();
      }
    } catch (_) {}
  }

  List<UserModel> _users = [];
  List<UserModel> get users => _users;

  List<RequestModel> _requests = [];
  List<RequestModel> get requests => _requests;

  List<UserModel> _agents = [];
  List<UserModel> get agents => _agents;

  List<UserModel> getAgentsSortedByProximity(double lat, double lng) {
    List<UserModel> hasLoc = [];
    List<UserModel> noLoc = [];
    
    for (var u in _agents) {
      if (u.latitude != null && u.longitude != null) {
        hasLoc.add(u);
      } else {
        noLoc.add(u);
      }
    }
    
    hasLoc.sort((a, b) {
      double distA = calculateDistance(lat, lng, a.latitude!, a.longitude!);
      double distB = calculateDistance(lat, lng, b.latitude!, b.longitude!);
      return distA.compareTo(distB);
    });
    
    return [...hasLoc, ...noLoc];
  }

  double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    var p = 0.017453292519943295;
    var a = 0.5 - cos((lat2 - lat1) * p) / 2 +
        cos(lat1 * p) * cos(lat2 * p) *
            (1 - cos((lon2 - lon1) * p)) / 2;
    return 12742 * asin(sqrt(a));
  }

  bool _loading = false;
  bool get loading => _loading;

  String? _error;
  String? get error => _error;

  Future<void> fetchUsers() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _users = await _adminService.getUsers();
      _agents = _users.where((u) => u.role == 'AGENT').toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> fetchRequests({String? status, String? category}) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _requests = await _adminService.getAllRequests(status: status, category: category);
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> upgradeUserToAgent(String userId) async {
    _loading = true;
    notifyListeners();
    try {
      await _adminService.updateUserRole(userId, 'AGENT');
      await fetchUsers();
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> assignTask(String requestId, String agentId) async {
    _loading = true;
    notifyListeners();
    try {
      await _adminService.assignTask(requestId, agentId);
      await fetchRequests();
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<List<UserModel>> getNearbyAgents(double lat, double lng) async {
    try {
      return await _adminService.getAgentsNearby(lat, lng);
    } catch (e) {
      _error = e.toString();
      return [];
    }
  }
}
