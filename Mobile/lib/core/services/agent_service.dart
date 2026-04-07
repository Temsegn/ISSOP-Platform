import 'dart:io';
import 'package:dio/dio.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/core/services/network_service.dart';

class AgentService {
  final NetworkService _network;

  AgentService(this._network);

  Future<List<RequestModel>> getMyTasks() async {
    // Fetch all requests, the backend should filter by agentId based on role
    // Or we just get /requests which returns assigned tasks for the authenticated agent
    final response = await _network.dio.get('/requests');
    final List data = response.data['data']['requests'];
    return data.map((json) => RequestModel.fromJson(json)).toList();
  }

  Future<RequestModel> updateTaskStatus(String requestId, String status, {File? proof}) async {
    final Map<String, dynamic> data = {'status': status};
    
    if (proof != null) {
      final formData = FormData.fromMap({
        'status': status,
        'proof': await MultipartFile.fromFile(proof.path),
      });
      final response = await _network.dio.patch('/requests/$requestId/status', data: formData);
      return RequestModel.fromJson(response.data['data']['request']);
    } else {
      final response = await _network.dio.patch('/requests/$requestId/status', data: data);
      return RequestModel.fromJson(response.data['data']['request']);
    }
  }

  Future<void> updateLocation(double lat, double lng) async {
    await _network.dio.patch('/users/location', data: {
      'latitude': lat,
      'longitude': lng,
    });
  }
}
