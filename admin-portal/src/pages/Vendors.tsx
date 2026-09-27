import React from 'react';
import { Vendor, Category } from '../types';

interface VendorsPageProps {
  vendors: Vendor[];
  categories: Category[];
}

export const VendorsPage: React.FC<VendorsPageProps> = ({ vendors, categories }) => {
  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? `${cat.emoji} ${cat.name}` : id;
  };

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="admin-h1">Vendor Roster</div>
          <div className="admin-sub">{vendors.length} certified maintenance contractors &amp; service crews</div>
        </div>
      </div>

      <div className="vendor-grid">
        {vendors.map(v => (
          <div key={v.id} className="vendor-card">
            <div className="vendor-name">{v.name}</div>
            
            <div className="vendor-cats">
              {v.categories.map(catId => (
                <span key={catId} className="chip">
                  {getCategoryName(catId)}
                </span>
              ))}
            </div>

            <div className="vendor-rating">
              <span>★</span>
              <span>{v.rating}</span>
              <span style={{ color: 'var(--ink-400)', fontWeight: 400 }}>· {v.jobs_done} jobs completed</span>
            </div>

            <div style={{ height: '1px', background: 'var(--line)', margin: '4px 0' }} />

            <div className="help-text">📞 {v.phone}</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--navy-700)' }}>
              ⚡ {v.active_jobs_count || 0} active job{(v.active_jobs_count || 0) === 1 ? '' : 's'} assigned
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
