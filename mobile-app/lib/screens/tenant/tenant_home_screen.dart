import 'package:flutter/material.dart';
import '../../constants/theme.dart';
import '../../models/complaint.dart';
import '../../models/tenant.dart';
import '../../widgets/status_badge.dart';

class TenantHomeScreen extends StatelessWidget {
  final Tenant tenant;
  final List<Complaint> complaints;
  final VoidCallback onRaisePressed;
  final VoidCallback onCallManager;
  final Function(Complaint) onComplaintSelected;

  const TenantHomeScreen({
    Key? key,
    required this.tenant,
    required this.complaints,
    required this.onRaisePressed,
    required this.onCallManager,
    required this.onComplaintSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final openCount = complaints.where((c) => c.status != 'Closed').length;
    final closedCount = complaints.where((c) => c.status == 'Closed').length;
    final recent = complaints.take(3).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Stat Cards Row
        Row(
          children: [
            Expanded(
              child: _buildStatBox(
                context,
                count: openCount,
                label: 'Open requests',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatBox(
                context,
                count: closedCount,
                label: 'Completed',
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Quick Actions Row
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: onRaisePressed,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Raise a complaint'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.navy900,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: onCallManager,
                icon: const Icon(Icons.phone_outlined, size: 18),
                label: const Text('Call manager'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.navy900,
                  side: const BorderSide(color: AppColors.line),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Recent Requests Section
        const Text(
          'Recent requests',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: AppColors.ink900,
          ),
        ),
        const SizedBox(height: 10),

        if (recent.isEmpty)
          Container(
            padding: const EdgeInsets.all(32),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.Border.all(color: AppColors.line),
            ),
            child: Column(
              children: const [
                Icon(Icons.inbox_outlined, size: 40, color: AppColors.ink400),
                SizedBox(height: 8),
                Text(
                  'No requests yet',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                SizedBox(height: 4),
                Text(
                  'Raise your first maintenance request to get started.',
                  style: TextStyle(fontSize: 12, color: AppColors.ink400),
                ),
              ],
            ),
          )
        else
          ...recent.map((c) => _buildComplaintCard(c)).toList(),
      ],
    );
  }

  Widget _buildStatBox(BuildContext context, {required int count, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$count',
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: AppColors.navy900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.ink600,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComplaintCard(Complaint c) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.Border.all(color: AppColors.line),
      ),
      child: InkWell(
        onTap: () => onComplaintSelected(c),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    c.id,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.navy700,
                    ),
                  ),
                  StatusBadge(status: c.status),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${c.categoryEmoji ?? '📋'} ${c.categoryName ?? 'Maintenance'} — ${c.description}',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.ink900,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(
                    c.createdAt.split('T').first,
                    style: const TextStyle(fontSize: 12, color: AppColors.ink400),
                  ),
                  if (c.vendorName != null) ...[
                    const Text(' · ', style: TextStyle(color: AppColors.ink400)),
                    Expanded(
                      child: Text(
                        c.vendorName!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12, color: AppColors.ink600),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
