"use client";

import { X, Clock, Coffee, LogOut, Edit, UserPlus, UserMinus, RefreshCw, AlertCircle } from "lucide-react";
import { useAuditLogs } from "@/lib/hooks/use-audit-logs";
import type { AuditLog, AuditLogDetails } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

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
  time_correction: <Edit className="h-4 w-4 text-[#6366f1]" />,
  employee_added: <UserPlus className="h-4 w-4 text-[#3b82f6]" />,
  "Employee Added": <UserPlus className="h-4 w-4 text-[#3b82f6]" />,
  employee_removed: <UserMinus className="h-4 w-4 text-[#ef4444]" />,
  employee_updated: <RefreshCw className="h-4 w-4 text-[#f59e0b]" />,
  "Employee Updated": <RefreshCw className="h-4 w-4 text-[#f59e0b]" />,
};

const actionColors: Record<string, string> = {
  clock_in: "text-[#22c55e]",
  clock_out: "text-[#ef4444]",
  break_start: "text-[#f59e0b]",
  break_end: "text-[#22c55e]",
  correction: "text-[#6366f1]",
  time_correction: "text-[#6366f1]",
  employee_added: "text-[#3b82f6]",
  "Employee Added": "text-[#3b82f6]",
  employee_removed: "text-[#ef4444]",
  employee_updated: "text-[#f59e0b]",
  "Employee Updated": "text-[#f59e0b]",
};

// Format the audit log details into human-readable text
function formatDetails(action: string, details: AuditLogDetails | null): string | null {
  if (!details) return null;
  
  const parts: string[] = [];

  // Handle Employee Added
  if (action === "Employee Added" || action === "employee_added") {
    if (details.role) parts.push(`Role: ${details.role}`);
    if (details.hourly_rate) parts.push(`Pay Rate: ${formatCurrency(details.hourly_rate)}/hr`);
    return parts.length > 0 ? parts.join(" | ") : null;
  }

  // Handle Employee Updated - show what changed
  if (action === "Employee Updated" || action === "employee_updated") {
    const oldData = details.old;
    const newData = details.new;
    
    if (oldData && newData) {
      const changes: string[] = [];
      
      if (oldData.name !== newData.name) {
        changes.push(`Name: "${oldData.name}" → "${newData.name}"`);
      }
      if (oldData.role !== newData.role) {
        changes.push(`Role: "${oldData.role}" → "${newData.role}"`);
      }
      if (oldData.hourly_rate !== newData.hourly_rate) {
        changes.push(`Pay Rate: ${formatCurrency(oldData.hourly_rate || 0)} → ${formatCurrency(newData.hourly_rate || 0)}`);
      }
      if (oldData.is_active !== newData.is_active) {
        changes.push(`Status: ${oldData.is_active ? "Active" : "Inactive"} → ${newData.is_active ? "Active" : "Inactive"}`);
      }
      
      return changes.length > 0 ? changes.join(" | ") : "Details updated";
    }
  }

  // Handle Time Correction
  if (action === "correction" || action === "time_correction") {
    if (details.reason) parts.push(`Reason: ${details.reason}`);
    if (details.clock_in) {
      const time = new Date(details.clock_in).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
      });
      parts.push(`Clock In: ${time}`);
    }
    if (details.clock_out) {
      const time = new Date(details.clock_out).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
      });
      parts.push(`Clock Out: ${time}`);
    }
    return parts.length > 0 ? parts.join(" | ") : null;
  }

  // Handle clock in/out with session info
  if (action === "clock_in" || action === "clock_out") {
    if (details.session_id) {
      return `Session ID: ${details.session_id.slice(0, 8)}...`;
    }
  }

  // Default: show key details in readable format
  const skipKeys = ["old", "new", "id", "created_at", "updated_at"];
  Object.entries(details).forEach(([key, value]) => {
    if (skipKeys.includes(key) || value === null || value === undefined) return;
    
    const formattedKey = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    
    if (typeof value === "boolean") {
      parts.push(`${formattedKey}: ${value ? "Yes" : "No"}`);
    } else if (typeof value === "number") {
      if (key.includes("rate") || key.includes("amount") || key.includes("cost")) {
        parts.push(`${formattedKey}: ${formatCurrency(value)}`);
      } else {
        parts.push(`${formattedKey}: ${value}`);
      }
    } else if (typeof value === "string" && !value.includes("{")) {
      parts.push(`${formattedKey}: ${value}`);
    }
  });

  return parts.length > 0 ? parts.join(" | ") : null;
}

export function AuditModal({ isOpen, onClose }: AuditModalProps) {
  const { logs, isLoading } = useAuditLogs();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-[#242038] rounded-lg border border-[#3d3655] w-full max-w-3xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#3d3655] flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white">Audit Log</h2>
              <p className="text-sm text-[#d4a537]">Time Clock Activity History</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#a0a0b0] hover:text-white hover:bg-[#3d3655] rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6366f1] border-t-transparent" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-[#6b7280] mx-auto mb-3" />
                <p className="text-[#a0a0b0]">No audit logs yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => {
                  const formattedDetails = formatDetails(log.action, log.details);
                  const actionColor = actionColors[log.action] || "text-[#d4a537]";
                  
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 bg-[#1a1625] rounded-lg hover:bg-[#1f1b2e] transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1 p-2 bg-[#242038] rounded-full">
                        {actionIcons[log.action] || <Clock className="h-4 w-4 text-[#a0a0b0]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-semibold text-white">{log.employee_name}</span>
                          <span className="text-[#6b7280]">·</span>
                          <span className={`text-sm font-medium ${actionColor}`}>
                            {log.action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        
                        {formattedDetails && (
                          <p className="text-sm text-[#a0a0b0] mt-1.5 leading-relaxed">
                            {formattedDetails}
                          </p>
                        )}
                        
                        <p className="text-xs text-[#6b7280] mt-2">
                          {new Date(log.created_at).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                          {log.performed_by && (
                            <span className="text-[#a0a0b0]"> · by {log.performed_by}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-5 border-t border-[#3d3655] flex-shrink-0">
            <p className="text-sm text-[#6b7280]">
              {logs.length} {logs.length === 1 ? "entry" : "entries"}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#6b7280] text-white font-medium rounded-lg hover:bg-[#4b5563] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
