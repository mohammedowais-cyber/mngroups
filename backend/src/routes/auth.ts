import express, { Request, Response } from 'express';
import { db } from '../db/client';

const router = express.Router();

router.get('/personas', async (_req: Request, res: Response) => {
  try {
    const tenants = await db.query(`SELECT id, name, phone, unit FROM tenants ORDER BY name ASC`);
    const vendors = await db.query(`SELECT id, name, phone, categories FROM vendors ORDER BY name ASC`);
    
    return res.json({
      tenants: tenants.rows,
      vendors: vendors.rows,
      roles: ['tenant', 'vendor', 'manager', 'admin']
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { role, id } = req.body;
    if (role === 'tenant') {
      const resTenant = await db.query(
        `SELECT t.*, p.name as property_name, p.address as property_address, p.manager_name 
         FROM tenants t JOIN properties p ON t.property_id = p.id 
         WHERE t.id = $1`, 
        [id || 't1']
      );
      if (resTenant.rows.length === 0) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      return res.json({ role: 'tenant', user: resTenant.rows[0] });
    }

    if (role === 'vendor') {
      const resVendor = await db.query(`SELECT * FROM vendors WHERE id = $1`, [id || 'v1']);
      if (resVendor.rows.length === 0) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      return res.json({ role: 'vendor', user: resVendor.rows[0] });
    }

    if (role === 'manager' || role === 'admin') {
      return res.json({
        role,
        user: {
          id: 'admin-1',
          name: 'Vikram S. (Property Manager & Admin)',
          email: 'admin@mngroups.in'
        }
      });
    }

    return res.status(400).json({ error: 'Invalid role specified' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
