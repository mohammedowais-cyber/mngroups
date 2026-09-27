import React from 'react';
import { DashboardSummary, Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TrendChart, CategoryChart } from '../components/Charts';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  onOpenComplaint: (c: Complaint) => void;
  onViewAllComplaints: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ summary, onOpenComplaint, onViewAllComplaints }) => {
  if (!summary) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard metrics...</div>;
  }

  const { kpis, categoryDistribution, trend, recentComplaints } = summary;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="admin-h1">Dashboard</div>
          <div className="admin-sub">Live overview across all managed PG, residential &amp; commercial properties</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Total Properties</div>
          <div className="kpi-num">{kpis.totalProperties}</div>
          <div className="kpi-sub">{kpis.totalProperties} active sites across Mumbai &amp; Bengaluru</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total Tenants</div>
          <div className="kpi-num">{kpis.totalTenants}</div>
          <div className="kpi-sub">Across PG and rental units</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Open Complaints</div>
          <div className="kpi-num">{kpis.openComplaints}</div>
          <div className="kpi-sub">Awaiting resolution / in progress</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Closed This Month</div>
          <div className="kpi-num">{kpis.closedThisMonth}</div>
          <div className="kpi-sub">Avg rating: {kpis.averageRating} / 5.0 ★</div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-row">
        <div className="chart-card">
          <h3>Complaints Overview — Last 6 Weeks</h3>
          <div className="chart-wrap">
            <TrendChart trend={trend} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Complaints by Category</h3>
          <CategoryChart categories={categoryDistribution} />
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="table-card">
        <div className="table-card-head">
          <h3>Recent Complaints</h3>
          <button 
            onClick={onViewAllComplaints}
            style={{ background: 'none', border: 'none', color: 'var(--navy-500)', fontWeight: 600, cursor: 'pointer', fontSize: '13.5px' }}
          >
            View all →
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Property</th>
                <th>Tenant</th>
                <th>Category</th>
                <th>Status</th>
                <th>Assigned Vendor</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map(c => (
                <tr key={c.id} className="row-click" onClick={() => onOpenComplaint(c)}>
                  <td style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{c.id}</td>
                  <td>{c.property_name}</td>
                  <td>{c.tenant_name}</td>
                  <td>
                    <span>{c.category_emoji} {c.category_name}</span>
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>{c.vendor_name || '—'}</td>
                  <td>{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
