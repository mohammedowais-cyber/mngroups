import 'package:flutter/material.dart';
import 'constants/theme.dart';
import 'models/complaint.dart';
import 'models/tenant.dart';
import 'models/vendor.dart';
import 'models/category.dart';
import 'services/api_service.dart';
import 'screens/tenant/tenant_shell.dart';
import 'screens/vendor/vendor_shell.dart';

void main() {
  runApp(const MnGroupsApp());
}

class MnGroupsApp extends StatelessWidget {
  const MnGroupsApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MN Groups Property Maintenance',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const RootScreen(),
    );
  }
}

class RootScreen extends StatefulWidget {
  const RootScreen({Key? key}) : super(key: key);

  @override
  State<RootScreen> createState() => _RootScreenState();
}

class _RootScreenState extends State<RootScreen> {
  String _currentRole = 'tenant'; // 'tenant' or 'vendor'
  bool _isLoading = true;

  List<Tenant> _tenants = [];
  Tenant? _selectedTenant;

  List<Vendor> _vendors = [];
  Vendor? _selectedVendor;

  List<Category> _categories = [];
  List<Complaint> _complaints = [];

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoading = true);
    try {
      final tenants = await ApiService.getTenants();
      final vendors = await ApiService.getVendors();
      final categories = await ApiService.getCategories();
      final complaints = await ApiService.getComplaints();

      setState(() {
        _tenants = tenants;
        _selectedTenant = tenants.isNotEmpty ? tenants.first : null;
        _vendors = vendors;
        _selectedVendor = vendors.isNotEmpty ? vendors.first : null;
        _categories = categories;
        _complaints = complaints;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('API Error: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _refreshComplaints() async {
    try {
      final complaints = await ApiService.getComplaints();
      setState(() {
        _complaints = complaints;
      });
    } catch (e) {
      debugPrint('Refresh error: $e');
    }
  }

  Future<void> _handleTenantComplaintSubmit(String categoryId, String desc, List<String> photos) async {
    if (_selectedTenant == null) return;
    await ApiService.createComplaint(
      tenantId: _selectedTenant!.id,
      categoryId: categoryId,
      description: desc,
      beforePhotos: photos,
    );
    await _refreshComplaints();
  }

  Future<void> _handleTenantVerify(Complaint c, int rating, String feedback) async {
    await ApiService.verifyJob(c.id, rating: rating, feedback: feedback);
    await _refreshComplaints();
  }

  Future<void> _handleVendorStartJob(Complaint c) async {
    await ApiService.startJob(c.id);
    await _refreshComplaints();
  }

  Future<void> _handleVendorCompleteJob(Complaint c, List<String> photos, String mat, String notes) async {
    await ApiService.completeJob(c.id, afterPhotos: photos, materialsUsed: mat, completionNotes: notes);
    await _refreshComplaints();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.navy900),
        ),
      );
    }

    return Scaffold(
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: AppColors.navy900),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: const [
                  Text(
                    'MN GROUPS',
                    style: TextStyle(
                      color: AppColors.brass500,
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Property Maintenance System',
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.person, color: AppColors.navy700),
              title: const Text('Tenant Experience'),
              selected: _currentRole == 'tenant',
              selectedTileColor: AppColors.surfaceSunken,
              onTap: () {
                setState(() => _currentRole = 'tenant');
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.build, color: AppColors.brass600),
              title: const Text('Vendor Experience'),
              selected: _currentRole == 'vendor',
              selectedTileColor: AppColors.surfaceSunken,
              onTap: () {
                setState(() => _currentRole = 'vendor');
                Navigator.pop(context);
              },
            ),
            const Divider(),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                'API Endpoint: ${ApiService.baseUrl}',
                style: const TextStyle(fontSize: 11, color: AppColors.ink400),
              ),
            ),
          ],
        ),
      ),
      body: _currentRole == 'tenant'
          ? (_selectedTenant != null
              ? TenantShell(
                  tenants: _tenants,
                  currentTenant: _selectedTenant!,
                  complaints: _complaints.where((c) => c.tenantId == _selectedTenant!.id).toList(),
                  categories: _categories,
                  onTenantChanged: (t) => setState(() => _selectedTenant = t),
                  onComplaintSubmitted: _handleTenantComplaintSubmit,
                  onComplaintVerified: _handleTenantVerify,
                  onRefresh: _refreshComplaints,
                )
              : const Center(child: Text('No tenant records found')))
          : (_selectedVendor != null
              ? VendorShell(
                  vendors: _vendors,
                  currentVendor: _selectedVendor!,
                  complaints: _complaints,
                  onVendorChanged: (v) => setState(() => _selectedVendor = v),
                  onStartJob: _handleVendorStartJob,
                  onCompleteJob: _handleVendorCompleteJob,
                  onRefresh: _refreshComplaints,
                )
              : const Center(child: Text('No vendor records found'))),
    );
  }
}
