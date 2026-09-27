import express, { Request, Response } from 'express';
import { db } from '../db/client';
import { validateTransition, StateMachineError, ComplaintStatus } from '../services/stateMachine';
import { notificationService } from '../services/notificationService';

const router = express.Router();

// Helper to generate next readable Complaint ID: MC-YYYY-#####
async function generateComplaintId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `MC-${currentYear}-`;
  
  const res = await db.query(
    `SELECT id FROM complaints WHERE id LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextNum = 1;
  if (res.rows.length > 0) {
    const lastId = res.rows[0].id; // e.g. MC-2026-00136
    const numPart = lastId.split('-')[2];
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed)) {
      nextNum = parsed + 1;
    }
  } else {
    nextNum = 137; // start after seed data
  }

  return `${prefix}${String(nextNum).padStart(5, '0')}`;
}

// GET /complaints - Filterable list
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenant_id, vendor_id, status, category_id, property_id, search } = req.query;

    let sql = `
      SELECT 
        c.*,
        t.name as tenant_name,
        t.phone as tenant_phone,
        p.name as property_name,
        p.address as property_address,
        p.type as property_type,
        p.manager_name as manager_name,
        v.name as vendor_name,
        v.phone as vendor_phone,
        v.rating as vendor_rating,
        cat.name as category_name,
        cat.emoji as category_emoji
      FROM complaints c
      LEFT JOIN tenants t ON c.tenant_id = t.id
      LEFT JOIN properties p ON c.property_id = p.id
      LEFT JOIN vendors v ON c.vendor_id = v.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIdx = 1;

    if (tenant_id) {
      sql += ` AND c.tenant_id = $${paramIdx++}`;
      params.push(tenant_id);
    }
    if (vendor_id) {
      sql += ` AND c.vendor_id = $${paramIdx++}`;
      params.push(vendor_id);
    }
    if (status && status !== 'all') {
      sql += ` AND c.status = $${paramIdx++}`;
      params.push(status);
    }
    if (category_id && category_id !== 'all') {
      sql += ` AND c.category_id = $${paramIdx++}`;
      params.push(category_id);
    }
    if (property_id && property_id !== 'all') {
      sql += ` AND c.property_id = $${paramIdx++}`;
      params.push(property_id);
    }
    if (search) {
      sql += ` AND (c.id ILIKE $${paramIdx} OR c.description ILIKE $${paramIdx} OR t.name ILIKE $${paramIdx} OR p.name ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    sql += ` ORDER BY c.created_at DESC`;

    const result = await db.query(sql, params);
    return res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching complaints:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /complaints/:id - Single complaint detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        c.*,
        t.name as tenant_name,
        t.phone as tenant_phone,
        p.name as property_name,
        p.address as property_address,
        p.type as property_type,
        p.manager_name as manager_name,
        v.name as vendor_name,
        v.phone as vendor_phone,
        v.rating as vendor_rating,
        cat.name as category_name,
        cat.emoji as category_emoji
      FROM complaints c
      LEFT JOIN tenants t ON c.tenant_id = t.id
      LEFT JOIN properties p ON c.property_id = p.id
      LEFT JOIN vendors v ON c.vendor_id = v.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = $1
    `;
    const result = await db.query(sql, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    return res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error fetching complaint detail:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /complaints - Tenant raises a complaint (auto-assigns vendor by category)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { tenant_id, category_id, description, before_photos } = req.body;

    if (!tenant_id || !category_id || !description || description.trim().length < 4) {
      return res.status(400).json({ 
        error: 'Missing required fields: tenant_id, category_id, and a description (min 4 chars) are required.' 
      });
    }

    // Lookup tenant & property
    const tenantRes = await db.query(`SELECT * FROM tenants WHERE id = $1`, [tenant_id]);
    if (tenantRes.rows.length === 0) {
      return res.status(400).json({ error: `Tenant with id '${tenant_id}' does not exist.` });
    }
    const tenant = tenantRes.rows[0];

    // Lookup category & default vendor
    const catRes = await db.query(`SELECT * FROM categories WHERE id = $1`, [category_id]);
    if (catRes.rows.length === 0) {
      return res.status(400).json({ error: `Category '${category_id}' does not exist.` });
    }
    const category = catRes.rows[0];
    const defaultVendorId = category.default_vendor_id;

    const newId = await generateComplaintId();
    const initialStatus: ComplaintStatus = defaultVendorId ? 'Assigned' : 'Submitted';
    const now = new Date().toISOString();
    const assignedAt = defaultVendorId ? now : null;

    const photosArray = Array.isArray(before_photos) ? before_photos : [];

    const insertSql = `
      INSERT INTO complaints (
        id, tenant_id, property_id, unit, category_id, description,
        status, vendor_id, created_at, assigned_at, before_photos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await db.query(insertSql, [
      newId,
      tenant.id,
      tenant.property_id,
      tenant.unit,
      category.id,
      description.trim(),
      initialStatus,
      defaultVendorId,
      now,
      assignedAt,
      photosArray
    ]);

    const created = result.rows[0];

    // Notify vendor
    if (defaultVendorId) {
      const propRes = await db.query(`SELECT name FROM properties WHERE id = $1`, [tenant.property_id]);
      const propName = propRes.rows[0]?.name || 'Property';
      notificationService.onComplaintAssigned(newId, defaultVendorId, category.name, propName, tenant.unit);
    }

    return res.status(201).json(created);
  } catch (err: any) {
    console.error('Error creating complaint:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /complaints/:id/start - Vendor accepts/starts the job
router.patch('/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingRes = await db.query(
      `SELECT c.*, v.name as vendor_name FROM complaints c LEFT JOIN vendors v ON c.vendor_id = v.id WHERE c.id = $1`, 
      [id]
    );

    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const complaint = existingRes.rows[0];
    validateTransition(complaint.status, 'In Progress');

    const now = new Date().toISOString();
    const updateSql = `
      UPDATE complaints 
      SET status = 'In Progress', started_at = $1 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await db.query(updateSql, [now, id]);

    notificationService.onJobStarted(id, complaint.tenant_id, complaint.vendor_name || 'Vendor');

    return res.json(result.rows[0]);
  } catch (err: any) {
    if (err instanceof StateMachineError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('Error starting complaint:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /complaints/:id/complete - Vendor submits completion report + photos
router.patch('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { after_photos, materials_used, completion_notes } = req.body;

    const existingRes = await db.query(
      `SELECT c.*, v.name as vendor_name FROM complaints c LEFT JOIN vendors v ON c.vendor_id = v.id WHERE c.id = $1`, 
      [id]
    );
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const complaint = existingRes.rows[0];
    validateTransition(complaint.status, 'Completed');

    // Requirement: requires >=1 after-photo + notes
    if (!after_photos || !Array.isArray(after_photos) || after_photos.length === 0) {
      return res.status(400).json({ 
        error: 'Validation failed: Submitting a completion report requires at least one after-photo.' 
      });
    }

    if (!completion_notes || completion_notes.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Validation failed: Submitting a completion report requires completion notes detailing the repair.' 
      });
    }

    const now = new Date().toISOString();
    const updateSql = `
      UPDATE complaints 
      SET status = 'Completed', 
          completed_at = $1, 
          after_photos = $2, 
          materials_used = $3, 
          completion_notes = $4 
      WHERE id = $5 
      RETURNING *
    `;

    const result = await db.query(updateSql, [
      now, 
      after_photos, 
      (materials_used || '').trim(), 
      completion_notes.trim(), 
      id
    ]);

    notificationService.onJobCompleted(id, complaint.tenant_id, complaint.vendor_name || 'Vendor');

    return res.json(result.rows[0]);
  } catch (err: any) {
    if (err instanceof StateMachineError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('Error completing complaint:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /complaints/:id/verify - Tenant verifies + rates service
router.patch('/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const existingRes = await db.query(
      `SELECT c.*, p.manager_name FROM complaints c LEFT JOIN properties p ON c.property_id = p.id WHERE c.id = $1`, 
      [id]
    );
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const complaint = existingRes.rows[0];
    validateTransition(complaint.status, 'Closed');

    // Requirement: requires a 1-5 rating
    const numRating = Number(rating);
    if (!rating || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ 
        error: 'Validation failed: Verifying completion requires an integer star rating between 1 and 5.' 
      });
    }

    const now = new Date().toISOString();
    const updateSql = `
      UPDATE complaints 
      SET status = 'Closed', 
          verified_at = $1, 
          closed_at = $2, 
          rating = $3, 
          feedback = $4 
      WHERE id = $5 
      RETURNING *
    `;

    const result = await db.query(updateSql, [
      now, 
      now, 
      numRating, 
      (feedback || '').trim(), 
      id
    ]);

    // Recalculate vendor rating & increment jobs_done
    if (complaint.vendor_id) {
      const vendorStats = await db.query(
        `SELECT AVG(rating) as avg_rating, COUNT(rating) as rated_count 
         FROM complaints 
         WHERE vendor_id = $1 AND rating IS NOT NULL`,
        [complaint.vendor_id]
      );
      const newAvg = parseFloat(vendorStats.rows[0]?.avg_rating || '5.0');
      await db.query(
        `UPDATE vendors 
         SET rating = ROUND($1::numeric, 1), 
             jobs_done = jobs_done + 1 
         WHERE id = $2`,
        [newAvg, complaint.vendor_id]
      );
    }

    notificationService.onComplaintClosed(id, complaint.manager_name || 'Manager', numRating);

    return res.json(result.rows[0]);
  } catch (err: any) {
    if (err instanceof StateMachineError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('Error verifying complaint:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
