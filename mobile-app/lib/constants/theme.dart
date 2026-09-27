import 'package:flutter/material.dart';

class AppColors {
  static const Color navy900 = Color(0xFF0F1B33);
  static const Color navy700 = Color(0xFF1C2E52);
  static const Color navy500 = Color(0xFF2E4372);
  static const Color brass500 = Color(0xFFB8902E);
  static const Color brass600 = Color(0xFF98741F);
  static const Color brass100 = Color(0xFFF1E6C9);
  static const Color bg = Color(0xFFEFF2F6);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceSunken = Color(0xFFE7EBF1);
  static const Color ink900 = Color(0xFF161B26);
  static const Color ink600 = Color(0xFF4B5468);
  static const Color ink400 = Color(0xFF828EA3);
  static const Color line = Color(0xFFDCE1E9);

  // Status colors
  static const Color sky = Color(0xFF2F6BA6);
  static const Color purple = Color(0xFF6E5A9E);
  static const Color amber = Color(0xFFB37A1C);
  static const Color teal = Color(0xFF177A82);
  static const Color moss = Color(0xFF347A5C);
  static const Color clay = Color(0xFFB14B41);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.bg,
      colorScheme: const ColorScheme.light(
        primary: AppColors.navy900,
        secondary: AppColors.brass500,
        surface: AppColors.surface,
        background: AppColors.bg,
      ),
      fontFamily: 'sans-serif',
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.navy900,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardTheme: CardTheme(
        color: AppColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: AppColors.line, width: 1),
        ),
      ),
    );
  }
}
