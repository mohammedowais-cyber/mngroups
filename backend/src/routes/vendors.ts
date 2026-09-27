import express, { Request, Response } from 'express';
import { db } from '../db/client';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const sql = `
      SELECT 
        v.*,
        COUNT(CASE WHEN c.status != 'Closed' THEN 1 END)::int as active_jobs_count
      FROM vendors v
      LEFT JOIN complaints c ON v.id = c.vendor_id
      GROUP BY v.id
      ORDER BY v.name ASC
    `;
    const result = await db.query(sql);
    return res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching vendors:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM vendors WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    return res.json(result.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
