"use client";

import { useState } from "react";
import { Plus, CalendarDays, Trash2 } from "lucide-react";
import { useHolidays } from "@/lib/hooks/use-settings";

export function HolidayView() {
  const { holidays, isLoading, addHoliday, deleteHoliday, mutate } = useHolidays();
  const [showAdd, setShowAdd] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "", is_paid: true });

  const handleAdd = async () => {
    if (!newHoliday.name || !newHoliday.date) return;
    await addHoliday(newHoliday);
    setNewHoliday({ name: "", date: "", is_paid: true });
    setShowAdd(false);
    mutate();
  };

  const today = new Date().toISOString().split("T")[0];
  const upcomingHolidays = holidays.filter((h) => h.date >= today);
  const pastHolidays = holidays.filter((h) => h.date < today);

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
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-[#4f46e5] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Holiday
          </button>
        </div>
      </div>

      {/* Add Holiday Form */}
      {showAdd && (
        <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Holiday</h3>
          <div className="grid grid-cols-3 gap-4">
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
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 bg-[#22c55e] text-white font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 bg-[#6b7280] text-white font-medium rounded-lg hover:bg-[#4b5563] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6366f1] border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Upcoming Holidays */}
          <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-6">
            <h3 className="text-sm font-semibold text-[#d4a537] uppercase tracking-wider mb-4">
              Upcoming Holidays
            </h3>
            {upcomingHolidays.length === 0 ? (
              <p className="text-[#a0a0b0] text-sm">No upcoming holidays</p>
            ) : (
              <div className="space-y-3">
                {upcomingHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-[#3b82f6]" />
                      <div>
                        <p className="text-white font-medium">{holiday.name}</p>
                        <p className="text-xs text-[#a0a0b0]">
                          {new Date(holiday.date).toLocaleDateString("en-US", {
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
                ))}
              </div>
            )}
          </div>

          {/* Past Holidays */}
          <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-6">
            <h3 className="text-sm font-semibold text-[#a0a0b0] uppercase tracking-wider mb-4">
              Past Holidays
            </h3>
            {pastHolidays.length === 0 ? (
              <p className="text-[#a0a0b0] text-sm">No past holidays</p>
            ) : (
              <div className="space-y-3 opacity-60">
                {pastHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-[#6b7280]" />
                      <div>
                        <p className="text-white font-medium">{holiday.name}</p>
                        <p className="text-xs text-[#a0a0b0]">
                          {new Date(holiday.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
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
