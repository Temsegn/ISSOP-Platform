class RequestModel {
  final String id;
  final String title;
  final String description;
  final String category;
  final String status;
  final List<String> mediaUrls;
  final double latitude;
  final double longitude;
  final String? address;
  final String citizenId;
  final String? agentId;
  final DateTime createdAt;

  RequestModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.status,
    required this.mediaUrls,
    required this.latitude,
    required this.longitude,
    this.address,
    required this.citizenId,
    this.agentId,
    required this.createdAt,
  });

  factory RequestModel.fromJson(Map<String, dynamic> json) {
    return RequestModel(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      category: json['category'],
      status: json['status'],
      mediaUrls: List<String>.from(json['mediaUrls'] ?? []),
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'],
      citizenId: json['citizenId'],
      agentId: json['agentId'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'status': status,
      'mediaUrls': mediaUrls,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'citizenId': citizenId,
      'agentId': agentId,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
