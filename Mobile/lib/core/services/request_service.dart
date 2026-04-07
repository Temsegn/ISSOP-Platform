import 'dart:io';
import 'package:dio/dio.dart';
import 'package:issop_mobile/core/models/request_model.dart';
import 'package:issop_mobile/core/services/network_service.dart';

class RequestService {
  final NetworkService _network;

  RequestService(this._network);

  Future<List<RequestModel>> getMyRequests() async {
    final response = await _network.dio.get('/requests');
    final List data = response.data['data']['requests'];
    return data.map((json) => RequestModel.fromJson(json)).toList();
  }

  Future<RequestModel> createRequest({
    required String title,
    required String description,
    required String category,
    required double latitude,
    required double longitude,
    String? address,
    List<File>? files,
  }) async {
    // Multi-part form-data for Cloudinary backend integration
    final formData = FormData.fromMap({
      'title': title,
      'description': description,
      'category': category,
      'latitude': latitude,
      'longitude': longitude,
      if (address != null) 'address': address,
    });

    if (files != null) {
      for (var file in files) {
        formData.files.add(MapEntry(
          'media', // Key must match the 'multer' upload.array('media')
          await MultipartFile.fromFile(file.path),
        ));
      }
    }

    final response = await _network.dio.post('/requests', data: formData);
    return RequestModel.fromJson(response.data['data']['request']);
  }
}
