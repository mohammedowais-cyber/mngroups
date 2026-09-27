import React from 'react';

export type AppRole = 'tenant' | 'vendor' | 'admin';

interface TopbarProps {
  currentRole: AppRole;
  onSelectRole: (role: AppRole) => void;
  onRefresh?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ currentRole, onSelectRole, onRefresh }) => {
  const getSubtitle = () => {
    switch (currentRole) {
      case 'tenant':
        return 'Tenant app';
      case 'vendor':
        return 'Vendor app';
      case 'admin':
        return 'Admin & manager portal';
    }
  };

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">MN</div>
        <div>
          <div className="brand-word">MN Groups</div>
          <div className="brand-sub">{getSubtitle()}</div>
        </div>
      </div>

      <div className="role-switch">
        <button
          className={currentRole === 'tenant' ? 'active' : ''}
          onClick={() => onSelectRole('tenant')}
        >
          Tenant
        </button>
        <button
          className={currentRole === 'vendor' ? 'active' : ''}
          onClick={() => onSelectRole('vendor')}
        >
          Vendor
        </button>
        <button
          className={currentRole === 'admin' ? 'active' : ''}
          onClick={() => onSelectRole('admin')}
        >
          Admin
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <a
          href="/mngroups-debug.apk"
          download="mngroups-debug.apk"
          style={{
            background: 'linear-gradient(135deg, #B8902E, #98741F)',
            border: 'none',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontSize: '12.5px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(184, 144, 46, 0.3)'
          }}
          title="Download MN Groups Android App (.apk)"
        >
          📥 Download APK
        </a>

        <button
          onClick={onRefresh}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '999px',
            cursor: 'pointer',
            fontSize: '12.5px',
            fontWeight: 500
          }}
          title="Refresh live data from PostgreSQL"
        >
          🔄 Sync
        </button>
      </div>
    </header>
  );
};
