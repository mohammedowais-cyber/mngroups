class Vendor {
  final String id;
  final String name;
  final String phone;
  final List<String> categories;
  final double rating;
  final int jobsDone;
  final int? activeJobsCount;

  Vendor({
    required this.id,
    required this.name,
    required this.phone,
    required this.categories,
    required this.rating,
    required this.jobsDone,
    this.activeJobsCount,
  });

  factory Vendor.fromJson(Map<String, dynamic> json) {
    return Vendor(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      categories: (json['categories'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      rating: double.tryParse(json['rating'].toString()) ?? 5.0,
      jobsDone: int.tryParse(json['jobs_done'].toString()) ?? 0,
      activeJobsCount: int.tryParse(json['active_jobs_count']?.toString() ?? '0'),
    );
  }
}
