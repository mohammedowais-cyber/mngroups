import React from 'react';
import { Property } from '../types';

interface PropertiesPageProps {
  properties: Property[];
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ properties }) => {
  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="admin-h1">Managed Properties</div>
          <div className="admin-sub">{properties.length} active sites across PG, Residential, and Commercial</div>
        </div>
      </div>

      <div className="vendor-grid">
        {properties.map(p => (
          <div key={p.id} className="vendor-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="vendor-name">🏢 {p.name}</div>
              <span 
                className="chip" 
                style={{ 
                  background: p.type === 'PG' ? 'rgba(47, 107, 166, 0.12)' : p.type === 'Residential' ? 'rgba(52, 122, 92, 0.12)' : 'rgba(179, 122, 28, 0.12)',
                  color: p.type === 'PG' ? 'var(--sky)' : p.type === 'Residential' ? 'var(--moss)' : 'var(--amber)',
                  fontWeight: 600
                }}
              >
                {p.type}
              </span>
            </div>

            <div className="help-text">📍 {p.address}</div>

            <div style={{ height: '1px', background: 'var(--line)', margin: '4px 0' }} />

            <div style={{ fontSize: '13px' }}>
              <strong>Property Manager:</strong> {p.manager_name}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '13px', color: 'var(--ink-600)' }}>
              <span>👥 {p.tenant_count || 0} Tenants</span>
              <span>⚠️ {p.open_complaints_count || 0} Open Issue{(p.open_complaints_count || 0) === 1 ? '' : 's'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
