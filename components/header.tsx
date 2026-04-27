"use client";

import { useState, useEffect } from "react";
import { Save, Calendar, DollarSign, FileText, Trash2 } from "lucide-react";

interface HeaderProps {
  onSave?: () => void;
  onShowSchedule?: () => void;
  onShowPayroll?: () => void;
  onShowAudit?: () => void;
  onClear?: () => void;
}

export function Header({ onSave, onShowSchedule, onShowPayroll, onShowAudit, onClear }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <header className="h-16 bg-[#1a1625] border-b border-[#3d3655] flex items-center justify-between px-6">
      {/* Time Display */}
      <div className="flex-1" />
      
      <div className="text-center">
        <p className="text-xl font-bold text-white">{formatTime(currentTime)}</p>
        <p className="text-sm text-[#d4a537]">{formatDate(currentTime)}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex-1 flex items-center justify-end gap-2">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-white text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
        >
          <Save className="h-4 w-4" />
          Save
        </button>
        <button
          onClick={onShowSchedule}
          className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white text-sm font-medium rounded-lg hover:bg-[#2563eb] transition-colors"
        >
          <Calendar className="h-4 w-4" />
          Schedule
        </button>
        <button
          onClick={onShowPayroll}
          className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-[#4f46e5] transition-colors"
        >
          <DollarSign className="h-4 w-4" />
          Payroll
        </button>
        <button
          onClick={onShowAudit}
          className="flex items-center gap-2 px-4 py-2 bg-[#ec4899] text-white text-sm font-medium rounded-lg hover:bg-[#db2777] transition-colors"
        >
          <FileText className="h-4 w-4" />
          Audit Log
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 bg-[#ef4444] text-white text-sm font-medium rounded-lg hover:bg-[#dc2626] transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      </div>
    </header>
  );
}
