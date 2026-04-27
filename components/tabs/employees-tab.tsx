"use client";

import { useState } from "react";
import { Plus, Wrench, Users, Clock, DollarSign } from "lucide-react";
import { useEmployees } from "@/lib/hooks/use-employees";
import { EmployeeCard } from "@/components/employee-card";
import { AddEmployeeModal } from "@/components/modals/add-employee-modal";
import { EditEmployeeModal } from "@/components/modals/edit-employee-modal";
import { CorrectionModal } from "@/components/modals/correction-modal";
import type { EmployeeWithSession } from "@/lib/types";
import { formatCurrency, formatHours } from "@/lib/utils";

export function EmployeesTab() {
  const { employees, isLoading, mutate } = useEmployees();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithSession | null>(null);

  const handleEdit = (employee: EmployeeWithSession) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  // Calculate summary stats
  const activeCount = employees.filter((e) => e.current_session).length;
  const totalTodayHours = employees.reduce((acc, e) => acc + (e.today_hours || 0), 0);
  const totalTodayEarnings = employees.reduce((acc, e) => acc + (e.today_earnings || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Now</p>
              <p className="text-2xl font-bold text-foreground">
                {activeCount} <span className="text-sm font-normal text-muted-foreground">/ {employees.length}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today&apos;s Hours</p>
              <p className="text-2xl font-bold text-foreground">{formatHours(totalTodayHours)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
              <DollarSign className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today&apos;s Earnings</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalTodayEarnings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Employees</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCorrectionModal(true)}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <Wrench className="h-4 w-4" />
            Admin Correction
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Employee Grid */}
      {employees.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No employees yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first employee to get started with time tracking.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEdit}
              onMutate={mutate}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={mutate}
      />
      <EditEmployeeModal
        isOpen={showEditModal}
        employee={selectedEmployee}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEmployee(null);
        }}
        onSuccess={mutate}
      />
      <CorrectionModal
        isOpen={showCorrectionModal}
        employees={employees}
        onClose={() => setShowCorrectionModal(false)}
        onSuccess={mutate}
      />
    </div>
  );
}
