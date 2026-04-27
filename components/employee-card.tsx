"use client";

import { useState, useEffect } from "react";
import { FileText, Wrench, XCircle } from "lucide-react";
import type { EmployeeWithSession } from "@/lib/types";
import { formatCurrency, formatHours } from "@/lib/utils";
import { clockIn, clockOut, startBreak, endBreak } from "@/lib/hooks/use-employees";

interface EmployeeCardProps {
  employee: EmployeeWithSession;
  onEdit: (employee: EmployeeWithSession) => void;
  onCorrection?: (employee: EmployeeWithSession) => void;
  onDeactivate?: (employee: EmployeeWithSession) => void;
  onViewLog?: (employee: EmployeeWithSession) => void;
  onMutate: () => void;
}

// Generate a consistent color based on initials
function getInitialColor(name: string): string {
  const colors = [
    "bg-[#6366f1]", // indigo
    "bg-[#3b82f6]", // blue
    "bg-[#22c55e]", // green
    "bg-[#f59e0b]", // amber
    "bg-[#ec4899]", // pink
    "bg-[#8b5cf6]", // violet
    "bg-[#06b6d4]", // cyan
    "bg-[#ef4444]", // red
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function EmployeeCard({ employee, onEdit, onCorrection, onDeactivate, onViewLog, onMutate }: EmployeeCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const session = employee.current_session;
  const isWorking = session?.status === "working";
  const isOnBreak = session?.status === "on_break";
  const isClockedIn = isWorking || isOnBreak;
  const isAdmin = employee.role?.toUpperCase() === "ADMINISTRATOR";

  // Calculate and update session time
  useEffect(() => {
    if (!session || !session.clock_in) {
      setSessionSeconds(0);
      return;
    }

    const updateTime = () => {
      const start = new Date(session.clock_in).getTime();
      let breakTime = (session.total_break_minutes || 0) * 60 * 1000;
      
      // If currently on break, add the ongoing break time
      if (isOnBreak && session.break_start) {
        breakTime += Date.now() - new Date(session.break_start).getTime();
      }
      
      const elapsed = Math.floor((Date.now() - start - breakTime) / 1000);
      setSessionSeconds(Math.max(0, elapsed));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [session, isOnBreak]);

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

  // Format time as HH:MM:SS
  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="employee-card bg-[#242038] rounded-lg p-5 border border-[#3d3655]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm ${getInitialColor(employee.name)}`}>
            {getInitials(employee.name)}
          </div>
          <div>
            <h3 className="font-semibold text-white">{employee.name}</h3>
            <p className="text-xs text-[#a0a0b0] uppercase tracking-wider">{employee.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 text-xs ${isClockedIn ? "text-[#22c55e]" : "text-[#a0a0b0]"}`}>
            <span className={`h-2 w-2 rounded-full ${isClockedIn ? (isOnBreak ? "bg-[#f59e0b]" : "bg-[#22c55e]") : "bg-[#6b7280]"}`} />
            {isClockedIn ? (isOnBreak ? "ON BREAK" : "ACTIVE") : "OUT"}
          </span>
          {isAdmin && (
            <span className="px-2 py-0.5 bg-[#6366f1] text-white text-xs font-medium rounded">
              EXEMPT
            </span>
          )}
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-4">
        <p className={`text-4xl font-mono font-bold tracking-wider ${isClockedIn ? "text-white" : "text-[#6b7280]"}`}>
          {formatTimer(sessionSeconds)}
        </p>
        <p className="text-xs text-[#a0a0b0] mt-1">
          {isClockedIn ? (isOnBreak ? "On Break" : "Working") : "Not clocked in"}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div>
          <p className="text-xs text-[#a0a0b0] uppercase">Today</p>
          <p className="text-sm font-semibold text-white">{formatHours(employee.today_hours || 0)}</p>
        </div>
        <div>
          <p className="text-xs text-[#a0a0b0] uppercase">Week</p>
          <p className="text-sm font-semibold text-white">{formatHours(employee.week_hours || 0)}</p>
        </div>
        <div>
          <p className="text-xs text-[#a0a0b0] uppercase">Month</p>
          <p className="text-sm font-semibold text-white">{formatHours(employee.month_hours || 0)}</p>
        </div>
      </div>

      {/* Earnings */}
      <div className="mb-4">
        <p className="text-xs text-[#a0a0b0] uppercase">
          Earnings ({formatCurrency(employee.hourly_rate)}/HR)
        </p>
        <p className="text-lg font-bold text-[#22c55e]">
          {formatCurrency(employee.today_earnings || 0)}
        </p>
      </div>

      {/* Clock Button */}
      <div className="mb-3">
        {!isClockedIn ? (
          <button
            onClick={handleClockIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#22c55e] text-white font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50"
          >
            Clock In
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleBreak}
              disabled={isLoading}
              className={`flex-1 py-2.5 font-medium rounded-lg transition-colors disabled:opacity-50 ${
                isOnBreak
                  ? "bg-[#22c55e] text-white hover:bg-[#16a34a]"
                  : "bg-[#f59e0b] text-white hover:bg-[#d97706]"
              }`}
            >
              {isOnBreak ? "End Break" : "Break"}
            </button>
            <button
              onClick={handleClockOut}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-[#ef4444] text-white font-medium rounded-lg hover:bg-[#dc2626] transition-colors disabled:opacity-50"
            >
              Clock Out
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewLog?.(employee)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b82f6] text-white text-xs font-medium rounded hover:bg-[#2563eb] transition-colors"
        >
          <FileText className="h-3 w-3" />
          View Time Log
        </button>
        {!isAdmin && (
          <>
            <button
              onClick={() => onCorrection?.(employee)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6b7280] text-white text-xs font-medium rounded hover:bg-[#4b5563] transition-colors"
            >
              <Wrench className="h-3 w-3" />
              Admin Correct
            </button>
            <button
              onClick={() => onDeactivate?.(employee)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[#ef4444] border border-[#ef4444] text-xs font-medium rounded hover:bg-[#ef4444]/10 transition-colors"
            >
              Deactivate
            </button>
          </>
        )}
      </div>

      {/* Hire Date */}
      {employee.created_at && (
        <p className="text-xs text-[#a0a0b0] text-right mt-3">
          Hire date: {new Date(employee.created_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
        </p>
      )}
    </div>
  );
}
