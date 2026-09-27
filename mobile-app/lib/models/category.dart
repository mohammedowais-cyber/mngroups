class Category {
  final String id;
  final String name;
  final String emoji;
  final String? defaultVendorId;

  Category({
    required this.id,
    required this.name,
    required this.emoji,
    this.defaultVendorId,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      emoji: json['emoji'] ?? '📋',
      defaultVendorId: json['default_vendor_id'],
    );
  }
}
