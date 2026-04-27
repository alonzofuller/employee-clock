import useSWR, { mutate } from "swr";
import type { Employee, EmployeeWithSession, EmployeeFormData, TimeSession } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useEmployees() {
  const { data, error, isLoading } = useSWR<EmployeeWithSession[]>(
    "/api/employees",
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds for live updates
    }
  );

  return {
    employees: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate("/api/employees"),
  };
}

export function useEmployee(id: string) {
  const { data, error, isLoading } = useSWR<EmployeeWithSession>(
    id ? `/api/employees/${id}` : null,
    fetcher
  );

  return {
    employee: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/employees/${id}`),
  };
}

export async function createEmployee(data: EmployeeFormData): Promise<Employee> {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create employee");
  }

  mutate("/api/employees");
  return response.json();
}

export async function updateEmployee(id: string, data: Partial<EmployeeFormData>): Promise<Employee> {
  const response = await fetch(`/api/employees/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update employee");
  }

  mutate("/api/employees");
  mutate(`/api/employees/${id}`);
  return response.json();
}

export async function deleteEmployee(id: string): Promise<void> {
  const response = await fetch(`/api/employees/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete employee");
  }

  mutate("/api/employees");
}

// Time session actions
export async function clockIn(employeeId: string): Promise<TimeSession> {
  const response = await fetch("/api/time-sessions/clock-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee_id: employeeId }),
  });

  if (!response.ok) {
    throw new Error("Failed to clock in");
  }

  mutate("/api/employees");
  return response.json();
}

export async function clockOut(employeeId: string): Promise<TimeSession> {
  const response = await fetch("/api/time-sessions/clock-out", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee_id: employeeId }),
  });

  if (!response.ok) {
    throw new Error("Failed to clock out");
  }

  mutate("/api/employees");
  return response.json();
}

export async function startBreak(employeeId: string): Promise<TimeSession> {
  const response = await fetch("/api/time-sessions/break", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee_id: employeeId, action: "start" }),
  });

  if (!response.ok) {
    throw new Error("Failed to start break");
  }

  mutate("/api/employees");
  return response.json();
}

export async function endBreak(employeeId: string): Promise<TimeSession> {
  const response = await fetch("/api/time-sessions/break", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee_id: employeeId, action: "end" }),
  });

  if (!response.ok) {
    throw new Error("Failed to end break");
  }

  mutate("/api/employees");
  return response.json();
}
