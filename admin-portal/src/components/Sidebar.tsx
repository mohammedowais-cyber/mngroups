import React from 'react';

export type AdminView = 'dashboard' | 'complaints' | 'vendors' | 'properties' | 'tenants';

interface SidebarProps {
  currentView: AdminView;
  onSelectView: (view: AdminView) => void;
  onNotifySoon: (moduleName: string) => void;
}

const NAV_ITEMS: Array<{ id: AdminView; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'complaints', label: 'Complaints', icon: '📋' },
  { id: 'vendors', label: 'Vendors', icon: '🔧' },
  { id: 'properties', label: 'Properties', icon: '🏢' },
  { id: 'tenants', label: 'Tenants', icon: '👥' }
];

const SOON_ITEMS = [
  { label: 'Finance', icon: '📈' },
  { label: 'Inventory', icon: '📦' },
  { label: 'Documents', icon: '📄' },
  { label: 'Settings', icon: '⚙️' }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, onNotifySoon }) => {
  return (
    <aside className="sidebar">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`side-link ${currentView === item.id ? 'active' : ''}`}
          onClick={() => onSelectView(item.id)}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}

      <div className="side-note">Later Phase Modules</div>

      {SOON_ITEMS.map(item => (
        <button
          key={item.label}
          className="side-link disabled"
          onClick={() => onNotifySoon(item.label)}
          title="Coming in a later phase"
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </aside>
  );
};
