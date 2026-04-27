"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { DevTimer } from "@/components/dev-timer";
import { EmployeesTab } from "@/components/tabs/employees-tab";
import { PayrollTab } from "@/components/tabs/payroll-tab";
import { AuditTab } from "@/components/tabs/audit-tab";
import { SettingsTab } from "@/components/tabs/settings-tab";
import type { TabType } from "@/lib/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("employees");

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {activeTab === "employees" && <EmployeesTab />}
        {activeTab === "payroll" && <PayrollTab />}
        {activeTab === "audit" && <AuditTab />}
        {activeTab === "settings" && <SettingsTab />}
      </main>
      <DevTimer />
    </div>
  );
}
