"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { EmployeeWithSession } from "@/lib/types";
import { formatCurrency, formatHours } from "@/lib/utils";

interface PayrollDashboardProps {
  employees: EmployeeWithSession[];
  weeklyCap?: number;
}

export function PayrollDashboard({ employees, weeklyCap = 1250 }: PayrollDashboardProps) {
  const [isAmountsBlurred, setIsAmountsBlurred] = useState(true);
  // Filter out owner (exempt employee)
  const staffEmployees = employees.filter(e => e.role?.toUpperCase() !== "ADMINISTRATOR");
  const ownerEmployee = employees.find(e => e.role?.toUpperCase() === "ADMINISTRATOR");

  // Calculate staff totals
  const staffDailyHours = staffEmployees.reduce((acc, e) => acc + (e.today_hours || 0), 0);
  const staffWeeklyHours = staffEmployees.reduce((acc, e) => acc + (e.week_hours || 0), 0);
  const staffMonthlyHours = staffEmployees.reduce((acc, e) => acc + (e.month_hours || 0), 0);

  const staffDailyPayroll = staffEmployees.reduce((acc, e) => acc + (e.today_earnings || 0), 0);
  const staffWeeklyPayroll = staffEmployees.reduce((acc, e) => acc + (e.week_earnings || 0), 0);
  const staffMonthlyPayroll = staffEmployees.reduce((acc, e) => acc + (e.month_earnings || 0), 0);

  const remainingBudget = weeklyCap - staffWeeklyPayroll;
  const warningThreshold = weeklyCap * 0.8;
  const progressPercent = Math.min((staffWeeklyPayroll / weeklyCap) * 100, 100);

  return (
    <div className="bg-[#242038] rounded-lg p-6 border border-[#3d3655]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Live Staff Payroll Dashboard</h2>
          <p className="text-xs text-[#d4a537] uppercase tracking-wider">
            Real-Time Labor Cost — Owner Excluded
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#a0a0b0]">Updates live with clock activity</p>
          <p className="text-sm text-white">Weekly Cap: {formatCurrency(weeklyCap)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white">Weekly Staff Payroll</span>
          <span className="text-sm font-medium">
            <span className="text-[#22c55e]">{formatCurrency(staffWeeklyPayroll)} used</span>
            <span className="text-white"> · </span>
            <span className="text-[#22c55e]">{formatCurrency(remainingBudget)} remaining</span>
          </span>
        </div>
        <div className="h-3 bg-[#1a1625] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              staffWeeklyPayroll >= weeklyCap
                ? "bg-[#ef4444]"
                : staffWeeklyPayroll >= warningThreshold
                ? "bg-[#f59e0b]"
                : "bg-[#22c55e]"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1 text-xs text-[#a0a0b0]">
          <span>$0</span>
          <span>80% warning at {formatCurrency(warningThreshold)}</span>
          <span>Cap: {formatCurrency(weeklyCap)}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Staff Hours */}
        <div>
          <h3 className="text-xs font-semibold text-[#d4a537] uppercase tracking-wider mb-3">
            Staff Hours
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1a1625] rounded-lg p-3 text-center">
              <p className="text-xs text-[#a0a0b0] mb-1">Daily</p>
              <p className="text-lg font-bold text-white">{formatHours(staffDailyHours)}</p>
            </div>
            <div className="bg-[#1a1625] rounded-lg p-3 text-center">
              <p className="text-xs text-[#a0a0b0] mb-1">Weekly</p>
              <p className="text-lg font-bold text-white">{formatHours(staffWeeklyHours)}</p>
            </div>
            <div className="bg-[#1a1625] rounded-lg p-3 text-center">
              <p className="text-xs text-[#a0a0b0] mb-1">Monthly</p>
              <p className="text-lg font-bold text-white">{formatHours(staffMonthlyHours)}</p>
            </div>
          </div>
        </div>

        {/* Staff Payroll */}
        <div>
          <h3 className="text-xs font-semibold text-[#d4a537] uppercase tracking-wider mb-3">
            Staff Payroll
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1a1625] rounded-lg p-3 text-center">
              <p className="text-xs text-[#a0a0b0] mb-1">Daily</p>
              <p className="text-lg font-bold text-[#22c55e]">{formatCurrency(staffDailyPayroll)}</p>
            </div>
            <div className="bg-[#1a1625] rounded-lg p-3 text-center">
              <p className="text-xs text-[#a0a0b0] mb-1">Weekly</p>
              <p className="text-lg font-bold text-[#22c55e]">{formatCurrency(staffWeeklyPayroll)}</p>
            </div>
            <div className="bg-[#1a1625] rounded-lg p-3 text-center">
              <p className="text-xs text-[#a0a0b0] mb-1">Monthly</p>
              <p className="text-lg font-bold text-[#22c55e]">{formatCurrency(staffMonthlyPayroll)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Section */}
      {ownerEmployee && (
        <div className="mt-6 pt-4 border-t border-[#3d3655]">
          <p className="text-xs text-[#a0a0b0] uppercase tracking-wider mb-2">
            Owner Time / Owner Earnings — Not Included in Staff Payroll
          </p>
          <div className="flex items-center gap-6">
            <span className="font-semibold text-white">{ownerEmployee.name}</span>
            <span className="text-sm text-[#a0a0b0]">
              Today: {formatHours(ownerEmployee.today_hours || 0)} · {formatCurrency(ownerEmployee.today_earnings || 0)}
            </span>
            <span className="text-sm text-[#a0a0b0]">
              Week: {formatHours(ownerEmployee.week_hours || 0)} · {formatCurrency(ownerEmployee.week_earnings || 0)}
            </span>
            <span className="text-sm text-[#a0a0b0]">
              Month: {formatHours(ownerEmployee.month_hours || 0)} · {formatCurrency(ownerEmployee.month_earnings || 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
