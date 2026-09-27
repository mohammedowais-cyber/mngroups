import React from 'react';
import { Tenant } from '../types';

interface TenantsPageProps {
  tenants: Tenant[];
}

export const TenantsPage: React.FC<TenantsPageProps> = ({ tenants }) => {
  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="admin-h1">Tenant Directory</div>
          <div className="admin-sub">{tenants.length} registered tenants across all properties</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Tenant Name</th>
                <th>Property</th>
                <th>Unit / Room</th>
                <th>Phone</th>
                <th>Manager</th>
                <th>Open Issues</th>
                <th>Resolved</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td>{t.property_name}</td>
                  <td>
                    <span className="chip">{t.unit}</span>
                  </td>
                  <td>{t.phone}</td>
                  <td>{t.manager_name}</td>
                  <td style={{ color: (t.open_count || 0) > 0 ? 'var(--amber)' : 'var(--ink-400)', fontWeight: 600 }}>
                    {t.open_count || 0}
                  </td>
                  <td style={{ color: 'var(--moss)', fontWeight: 600 }}>
                    {t.closed_count || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
