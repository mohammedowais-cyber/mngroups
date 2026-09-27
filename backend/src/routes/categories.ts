import express, { Request, Response } from 'express';
import { db } from '../db/client';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const sql = `
      SELECT 
        c.*,
        v.name as default_vendor_name,
        v.phone as default_vendor_phone
      FROM categories c
      LEFT JOIN vendors v ON c.default_vendor_id = v.id
      ORDER BY c.name ASC
    `;
    const result = await db.query(sql);
    return res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
