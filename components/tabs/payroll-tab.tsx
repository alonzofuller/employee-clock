"use client";

import { useState } from "react";
import { DollarSign, Clock, TrendingUp, Plus, Lock } from "lucide-react";
import { usePayrollPeriods, useCurrentPeriodSessions, createPayrollPeriod, closePayrollPeriod } from "@/lib/hooks/use-payroll";
import { formatCurrency, formatHours, formatDate, formatDateTime } from "@/lib/utils";

export function PayrollTab() {
  const { periods, isLoading: periodsLoading, mutate: mutatePeriods } = usePayrollPeriods();
  const { sessions, totals, isLoading: sessionsLoading } = useCurrentPeriodSessions();
  const [showNewPeriod, setShowNewPeriod] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const openPeriod = periods.find((p) => p.status === "open");

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setIsCreating(true);
    try {
      await createPayrollPeriod({ start_date: startDate, end_date: endDate });
      mutatePeriods();
      setShowNewPeriod(false);
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Failed to create period:", error);
    }
    setIsCreating(false);
  };

  const handleClosePeriod = async (id: string) => {
    if (!confirm("Are you sure you want to close this payroll period? This will calculate final totals.")) return;
    
    try {
      await closePayrollPeriod(id);
      mutatePeriods();
    } catch (error) {
      console.error("Failed to close period:", error);
    }
  };

  if (periodsLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold text-foreground">{formatHours(totals.total_hours)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overtime Hours</p>
              <p className="text-2xl font-bold text-foreground">{formatHours(totals.overtime_hours)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totals.total_earnings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Period */}
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Current Period</h2>
          {!openPeriod && (
            <button
              onClick={() => setShowNewPeriod(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Period
            </button>
          )}
        </div>

        {showNewPeriod && (
          <form onSubmit={handleCreatePeriod} className="mb-4 rounded-lg bg-secondary/30 p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewPeriod(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create Period"}
              </button>
            </div>
          </form>
        )}

        {openPeriod ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(openPeriod.start_date)} - {formatDate(openPeriod.end_date)}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
                  Open
                </span>
              </div>
              <button
                onClick={() => handleClosePeriod(openPeriod.id)}
                className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                <Lock className="h-4 w-4" />
                Close Period
              </button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No active payroll period. Create one to track hours.</p>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="rounded-xl bg-card border border-border p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Time Entries</h2>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground">No time entries for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Employee</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Clock In</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Clock Out</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Hours</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 10).map((session) => {
                  const hours = session.clock_out
                    ? (new Date(session.clock_out).getTime() - new Date(session.clock_in).getTime()) / 1000 / 60 / 60 - (session.total_break_minutes || 0) / 60
                    : 0;
                  return (
                    <tr key={session.id} className="border-b border-border/50">
                      <td className="py-3 px-2 text-sm text-foreground">{session.employee_name}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{formatDateTime(session.clock_in)}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">
                        {session.clock_out ? formatDateTime(session.clock_out) : "-"}
                      </td>
                      <td className="py-3 px-2 text-sm text-foreground text-right">{formatHours(hours)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past Periods */}
      {periods.filter((p) => p.status === "closed").length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">Past Periods</h2>
          <div className="space-y-3">
            {periods
              .filter((p) => p.status === "closed")
              .slice(0, 5)
              .map((period) => (
                <div key={period.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {formatDate(period.start_date)} - {formatDate(period.end_date)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatHours(period.total_hours)} worked ({formatHours(period.total_overtime_hours)} OT)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{formatCurrency(period.total_amount)}</p>
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      Closed
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
