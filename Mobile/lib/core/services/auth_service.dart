import 'package:dio/dio.dart';
import 'package:issop_mobile/core/models/user_model.dart';
import 'package:issop_mobile/core/services/network_service.dart';

class AuthService {
  final NetworkService _network;

  AuthService(this._network);

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _network.dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = response.data['data'];
        return {
          'user': UserModel.fromJson(data['user']),
          'token': data['token'],
        };
      }
      throw Exception('Login failed');
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> register(String name, String email, String password, {String? phone}) async {
    try {
      final response = await _network.dio.post('/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
      });

      if (response.statusCode == 201) {
        final data = response.data['data'];
        return {
          'user': UserModel.fromJson(data['user']),
          'token': data['token'],
        };
      }
      throw Exception('Registration failed');
    } catch (e) {
      rethrow;
    }
  }
}
