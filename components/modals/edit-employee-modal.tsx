"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Employee } from "@/lib/types";
import { updateEmployee } from "@/lib/hooks/use-employees";

interface EditEmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEmployeeModal({ isOpen, employee, onClose, onSuccess }: EditEmployeeModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [overtimeRate, setOvertimeRate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setRole(employee.role);
      setHourlyRate(employee.hourly_rate.toString());
      setOvertimeRate(employee.overtime_rate.toString());
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);
    try {
      await updateEmployee(employee.id, {
        name: name.trim(),
        role: role.trim() || "Employee",
        hourly_rate: parseFloat(hourlyRate) || 15.0,
        overtime_rate: parseFloat(overtimeRate) || 22.5,
      });
      onSuccess();
      onClose();
    } catch {
      setError("Failed to update employee");
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
            <h2 className="text-xl font-semibold text-white">Edit Employee</h2>
            <p className="text-sm text-[#d4a537]">Update employee details</p>
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
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#3d3655] bg-[#1a1625] px-3 py-2 text-white placeholder-[#a0a0b0] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              placeholder="Enter employee name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-[#3d3655] bg-[#1a1625] px-3 py-2 text-white placeholder-[#a0a0b0] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              placeholder="e.g., Employee, Manager"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full rounded-lg border border-[#3d3655] bg-[#1a1625] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Overtime Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={overtimeRate}
                onChange={(e) => setOvertimeRate(e.target.value)}
                className="w-full rounded-lg border border-[#3d3655] bg-[#1a1625] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              />
            </div>
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
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
