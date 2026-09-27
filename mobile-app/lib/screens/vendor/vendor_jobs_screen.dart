import 'package:flutter/material.dart';
import '../../constants/theme.dart';
import '../../models/complaint.dart';
import '../../widgets/status_badge.dart';

class VendorJobsScreen extends StatelessWidget {
  final List<Complaint> assignedJobs;
  final List<Complaint> inProgressJobs;
  final List<Complaint> doneJobs;
  final Function(Complaint) onJobSelected;

  const VendorJobsScreen({
    Key? key,
    required this.assignedJobs,
    required this.inProgressJobs,
    required this.doneJobs,
    required this.onJobSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          Container(
            color: AppColors.surface,
            child: TabBar(
              labelColor: AppColors.navy900,
              unselectedLabelColor: AppColors.ink400,
              indicatorColor: AppColors.brass500,
              indicatorWeight: 3,
              tabs: [
                Tab(text: 'Assigned (${assignedJobs.length})'),
                Tab(text: 'In Progress (${inProgressJobs.length})'),
                Tab(text: 'Done (${doneJobs.length})'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildJobList(assignedJobs, 'No new assigned jobs'),
                _buildJobList(inProgressJobs, 'No jobs currently in progress'),
                _buildJobList(doneJobs, 'No completed jobs yet'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildJobList(List<Complaint> jobs, String emptyText) {
    if (jobs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.work_outline, size: 40, color: AppColors.ink400),
            const SizedBox(height: 8),
            Text(
              emptyText,
              style: const TextStyle(fontSize: 14, color: AppColors.ink600, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: jobs.length,
      itemBuilder: (context, index) {
        final c = jobs[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.line),
          ),
          child: InkWell(
            onTap: () => onJobSelected(c),
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
                  const SizedBox(height: 6),
                  Text(
                    '${c.categoryEmoji ?? '📋'} ${c.categoryName ?? 'Category'} — ${c.propertyName ?? 'Property'}, ${c.unit}',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    c.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 13, color: AppColors.ink600),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${c.tenantName ?? 'Tenant'} · ${c.createdAt.split('T').first}',
                    style: const TextStyle(fontSize: 12, color: AppColors.ink400),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
