"use client";

import { useRef, useState } from "react";
import { Printer, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useSchedules } from "@/lib/hooks/use-settings";
import { getInitials, getInitialsColor } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ABBREV = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScheduleView() {
  const { employees } = useEmployees();
  const { schedules } = useSchedules();
  const printRef = useRef<HTMLDivElement>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  
  // Get current week dates
  const getWeekDates = (offset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day + (offset * 7));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekOffset);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  // Get schedule for an employee on a specific day
  const getEmployeeSchedule = (employeeId: string, dayOfWeek: number) => {
    const schedule = schedules?.find(
      (s) => s.employee_id === employeeId && s.day_of_week === dayOfWeek
    );
    
    if (!schedule || schedule.is_day_off) {
      return null;
    }
    
    return {
      start: schedule.start_time || "9:00am",
      end: schedule.end_time || "5:00pm",
    };
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const weekStartStr = weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const weekEndStr = weekEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Employee Schedule - ${weekStartStr} to ${weekEndStr}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #1e1a2e;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #1e1a2e;
              margin-bottom: 5px;
            }
            .schedule-title {
              font-size: 18px;
              color: #d4a537;
              margin-bottom: 10px;
            }
            .week-range {
              font-size: 14px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px 8px;
              text-align: center;
              vertical-align: top;
            }
            th {
              background-color: #1e1a2e;
              color: white;
              font-weight: 600;
              font-size: 12px;
            }
            th.employee-col {
              text-align: left;
              width: 180px;
            }
            td.employee-cell {
              text-align: left;
              font-weight: 500;
            }
            .employee-role {
              font-size: 11px;
              color: #888;
              font-weight: normal;
            }
            .schedule-time {
              font-size: 11px;
              background: #e8f5e9;
              color: #2e7d32;
              padding: 4px 6px;
              border-radius: 4px;
              display: inline-block;
            }
            .day-off {
              color: #999;
              font-size: 11px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 11px;
              color: #888;
            }
            @media print {
              body { padding: 0; }
              .header { border-bottom-color: #333; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">iTeam Legal Solutions</div>
            <div class="schedule-title">Employee Work Schedule</div>
            <div class="week-range">${weekStartStr} - ${weekEndStr}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th class="employee-col">Employee</th>
                ${weekDates.map((date, i) => `
                  <th>
                    ${DAY_ABBREV[i]}<br>
                    <span style="font-weight: normal; font-size: 11px;">
                      ${date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                    </span>
                  </th>
                `).join("")}
              </tr>
            </thead>
            <tbody>
              ${employees?.filter(e => e.is_active).map(employee => `
                <tr>
                  <td class="employee-cell">
                    ${employee.name}
                    <div class="employee-role">${employee.role}</div>
                  </td>
                  ${weekDates.map((date, dayIndex) => {
                    const schedule = getEmployeeSchedule(employee.id, dayIndex);
                    return `
                      <td>
                        ${schedule 
                          ? `<span class="schedule-time">${schedule.start} - ${schedule.end}</span>`
                          : `<span class="day-off">OFF</span>`
                        }
                      </td>
                    `;
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <div class="footer">
            Generated on ${new Date().toLocaleString("en-US", { 
              month: "long", day: "numeric", year: "numeric",
              hour: "numeric", minute: "2-digit", hour12: true 
            })}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Week Navigation & Print Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-2 bg-[#242038] text-white rounded-lg hover:bg-[#3d3655] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <p className="text-white font-medium">
              {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - {weekEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            {weekOffset === 0 && (
              <p className="text-xs text-[#22c55e]">Current Week</p>
            )}
          </div>
          
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-2 bg-[#242038] text-white rounded-lg hover:bg-[#3d3655] transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 text-sm bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-white font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
        >
          <Printer className="h-4 w-4" />
          Print Schedule
        </button>
      </div>

      {/* Schedule Grid */}
      <div ref={printRef} className="bg-[#242038] rounded-lg border border-[#3d3655] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a1625]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#a0a0b0] uppercase tracking-wider w-48">
                  Employee
                </th>
                {weekDates.map((date, index) => (
                  <th key={index} className="px-3 py-3 text-center text-xs font-semibold text-[#a0a0b0] uppercase tracking-wider">
                    <div>{DAY_ABBREV[index]}</div>
                    <div className="text-[10px] font-normal mt-0.5">
                      {date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees?.filter(e => e.is_active).map((employee, idx) => (
                <tr 
                  key={employee.id} 
                  className={`border-t border-[#3d3655] ${idx % 2 === 0 ? "bg-[#242038]" : "bg-[#1f1b2e]"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: getInitialsColor(employee.name) }}
                      >
                        {getInitials(employee.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{employee.name}</p>
                        <p className="text-xs text-[#a0a0b0]">{employee.role}</p>
                      </div>
                    </div>
                  </td>
                  {weekDates.map((date, dayIndex) => {
                    const schedule = getEmployeeSchedule(employee.id, dayIndex);
                    const isWeekend = dayIndex === 0 || dayIndex === 6;
                    
                    return (
                      <td key={dayIndex} className={`px-3 py-3 text-center ${isWeekend ? "bg-[#1a1625]/50" : ""}`}>
                        {schedule ? (
                          <div className="text-xs bg-[#22c55e]/20 text-[#22c55e] px-2 py-1.5 rounded">
                            {schedule.start}
                            <br />
                            {schedule.end}
                          </div>
                        ) : (
                          <span className="text-xs text-[#6b7280]">OFF</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {(!employees || employees.filter(e => e.is_active).length === 0) && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Calendar className="h-12 w-12 text-[#3d3655] mx-auto mb-3" />
                    <p className="text-[#a0a0b0]">No active employees to display</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-[#a0a0b0]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#22c55e]/20 rounded" />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#1a1625]/50 rounded" />
          <span>Weekend</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#6b7280]">OFF</span>
          <span>Day Off</span>
        </div>
      </div>
    </div>
  );
}
