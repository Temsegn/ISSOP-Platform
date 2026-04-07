import 'package:flutter/material.dart';
import 'package:issop_mobile/core/models/user_model.dart';
import 'package:issop_mobile/core/services/auth_service.dart';
import 'package:issop_mobile/core/services/storage_service.dart';
import 'package:issop_mobile/core/services/socket_service.dart';

class AuthViewModel extends ChangeNotifier {
  final AuthService _authService;
  final StorageService _storageService;
  final SocketService _socketService;

  AuthViewModel(this._authService, this._storageService, this._socketService);

  UserModel? _user;
  UserModel? get user => _user;

  bool _loading = false;
  bool get loading => _loading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  bool _initialized = false;
  bool get initialized => _initialized;

  bool _onboardingCompleted = false;
  bool get onboardingCompleted => _onboardingCompleted;

  Future<void> checkAuth() async {
    _onboardingCompleted = await _storageService.isOnboardingCompleted();
    final token = await _storageService.getToken();
    
    if (token != null) {
      try {
        final response = await _authService.getProfile(); 
        _user = response;
        _socketService.connect();
      } catch (e) {
        await _storageService.clear();
      }
    }
    _initialized = true;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final res = await _authService.login(email, password);
      _user = res['user'];
      await _storageService.saveToken(res['token']);
      _socketService.connect();
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password, {String? phone}) async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final res = await _authService.register(name, email, password, phone: phone);
      _user = res['user'];
      await _storageService.saveToken(res['token']);
      _socketService.connect();
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  void logout() {
    _user = null;
    _storageService.clear();
    _socketService.disconnect();
    notifyListeners();
  }
}
