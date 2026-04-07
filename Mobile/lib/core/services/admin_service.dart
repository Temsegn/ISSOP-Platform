import 'package:issop_mobile/core/models/user_model.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/core/services/network_service.dart';

class AdminService {
  final NetworkService _network;

  AdminService(this._network);

  Future<List<UserModel>> getUsers() async {
    final response = await _network.dio.get('/users');
    final List data = response.data['data']['users'];
    return data.map((json) => UserModel.fromJson(json)).toList();
  }

  Future<UserModel> updateUserRole(String userId, String role) async {
    final response = await _network.dio.patch('/users/$userId/role', data: {'role': role});
    return UserModel.fromJson(response.data['data']['user']);
  }

  Future<List<RequestModel>> getAllRequests({String? status, String? category}) async {
    final queryParameters = <String, dynamic>{};
    if (status != null) queryParameters['status'] = status;
    if (category != null) queryParameters['category'] = category;

    final response = await _network.dio.get('/requests', queryParameters: queryParameters);
    final List data = response.data['data']['requests'];
    return data.map((json) => RequestModel.fromJson(json)).toList();
  }

  Future<void> assignTask(String requestId, String agentId) async {
    await _network.dio.patch('/requests/$requestId/assign', data: {'agentId': agentId});
  }

  Future<List<UserModel>> getAgentsNearby(double lat, double lng, {double radius = 10}) async {
    final response = await _network.dio.get('/users/nearest-agents', queryParameters: {
      'lat': lat,
      'lon': lng,
      'radius': radius,
    });
    final List data = response.data['data']['agents'];
    return data.map((json) => UserModel.fromJson(json)).toList();
  }
}
