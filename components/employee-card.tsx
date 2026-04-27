"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square, Coffee, Edit, Trash2 } from "lucide-react";
import type { EmployeeWithSession } from "@/lib/types";
import { formatTime, formatCurrency, formatHours, getStatusColor, getStatusText } from "@/lib/utils";
import { clockIn, clockOut, startBreak, endBreak, deleteEmployee } from "@/lib/hooks/use-employees";

interface EmployeeCardProps {
  employee: EmployeeWithSession;
  onEdit: (employee: EmployeeWithSession) => void;
  onMutate: () => void;
}

export function EmployeeCard({ employee, onEdit, onMutate }: EmployeeCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const session = employee.current_session;
  const isWorking = session?.status === "working";
  const isOnBreak = session?.status === "on_break";
  const isClockedIn = isWorking || isOnBreak;

  // Calculate and update session time
  useEffect(() => {
    if (!session || !session.clock_in) {
      setSessionSeconds(0);
      return;
    }

    const updateTime = () => {
      const start = new Date(session.clock_in).getTime();
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setSessionSeconds(elapsed);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const handleClockIn = async () => {
    setIsLoading(true);
    try {
      await clockIn(employee.id);
      onMutate();
    } catch (error) {
      console.error("Failed to clock in:", error);
    }
    setIsLoading(false);
  };

  const handleClockOut = async () => {
    setIsLoading(true);
    try {
      await clockOut(employee.id);
      onMutate();
    } catch (error) {
      console.error("Failed to clock out:", error);
    }
    setIsLoading(false);
  };

  const handleBreak = async () => {
    setIsLoading(true);
    try {
      if (isOnBreak) {
        await endBreak(employee.id);
      } else {
        await startBreak(employee.id);
      }
      onMutate();
    } catch (error) {
      console.error("Failed to toggle break:", error);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove ${employee.name}?`)) return;
    setIsLoading(true);
    try {
      await deleteEmployee(employee.id);
      onMutate();
    } catch (error) {
      console.error("Failed to delete employee:", error);
    }
    setIsLoading(false);
  };

  // Calculate current session earnings
  const sessionHours = sessionSeconds / 3600;
  const regularHours = Math.min(sessionHours, 8);
  const overtimeHours = Math.max(0, sessionHours - 8);
  const sessionEarnings = regularHours * employee.hourly_rate + overtimeHours * employee.overtime_rate;

  return (
    <div className="employee-card rounded-xl bg-card border border-border p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-lg">
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{employee.name}</h3>
            <p className="text-sm text-muted-foreground">{employee.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(employee)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading || isClockedIn}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`h-2.5 w-2.5 rounded-full ${isClockedIn ? getStatusColor(session?.status || "") : "bg-gray-500"}`} />
        <span className="text-sm text-muted-foreground">
          {isClockedIn ? getStatusText(session?.status || "") : "Clocked Out"}
        </span>
      </div>

      {/* Timer */}
      {isClockedIn && (
        <div className="mb-4 rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Session Time</span>
            <span className="font-mono text-xl font-bold text-foreground">
              {formatTime(sessionSeconds)}
            </span>
          </div>
          {session?.total_break_minutes ? (
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">Break Time</span>
              <span className="text-xs text-muted-foreground">
                {session.total_break_minutes} min
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-secondary/30 p-3">
          <p className="text-xs text-muted-foreground mb-1">Today</p>
          <p className="font-semibold text-foreground">{formatHours(employee.today_hours || 0)}</p>
          <p className="text-xs text-accent">{formatCurrency(employee.today_earnings || 0)}</p>
        </div>
        <div className="rounded-lg bg-secondary/30 p-3">
          <p className="text-xs text-muted-foreground mb-1">This Week</p>
          <p className="font-semibold text-foreground">{formatHours(employee.week_hours || 0)}</p>
          {(employee.week_hours || 0) > 40 && (
            <p className="text-xs text-warning">+{formatHours((employee.week_hours || 0) - 40)} OT</p>
          )}
        </div>
      </div>

      {/* Rate */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>Rate: {formatCurrency(employee.hourly_rate)}/hr</span>
        <span>OT: {formatCurrency(employee.overtime_rate)}/hr</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!isClockedIn ? (
          <button
            onClick={handleClockIn}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground py-2.5 font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            Clock In
          </button>
        ) : (
          <>
            <button
              onClick={handleBreak}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 font-medium transition-colors disabled:opacity-50 ${
                isOnBreak
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "bg-warning text-white hover:bg-warning/90"
              }`}
            >
              <Coffee className="h-4 w-4" />
              {isOnBreak ? "End Break" : "Break"}
            </button>
            <button
              onClick={handleClockOut}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-destructive text-destructive-foreground py-2.5 font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              <Square className="h-4 w-4" />
              Clock Out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
