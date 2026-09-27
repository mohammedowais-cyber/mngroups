import 'package:flutter/material.dart';
import '../../constants/theme.dart';
import '../../models/category.dart';

class TenantRaiseScreen extends StatefulWidget {
  final List<Category> categories;
  final Function(String categoryId, String description, List<String> photos) onSubmit;

  const TenantRaiseScreen({
    Key? key,
    required this.categories,
    required this.onSubmit,
  }) : super(key: key);

  @override
  State<TenantRaiseScreen> createState() => _TenantRaiseScreenState();
}

class _TenantRaiseScreenState extends State<TenantRaiseScreen> {
  String? selectedCategoryId;
  final TextEditingController _descController = TextEditingController();
  final List<String> _photos = [];
  String? _errorMessage;
  bool _isSubmitting = false;

  void _handleAddMockPhoto() {
    // Add realistic sample photo for mobile demo
    setState(() {
      _photos.add('/uploads/sample-issue-${_photos.length + 1}.jpg');
    });
  }

  void _handleSubmit() async {
    setState(() => _errorMessage = null);

    if (selectedCategoryId == null) {
      setState(() => _errorMessage = 'Please select a category to continue.');
      return;
    }

    if (_descController.text.trim().length < 4) {
      setState(() => _errorMessage = 'Please provide a short description of the issue (min 4 characters).');
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      await widget.onSubmit(selectedCategoryId!, _descController.text.trim(), _photos);
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  void dispose() {
    _descController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Select a category',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: AppColors.ink900,
          ),
        ),
        const SizedBox(height: 10),

        // 11 Categories Grid
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: widget.categories.map((cat) {
            final isSelected = selectedCategoryId == cat.id;
            return InkWell(
              onTap: () => setState(() => selectedCategoryId = cat.id),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.navy900 : AppColors.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected ? AppColors.navy900 : AppColors.line,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(cat.emoji, style: const TextStyle(fontSize: 16)),
                    const SizedBox(width: 6),
                    Text(
                      cat.name,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: isSelected ? Colors.white : AppColors.ink900,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 20),

        // Description Input
        const Text(
          'Describe the issue',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.ink900,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _descController,
          maxLines: 4,
          decoration: InputDecoration(
            hintText: 'e.g. Bathroom tap is leaking continuously near the base valve.',
            filled: true,
            fillColor: AppColors.surface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.line),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.line),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.navy900, width: 1.5),
            ),
          ),
        ),
        const SizedBox(height: 18),

        // Photo Attachment
        const Text(
          'Attach photos',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.ink900,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            ..._photos.map((p) => Container(
              width: 68,
              height: 68,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                color: AppColors.surfaceSunken,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.line),
              ),
              child: const Icon(Icons.image_outlined, color: AppColors.navy500),
            )),
            InkWell(
              onTap: _handleAddMockPhoto,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: 68,
                height: 68,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.line, style: BorderStyle.solid),
                ),
                child: const Icon(Icons.camera_alt_outlined, color: AppColors.ink600),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

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
          const SizedBox(height: 12),
        ],

        ElevatedButton.icon(
          onPressed: _isSubmitting ? null : _handleSubmit,
          icon: _isSubmitting
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Icon(Icons.check, size: 18),
          label: Text(_isSubmitting ? 'Submitting...' : 'Submit complaint'),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.navy900,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
      ],
    );
  }
}
