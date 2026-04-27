"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { StaffClockView } from "@/components/views/staff-clock-view";
import { ScheduleView } from "@/components/views/schedule-view";
import { HolidayView } from "@/components/views/holiday-view";
import { DevTimeView } from "@/components/views/dev-time-view";
import { PayrollModal } from "@/components/modals/payroll-modal";
import { AuditModal } from "@/components/modals/audit-modal";

export default function Home() {
  const [activeItem, setActiveItem] = useState("clock");
  const [showPayroll, setShowPayroll] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  const renderContent = () => {
    switch (activeItem) {
      case "clock":
        return <StaffClockView />;
      case "schedule":
        return <ScheduleView />;
      case "holiday":
        return <HolidayView />;
      case "devtime":
        return <DevTimeView />;
      default:
        return <StaffClockView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#1a1625]">
      <Sidebar activeItem={activeItem} onItemChange={setActiveItem} />
      
      <div className="flex-1 flex flex-col">
        <Header
          onShowPayroll={() => setShowPayroll(true)}
          onShowAudit={() => setShowAudit(true)}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <PayrollModal isOpen={showPayroll} onClose={() => setShowPayroll(false)} />
      <AuditModal isOpen={showAudit} onClose={() => setShowAudit(false)} />
    </div>
  );
}
