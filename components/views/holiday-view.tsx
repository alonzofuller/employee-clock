"use client";

import { useState } from "react";
import { Plus, CalendarDays, Trash2, Building2, Flag, AlertCircle, Users, XCircle } from "lucide-react";
import { useHolidays } from "@/lib/hooks/use-settings";
import type { Holiday } from "@/lib/types";

// Texas State Holidays FY2026 (Sept 1, 2025 - Aug 31, 2026)
const TEXAS_STATE_HOLIDAYS_2026: Omit<Holiday, "id" | "created_at">[] = [
  { name: "Labor Day", date: "2025-09-01", is_paid: true, status: "all_closed", holiday_type: "state" },
  { name: "Veterans Day", date: "2025-11-11", is_paid: true, status: "skeleton_crew", holiday_type: "state" },
  { name: "Thanksgiving Day", date: "2025-11-27", is_paid: true, status: "all_closed", holiday_type: "state" },
  { name: "Day After Thanksgiving", date: "2025-11-28", is_paid: true, status: "all_closed", holiday_type: "state" },
  { name: "Christmas Eve", date: "2025-12-24", is_paid: true, status: "all_closed", holiday_type: "state" },
  { name: "Christmas Day", date: "2025-12-25", is_paid: true, status: "all_closed", holiday_type: "state" },
  { name: "Day After Christmas", date: "2025-12-26", is_paid: true, status: "all_closed", holiday_type: "state" },
  { name: "New Year's Day", date: "2026-01-01", is_paid: true, status: "all_closed", holiday_type: "state" },
  { name: "Confederate Heroes Day", date: "2026-01-19", is_paid: true, status: "optional", holiday_type: "state" },
  { name: "Martin Luther King Jr. Day", date: "2026-01-19", is_paid: true, status: "all_closed", holiday_type: "state" },
  { name: "Presidents' Day", date: "2026-02-16", is_paid: true, status: "optional", holiday_type: "state" },
  { name: "Texas Independence Day", date: "2026-03-02", is_paid: true, status: "optional", holiday_type: "state" },
  { name: "Cesar Chavez Day", date: "2026-03-31", is_paid: true, status: "optional", holiday_type: "state" },
  { name: "Good Friday", date: "2026-04-03", is_paid: true, status: "optional", holiday_type: "state" },
  { name: "San Jacinto Day", date: "2026-04-21", is_paid: true, status: "optional", holiday_type: "state" },
  { name: "Memorial Day", date: "2026-05-25", is_paid: true, status: "all_closed", holiday_type: "state" },
  { name: "Emancipation Day (Juneteenth)", date: "2026-06-19", is_paid: true, status: "all_closed", holiday_type: "state" },
  { name: "Independence Day (Observed)", date: "2026-07-03", is_paid: true, status: "all_closed", holiday_type: "state" },
  { name: "Lyndon B. Johnson Day", date: "2026-08-27", is_paid: true, status: "optional", holiday_type: "state" },
];

// Federal Holidays 2026
const FEDERAL_HOLIDAYS_2026: Omit<Holiday, "id" | "created_at">[] = [
  { name: "New Year's Day", date: "2026-01-01", is_paid: true, status: "federal", holiday_type: "federal" },
  { name: "Birthday of Martin Luther King, Jr.", date: "2026-01-19", is_paid: true, status: "federal", holiday_type: "federal" },
  { name: "Washington's Birthday", date: "2026-02-16", is_paid: true, status: "federal", holiday_type: "federal" },
  { name: "Memorial Day", date: "2026-05-25", is_paid: true, status: "federal", holiday_type: "federal" },
  { name: "Juneteenth National Independence Day", date: "2026-06-19", is_paid: true, status: "federal", holiday_type: "federal" },
  { name: "Independence Day (Observed)", date: "2026-07-03", is_paid: true, status: "federal", holiday_type: "federal" },
  { name: "Labor Day", date: "2026-09-07", is_paid: true, status: "federal", holiday_type: "federal" },
  { name: "Columbus Day", date: "2026-10-12", is_paid: true, status: "federal", holiday_type: "federal" },
  { name: "Veterans Day", date: "2026-11-11", is_paid: true, status: "federal", holiday_type: "federal" },
  { name: "Thanksgiving Day", date: "2026-11-26", is_paid: true, status: "federal", holiday_type: "federal" },
  { name: "Christmas Day", date: "2026-12-25", is_paid: true, status: "federal", holiday_type: "federal" },
];

