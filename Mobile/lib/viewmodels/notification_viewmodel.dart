import 'package:flutter/material.dart';
import 'package:issop_mobile/core/services/network_service.dart';
import 'package:issop_mobile/core/services/socket_service.dart';
import 'package:intl/intl.dart';

class NotificationViewModel extends ChangeNotifier {
  final NetworkService _network;
  final SocketService _socketService;

  NotificationViewModel(this._network, this._socketService) {
    _initSocket();
  }

  void _initSocket() {
    _socketService.events.listen((event) {
      if (event.name == 'notification_received') {
        final newNotif = event.data;
        if (!_notifications.any((n) => n['id'] == newNotif['id'])) {
          _notifications.insert(0, newNotif);
          notifyListeners();
        }
      }
    });
  }

  List<dynamic> _notifications = [];
  List<dynamic> get notifications => _notifications;
  
  int get unreadCount => _notifications.where((n) => n['isRead'] == false).length;

  Future<void> fetchNotifications() async {
    try {
      final response = await _network.dio.get('/notifications');
      _notifications = response.data['data']['notifications'];
      notifyListeners();
    } catch (e) {
      // ignore
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await _network.dio.patch('/notifications/$id/read');
      final idx = _notifications.indexWhere((n) => n['id'] == id);
      if (idx != -1) {
        _notifications[idx]['isRead'] = true;
        notifyListeners();
      }
    } catch (e) {
      // ignore
    }
  }
}

class NotificationSheet extends StatefulWidget {
  const NotificationSheet({super.key});
  @override
  State<NotificationSheet> createState() => _NotificationSheetState();
}

class _NotificationSheetState extends State<NotificationSheet> {
  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
