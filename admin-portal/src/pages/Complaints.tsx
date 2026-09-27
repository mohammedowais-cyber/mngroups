import React, { useState } from 'react';
import { Complaint, Category } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface ComplaintsPageProps {
  complaints: Complaint[];
  categories: Category[];
  onOpenComplaint: (c: Complaint) => void;
  onFilterChange: (status: string, category: string, search: string) => void;
}

export const ComplaintsPage: React.FC<ComplaintsPageProps> = ({
  complaints,
  categories,
  onOpenComplaint,
  onFilterChange
}) => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    onFilterChange(val, selectedCategory, search);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    onFilterChange(selectedStatus, val, search);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    onFilterChange(selectedStatus, selectedCategory, val);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="admin-h1">Maintenance Requests</div>
          <div className="admin-sub">
            Showing {complaints.length} requests across all categories &amp; statuses
          </div>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search complaints, tenants..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            style={{ width: '220px' }}
          />

          <select value={selectedStatus} onChange={e => handleStatusChange(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Vendor Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Awaiting Review</option>
            <option value="Closed">Closed</option>
          </select>

          <select value={selectedCategory} onChange={e => handleCategoryChange(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-card">
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
              {complaints.length > 0 ? (
                complaints.map(c => (
                  <tr key={c.id} className="row-click" onClick={() => onOpenComplaint(c)}>
                    <td style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{c.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.property_name}</div>
                      <div className="help-text">{c.unit}</div>
                    </td>
                    <td>
                      <div>{c.tenant_name}</div>
                      <div className="help-text">{c.tenant_phone}</div>
                    </td>
                    <td>
                      <span>{c.category_emoji} {c.category_name}</span>
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>{c.vendor_name || '—'}</td>
                    <td>{formatDate(c.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-400)' }}>
                    No maintenance requests match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
