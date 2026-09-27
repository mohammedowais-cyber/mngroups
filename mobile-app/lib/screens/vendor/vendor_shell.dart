import 'package:flutter/material.dart';
import '../../constants/theme.dart';
import '../../models/complaint.dart';
import '../../models/vendor.dart';
import 'vendor_jobs_screen.dart';
import 'vendor_job_detail_screen.dart';

class VendorShell extends StatefulWidget {
  final List<Vendor> vendors;
  final Vendor currentVendor;
  final List<Complaint> complaints;
  final Function(Vendor) onVendorChanged;
  final Function(Complaint) onStartJob;
  final Function(Complaint, List<String> afterPhotos, String materials, String notes) onCompleteJob;
  final Future<void> Function() onRefresh;

  const VendorShell({
    Key? key,
    required this.vendors,
    required this.currentVendor,
    required this.complaints,
    required this.onVendorChanged,
    required this.onStartJob,
    required this.onCompleteJob,
    required this.onRefresh,
  }) : super(key: key);

  @override
  State<VendorShell> createState() => _VendorShellState();
}

class _VendorShellState extends State<VendorShell> {
  Complaint? _activeJob;

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
    final v = widget.currentVendor;
    final myJobs = widget.complaints.where((c) => c.vendorId == v.id).toList();

    final assignedJobs = myJobs.where((c) => c.status == 'Assigned').toList();
    final inProgressJobs = myJobs.where((c) => c.status == 'In Progress').toList();
    final doneJobs = myJobs.where((c) => c.status == 'Completed' || c.status == 'Closed').toList();

    Widget body;
    if (_activeJob != null) {
      body = VendorJobDetailScreen(
        complaint: _activeJob!,
        onBack: () => setState(() => _activeJob = null),
        onStartJob: (c) async {
          await widget.onStartJob(c);
          setState(() => _activeJob = null);
          _showMessage('Job accepted & marked In Progress');
        },
        onCompleteJob: (c, photos, mat, notes) async {
          await widget.onCompleteJob(c, photos, mat, notes);
          setState(() => _activeJob = null);
          _showMessage('Completion report submitted · Tenant notified');
        },
      );
    } else {
      body = RefreshIndicator(
        onRefresh: widget.onRefresh,
        child: VendorJobsScreen(
          assignedJobs: assignedJobs,
          inProgressJobs: inProgressJobs,
          doneJobs: doneJobs,
          onJobSelected: (c) => setState(() => _activeJob = c),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Vendor Portal',
              style: TextStyle(fontSize: 11.5, color: Colors.white70),
            ),
            Text(
              v.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
          ],
        ),
        actions: [
          DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              dropdownColor: AppColors.navy700,
              icon: const Icon(Icons.arrow_drop_down, color: Colors.white),
              value: v.id,
              items: widget.vendors.map((ven) {
                return DropdownMenuItem(
                  value: ven.id,
                  child: Text(
                    ven.name,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                  ),
                );
              }).toList>,
              onChanged: (newId) {
                final match = widget.vendors.firstWhere((x) => x.id == newId);
                widget.onVendorChanged(match);
                setState(() => _activeJob = null);
              },
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: body,
    );
  }
}
