import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'photo-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB
});

router.post('/', upload.single('photo'), (req, res) => {
  if (!req.file) {
    // If sent as JSON base64 dataUrl:
    if (req.body && req.body.dataUrl) {
      try {
        const matches = req.body.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1].split('/')[1] || 'jpg';
          const filename = `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
          const fileUrl = `/uploads/${filename}`;
          return res.json({ url: fileUrl, filename });
        }
      } catch (err: any) {
        return res.status(400).json({ error: 'Failed to process base64 photo' });
      }
    }
    return res.status(400).json({ error: 'No photo provided' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

export default router;
