"use client";

import useSWR, { mutate } from "swr";
import type { Holiday, Schedule, AppSession } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Holidays
export function useHolidays() {
  const { data, error, isLoading } = useSWR<Holiday[]>(
    "/api/holidays",
    fetcher
  );

  return {
    holidays: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate("/api/holidays"),
  };
}

export async function createHoliday(data: {
  name: string;
  date: string;
  is_paid: boolean;
}): Promise<Holiday> {
  const response = await fetch("/api/holidays", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create holiday");
  }

  mutate("/api/holidays");
  return response.json();
}

export async function deleteHoliday(id: string): Promise<void> {
  const response = await fetch(`/api/holidays/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete holiday");
  }

  mutate("/api/holidays");
}

// Schedules
export function useSchedules(employeeId?: string) {
  const url = employeeId ? `/api/schedules?employee_id=${employeeId}` : "/api/schedules";
  const { data, error, isLoading } = useSWR<Schedule[]>(url, fetcher);

  return {
    schedules: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate(url),
  };
}

export async function updateSchedule(data: {
  employee_id: string;
  day_of_week: number;
  start_time?: string;
  end_time?: string;
  is_day_off: boolean;
}): Promise<Schedule> {
  const response = await fetch("/api/schedules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update schedule");
  }

  mutate("/api/schedules");
  mutate(`/api/schedules?employee_id=${data.employee_id}`);
  return response.json();
}

// App Sessions (Developer Time Tracking)
export function useAppSessions() {
  const { data, error, isLoading } = useSWR<AppSession[]>(
    "/api/app-sessions",
    fetcher,
    {
      refreshInterval: 1000, // Real-time updates for timer
    }
  );

  return {
    sessions: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate("/api/app-sessions"),
  };
}

export function useCurrentAppSession() {
  const { data, error, isLoading } = useSWR<AppSession | null>(
    "/api/app-sessions/current",
    fetcher,
    {
      refreshInterval: 1000,
    }
  );

  return {
    session: data,
    isLoading,
    isError: error,
    mutate: () => mutate("/api/app-sessions/current"),
  };
}

export async function startAppSession(): Promise<AppSession> {
  const response = await fetch("/api/app-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start" }),
  });

  if (!response.ok) {
    throw new Error("Failed to start app session");
  }

  mutate("/api/app-sessions");
  mutate("/api/app-sessions/current");
  return response.json();
}

export async function pauseAppSession(): Promise<AppSession> {
  const response = await fetch("/api/app-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "pause" }),
  });

  if (!response.ok) {
    throw new Error("Failed to pause app session");
  }

  mutate("/api/app-sessions");
  mutate("/api/app-sessions/current");
  return response.json();
}

export async function resumeAppSession(): Promise<AppSession> {
  const response = await fetch("/api/app-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "resume" }),
  });

  if (!response.ok) {
    throw new Error("Failed to resume app session");
  }

  mutate("/api/app-sessions");
  mutate("/api/app-sessions/current");
  return response.json();
}

export async function stopAppSession(): Promise<AppSession> {
  const response = await fetch("/api/app-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "stop" }),
  });

  if (!response.ok) {
    throw new Error("Failed to stop app session");
  }

  mutate("/api/app-sessions");
  mutate("/api/app-sessions/current");
  return response.json();
}
