"use client";

import { Calendar } from "lucide-react";

export function ScheduleView() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-[#a0a0b0] uppercase tracking-wider mb-1">
          iTeam Legal Solutions — Schedule Manager
        </p>
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-[#d4a537] uppercase tracking-wider">
            Employee Schedules
          </h1>
          <div className="flex-1 gold-line" />
        </div>
      </div>

      <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-12 text-center">
        <Calendar className="h-12 w-12 text-[#3b82f6] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white">Schedule Manager</h3>
        <p className="mt-1 text-sm text-[#a0a0b0]">
          Manage employee work schedules and shifts.
        </p>
      </div>
    </div>
  );
}
