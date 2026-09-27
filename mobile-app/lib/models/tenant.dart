class Tenant {
  final String id;
  final String name;
  final String phone;
  final String propertyId;
  final String unit;
  final String? propertyName;
  final String? propertyAddress;
  final String? managerName;

  Tenant({
    required this.id,
    required this.name,
    required this.phone,
    required this.propertyId,
    required this.unit,
    this.propertyName,
    this.propertyAddress,
    this.managerName,
  });

  factory Tenant.fromJson(Map<String, dynamic> json) {
    return Tenant(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      propertyId: json['property_id'] ?? '',
      unit: json['unit'] ?? '',
      propertyName: json['property_name'],
      propertyAddress: json['property_address'],
      managerName: json['manager_name'],
    );
  }
}
