import express, { Request, Response } from 'express';
import { db } from '../db/client';

const router = express.Router();

router.get('/summary', async (_req: Request, res: Response) => {
  try {
    // 1. KPI Counts
    const propCountRes = await db.query(`SELECT COUNT(*) as count FROM properties`);
    const tenantCountRes = await db.query(`SELECT COUNT(*) as count FROM tenants`);
    const openRes = await db.query(`SELECT COUNT(*) as count FROM complaints WHERE status != 'Closed'`);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const closedMonthRes = await db.query(
      `SELECT COUNT(*) as count FROM complaints WHERE status = 'Closed' AND closed_at >= $1`,
      [startOfMonth]
    );

    const ratingRes = await db.query(`SELECT AVG(rating) as avg_rating FROM complaints WHERE rating IS NOT NULL`);

    const totalProperties = parseInt(propCountRes.rows[0]?.count || '0', 10);
    const totalTenants = parseInt(tenantCountRes.rows[0]?.count || '0', 10);
    const openComplaints = parseInt(openRes.rows[0]?.count || '0', 10);
    const closedThisMonth = parseInt(closedMonthRes.rows[0]?.count || '0', 10);
    const avgRating = ratingRes.rows[0]?.avg_rating ? parseFloat(ratingRes.rows[0].avg_rating).toFixed(1) : '5.0';

    // 2. Category distribution
    const catRes = await db.query(`
      SELECT 
        c.id, c.name, c.emoji, 
        COUNT(comp.id)::int as count 
      FROM categories c
      LEFT JOIN complaints comp ON c.id = comp.category_id
      GROUP BY c.id, c.name, c.emoji
      ORDER BY count DESC
    `);

    // 3. 6-Week Trend (Raised vs Closed)
    const weeks: Array<{ label: string; raised: number; closed: number }> = [];
    for (let w = 5; w >= 0; w--) {
      const start = new Date();
      start.setDate(start.getDate() - (w * 7 + 6));
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setDate(end.getDate() - (w * 7));
      end.setHours(23, 59, 59, 999);

      const label = w === 0 ? 'This week' : start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

      const trendRes = await db.query(
        `SELECT 
           COUNT(CASE WHEN created_at >= $1 AND created_at <= $2 THEN 1 END)::int as raised,
           COUNT(CASE WHEN closed_at >= $1 AND closed_at <= $2 THEN 1 END)::int as closed
         FROM complaints`,
        [start.toISOString(), end.toISOString()]
      );

      weeks.push({
        label,
        raised: trendRes.rows[0]?.raised || 0,
        closed: trendRes.rows[0]?.closed || 0
      });
    }

    // 4. Recent complaints
    const recentRes = await db.query(`
      SELECT 
        c.id, c.description, c.status, c.created_at,
        t.name as tenant_name,
        p.name as property_name,
        v.name as vendor_name,
        cat.name as category_name,
        cat.emoji as category_emoji
      FROM complaints c
      LEFT JOIN tenants t ON c.tenant_id = t.id
      LEFT JOIN properties p ON c.property_id = p.id
      LEFT JOIN vendors v ON c.vendor_id = v.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      ORDER BY c.created_at DESC
      LIMIT 6
    `);

    return res.json({
      kpis: {
        totalProperties,
        totalTenants,
        openComplaints,
        closedThisMonth,
        averageRating: avgRating
      },
      categoryDistribution: catRes.rows,
      trend: weeks,
      recentComplaints: recentRes.rows
    });
  } catch (err: any) {
    console.error('Error computing dashboard summary:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
