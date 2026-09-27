import express, { Request, Response } from 'express';
import { db } from '../db/client';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const sql = `
      SELECT 
        p.*,
        COUNT(DISTINCT t.id)::int as tenant_count,
        COUNT(DISTINCT CASE WHEN c.status != 'Closed' THEN c.id END)::int as open_complaints_count
      FROM properties p
      LEFT JOIN tenants t ON p.id = t.property_id
      LEFT JOIN complaints c ON p.id = c.property_id
      GROUP BY p.id
      ORDER BY p.name ASC
    `;
    const result = await db.query(sql);
    return res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching properties:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, address, manager_name } = req.body;
    if (!name || !type || !address || !manager_name) {
      return res.status(400).json({ error: 'name, type, address, manager_name are required' });
    }
    const id = 'p' + Date.now().toString(36);
    const result = await db.query(
      `INSERT INTO properties (id, name, type, address, manager_name) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, name, type, address, manager_name]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
