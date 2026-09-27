export interface Property {
  id: string;
  name: string;
  type: 'PG' | 'Residential' | 'Commercial';
  address: string;
  manager_name: string;
  tenant_count?: number;
  open_complaints_count?: number;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  property_id: string;
  unit: string;
  property_name?: string;
  property_address?: string;
  manager_name?: string;
  open_count?: number;
  closed_count?: number;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  categories: string[];
  rating: number;
  jobs_done: number;
  active_jobs_count?: number;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  default_vendor_id?: string;
  count?: number;
}

export type ComplaintStatus = 'Submitted' | 'Assigned' | 'In Progress' | 'Completed' | 'Closed';

export interface Complaint {
  id: string;
  tenant_id: string;
  property_id: string;
  unit: string;
  category_id: string;
  description: string;
  status: ComplaintStatus;
  vendor_id?: string;
  created_at: string;
  assigned_at?: string;
  started_at?: string;
  completed_at?: string;
  verified_at?: string;
  closed_at?: string;
  before_photos: string[];
  after_photos: string[];
  materials_used?: string;
  completion_notes?: string;
  rating?: number;
  feedback?: string;
  
  // Joined fields
  tenant_name?: string;
  tenant_phone?: string;
  property_name?: string;
  property_address?: string;
  property_type?: string;
  manager_name?: string;
  vendor_name?: string;
  vendor_phone?: string;
  vendor_rating?: number;
  category_name?: string;
  category_emoji?: string;
}

export interface DashboardSummary {
  kpis: {
    totalProperties: number;
    totalTenants: number;
    openComplaints: number;
    closedThisMonth: number;
    averageRating: string;
  };
  categoryDistribution: Array<{
    id: string;
    name: string;
    emoji: string;
    count: number;
  }>;
  trend: Array<{
    label: string;
    raised: number;
    closed: number;
  }>;
  recentComplaints: Complaint[];
}
