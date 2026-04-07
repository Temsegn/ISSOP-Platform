import 'package:dio/dio.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:issop_mobile/config/api_config.dart';
import 'package:issop_mobile/core/services/storage_service.dart';
import 'package:issop_mobile/core/utils/ui_utils.dart';

class NetworkService {
  final Dio dio;
  final StorageService _storageService;

  NetworkService(this._storageService) : dio = Dio(BaseOptions(
    baseUrl: APIConstants.baseUrl,
    connectTimeout: const Duration(seconds: 45),
    receiveTimeout: const Duration(seconds: 45),
  )) {
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storageService.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (e, handler) async {
        // Log errors globally for debugging
        print('NETWORK_ERROR: [${e.response?.statusCode}] ${e.message}');
        
        // Auto-handle 401 if needed, but usually ViewModel handles it
        return handler.next(e);
      },
    ));
  }

  Future<bool> hasConnection() async {
    final List<ConnectivityResult> results = await Connectivity().checkConnectivity();
    return !results.contains(ConnectivityResult.none);
  }
}

