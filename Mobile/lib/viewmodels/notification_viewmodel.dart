import 'package:flutter/material.dart';
import 'package:issop_mobile/core/services/network_service.dart';
import 'package:intl/intl.dart';

class NotificationViewModel extends ChangeNotifier {
  final NetworkService _network;
  NotificationViewModel(this._network);

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
