"use client";

import useSWR, { mutate } from "swr";
import type { PayrollPeriod, TimeSession, OperatingCost } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePayrollPeriods() {
  const { data, error, isLoading } = useSWR<PayrollPeriod[]>(
    "/api/payroll/periods",
    fetcher
  );

  return {
    periods: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate("/api/payroll/periods"),
  };
}

export function useCurrentPeriodSessions() {
  const { data, error, isLoading } = useSWR<{
    sessions: (TimeSession & { employee_name: string })[];
    totals: {
      total_hours: number;
      overtime_hours: number;
      total_earnings: number;
    };
  }>("/api/payroll/current-sessions", fetcher, {
    refreshInterval: 30000,
  });

  return {
    sessions: data?.sessions || [],
    totals: data?.totals || { total_hours: 0, overtime_hours: 0, total_earnings: 0 },
    isLoading,
    isError: error,
    mutate: () => mutate("/api/payroll/current-sessions"),
  };
}

export function useOperatingCosts() {
  const { data, error, isLoading } = useSWR<OperatingCost[]>(
    "/api/operating-costs",
    fetcher
  );

  return {
    costs: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate("/api/operating-costs"),
  };
}

export async function createPayrollPeriod(data: {
  start_date: string;
  end_date: string;
}): Promise<PayrollPeriod> {
  const response = await fetch("/api/payroll/periods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create payroll period");
  }

  mutate("/api/payroll/periods");
  return response.json();
}

export async function closePayrollPeriod(id: string): Promise<PayrollPeriod> {
  const response = await fetch(`/api/payroll/periods/${id}/close`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to close payroll period");
  }

  mutate("/api/payroll/periods");
  return response.json();
}

export async function updateOperatingCost(data: {
  month: string;
  amount: number;
  notes?: string;
}): Promise<OperatingCost> {
  const response = await fetch("/api/operating-costs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update operating cost");
  }

  mutate("/api/operating-costs");
  return response.json();
}
