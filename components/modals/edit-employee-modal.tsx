"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import type { Employee, WeeklySchedule, Schedule } from "@/lib/types";
import { getInitials, getInitialsColor } from "@/lib/utils";

interface EditEmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  schedules?: Schedule[];
  onClose: () => void;
  onSave: (data: {
    employee: Partial<Employee>;
    schedules: WeeklySchedule;
  }) => Promise<void>;
}

const defaultSchedule: WeeklySchedule = {
  monday: { active: true, start_time: "9:00am", end_time: "5:00pm" },
  tuesday: { active: true, start_time: "9:00am", end_time: "5:00pm" },
  wednesday: { active: true, start_time: "9:00am", end_time: "5:00pm" },
  thursday: { active: true, start_time: "9:00am", end_time: "5:00pm" },
  friday: { active: true, start_time: "9:00am", end_time: "5:00pm" },
  saturday: { active: false, start_time: "9:00am", end_time: "5:00pm" },
  sunday: { active: false, start_time: "9:00am", end_time: "5:00pm" },
};

const dayMapping: Record<number, keyof WeeklySchedule> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export function EditEmployeeModal({ 
  isOpen, 
  employee, 
  schedules = [],
  onClose, 
  onSave 
}: EditEmployeeModalProps) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [employmentType, setEmploymentType] = useState<string>("hourly");
  const [payType, setPayType] = useState<string>("hourly");
  const [hourlyRate, setHourlyRate] = useState("15");
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(defaultSchedule);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with employee data
  useEffect(() => {
    if (employee) {
      setPhotoUrl(employee.photo_url || "");
      setHireDate(employee.hire_date || "");
      setEmploymentType(employee.employment_type || "hourly");
      setPayType(employee.pay_type || "hourly");
      setHourlyRate(employee.hourly_rate?.toString() || "15");
    }
  }, [employee]);

  // Convert schedules from DB format to WeeklySchedule
  useEffect(() => {
    if (schedules && schedules.length > 0) {
      const newSchedule = { ...defaultSchedule };
      
      schedules.forEach((schedule) => {
        const dayName = dayMapping[schedule.day_of_week];
        if (dayName) {
          newSchedule[dayName] = {
            active: !schedule.is_day_off,
            start_time: schedule.start_time || "9:00am",
            end_time: schedule.end_time || "5:00pm",
          };
        }
      });
      setWeeklySchedule(newSchedule);
    } else {
      setWeeklySchedule(defaultSchedule);
    }
  }, [schedules]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDayToggle = (day: keyof WeeklySchedule) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active },
    }));
  };

  const handleTimeChange = (
    day: keyof WeeklySchedule,
    field: "start_time" | "end_time",
    value: string
  ) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!employee) return;
    
    setSaving(true);
    try {
      await onSave({
        employee: {
          photo_url: photoUrl || null,
          hire_date: hireDate || null,
          employment_type: employmentType as 'hourly' | 'salary' | 'contract',
          pay_type: payType as 'hourly' | 'salary',
          hourly_rate: parseFloat(hourlyRate) || 15,
          overtime_rate: (parseFloat(hourlyRate) || 15) * 1.5,
        },
        schedules: weeklySchedule,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save employee:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !employee) return null;

  const initials = getInitials(employee.name);
  const initialsColor = getInitialsColor(employee.name);
  const days: (keyof WeeklySchedule)[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-[#1e1a2e] text-white rounded-t-lg">
            <h2 className="text-lg font-semibold">Edit Employee Details</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Employee Header */}
            <div className="flex items-center gap-4">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={employee.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#1e1a2e]"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-[#1e1a2e]"
                  style={{ backgroundColor: initialsColor }}
                >
                  {initials}
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{employee.name}</h3>
                <p className="text-gray-500">{employee.role}</p>
              </div>
            </div>

            {/* Profile Picture Section */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">
                Profile Picture
              </h4>
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: initialsColor }}
                  >
                    {initials}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </button>
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">
                Employment Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1e1a2e] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1e1a2e] focus:border-transparent text-sm"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="salary">Exempt (Salary)</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pay Settings */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">
                Pay Settings
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Pay Type
                  </label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1e1a2e] focus:border-transparent text-sm"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="salary">Salary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1e1a2e] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">
                Weekly Schedule
              </h4>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => (
                  <div key={day} className="text-center">
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-2">
                      {day.slice(0, 3)}
                    </div>
                    <label className="flex items-center justify-center gap-1 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={weeklySchedule[day].active}
                        onChange={() => handleDayToggle(day)}
                        className="w-4 h-4 rounded border-gray-300 text-[#1e1a2e] focus:ring-[#1e1a2e]"
                      />
                      <span className="text-xs text-gray-600">Active</span>
                    </label>
                    <input
                      type="text"
                      value={weeklySchedule[day].start_time}
                      onChange={(e) => handleTimeChange(day, "start_time", e.target.value)}
                      disabled={!weeklySchedule[day].active}
                      className="w-full px-1 py-1 text-xs border border-gray-300 rounded mb-1 disabled:bg-gray-100 disabled:text-gray-400 text-center"
                      placeholder="9:00am"
                    />
                    <input
                      type="text"
                      value={weeklySchedule[day].end_time}
                      onChange={(e) => handleTimeChange(day, "end_time", e.target.value)}
                      disabled={!weeklySchedule[day].active}
                      className="w-full px-1 py-1 text-xs border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-400 text-center"
                      placeholder="5:00pm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#0ea5e9] text-white rounded-md hover:bg-[#0284c7] disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
