import 'package:flutter/material.dart';

class ISSOPAlert {
  static void showError(BuildContext context, String title, String message) {
    showDialog(
      context: context,
      builder: (context) => _ErrorDialog(title: title, message: message),
    );
  }

  static void showSuccess(BuildContext context, String title, String message) {
    // Similar implementation for success
  }
}

class _ErrorDialog extends StatelessWidget {
  final String title;
  final String message;

  const _ErrorDialog({required this.title, required this.message});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A2E), // Obsidian
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: Colors.redAccent.withOpacity(0.3), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.redAccent.withOpacity(0.1),
              blurRadius: 40,
              spreadRadius: 5,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.redAccent.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.error_outline_rounded,
                color: Colors.redAccent,
                size: 48,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title.toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white.withOpacity(0.7),
                fontSize: 14,
                fontWeight: FontWeight.w500,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent.withOpacity(0.1),
                foregroundColor: Colors.redAccent,
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Colors.redAccent, width: 1),
                ),
                elevation: 0,
              ),
              child: const Text(
                'ACKNOWLEDGE',
                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 2),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ErrorMapper {
  static String map(dynamic error) {
    final str = error.toString().toLowerCase();
    
    if (str.contains('connection refused') || str.contains('network_unreachable')) {
      return 'SERVER IS CURRENTLY UNREACHABLE. PLEASE CHECK YOUR DATA OR WI-FI CONNECTION.';
    }
    if (str.contains('401') || str.contains('invalid email or password')) {
      return 'AUTHENTICATION FAILED. THE EMAIL OR PASSWORD YOU ENTERED IS INCORRECT.';
    }
    if (str.contains('403')) {
      return 'ACCESS DENIED. YOUR ACCOUNT MAY BE INACTIVE OR YOU LACK SUFFICIENT PERMISSIONS.';
    }
    if (str.contains('timeout')) {
      return 'CONNECTION TIMED OUT. THE SERVER IS TAKING TOO LONG TO RESPOND.';
    }
    if (str.contains('404')) {
      return 'ENDPOINT NOT FOUND. PLEASE ENSURE YOUR APP IS UP TO DATE.';
    }
    
    return error.toString().replaceFirst('Exception: ', '').toUpperCase();
  }
}
