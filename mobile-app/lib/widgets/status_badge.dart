import 'package:flutter/material.dart';
import '../constants/theme.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({Key? key, required this.status}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    String label;

    switch (status) {
      case 'Submitted':
        bg = AppColors.sky.withOpacity(0.12);
        fg = AppColors.sky;
        label = 'Submitted';
        break;
      case 'Assigned':
        bg = AppColors.purple.withOpacity(0.12);
        fg = AppColors.purple;
        label = 'Vendor assigned';
        break;
      case 'In Progress':
        bg = AppColors.amber.withOpacity(0.12);
        fg = AppColors.amber;
        label = 'In progress';
        break;
      case 'Completed':
        bg = AppColors.teal.withOpacity(0.12);
        fg = AppColors.teal;
        label = 'Awaiting review';
        break;
      case 'Closed':
        bg = AppColors.moss.withOpacity(0.12);
        fg = AppColors.moss;
        label = 'Closed';
        break;
      default:
        bg = AppColors.ink400.withOpacity(0.12);
        fg = AppColors.ink600;
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: fg,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: fg,
              fontSize: 11.5,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
