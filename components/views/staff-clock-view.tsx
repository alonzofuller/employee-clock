"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useEmployees } from "@/lib/hooks/use-employees";
import { EmployeeCard } from "@/components/employee-card";
import { PayrollDashboard } from "@/components/payroll-dashboard";
import { AddEmployeeModal } from "@/components/modals/add-employee-modal";
import { EditEmployeeModal } from "@/components/modals/edit-employee-modal";
import { CorrectionModal } from "@/components/modals/correction-modal";
import type { EmployeeWithSession } from "@/lib/types";

export function StaffClockView() {
  const { employees, isLoading, mutate } = useEmployees();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithSession | null>(null);

  const handleEdit = (employee: EmployeeWithSession) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleCorrection = (employee: EmployeeWithSession) => {
    setSelectedEmployee(employee);
    setShowCorrectionModal(true);
  };

  // Count active employees and those on break
  const activeCount = employees.filter((e) => e.current_session?.status === "working").length;
  const breakCount = employees.filter((e) => e.current_session?.status === "on_break").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6366f1] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-xs text-[#a0a0b0] uppercase tracking-wider mb-1">
          iTeam Legal Solutions — Employee Clock
        </p>
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-[#d4a537] uppercase tracking-wider">
            Staff Clock — {activeCount} Active · {breakCount} On Break
          </h1>
          <div className="flex-1 gold-line" />
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-[#4f46e5] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Payroll Dashboard */}
      <PayrollDashboard employees={employees} />

      {/* Employee Cards Grid */}
      {employees.length === 0 ? (
        <div className="bg-[#242038] rounded-lg border border-dashed border-[#3d3655] p-12 text-center">
          <h3 className="text-lg font-medium text-white">No employees yet</h3>
          <p className="mt-1 text-sm text-[#a0a0b0]">
            Add your first employee to get started with time tracking.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-[#4f46e5] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEdit}
              onCorrection={handleCorrection}
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
        employees={selectedEmployee ? [selectedEmployee] : employees}
        onClose={() => {
          setShowCorrectionModal(false);
          setSelectedEmployee(null);
        }}
        onSuccess={mutate}
      />
    </div>
  );
}
