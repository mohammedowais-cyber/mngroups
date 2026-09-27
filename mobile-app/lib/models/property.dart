class Property {
  final String id;
  final String name;
  final String type;
  final String address;
  final String managerName;

  Property({
    required this.id,
    required this.name,
    required this.type,
    required this.address,
    required this.managerName,
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    return Property(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? 'Residential',
      address: json['address'] ?? '',
      managerName: json['manager_name'] ?? 'Deepa R.',
    );
  }
}
