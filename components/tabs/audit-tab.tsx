"use client";

import { FileText, Clock, User, Info } from "lucide-react";
import { useAuditLogs } from "@/lib/hooks/use-audit-logs";
import { formatDateTime } from "@/lib/utils";

export function AuditTab() {
  const { logs, isLoading } = useAuditLogs(100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const getActionColor = (action: string): string => {
    if (action.includes("Clock In") || action.includes("Added")) return "text-accent";
    if (action.includes("Clock Out") || action.includes("Removed")) return "text-destructive";
    if (action.includes("Break")) return "text-warning";
    if (action.includes("Updated") || action.includes("Correction")) return "text-info";
    return "text-muted-foreground";
  };

  const getActionIcon = (action: string) => {
    if (action.includes("Clock")) return <Clock className="h-4 w-4" />;
    if (action.includes("Employee")) return <User className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Audit Log</h2>
          <p className="text-sm text-muted-foreground">Complete record of all system activities</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          {logs.length} entries
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No audit logs yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Activity will be recorded here as employees clock in and out.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-foreground">{log.employee_name}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{formatDateTime(log.created_at)}</span>
                      <span>by {log.performed_by}</span>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-2 rounded-lg bg-secondary/50 p-3 text-sm">
                        <pre className="whitespace-pre-wrap text-muted-foreground font-mono text-xs">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
