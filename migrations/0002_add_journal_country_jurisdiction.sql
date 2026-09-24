-- Migration: Add country and jurisdiction columns to journals table
ALTER TABLE journals ADD COLUMN country TEXT DEFAULT 'US';
ALTER TABLE journals ADD COLUMN jurisdiction TEXT DEFAULT 'US';
