import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/complaint.dart';
import '../models/category.dart';
import '../models/tenant.dart';
import '../models/vendor.dart';
import '../models/property.dart';

class ApiService {
  // Default to localhost for web/desktop, 10.0.2.2 for Android emulator
  static String baseUrl = 'http://localhost:4000';

  static Future<List<Complaint>> getComplaints({
    String? tenantId,
    String? vendorId,
    String? status,
    String? categoryId,
  }) async {
    final queryParams = <String, String>{};
    if (tenantId != null) queryParams['tenant_id'] = tenantId;
    if (vendorId != null) queryParams['vendor_id'] = vendorId;
    if (status != null && status != 'all') queryParams['status'] = status;
    if (categoryId != null && categoryId != 'all') queryParams['category_id'] = categoryId;

    final uri = Uri.parse('$baseUrl/complaints').replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Complaint.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load complaints');
    }
  }

  static Future<Complaint> getComplaint(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/complaints/$id'));
    if (response.statusCode == 200) {
      return Complaint.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load complaint $id');
    }
  }

  static Future<Complaint> createComplaint({
    required String tenantId,
    required String categoryId,
    required String description,
    List<String> beforePhotos = const [],
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/complaints'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'tenant_id': tenantId,
        'category_id': categoryId,
        'description': description,
        'before_photos': beforePhotos,
      }),
    );

    if (response.statusCode == 201) {
      return Complaint.fromJson(jsonDecode(response.body));
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Failed to create complaint');
    }
  }

  static Future<Complaint> startJob(String id) async {
    final response = await http.patch(Uri.parse('$baseUrl/complaints/$id/start'));
    if (response.statusCode == 200) {
      return Complaint.fromJson(jsonDecode(response.body));
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Failed to start job');
    }
  }

  static Future<Complaint> completeJob(
    String id, {
    required List<String> afterPhotos,
    String? materialsUsed,
    required String completionNotes,
  }) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/complaints/$id/complete'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'after_photos': afterPhotos,
        'materials_used': materialsUsed ?? '',
        'completion_notes': completionNotes,
      }),
    );

    if (response.statusCode == 200) {
      return Complaint.fromJson(jsonDecode(response.body));
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Failed to complete job');
    }
  }

  static Future<Complaint> verifyJob(
    String id, {
    required int rating,
    String? feedback,
  }) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/complaints/$id/verify'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'rating': rating,
        'feedback': feedback ?? '',
      }),
    );

    if (response.statusCode == 200) {
      return Complaint.fromJson(jsonDecode(response.body));
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Failed to verify job');
    }
  }

  static Future<List<Category>> getCategories() async {
    final response = await http.get(Uri.parse('$baseUrl/categories'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Category.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load categories');
    }
  }

  static Future<List<Tenant>> getTenants() async {
    final response = await http.get(Uri.parse('$baseUrl/tenants'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Tenant.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load tenants');
    }
  }

  static Future<List<Vendor>> getVendors() async {
    final response = await http.get(Uri.parse('$baseUrl/vendors'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Vendor.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load vendors');
    }
  }

  static Future<List<Property>> getProperties() async {
    final response = await http.get(Uri.parse('$baseUrl/properties'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Property.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load properties');
    }
  }
}
