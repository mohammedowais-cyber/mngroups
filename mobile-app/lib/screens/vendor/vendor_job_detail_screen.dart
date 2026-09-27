import 'package:flutter/material.dart';
import '../../constants/theme.dart';
import '../../models/complaint.dart';
import '../../widgets/status_badge.dart';

class VendorJobDetailScreen extends StatefulWidget {
  final Complaint complaint;
  final VoidCallback onBack;
  final Function(Complaint) onStartJob;
  final Function(Complaint, List<String> afterPhotos, String materials, String notes) onCompleteJob;

  const VendorJobDetailScreen({
    Key? key,
    required this.complaint,
    required this.onBack,
    required this.onStartJob,
    required this.onCompleteJob,
  }) : super(key: key);

  @override
  State<VendorJobDetailScreen> createState() => _VendorJobDetailScreenState();
}

class _VendorJobDetailScreenState extends State<VendorJobDetailScreen> {
  final TextEditingController _materialsController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  final List<String> _afterPhotos = [];
  bool _isProcessing = false;
  String? _errorMessage;

  void _handleAddMockAfterPhoto() {
    setState(() {
      _afterPhotos.add('/uploads/repair-proof-${_afterPhotos.length + 1}.jpg');
    });
  }

  void _handleStart() async {
    setState(() => _isProcessing = true);
    try {
      await widget.onStartJob(widget.complaint);
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  void _handleComplete() async {
    setState(() => _errorMessage = null);

    if (_afterPhotos.isEmpty) {
      setState(() => _errorMessage = 'Please attach at least one after-photo showing completed repair.');
      return;
    }

    if (_notesController.text.trim().isEmpty) {
      setState(() => _errorMessage = 'Please provide notes describing what was done to fix the issue.');
      return;
    }

    setState(() => _isProcessing = true);
    try {
      await widget.onCompleteJob(
        widget.complaint,
        _afterPhotos,
        _materialsController.text.trim(),
        _notesController.text.trim(),
      );
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  void dispose() {
    _materialsController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.complaint;

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
              'Job details',
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
                  Text(
                    c.id,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.navy700,
                    ),
                  ),
                  StatusBadge(status: c.status),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                '${c.categoryEmoji ?? '📋'} ${c.categoryName ?? 'Category'}',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 6),
              Text(
                c.description,
                style: const TextStyle(fontSize: 13.5, color: AppColors.ink600, height: 1.4),
              ),
              const Divider(height: 24, color: AppColors.line),

              Text(
                'Property: ${c.propertyName ?? 'Property'}, ${c.unit}',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 4),
              Text(
                'Tenant: ${c.tenantName ?? 'Tenant'} · ${c.tenantPhone ?? ''}',
                style: const TextStyle(fontSize: 13, color: AppColors.ink600),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Photos from Tenant
        if (c.beforePhotos.isNotEmpty) ...[
          const Text(
            'Photos from tenant',
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

        if (_errorMessage != null) ...[
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.red.shade200),
            ),
            child: Text(
              _errorMessage!,
              style: TextStyle(color: Colors.red.shade800, fontSize: 13),
            ),
          ),
          const SizedBox(height: 14),
        ],

        // Action Block based on status
        if (c.status == 'Assigned') ...[
          ElevatedButton.icon(
            onPressed: _isProcessing ? null : _handleStart,
            icon: _isProcessing
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.build_outlined, size: 18),
            label: Text(_isProcessing ? 'Starting job...' : 'Accept & start job'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.navy900,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ] else if (c.status == 'In Progress') ...[
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
                  'Submit completion report',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),

                // After Photos
                const Text(
                  'Completion photos (min 1 required)',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    ..._afterPhotos.map((p) => Container(
                      width: 68,
                      height: 68,
                      margin: const EdgeInsets.only(right: 8),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceSunken,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.line),
                      ),
                      child: const Icon(Icons.check_circle_outline, color: AppColors.moss),
                    )),
                    InkWell(
                      onTap: _handleAddMockAfterPhoto,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        width: 68,
                        height: 68,
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.line),
                        ),
                        child: const Icon(Icons.camera_alt_outlined, color: AppColors.ink600),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Materials
                TextField(
                  controller: _materialsController,
                  decoration: InputDecoration(
                    labelText: 'Materials used (optional)',
                    hintText: 'e.g. Replacement tap washer, Teflon tape',
                    filled: true,
                    fillColor: AppColors.surfaceSunken,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 12),

                // Notes
                TextField(
                  controller: _notesController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: 'Completion notes *',
                    hintText: 'What was done to fix the problem?',
                    filled: true,
                    fillColor: AppColors.surfaceSunken,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 16),

                ElevatedButton.icon(
                  onPressed: _isProcessing ? null : _handleComplete,
                  icon: const Icon(Icons.check, size: 18),
                  label: Text(_isProcessing ? 'Submitting...' : 'Submit completion report'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.navy900,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(48),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
          ),
        ] else ...[
          // Completed or Closed view
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
                  'Submitted Report',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                Text(
                  c.completionNotes ?? 'No notes provided.',
                  style: const TextStyle(fontSize: 13.5),
                ),
                if (c.materialsUsed != null && c.materialsUsed!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    'Materials: ${c.materialsUsed}',
                    style: const TextStyle(fontSize: 12.5, color: AppColors.ink600),
                  ),
                ],
                const SizedBox(height: 12),
                if (c.rating != null) ...[
                  Row(
                    children: [
                      ...[1, 2, 3, 4, 5].map((s) => Icon(
                        s <= c.rating! ? Icons.star : Icons.star_border,
                        color: AppColors.brass500,
                        size: 20,
                      )),
                      const SizedBox(width: 8),
                      Text(
                        'Tenant rating: ${c.rating}/5',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  if (c.feedback != null && c.feedback!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      '“${c.feedback}”',
                      style: const TextStyle(fontSize: 12.5, fontStyle: FontStyle.italic, color: AppColors.ink600),
                    ),
                  ],
                ] else ...[
                  const Text(
                    'Waiting for tenant verification & rating.',
                    style: TextStyle(fontSize: 12, color: AppColors.ink400),
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
