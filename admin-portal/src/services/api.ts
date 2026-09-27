import { Complaint, DashboardSummary, Property, Tenant, Vendor, Category, ComplaintStatus } from '../types';
import { initialProperties, initialVendors, initialCategories, initialTenants, initialComplaints, getMockDashboardSummary } from '../data/mockSeed';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = BASE_URL ? `${BASE_URL.replace(/\/+$/, '')}/api` : '/api';

// In-memory state for offline/Vercel demo fallback
let mockComplaints = [...initialComplaints];
let mockVendors = [...initialVendors];

export const api = {
  async createComplaint(data: { tenant_id: string; category_id: string; description: string; before_photos?: string[] }): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback to local store
    }

    const tenant = initialTenants.find(t => t.id === data.tenant_id) || initialTenants[0];
    const category = initialCategories.find(c => c.id === data.category_id) || initialCategories[0];
    const vendor = initialVendors.find(v => v.id === category.default_vendor_id) || initialVendors[0];
    const property = initialProperties.find(p => p.id === tenant.property_id) || initialProperties[0];

    const newId = `MC-2026-${String(mockComplaints.length + 129).padStart(5, '0')}`;
    const newComplaint: Complaint = {
      id: newId,
      tenant_id: data.tenant_id,
      property_id: tenant.property_id,
      unit: tenant.unit,
      category_id: data.category_id,
      description: data.description,
      status: 'Assigned',
      vendor_id: vendor.id,
      created_at: new Date().toISOString(),
      assigned_at: new Date().toISOString(),
      before_photos: data.before_photos || [],
      after_photos: [],
      tenant_name: tenant.name,
      tenant_phone: tenant.phone,
      property_name: property.name,
      property_address: property.address,
      property_type: property.type,
      manager_name: property.manager_name,
      vendor_name: vendor.name,
      vendor_phone: vendor.phone,
      vendor_rating: vendor.rating,
      category_name: category.name,
      category_emoji: category.emoji
    };

    mockComplaints.unshift(newComplaint);
    return newComplaint;
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      if (res.ok) return await res.json();
    } catch {}
    return getMockDashboardSummary(mockComplaints);
  },

  async getComplaints(filters?: { status?: string; category_id?: string; search?: string }): Promise<Complaint[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.category_id && filters.category_id !== 'all') params.append('category_id', filters.category_id);
      if (filters?.search) params.append('search', filters.search);

      const res = await fetch(`${API_BASE}/complaints?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}

    let list = [...mockComplaints];
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(c => c.status.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters?.category_id && filters.category_id !== 'all') {
      list = list.filter(c => c.category_id === filters.category_id);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.tenant_name && c.tenant_name.toLowerCase().includes(q)) ||
        (c.property_name && c.property_name.toLowerCase().includes(q))
      );
    }
    return list;
  },

  async getComplaint(id: string): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`);
      if (res.ok) return await res.json();
    } catch {}

    const found = mockComplaints.find(c => c.id === id);
    if (!found) throw new Error(`Complaint ${id} not found`);
    return found;
  },

  async getProperties(): Promise<Property[]> {
    try {
      const res = await fetch(`${API_BASE}/properties`);
      if (res.ok) return await res.json();
    } catch {}
    return initialProperties;
  },

  async getTenants(): Promise<Tenant[]> {
    try {
      const res = await fetch(`${API_BASE}/tenants`);
      if (res.ok) return await res.json();
    } catch {}
    return initialTenants;
  },

  async getVendors(): Promise<Vendor[]> {
    try {
      const res = await fetch(`${API_BASE}/vendors`);
      if (res.ok) return await res.json();
    } catch {}
    return mockVendors;
  },

  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) return await res.json();
    } catch {}
    return initialCategories;
  },

  async startJob(id: string): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/start`, { method: 'PATCH' });
      if (res.ok) return await res.json();
    } catch {}

    const c = mockComplaints.find(x => x.id === id);
    if (c) {
      c.status = 'In Progress';
      c.started_at = new Date().toISOString();
      return { ...c };
    }
    throw new Error('Complaint not found');
  },

  async completeJob(id: string, data: { after_photos: string[]; materials_used?: string; completion_notes: string }): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}

    const c = mockComplaints.find(x => x.id === id);
    if (c) {
      c.status = 'Completed';
      c.after_photos = data.after_photos;
      c.materials_used = data.materials_used;
      c.completion_notes = data.completion_notes;
      c.completed_at = new Date().toISOString();
      return { ...c };
    }
    throw new Error('Complaint not found');
  },

  async verifyJob(id: string, data: { rating: number; feedback?: string }): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}

    const c = mockComplaints.find(x => x.id === id);
    if (c) {
      c.status = 'Closed' as ComplaintStatus;
      c.rating = data.rating;
      c.feedback = data.feedback;
      c.verified_at = new Date().toISOString();
      c.closed_at = new Date().toISOString();

      // Recalculate vendor rating
      const v = mockVendors.find(vend => vend.id === c.vendor_id);
      if (v) {
        v.jobs_done += 1;
        v.rating = Number(((v.rating * (v.jobs_done - 1) + data.rating) / v.jobs_done).toFixed(1));
      }

      return { ...c };
    }
    throw new Error('Complaint not found');
  }
};
