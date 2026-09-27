import { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { Complaint, DashboardSummary, Property, Tenant, Vendor, Category } from './types';
import { Topbar, AppRole } from './components/Topbar';
import { Sidebar, AdminView } from './components/Sidebar';
import { ComplaintModal } from './components/ComplaintModal';
import { DashboardPage } from './pages/Dashboard';
import { ComplaintsPage } from './pages/Complaints';
import { VendorsPage } from './pages/Vendors';
import { PropertiesPage } from './pages/Properties';
import { TenantsPage } from './pages/Tenants';
import { TenantApp } from './components/TenantApp';
import { VendorApp } from './components/VendorApp';
import './styles/index.css';

export function App() {
  const [appRole, setAppRole] = useState<AppRole>('tenant');
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [activeTenantId, setActiveTenantId] = useState<string>('t1');
  const [activeVendorId, setActiveVendorId] = useState<string>('v1');
  
  const [activeModalComplaint, setActiveModalComplaint] = useState<Complaint | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryData, complaintsData, propertiesData, tenantsData, vendorsData, categoriesData] = await Promise.all([
        api.getDashboardSummary(),
        api.getComplaints(),
        api.getProperties(),
        api.getTenants(),
        api.getVendors(),
        api.getCategories()
      ]);

      setDashboardSummary(summaryData);
      setComplaints(complaintsData);
      setProperties(propertiesData);
      setTenants(tenantsData);
      setVendors(vendorsData);
      setCategories(categoriesData);

      if (tenantsData.length > 0 && !tenantsData.some(t => t.id === activeTenantId)) {
        setActiveTenantId(tenantsData[0].id);
      }
      if (vendorsData.length > 0 && !vendorsData.some(v => v.id === activeVendorId)) {
        setActiveVendorId(vendorsData[0].id);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      showToast('⚠️ Could not connect to API server. Retrying...');
    } finally {
      setLoading(false);
    }
  }, [activeTenantId, activeVendorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tenant action: Submit complaint
  const handleSubmitComplaint = async (categoryId: string, description: string, photos: string[]) => {
    await api.createComplaint({
      tenant_id: activeTenantId,
      category_id: categoryId,
      description,
      before_photos: photos
    });

    await loadData();
  };

  // Tenant action: Verify and rate
  const handleVerifyComplaint = async (complaintId: string, rating: number, feedback: string) => {
    await api.verifyJob(complaintId, { rating, feedback });
    await loadData();
  };

  // Vendor action: Start job
  const handleStartJob = async (complaintId: string) => {
    await api.startJob(complaintId);
    await loadData();
  };

  // Vendor action: Complete job
  const handleCompleteJob = async (complaintId: string, photos: string[], materials: string, notes: string) => {
    await api.completeJob(complaintId, {
      after_photos: photos,
      materials_used: materials,
      completion_notes: notes
    });
    await loadData();
  };

  const handleFilterChange = async (status: string, category_id: string, search: string) => {
    try {
      const filtered = await api.getComplaints({ status, category_id, search });
      setComplaints(filtered);
    } catch (err: any) {
      showToast('Error applying filters');
    }
  };

  return (
    <div className="app-container">
      <Topbar 
        currentRole={appRole} 
        onSelectRole={(role) => {
          setAppRole(role);
          loadData();
        }}
        onRefresh={loadData} 
      />

      {loading && !dashboardSummary ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-400)' }}>
          Connecting to PostgreSQL database &amp; loading live state...
        </div>
      ) : (
        <>
          {/* TENANT APP VIEW */}
          {appRole === 'tenant' && (
            <TenantApp
              tenants={tenants}
              currentTenantId={activeTenantId}
              onSwitchTenant={(id) => setActiveTenantId(id)}
              complaints={complaints}
              categories={categories}
              onSubmitComplaint={handleSubmitComplaint}
              onVerifyComplaint={handleVerifyComplaint}
              onToast={showToast}
            />
          )}

          {/* VENDOR APP VIEW */}
          {appRole === 'vendor' && (
            <VendorApp
              vendors={vendors}
              currentVendorId={activeVendorId}
              onSwitchVendor={(id) => setActiveVendorId(id)}
              complaints={complaints}
              categories={categories}
              onStartJob={handleStartJob}
              onCompleteJob={handleCompleteJob}
              onToast={showToast}
            />
          )}

          {/* ADMIN PORTAL VIEW */}
          {appRole === 'admin' && (
            <div className="admin-shell">
              <Sidebar 
                currentView={currentView} 
                onSelectView={(view) => {
                  setCurrentView(view);
                  if (view === 'dashboard' || view === 'complaints') {
                    loadData();
                  }
                }}
                onNotifySoon={(moduleName) => {
                  showToast(`"${moduleName}" module is planned for Phase 5 (future release).`);
                }}
              />

              <main className="admin-main">
                {currentView === 'dashboard' && (
                  <DashboardPage 
                    summary={dashboardSummary} 
                    onOpenComplaint={(c) => setActiveModalComplaint(c)}
                    onViewAllComplaints={() => setCurrentView('complaints')}
                  />
                )}

                {currentView === 'complaints' && (
                  <ComplaintsPage 
                    complaints={complaints}
                    categories={categories}
                    onOpenComplaint={(c) => setActiveModalComplaint(c)}
                    onFilterChange={handleFilterChange}
                  />
                )}

                {currentView === 'vendors' && (
                  <VendorsPage vendors={vendors} categories={categories} />
                )}

                {currentView === 'properties' && (
                  <PropertiesPage properties={properties} />
                )}

                {currentView === 'tenants' && (
                  <TenantsPage tenants={tenants} />
                )}
              </main>
            </div>
          )}
        </>
      )}

      {activeModalComplaint && (
        <ComplaintModal 
          complaint={activeModalComplaint} 
          onClose={() => setActiveModalComplaint(null)} 
        />
      )}

      {toastMessage && (
        <div className="toast-wrap">
          <div className="toast">
            <span className="dot" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
