"use client";

import useSWR, { mutate } from "swr";
import type { AuditLog } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAuditLogs(limit: number = 50) {
  const { data, error, isLoading } = useSWR<AuditLog[]>(
    `/api/audit-logs?limit=${limit}`,
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  );

  return {
    logs: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/audit-logs?limit=${limit}`),
  };
}

export async function createAuditLog(data: {
  employee_id?: string;
  employee_name: string;
  action: string;
  details?: Record<string, unknown>;
  performed_by?: string;
}): Promise<AuditLog> {
  const response = await fetch("/api/audit-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create audit log");
  }

  mutate((key: string) => typeof key === "string" && key.startsWith("/api/audit-logs"));
  return response.json();
}
