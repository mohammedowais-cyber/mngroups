-- MN GROUPS PostgreSQL Schema
-- Database schema for PG, Residential, and Commercial Property Maintenance

CREATE TABLE IF NOT EXISTS properties (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('PG', 'Residential', 'Commercial')),
  address TEXT NOT NULL,
  manager_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  jobs_done INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL DEFAULT '📋',
  default_vendor_id VARCHAR(64) REFERENCES vendors(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  property_id VARCHAR(64) REFERENCES properties(id) ON DELETE CASCADE,
  unit VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE RESTRICT,
  property_id VARCHAR(64) REFERENCES properties(id) ON DELETE RESTRICT,
  unit VARCHAR(100) NOT NULL,
  category_id VARCHAR(64) REFERENCES categories(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Submitted', 'Assigned', 'In Progress', 'Completed', 'Closed')),
  vendor_id VARCHAR(64) REFERENCES vendors(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  assigned_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  before_photos TEXT[] NOT NULL DEFAULT '{}',
  after_photos TEXT[] NOT NULL DEFAULT '{}',
  materials_used TEXT DEFAULT '',
  completion_notes TEXT DEFAULT '',
  rating INT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  feedback TEXT DEFAULT ''
);

-- Indexes for lightning-fast queries across mobile apps and admin dashboard
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_tenant_id ON complaints(tenant_id);
CREATE INDEX IF NOT EXISTS idx_complaints_vendor_id ON complaints(vendor_id);
CREATE INDEX IF NOT EXISTS idx_complaints_property_id ON complaints(property_id);
CREATE INDEX IF NOT EXISTS idx_complaints_category_id ON complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
