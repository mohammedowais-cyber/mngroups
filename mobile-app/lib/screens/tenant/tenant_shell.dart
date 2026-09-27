import 'package:flutter/material.dart';
import '../../constants/theme.dart';
import '../../models/complaint.dart';
import '../../models/tenant.dart';
import '../../models/category.dart';
import 'tenant_home_screen.dart';
import 'tenant_raise_screen.dart';
import 'tenant_track_screen.dart';
import 'tenant_detail_screen.dart';
import 'tenant_profile_screen.dart';

class TenantShell extends StatefulWidget {
  final List<Tenant> tenants;
  final Tenant currentTenant;
  final List<Complaint> complaints;
  final List<Category> categories;
  final Function(Tenant) onTenantChanged;
  final Function(String categoryId, String description, List<String> photos) onComplaintSubmitted;
  final Function(Complaint, int rating, String feedback) onComplaintVerified;
  final Future<void> Function() onRefresh;

  const TenantShell({
    Key? key,
    required this.tenants,
    required this.currentTenant,
    required this.complaints,
    required this.categories,
    required this.onTenantChanged,
    required this.onComplaintSubmitted,
    required this.onComplaintVerified,
    required this.onRefresh,
  }) : super(key: key);

  @override
  State<TenantShell> createState() => _TenantShellState();
}

class _TenantShellState extends State<TenantShell> {
  int _currentIndex = 0; // 0: Home, 1: Raise, 2: Track, 3: Profile
  Complaint? _activeComplaint;

  void _showMessage(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.navy900,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.currentTenant;

    Widget body;
    if (_activeComplaint != null) {
      body = TenantDetailScreen(
        complaint: _activeComplaint!,
        onBack: () => setState(() => _activeComplaint = null),
        onVerify: (rating, feedback) async {
          await widget.onComplaintVerified(_activeComplaint!, rating, feedback);
          setState(() => _activeComplaint = null);
          _showMessage('Request verified & closed. Thank you!');
        },
      );
    } else {
      switch (_currentIndex) {
        case 0:
          body = TenantHomeScreen(
            tenant: t,
            complaints: widget.complaints,
            onRaisePressed: () => setState(() => _currentIndex = 1),
            onCallManager: () => _showMessage('Calling ${t.managerName ?? 'Manager'}...'),
            onComplaintSelected: (c) => setState(() => _activeComplaint = c),
          );
          break;
        case 1:
          body = TenantRaiseScreen(
            categories: widget.categories,
            onSubmit: (catId, desc, photos) async {
              await widget.onComplaintSubmitted(catId, desc, photos);
              setState(() => _currentIndex = 2);
              _showMessage('Complaint submitted · Vendor auto-assigned');
            },
          );
          break;
        case 2:
          body = TenantTrackScreen(
            complaints: widget.complaints,
            onComplaintSelected: (c) => setState(() => _activeComplaint = c),
            onRefresh: widget.onRefresh,
          );
          break;
        case 3:
          body = TenantProfileScreen(
            tenant: t,
            onCallManager: () => _showMessage('Calling ${t.managerName ?? 'Manager'}...'),
          );
          break;
        default:
          body = Container();
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${t.propertyName ?? 'Property'} · ${t.unit}',
              style: const TextStyle(fontSize: 11.5, color: Colors.white70),
            ),
            Text(
              'Hi, ${t.name.split(' ').first}',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
          ],
        ),
        actions: [
          DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              dropdownColor: AppColors.navy700,
              icon: const Icon(Icons.arrow_drop_down, color: Colors.white),
              value: t.id,
              items: widget.tenants.map((ten) {
                return DropdownMenuItem(
                  value: ten.id,
                  child: Text(
                    ten.name,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                  ),
                );
              }).toList(),
              onChanged: (newId) {
                final match = widget.tenants.firstWhere((x) => x.id == newId);
                widget.onTenantChanged(match);
                setState(() => _activeComplaint = null);
              },
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: body,
      bottomNavigationBar: _activeComplaint == null
          ? BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (index) => setState(() => _currentIndex = index),
              selectedItemColor: AppColors.navy900,
              unselectedItemColor: AppColors.ink400,
              type: BottomNavigationBarType.fixed,
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
                BottomNavigationBarItem(icon: Icon(Icons.add_circle_outline), activeIcon: Icon(Icons.add_circle), label: 'Raise'),
                BottomNavigationBarItem(icon: Icon(Icons.format_list_bulleted), label: 'Track'),
                BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
              ],
            )
          : null,
    );
  }
}
