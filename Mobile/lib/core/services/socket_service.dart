import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:issop_mobile/core/services/storage_service.dart';

class SocketService {
  final StorageService _storage;
  io.Socket? _socket;
  final _rootUrl = 'http://10.0.2.2:3000'; // Standard Android Emulator Localhost

  final _eventController = StreamController<SocketEvent>.broadcast();
  Stream<SocketEvent> get events => _eventController.stream;

  SocketService(this._storage);

  Future<void> connect() async {
    final token = await _storage.getToken();
    if (token == null) return;

    _socket = io.io(_rootUrl, io.OptionBuilder()
      .setTransports(['websocket'])
      .setAuth({'token': token})
      .enableAutoConnect()
      .build());

    _socket!.onConnect((_) {
      print('Socket Connected to Backend');
      _eventController.add(SocketEvent('reconnected', null));
    });

    _socket!.on('request_created', (data) => _eventController.add(SocketEvent('request_created', data)));
    _socket!.on('task_assigned', (data) => _eventController.add(SocketEvent('task_assigned', data)));
    _socket!.on('status_updated', (data) => _eventController.add(SocketEvent('status_updated', data)));
    _socket!.on('agent_location_updated', (data) => _eventController.add(SocketEvent('agent_location_updated', data)));
    _socket!.on('notification_received', (data) => _eventController.add(SocketEvent('notification_received', data)));

    _socket!.onDisconnect((_) => print('Socket Disconnected'));
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }

  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }
}

class SocketEvent {
  final String name;
  final dynamic data;
  SocketEvent(this.name, this.data);
}
