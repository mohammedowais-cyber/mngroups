import 'package:flutter/material.dart';
import '../../constants/theme.dart';
import '../../models/tenant.dart';

class TenantProfileScreen extends StatelessWidget {
  final Tenant tenant;
  final VoidCallback onCallManager;

  const TenantProfileScreen({
    Key? key,
    required this.tenant,
    required this.onCallManager,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.line),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                tenant.name,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              Text(
                tenant.phone,
                style: const TextStyle(fontSize: 13, color: AppColors.ink600),
              ),
              const Divider(height: 28, color: AppColors.line),

              const Text(
                'Property & Unit',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.ink400),
              ),
              const SizedBox(height: 4),
              Text(
                '${tenant.propertyName ?? 'Property'} · ${tenant.unit}',
                style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600),
              ),
              if (tenant.propertyAddress != null) ...[
                const SizedBox(height: 2),
                Text(
                  tenant.propertyAddress!,
                  style: const TextStyle(fontSize: 12.5, color: AppColors.ink600),
                ),
              ],
              const Divider(height: 28, color: AppColors.line),

              const Text(
                'Property Manager',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.ink400),
              ),
              const SizedBox(height: 4),
              Text(
                tenant.managerName ?? 'Deepa R.',
                style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 14),
              OutlinedButton.icon(
                onPressed: onCallManager,
                icon: const Icon(Icons.phone_outlined, size: 18),
                label: const Text('Call property manager'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.navy900,
                  side: const BorderSide(color: AppColors.line),
                  minimumSize: const Size.fromHeight(44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
