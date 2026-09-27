import express, { Request, Response } from 'express';
import { db } from '../db/client';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const sql = `
      SELECT 
        t.*,
        p.name as property_name,
        p.address as property_address,
        p.manager_name as manager_name,
        COUNT(CASE WHEN c.status != 'Closed' THEN 1 END)::int as open_count,
        COUNT(CASE WHEN c.status = 'Closed' THEN 1 END)::int as closed_count
      FROM tenants t
      LEFT JOIN properties p ON t.property_id = p.id
      LEFT JOIN complaints c ON t.id = c.tenant_id
      GROUP BY t.id, p.name, p.address, p.manager_name
      ORDER BY t.name ASC
    `;
    const result = await db.query(sql);
    return res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching tenants:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        t.*,
        p.name as property_name,
        p.address as property_address,
        p.manager_name as manager_name
      FROM tenants t
      LEFT JOIN properties p ON t.property_id = p.id
      WHERE t.id = $1
    `;
    const result = await db.query(sql, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    return res.json(result.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
