"use client";

import { useState } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useHolidays, createHoliday, deleteHoliday } from "@/lib/hooks/use-settings";
import { formatDate } from "@/lib/utils";

export function SettingsTab() {
  const { holidays, isLoading, mutate } = useHolidays();
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim() || !holidayDate) return;

    setIsCreating(true);
    try {
      await createHoliday({
        name: holidayName.trim(),
        date: holidayDate,
        is_paid: isPaid,
      });
      mutate();
      setShowAddHoliday(false);
      setHolidayName("");
      setHolidayDate("");
      setIsPaid(true);
    } catch (error) {
      console.error("Failed to create holiday:", error);
    }
    setIsCreating(false);
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return;
    
    try {
      await deleteHoliday(id);
      mutate();
    } catch (error) {
      console.error("Failed to delete holiday:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Separate upcoming and past holidays
  const now = new Date();
  const upcomingHolidays = holidays.filter((h) => new Date(h.date) >= now);
  const pastHolidays = holidays.filter((h) => new Date(h.date) < now);

  return (
    <div className="space-y-6">
      {/* Holidays Section */}
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Holidays</h2>
              <p className="text-sm text-muted-foreground">Manage company holidays</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddHoliday(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Holiday
          </button>
        </div>

        {showAddHoliday && (
          <form onSubmit={handleAddHoliday} className="mb-4 rounded-lg bg-secondary/30 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                <input
                  type="text"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="e.g., Christmas"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
                <select
                  value={isPaid ? "paid" : "unpaid"}
                  onChange={(e) => setIsPaid(e.target.value === "paid")}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="paid">Paid Holiday</option>
                  <option value="unpaid">Unpaid Holiday</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddHoliday(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isCreating ? "Adding..." : "Add Holiday"}
              </button>
            </div>
          </form>
        )}

        {/* Upcoming Holidays */}
        {upcomingHolidays.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming</h3>
            <div className="space-y-2">
              {upcomingHolidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{holiday.name}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(holiday.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        holiday.is_paid
                          ? "bg-accent/20 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {holiday.is_paid ? "Paid" : "Unpaid"}
                    </span>
                    <button
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Holidays */}
        {pastHolidays.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Past</h3>
            <div className="space-y-2">
              {pastHolidays.slice(0, 5).map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/20 p-3 opacity-60"
                >
                  <div>
                    <p className="font-medium text-foreground">{holiday.name}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(holiday.date)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteHoliday(holiday.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {holidays.length === 0 && !showAddHoliday && (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No holidays configured yet</p>
          </div>
        )}
      </div>

      {/* App Info */}
      <div className="rounded-xl bg-card border border-border p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">About</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Application</span>
            <span className="text-foreground">Employee Time Clock</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Company</span>
            <span className="text-foreground">iTeam Legal Solutions</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="text-foreground">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Built with</span>
            <span className="text-foreground">Next.js + Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
