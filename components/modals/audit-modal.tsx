"use client";

import { X, Clock, Coffee, LogOut, Edit, UserPlus, UserMinus } from "lucide-react";
import { useAuditLogs } from "@/lib/hooks/use-audit-logs";

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const actionIcons: Record<string, React.ReactNode> = {
  clock_in: <Clock className="h-4 w-4 text-[#22c55e]" />,
  clock_out: <LogOut className="h-4 w-4 text-[#ef4444]" />,
  break_start: <Coffee className="h-4 w-4 text-[#f59e0b]" />,
  break_end: <Coffee className="h-4 w-4 text-[#22c55e]" />,
  correction: <Edit className="h-4 w-4 text-[#6366f1]" />,
  employee_added: <UserPlus className="h-4 w-4 text-[#3b82f6]" />,
  employee_removed: <UserMinus className="h-4 w-4 text-[#ef4444]" />,
};

const actionLabels: Record<string, string> = {
  clock_in: "Clocked In",
  clock_out: "Clocked Out",
  break_start: "Started Break",
  break_end: "Ended Break",
  correction: "Time Correction",
  employee_added: "Employee Added",
  employee_removed: "Employee Removed",
};

export function AuditModal({ isOpen, onClose }: AuditModalProps) {
  const { logs, isLoading } = useAuditLogs();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#242038] rounded-lg border border-[#3d3655] w-full max-w-3xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3d3655]">
          <div>
            <h2 className="text-xl font-bold text-white">Audit Log</h2>
            <p className="text-sm text-[#d4a537]">Time Clock Activity History</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#a0a0b0] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6366f1] border-t-transparent" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#a0a0b0]">No audit logs yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 bg-[#1a1625] rounded-lg"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {actionIcons[log.action] || <Clock className="h-4 w-4 text-[#a0a0b0]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{log.employee_name}</span>
                      <span className="text-[#a0a0b0]">·</span>
                      <span className="text-sm text-[#d4a537]">
                        {actionLabels[log.action] || log.action}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-[#a0a0b0] mt-1">
                        {typeof log.details === "object" 
                          ? JSON.stringify(log.details)
                          : log.details
                        }
                      </p>
                    )}
                    <p className="text-xs text-[#6b7280] mt-1">
                      {new Date(log.created_at).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                      {log.performed_by && log.performed_by !== "System" && (
                        <span> · by {log.performed_by}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#3d3655]">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#6b7280] text-white font-medium rounded-lg hover:bg-[#4b5563] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
