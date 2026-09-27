import { Property, Tenant, Vendor, Category, Complaint, DashboardSummary } from '../types';

export const initialProperties: Property[] = [
  { id: 'p1', name: 'Galaxy PG', type: 'PG', address: 'Koramangala, Bengaluru', manager_name: 'Deepa R.', tenant_count: 2, open_complaints_count: 3 },
  { id: 'p2', name: 'Sunrise Residency', type: 'Residential', address: 'Andheri West, Mumbai', manager_name: 'Vikram S.', tenant_count: 1, open_complaints_count: 2 },
  { id: 'p3', name: 'Green Heights', type: 'Residential', address: 'Indiranagar, Bengaluru', manager_name: 'Deepa R.', tenant_count: 1, open_complaints_count: 1 },
  { id: 'p4', name: 'Orchid Towers', type: 'Commercial', address: 'Powai, Mumbai', manager_name: 'Vikram S.', tenant_count: 1, open_complaints_count: 1 }
];

export const initialVendors: Vendor[] = [
  { id: 'v1', name: 'XYZ Plumbing Services', phone: '+91 98765 43210', categories: ['plumbing'], rating: 4.6, jobs_done: 58, active_jobs_count: 1 },
  { id: 'v2', name: 'ABC Electricals', phone: '+91 91234 56780', categories: ['electrical'], rating: 4.4, jobs_done: 71, active_jobs_count: 1 },
  { id: 'v3', name: 'Royal Carpentry', phone: '+91 99887 76655', categories: ['carpentry'], rating: 4.8, jobs_done: 33, active_jobs_count: 0 },
  { id: 'v4', name: 'FreshCoat Painters', phone: '+91 90000 11122', categories: ['painting'], rating: 4.3, jobs_done: 22, active_jobs_count: 0 },
  { id: 'v5', name: 'SparkleClean Co', phone: '+91 93456 78901', categories: ['cleaning'], rating: 4.5, jobs_done: 64, active_jobs_count: 0 },
  { id: 'v6', name: 'CoolAir HVAC', phone: '+91 97766 55443', categories: ['ac'], rating: 4.2, jobs_done: 19, active_jobs_count: 0 },
  { id: 'v7', name: 'General Fix-it Crew', phone: '+91 90909 09090', categories: ['civil', 'internet', 'appliances', 'security', 'other'], rating: 4.0, jobs_done: 41, active_jobs_count: 0 }
];

export const initialCategories: Category[] = [
  { id: 'electrical', name: 'Electrical', emoji: '⚡', default_vendor_id: 'v2', count: 3 },
  { id: 'plumbing', name: 'Plumbing', emoji: '🔧', default_vendor_id: 'v1', count: 4 },
  { id: 'carpentry', name: 'Carpentry', emoji: '🪚', default_vendor_id: 'v3', count: 2 },
  { id: 'painting', name: 'Painting', emoji: '🎨', default_vendor_id: 'v4', count: 1 },
  { id: 'cleaning', name: 'Cleaning', emoji: '🧹', default_vendor_id: 'v5', count: 1 },
  { id: 'civil', name: 'Civil work', emoji: '🏗️', default_vendor_id: 'v7', count: 0 },
  { id: 'internet', name: 'Internet', emoji: '📶', default_vendor_id: 'v7', count: 1 },
  { id: 'ac', name: 'Air conditioning', emoji: '❄️', default_vendor_id: 'v6', count: 1 },
  { id: 'appliances', name: 'Appliances', emoji: '🔌', default_vendor_id: 'v7', count: 0 },
  { id: 'security', name: 'Security', emoji: '🛡️', default_vendor_id: 'v7', count: 0 },
  { id: 'other', name: 'Other', emoji: '📋', default_vendor_id: 'v7', count: 0 }
];

export const initialTenants: Tenant[] = [
  { id: 't1', name: 'Rahul Kumar', phone: '+91 98765 12340', property_id: 'p1', unit: 'Room 202', property_name: 'Galaxy PG', property_address: 'Koramangala, Bengaluru', manager_name: 'Deepa R.', open_count: 1, closed_count: 2 },
  { id: 't2', name: 'Neha Singh', phone: '+91 91234 55667', property_id: 'p2', unit: 'Flat 101', property_name: 'Sunrise Residency', property_address: 'Andheri West, Mumbai', manager_name: 'Vikram S.', open_count: 1, closed_count: 1 },
  { id: 't3', name: 'Amit Patel', phone: '+91 99887 22110', property_id: 'p3', unit: 'Unit 203', property_name: 'Green Heights', property_address: 'Indiranagar, Bengaluru', manager_name: 'Deepa R.', open_count: 0, closed_count: 1 },
  { id: 't4', name: 'Priya Nair', phone: '+91 90000 44556', property_id: 'p1', unit: 'Room 118', property_name: 'Galaxy PG', property_address: 'Koramangala, Bengaluru', manager_name: 'Deepa R.', open_count: 1, closed_count: 0 },
  { id: 't5', name: 'Sanjay Mehta', phone: '+91 93456 77889', property_id: 'p4', unit: 'Flat 405', property_name: 'Orchid Towers', property_address: 'Powai, Mumbai', manager_name: 'Vikram S.', open_count: 1, closed_count: 0 }
];

