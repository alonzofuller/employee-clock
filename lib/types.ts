// Database types for Employee Clock application

export interface Employee {
  id: string;
  name: string;
  role: string;
  hourly_rate: number;
  overtime_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSession {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  break_start: string | null;
  break_end: string | null;
  total_break_minutes: number;
  status: 'working' | 'on_break' | 'completed';
  is_overtime: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  employee_id: string | null;
  employee_name: string;
  action: string;
  details: Record<string, unknown> | null;
  performed_by: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  employee_id: string;
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  is_day_off: boolean;
  created_at: string;
  updated_at: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  is_paid: boolean;
  created_at: string;
}

export interface PayrollPeriod {
  id: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'processing' | 'closed';
  total_hours: number;
  total_overtime_hours: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
  closed_at: string | null;
}

export interface OperatingCost {
  id: string;
  month: string;
  amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppSession {
  id: string;
  session_type: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number;
  status: 'running' | 'paused' | 'stopped';
  notes: string | null;
  created_at: string;
}

// Extended types with computed fields
export interface EmployeeWithSession extends Employee {
  current_session?: TimeSession | null;
  today_hours?: number;
  week_hours?: number;
  today_earnings?: number;
}

// Form types
export interface EmployeeFormData {
  name: string;
  role: string;
  hourly_rate: number;
  overtime_rate: number;
}

export interface CorrectionFormData {
  employee_id: string;
  session_id?: string;
  clock_in: string;
  clock_out: string;
  reason: string;
}

export interface HolidayFormData {
  name: string;
  date: string;
  is_paid: boolean;
}

// UI State types
export type TabType = 'employees' | 'payroll' | 'audit' | 'settings';

export interface TimerState {
  status: 'running' | 'paused' | 'stopped';
  elapsedSeconds: number;
  startTime: string | null;
}
