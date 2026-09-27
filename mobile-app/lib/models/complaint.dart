class Complaint {
  final String id;
  final String tenantId;
  final String propertyId;
  final String unit;
  final String categoryId;
  final String description;
  final String status; // Submitted | Assigned | In Progress | Completed | Closed
  final String? vendorId;
  final String createdAt;
  final String? assignedAt;
  final String? startedAt;
  final String? completedAt;
  final String? verifiedAt;
  final String? closedAt;
  final List<String> beforePhotos;
  final List<String> afterPhotos;
  final String? materialsUsed;
  final String? completionNotes;
  final int? rating;
  final String? feedback;

  // Joined
  final String? tenantName;
  final String? tenantPhone;
  final String? propertyName;
  final String? propertyAddress;
  final String? vendorName;
  final String? vendorPhone;
  final String? categoryName;
  final String? categoryEmoji;

  Complaint({
    required this.id,
    required this.tenantId,
    required this.propertyId,
    required this.unit,
    required this.categoryId,
    required this.description,
    required this.status,
    this.vendorId,
    required this.createdAt,
    this.assignedAt,
    this.startedAt,
    this.completedAt,
    this.verifiedAt,
    this.closedAt,
    this.beforePhotos = const [],
    this.afterPhotos = const [],
    this.materialsUsed,
    this.completionNotes,
    this.rating,
    this.feedback,
    this.tenantName,
    this.tenantPhone,
    this.propertyName,
    this.propertyAddress,
    this.vendorName,
    this.vendorPhone,
    this.categoryName,
    this.categoryEmoji,
  });

  factory Complaint.fromJson(Map<String, dynamic> json) {
    return Complaint(
      id: json['id'] ?? '',
      tenantId: json['tenant_id'] ?? '',
      propertyId: json['property_id'] ?? '',
      unit: json['unit'] ?? '',
      categoryId: json['category_id'] ?? '',
      description: json['description'] ?? '',
      status: json['status'] ?? 'Submitted',
      vendorId: json['vendor_id'],
      createdAt: json['created_at'] ?? '',
      assignedAt: json['assigned_at'],
      startedAt: json['started_at'],
      completedAt: json['completed_at'],
      verifiedAt: json['verified_at'],
      closedAt: json['closed_at'],
      beforePhotos: (json['before_photos'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      afterPhotos: (json['after_photos'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      materialsUsed: json['materials_used'],
      completionNotes: json['completion_notes'],
      rating: json['rating'] != null ? int.tryParse(json['rating'].toString()) : null,
      feedback: json['feedback'],
      tenantName: json['tenant_name'],
      tenantPhone: json['tenant_phone'],
      propertyName: json['property_name'],
      propertyAddress: json['property_address'],
      vendorName: json['vendor_name'],
      vendorPhone: json['vendor_phone'],
      categoryName: json['category_name'],
      categoryEmoji: json['category_emoji'],
    );
  }
}
