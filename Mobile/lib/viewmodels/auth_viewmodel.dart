import 'package:flutter/material.dart';
import 'package:issop_mobile/core/models/user_model.dart';
import 'package:issop_mobile/core/services/auth_service.dart';
import 'package:issop_mobile/core/services/storage_service.dart';

class AuthViewModel extends ChangeNotifier {
  final AuthService _authService;
  final StorageService _storageService;

  AuthViewModel(this._authService, this._storageService);

  UserModel? _user;
  UserModel? get user => _user;

  bool _loading = false;
  bool get loading => _loading;

  Future<bool> login(String email, String password) async {
    _loading = true;
    notifyListeners();
    try {
      final res = await _authService.login(email, password);
      _user = res['user'];
      await _storageService.saveToken(res['token']);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password, {String? phone}) async {
    _loading = true;
    notifyListeners();
    try {
      final res = await _authService.register(name, email, password, phone: phone);
      _user = res['user'];
      await _storageService.saveToken(res['token']);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  void logout() {
    _user = null;
    _storageService.clear();
    notifyListeners();
  }
}
