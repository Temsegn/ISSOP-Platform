import 'package:dio/dio.dart';
import 'package:issop_mobile/config/api_config.dart';
import 'package:issop_mobile/core/services/storage_service.dart';

class NetworkService {
  final Dio dio;
  final StorageService _storageService;

  NetworkService(this._storageService) : dio = Dio(BaseOptions(baseUrl: APIConstants.baseUrl)) {
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storageService.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));
  }
}