export const initialComplaints: Complaint[] = [
  {
    id: 'MC-2026-00125',
    tenant_id: 't1',
    property_id: 'p1',
    unit: 'Room 202',
    category_id: 'plumbing',
    description: 'Bathroom tap is leaking continuously, water pooling on the floor.',
    status: 'In Progress',
    vendor_id: 'v1',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    assigned_at: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
    started_at: new Date(Date.now() - 86400000).toISOString(),
    before_photos: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'],
    after_photos: [],
    tenant_name: 'Rahul Kumar',
    tenant_phone: '+91 98765 12340',
    property_name: 'Galaxy PG',
    property_address: 'Koramangala, Bengaluru',
    property_type: 'PG',
    manager_name: 'Deepa R.',
    vendor_name: 'XYZ Plumbing Services',
    vendor_phone: '+91 98765 43210',
    vendor_rating: 4.6,
    category_name: 'Plumbing',
    category_emoji: '🔧'
  },
  {
    id: 'MC-2026-00126',
    tenant_id: 't2',
    property_id: 'p2',
    unit: 'Flat 101',
    category_id: 'electrical',
    description: 'Power socket in the living room sparks when a plug is inserted.',
    status: 'Assigned',
    vendor_id: 'v2',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    assigned_at: new Date(Date.now() - 80000000).toISOString(),
    before_photos: [],
    after_photos: [],
    tenant_name: 'Neha Singh',
    tenant_phone: '+91 91234 55667',
    property_name: 'Sunrise Residency',
    property_address: 'Andheri West, Mumbai',
    property_type: 'Residential',
    manager_name: 'Vikram S.',
    vendor_name: 'ABC Electricals',
    vendor_phone: '+91 91234 56780',
    vendor_rating: 4.4,
    category_name: 'Electrical',
    category_emoji: '⚡'
  },
  {
    id: 'MC-2026-00127',
    tenant_id: 't3',
    property_id: 'p3',
    unit: 'Unit 203',
    category_id: 'carpentry',
    description: 'Kitchen cabinet door has come off its hinge.',
    status: 'Completed',
    vendor_id: 'v3',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    assigned_at: new Date(Date.now() - 6 * 86400000 + 3600000).toISOString(),
    started_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    before_photos: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80'],
    after_photos: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80'],
    materials_used: '2x heavy duty steel hinges, wood screws',
    completion_notes: 'Realigned door, installed new reinforced hinges.',
    tenant_name: 'Amit Patel',
    tenant_phone: '+91 99887 22110',
    property_name: 'Green Heights',
    property_address: 'Indiranagar, Bengaluru',
    property_type: 'Residential',
    manager_name: 'Deepa R.',
    vendor_name: 'Royal Carpentry',
    vendor_phone: '+91 99887 76655',
    vendor_rating: 4.8,
    category_name: 'Carpentry',
    category_emoji: '🪚'
  },
  {
    id: 'MC-2026-00128',
    tenant_id: 't1',
    property_id: 'p1',
    unit: 'Room 202',
    category_id: 'cleaning',
    description: 'Deep cleaning required for common balcony and AC vents.',
    status: 'Closed',
    vendor_id: 'v5',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    assigned_at: new Date(Date.now() - 10 * 86400000 + 1800000).toISOString(),
    started_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    verified_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    closed_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    before_photos: [],
    after_photos: [],
    rating: 5,
    feedback: 'Very thorough cleaning. Balcony looks brand new!',
    tenant_name: 'Rahul Kumar',
    tenant_phone: '+91 98765 12340',
    property_name: 'Galaxy PG',
    property_address: 'Koramangala, Bengaluru',
    property_type: 'PG',
    manager_name: 'Deepa R.',
    vendor_name: 'SparkleClean Co',
    vendor_phone: '+91 93456 78901',
    vendor_rating: 4.5,
    category_name: 'Cleaning',
    category_emoji: '🧹'
  }
];

export function getMockDashboardSummary(complaints: Complaint[]): DashboardSummary {
  const openCount = complaints.filter(c => c.status !== 'Closed').length;
  const closedCount = complaints.filter(c => c.status === 'Closed').length;
  
  const categoryCounts: Record<string, number> = {};
  initialCategories.forEach(cat => { categoryCounts[cat.id] = 0; });
  complaints.forEach(c => {
    categoryCounts[c.category_id] = (categoryCounts[c.category_id] || 0) + 1;
  });

  return {
    kpis: {
      totalProperties: initialProperties.length,
      totalTenants: initialTenants.length,
      openComplaints: openCount,
      closedThisMonth: closedCount + 6,
      averageRating: '4.7'
    },
    categoryDistribution: initialCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      count: categoryCounts[cat.id] || 0
    })),
    trend: [
      { label: 'Week 1', raised: 14, closed: 12 },
      { label: 'Week 2', raised: 18, closed: 16 },
      { label: 'Week 3', raised: 12, closed: 15 },
      { label: 'Week 4', raised: 22, closed: 19 },
      { label: 'Week 5', raised: 16, closed: 18 },
      { label: 'Week 6', raised: complaints.length, closed: closedCount }
    ],
    recentComplaints: complaints.slice(0, 5)
  };
}
