"use client";

import { X } from "lucide-react";
import { useEmployees } from "@/lib/hooks/use-employees";
import { formatCurrency, formatHours } from "@/lib/utils";

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PayrollModal({ isOpen, onClose }: PayrollModalProps) {
  const { employees } = useEmployees();

  if (!isOpen) return null;

  const staffEmployees = employees.filter(e => e.role?.toUpperCase() !== "ADMINISTRATOR");
  
  const totalWeeklyHours = staffEmployees.reduce((acc, e) => acc + (e.week_hours || 0), 0);
  const totalWeeklyEarnings = staffEmployees.reduce((acc, e) => acc + (e.week_earnings || 0), 0);
  const totalOvertimeHours = staffEmployees.reduce((acc, e) => Math.max(0, (e.week_hours || 0) - 40), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#242038] rounded-lg border border-[#3d3655] w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3d3655]">
          <div>
            <h2 className="text-xl font-bold text-white">Payroll Report</h2>
            <p className="text-sm text-[#d4a537]">Weekly Staff Earnings Summary</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#a0a0b0] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1a1625] rounded-lg p-4 text-center">
              <p className="text-xs text-[#a0a0b0] uppercase mb-1">Total Hours</p>
              <p className="text-2xl font-bold text-white">{formatHours(totalWeeklyHours)}</p>
            </div>
            <div className="bg-[#1a1625] rounded-lg p-4 text-center">
              <p className="text-xs text-[#a0a0b0] uppercase mb-1">Overtime Hours</p>
              <p className="text-2xl font-bold text-[#f59e0b]">{formatHours(totalOvertimeHours)}</p>
            </div>
            <div className="bg-[#1a1625] rounded-lg p-4 text-center">
              <p className="text-xs text-[#a0a0b0] uppercase mb-1">Total Payroll</p>
              <p className="text-2xl font-bold text-[#22c55e]">{formatCurrency(totalWeeklyEarnings)}</p>
            </div>
          </div>

          {/* Employee Table */}
          <div className="bg-[#1a1625] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3d3655]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#d4a537] uppercase">Employee</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#d4a537] uppercase">Hours</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#d4a537] uppercase">OT Hours</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#d4a537] uppercase">Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#d4a537] uppercase">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {staffEmployees.map((employee) => {
                  const otHours = Math.max(0, (employee.week_hours || 0) - 40);
                  return (
                    <tr key={employee.id} className="border-b border-[#3d3655]/50">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{employee.name}</p>
                        <p className="text-xs text-[#a0a0b0]">{employee.role}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-white">
                        {formatHours(employee.week_hours || 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-[#f59e0b]">
                        {otHours > 0 ? formatHours(otHours) : "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-[#a0a0b0]">
                        {formatCurrency(employee.hourly_rate)}/hr
                      </td>
                      <td className="px-4 py-3 text-right text-[#22c55e] font-medium">
                        {formatCurrency(employee.week_earnings || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[#242038]">
                  <td className="px-4 py-3 text-white font-bold">Total</td>
                  <td className="px-4 py-3 text-right text-white font-bold">
                    {formatHours(totalWeeklyHours)}
                  </td>
                  <td className="px-4 py-3 text-right text-[#f59e0b] font-bold">
                    {formatHours(totalOvertimeHours)}
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right text-[#22c55e] font-bold">
                    {formatCurrency(totalWeeklyEarnings)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#3d3655]">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#6b7280] text-white font-medium rounded-lg hover:bg-[#4b5563] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