const statusConfig = {
  all_closed: { label: "All Agencies Closed", color: "bg-[#ef4444]", icon: XCircle, description: "No employees can be scheduled" },
  optional: { label: "Optional Holiday", color: "bg-[#f59e0b]", icon: AlertCircle, description: "Management decision required" },
  skeleton_crew: { label: "Skeleton Crew Required", color: "bg-[#3b82f6]", icon: Users, description: "Limited staff required" },
  federal: { label: "Federal Holiday", color: "bg-[#6366f1]", icon: Flag, description: "No employees can be scheduled" },
};

export function HolidayView() {
  const { holidays, isLoading, addHoliday, deleteHoliday, mutate } = useHolidays();
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState<"texas" | "federal" | null>(null);
  const [newHoliday, setNewHoliday] = useState({ 
    name: "", 
    date: "", 
    is_paid: true,
    status: "all_closed" as Holiday["status"],
    holiday_type: "company" as Holiday["holiday_type"]
  });

  const handleAdd = async () => {
    if (!newHoliday.name || !newHoliday.date) return;
    await addHoliday(newHoliday);
    setNewHoliday({ name: "", date: "", is_paid: true, status: "all_closed", holiday_type: "company" });
    setShowAdd(false);
    mutate();
  };

  const handleImport = async (type: "texas" | "federal") => {
    const holidaysToImport = type === "texas" ? TEXAS_STATE_HOLIDAYS_2026 : FEDERAL_HOLIDAYS_2026;
    
    for (const holiday of holidaysToImport) {
      // Check if holiday already exists
      const exists = holidays.some(h => h.date === holiday.date && h.name === holiday.name);
      if (!exists) {
        await addHoliday(holiday);
      }
    }
    
    setShowImport(null);
    mutate();
  };

  const today = new Date().toISOString().split("T")[0];
  const upcomingHolidays = holidays.filter((h) => h.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const pastHolidays = holidays.filter((h) => h.date < today).sort((a, b) => b.date.localeCompare(a.date));

  const getStatusBadge = (status: Holiday["status"]) => {
    const config = statusConfig[status] || statusConfig.all_closed;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${config.color} text-white text-xs font-medium rounded`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: Holiday["holiday_type"]) => {
    const colors = {
      federal: "bg-[#6366f1]/20 text-[#a5b4fc]",
      state: "bg-[#f59e0b]/20 text-[#fbbf24]",
      company: "bg-[#22c55e]/20 text-[#4ade80]",
    };
    const labels = { federal: "Federal", state: "State", company: "Company" };
    return (
      <span className={`px-2 py-0.5 ${colors[type]} text-xs font-medium rounded`}>
        {labels[type]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-[#a0a0b0] uppercase tracking-wider mb-1">
          iTeam Legal Solutions — Holiday Schedule
        </p>
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-[#d4a537] uppercase tracking-wider">
            Company Holidays
          </h1>
          <div className="flex-1 gold-line" />
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport("texas")}
              className="flex items-center gap-2 px-3 py-2 bg-[#f59e0b] text-white text-sm font-medium rounded-lg hover:bg-[#d97706] transition-colors"
            >
              <Building2 className="h-4 w-4" />
              Import Texas 2026
            </button>
            <button
              onClick={() => setShowImport("federal")}
              className="flex items-center gap-2 px-3 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-[#4f46e5] transition-colors"
            >
              <Flag className="h-4 w-4" />
              Import Federal 2026
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-white text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Holiday
            </button>
          </div>
        </div>
      </div>

      {/* Import Confirmation */}
      {showImport && (
        <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Import {showImport === "texas" ? "Texas State" : "Federal"} Holidays 2026
          </h3>
          <p className="text-sm text-[#a0a0b0] mb-4">
            This will add {showImport === "texas" ? TEXAS_STATE_HOLIDAYS_2026.length : FEDERAL_HOLIDAYS_2026.length} holidays to your calendar. 
            Existing holidays with the same date and name will be skipped.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleImport(showImport)}
              className="px-4 py-2 bg-[#22c55e] text-white font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
            >
              Import Holidays
            </button>
            <button
              onClick={() => setShowImport(null)}
              className="px-4 py-2 bg-[#6b7280] text-white font-medium rounded-lg hover:bg-[#4b5563] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Holiday Form */}
      {showAdd && (
        <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Holiday</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Holiday Name"
              value={newHoliday.name}
              onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
              className="px-4 py-2 bg-[#1a1625] border border-[#3d3655] rounded-lg text-white placeholder-[#a0a0b0] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            />
            <input
              type="date"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              className="px-4 py-2 bg-[#1a1625] border border-[#3d3655] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            />
            <select
              value={newHoliday.status}
              onChange={(e) => setNewHoliday({ ...newHoliday, status: e.target.value as Holiday["status"] })}
              className="px-4 py-2 bg-[#1a1625] border border-[#3d3655] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            >
              <option value="all_closed">All Agencies Closed</option>
              <option value="optional">Optional Holiday</option>
              <option value="skeleton_crew">Skeleton Crew Required</option>
              <option value="federal">Federal Holiday</option>
            </select>
            <select
              value={newHoliday.holiday_type}
              onChange={(e) => setNewHoliday({ ...newHoliday, holiday_type: e.target.value as Holiday["holiday_type"] })}
              className="px-4 py-2 bg-[#1a1625] border border-[#3d3655] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            >
              <option value="company">Company Holiday</option>
              <option value="state">State Holiday</option>
              <option value="federal">Federal Holiday</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-[#22c55e] text-white font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
            >
              Add Holiday
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-[#6b7280] text-white font-medium rounded-lg hover:bg-[#4b5563] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Holiday Scheduling Rules */}
      <div className="bg-[#1a1625] rounded-lg border border-[#3d3655] p-4">
        <h4 className="text-sm font-semibold text-[#d4a537] uppercase tracking-wider mb-3">
          Holiday Scheduling Rules
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">All Agencies Closed / Federal</p>
              <p className="text-[#a0a0b0]">No employees can be scheduled on these days</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">Optional Holiday</p>
              <p className="text-[#a0a0b0]">Management decision whether employees work</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">Skeleton Crew Required</p>
              <p className="text-[#a0a0b0]">Limited staff must be scheduled</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6366f1] border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Upcoming Holidays */}
          <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-6">
            <h3 className="text-sm font-semibold text-[#d4a537] uppercase tracking-wider mb-4">
              Upcoming Holidays ({upcomingHolidays.length})
            </h3>
            {upcomingHolidays.length === 0 ? (
              <p className="text-[#a0a0b0] text-sm">No upcoming holidays. Import Texas or Federal holidays to get started.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {upcomingHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="p-4 bg-[#1a1625] rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-[#3b82f6]" />
                        <div>
                          <p className="text-white font-medium">{holiday.name}</p>
                          <p className="text-xs text-[#a0a0b0]">
                            {new Date(holiday.date + "T12:00:00").toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHoliday(holiday.id)}
                        className="p-2 text-[#a0a0b0] hover:text-[#ef4444] transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getTypeBadge(holiday.holiday_type)}
                      {getStatusBadge(holiday.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Holidays */}
          <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-6">
            <h3 className="text-sm font-semibold text-[#a0a0b0] uppercase tracking-wider mb-4">
              Past Holidays ({pastHolidays.length})
            </h3>
            {pastHolidays.length === 0 ? (
              <p className="text-[#a0a0b0] text-sm">No past holidays</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto opacity-60">
                {pastHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="p-4 bg-[#1a1625] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-[#6b7280]" />
                      <div>
                        <p className="text-white font-medium">{holiday.name}</p>
                        <p className="text-xs text-[#a0a0b0]">
                          {new Date(holiday.date + "T12:00:00").toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getTypeBadge(holiday.holiday_type)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
