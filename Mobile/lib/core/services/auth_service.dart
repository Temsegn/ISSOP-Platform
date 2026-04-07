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
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? 'Login failed. Please check your credentials.';
      throw Exception(message);
    } catch (e) {
      throw Exception('An unexpected error occurred during login');
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
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? 'Registration failed. Check your details.';
      throw Exception(message);
    } catch (e) {
      throw Exception('An unexpected error occurred during registration');
    }
  }

  Future<UserModel> getProfile() async {
    try {
      final response = await _network.dio.get('/auth/me');
      if (response.statusCode == 200) {
        return UserModel.fromJson(response.data['data']['user']);
      }
      throw Exception('Failed to fetch profile');
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? 'Session expired. Please log in again.';
      throw Exception(message);
    } catch (e) {
      throw Exception('Could not connect to server. Check your internet.');
    }
  }
}
