-- Add new fields to employees table for extended profile
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS hire_date DATE,
ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'hourly' CHECK (employment_type IN ('hourly', 'salary', 'contract')),
ADD COLUMN IF NOT EXISTS pay_type TEXT DEFAULT 'hourly' CHECK (pay_type IN ('hourly', 'salary'));

-- Add status field to holidays table for Texas State/Federal holiday categorization
ALTER TABLE holidays
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'all_closed' CHECK (status IN ('all_closed', 'optional', 'skeleton_crew', 'federal')),
ADD COLUMN IF NOT EXISTS holiday_type TEXT DEFAULT 'company' CHECK (holiday_type IN ('federal', 'state', 'company'));

-- Update schedules table to ensure proper time handling
ALTER TABLE schedules
ALTER COLUMN start_time TYPE TIME USING start_time::TIME,
ALTER COLUMN end_time TYPE TIME USING end_time::TIME;
