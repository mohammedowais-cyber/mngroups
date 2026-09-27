import 'package:flutter/material.dart';
import '../../constants/theme.dart';
import '../../models/complaint.dart';
import '../../widgets/status_badge.dart';

class TenantDetailScreen extends StatefulWidget {
  final Complaint complaint;
  final VoidCallback onBack;
  final Function(int rating, String feedback) onVerify;

  const TenantDetailScreen({
    Key? key,
    required this.complaint,
    required this.onBack,
    required this.onVerify,
  }) : super(key: key);

  @override
  State<TenantDetailScreen> createState() => _TenantDetailScreenState();
}

class _TenantDetailScreenState extends State<TenantDetailScreen> {
  int _selectedRating = 0;
  final TextEditingController _feedbackController = TextEditingController();
  bool _isVerifying = false;
  String? _errorMessage;

  void _handleVerify() async {
    if (_selectedRating == 0) {
      setState(() => _errorMessage = 'Please select a star rating (1 to 5).');
      return;
    }

    setState(() {
      _isVerifying = true;
      _errorMessage = null;
    });

    try {
      await widget.onVerify(_selectedRating, _feedbackController.text.trim());
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isVerifying = false);
    }
  }

  @override
  void dispose() {
    _feedbackController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.complaint;
    final order = ['Submitted', 'Assigned', 'In Progress', 'Completed', 'Closed'];
    final curIdx = order.indexOf(c.status);

    final steps = [
      {'label': 'Complaint submitted', 'time': c.createdAt},
      {'label': 'Vendor assigned${c.vendorName != null ? ': ${c.vendorName}' : ''}', 'time': c.assignedAt},
      {'label': 'Vendor started the job', 'time': c.startedAt},
      {'label': 'Repair completed by vendor', 'time': c.completedAt},
      {'label': 'Verified & closed', 'time': c.verifiedAt ?? c.closedAt},
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Back Button Row
        Row(
          children: [
            IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: widget.onBack,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
            const SizedBox(width: 8),
            const Text(
              'Track complaint',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Complaint Header Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.line),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        c.id,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.navy700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${c.categoryEmoji ?? '📋'} ${c.categoryName ?? 'Category'}',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink900,
                        ),
                      ),
                    ],
                  ),
                  StatusBadge(status: c.status),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                c.description,
                style: const TextStyle(fontSize: 13.5, color: AppColors.ink600, height: 1.4),
              ),
              if (c.vendorName != null) ...[
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSunken,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Assigned to ${c.vendorName} · ${c.vendorPhone ?? ''}',
                    style: const TextStyle(fontSize: 12, color: AppColors.ink600),
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Tenant Before Photos
        if (c.beforePhotos.isNotEmpty) ...[
          const Text(
            'Photos you added',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Row(
            children: c.beforePhotos.map((p) => Container(
              width: 72,
              height: 72,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                color: AppColors.surfaceSunken,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.line),
              ),
              child: const Icon(Icons.image_outlined, color: AppColors.navy500),
            )).toList(),
          ),
          const SizedBox(height: 16),
        ],

        // Status Timeline Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.line),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Status timeline',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),
              ...steps.asMap().entries.map((entry) {
                final idx = entry.key;
                final step = entry.value;
                final done = idx <= curIdx && step['time'] != null;
                final isLast = idx == steps.length - 1;

                return IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: done ? AppColors.moss : AppColors.line,
                              shape: BoxShape.circle,
                            ),
                          ),
                          if (!isLast)
                            Expanded(
                              child: Container(
                                width: 2,
                                color: AppColors.line,
                                margin: const EdgeInsets.symmetric(vertical: 4),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                step['label'] as String,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: done ? AppColors.ink900 : AppColors.ink400,
                                ),
                              ),
                              if (step['time'] != null)
                                Text(
                                  step['time'].toString().split('T').first,
                                  style: const TextStyle(fontSize: 11.5, color: AppColors.ink400),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Completion Report (Vendor photos & notes)
        if (c.completionNotes != null || c.afterPhotos.isNotEmpty) ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.Border.all(color: AppColors.line),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Vendor completion report',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                ),
                if (c.completionNotes != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    c.completionNotes!,
                    style: const TextStyle(fontSize: 13.5, color: AppColors.ink900),
                  ),
                ],
                if (c.materialsUsed != null && c.materialsUsed!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    'Materials: ${c.materialsUsed}',
                    style: const TextStyle(fontSize: 12, color: AppColors.ink600),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 14),
        ],

        // Rate & Verify Form (When Completed)
        if (c.status == 'Completed') ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.Border.all(color: AppColors.brass500, width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Rate the service',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [1, 2, 3, 4, 5].map((star) {
                    final isSelected = star <= _selectedRating;
                    return IconButton(
                      onPressed: () => setState(() => _selectedRating = star),
                      icon: Icon(
                        isSelected ? Icons.star : Icons.star_border,
                        color: AppColors.brass500,
                        size: 32,
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _feedbackController,
                  maxLines: 2,
                  decoration: InputDecoration(
                    hintText: 'Optional feedback for vendor...',
                    filled: true,
                    fillColor: AppColors.surfaceSunken,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: AppColors.line),
                    ),
                  ),
                ),
                if (_errorMessage != null) ...[
                  const SizedBox(height: 8),
                  Text(_errorMessage!, style: const TextStyle(color: Colors.red, fontSize: 12)),
                ],
                const SizedBox(height: 14),
                ElevatedButton.icon(
                  onPressed: _isVerifying ? null : _handleVerify,
                  icon: const Icon(Icons.check, size: 18),
                  label: Text(_isVerifying ? 'Verifying...' : 'Verify & close request'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.navy900,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(46),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
        ],

        // Closed rating display
        if (c.status == 'Closed' && c.rating != null) ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.line),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Your rating',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [1, 2, 3, 4, 5].map((star) {
                    return Icon(
                      star <= c.rating! ? Icons.star : Icons.star_border,
                      color: AppColors.brass500,
                      size: 20,
                    );
                  }).toList(),
                ),
                if (c.feedback != null && c.feedback!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    '“${c.feedback}”',
                    style: const TextStyle(fontSize: 13, fontStyle: FontStyle.italic, color: AppColors.ink600),
                  ),
                ],
              ],
            ),
          ),
        ],
      ],
    );
  }
}
