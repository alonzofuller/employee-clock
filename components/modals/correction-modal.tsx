"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Employee } from "@/lib/types";

interface CorrectionModalProps {
  isOpen: boolean;
  employees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CorrectionModal({ isOpen, employees, onClose, onSuccess }: CorrectionModalProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!employeeId) {
      setError("Please select an employee");
      return;
    }
    if (!clockIn) {
      setError("Clock in time is required");
      return;
    }
    if (!reason.trim()) {
      setError("Reason is required for corrections");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/time-sessions/correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          clock_in: clockIn,
          clock_out: clockOut || null,
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create correction");
      }

      onSuccess();
      onClose();
      // Reset form
      setEmployeeId("");
      setClockIn("");
      setClockOut("");
      setReason("");
    } catch {
      setError("Failed to create correction");
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-[#242038] border border-[#3d3655] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Admin Time Correction</h2>
            <p className="text-sm text-[#d4a537]">Add or modify time entries</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-[#a0a0b0] hover:text-white hover:bg-[#3d3655] rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Employee *
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded-lg border border-[#3d3655] bg-[#1a1625] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Clock In *
            </label>
            <input
              type="datetime-local"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
              className="w-full rounded-lg border border-[#3d3655] bg-[#1a1625] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Clock Out
            </label>
            <input
              type="datetime-local"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
              className="w-full rounded-lg border border-[#3d3655] bg-[#1a1625] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            />
            <p className="text-xs text-[#a0a0b0] mt-1">
              Leave empty to create an active session
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[#3d3655] bg-[#1a1625] px-3 py-2 text-white placeholder-[#a0a0b0] focus:outline-none focus:ring-2 focus:ring-[#6366f1] resize-none"
              placeholder="Explain why this correction is needed..."
            />
          </div>

          {error && (
            <p className="text-sm text-[#ef4444]">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-[#3d3655] py-2.5 font-medium text-white hover:bg-[#3d3655] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-[#6366f1] py-2.5 font-medium text-white hover:bg-[#4f46e5] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Submit Correction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
