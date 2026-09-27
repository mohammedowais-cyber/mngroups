import 'package:flutter/material.dart';
import '../../constants/theme.dart';
import '../../models/complaint.dart';
import '../../widgets/status_badge.dart';

class TenantTrackScreen extends StatelessWidget {
  final List<Complaint> complaints;
  final Function(Complaint) onComplaintSelected;
  final Future<void> Function() onRefresh;

  const TenantTrackScreen({
    Key? key,
    required this.complaints,
    required this.onComplaintSelected,
    required this.onRefresh,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: complaints.isEmpty
          ? ListView(
              padding: const EdgeInsets.all(32),
              children: [
                Container(
                  padding: const EdgeInsets.all(32),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.line),
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
                        'Raise your first maintenance request to track progress.',
                        style: TextStyle(fontSize: 12, color: AppColors.ink400),
                      ),
                    ],
                  ),
                ),
              ],
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: complaints.length,
              itemBuilder: (context, index) {
                final c = complaints[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.line),
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
              },
            ),
    );
  }
}
