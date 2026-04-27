"use client";

import { Clock, Calendar, CalendarDays, Timer } from "lucide-react";

interface SidebarProps {
  activeItem: string;
  onItemChange: (item: string) => void;
}

export function Sidebar({ activeItem, onItemChange }: SidebarProps) {
  return (
    <aside className="w-56 min-h-screen bg-[#1e1a2d] border-r border-[#3d3655] flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-[#3d3655]">
        <h1 className="text-lg font-bold text-white">iTeam Legal Solutions</h1>
        <p className="text-xs text-[#d4a537] uppercase tracking-wider mt-0.5">
          Employee Time Tracking System
        </p>
      </div>

      {/* Business Dashboard Section */}
      <div className="p-4">
        <h2 className="text-xs font-semibold text-[#d4a537] uppercase tracking-wider mb-3">
          Business Dashboard
        </h2>
      </div>

      {/* iTeam Legal Solutions Section */}
      <div className="px-2">
        <p className="px-2 text-xs font-medium text-[#a0a0b0] uppercase tracking-wider mb-2">
          iTeam Legal Solutions
        </p>
        <button
          onClick={() => onItemChange("clock")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeItem === "clock"
              ? "bg-[#ef4444] text-white"
              : "text-[#a0a0b0] hover:text-white hover:bg-[#2d2640]"
          }`}
        >
          <Clock className="h-4 w-4" />
          Employee Clock
        </button>
        <button
          onClick={() => onItemChange("schedule")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeItem === "schedule"
              ? "bg-[#3b82f6] text-white"
              : "text-[#a0a0b0] hover:text-white hover:bg-[#2d2640]"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Schedule Manager
        </button>
        <button
          onClick={() => onItemChange("holiday")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeItem === "holiday"
              ? "bg-[#3b82f6] text-white"
              : "text-[#a0a0b0] hover:text-white hover:bg-[#2d2640]"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Holiday Schedule
        </button>
      </div>

      {/* ProGuide Tech Solutions Section */}
      <div className="px-2 mt-6">
        <p className="px-2 text-xs font-medium text-[#a0a0b0] uppercase tracking-wider mb-2">
          ProGuide Tech Solutions
        </p>
        <button
          onClick={() => onItemChange("devtime")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeItem === "devtime"
              ? "bg-[#3b82f6] text-white"
              : "text-[#a0a0b0] hover:text-white hover:bg-[#2d2640]"
          }`}
        >
          <Timer className="h-4 w-4" />
          App Dev Time Keeper
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />
    </aside>
  );
}
