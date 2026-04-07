import 'package:flutter/material.dart';
import 'package:issop_mobile/core/models/user_model.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/core/services/admin_service.dart';

class AdminViewModel extends ChangeNotifier {
  final AdminService _adminService;

  AdminViewModel(this._adminService);

  List<UserModel> _users = [];
  List<UserModel> get users => _users;

  List<RequestModel> _requests = [];
  List<RequestModel> get requests => _requests;

  List<UserModel> _agents = [];
  List<UserModel> get agents => _agents;

  List<UserModel> getAgentsSortedByProximity(double lat, double lng) {
    List<UserModel> sorted = List.from(_agents.where((u) => u.latitude != null && u.longitude != null));
    sorted.sort((a, b) {
      double distA = (a.latitude! - lat) * (a.latitude! - lat) + (a.longitude! - lng) * (a.longitude! - lng);
      double distB = (b.latitude! - lat) * (b.latitude! - lat) + (b.longitude! - lng) * (b.longitude! - lng);
      return distA.compareTo(distB);
    });
    return sorted;
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
