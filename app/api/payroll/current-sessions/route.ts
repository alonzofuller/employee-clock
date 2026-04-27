import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Get the current open payroll period
  const { data: period } = await supabase
    .from("payroll_periods")
    .select("*")
    .eq("status", "open")
    .order("start_date", { ascending: false })
    .limit(1)
    .single();

  let startDate: string;
  let endDate: string;

  if (period) {
    startDate = period.start_date;
    endDate = period.end_date;
  } else {
    // Default to current week
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    startDate = weekStart.toISOString().split("T")[0];
    endDate = weekEnd.toISOString().split("T")[0];
  }

  // Get all sessions in this period
  const { data: sessions, error } = await supabase
    .from("time_sessions")
    .select("*, employees(name, hourly_rate, overtime_rate)")
    .eq("status", "completed")
    .gte("clock_in", startDate)
    .lte("clock_in", endDate + "T23:59:59.999Z")
    .order("clock_in", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate totals
  let totalHours = 0;
  let overtimeHours = 0;
  let totalEarnings = 0;

  const sessionsWithNames =
    sessions?.map((session) => {
      const hours =
        session.clock_out
          ? (new Date(session.clock_out).getTime() -
              new Date(session.clock_in).getTime()) /
              1000 /
              60 /
              60 -
            (session.total_break_minutes || 0) / 60
          : 0;

      totalHours += hours;

      const emp = session.employees;
      if (emp) {
        const regularHours = Math.min(hours, 8);
        const ot = Math.max(0, hours - 8);
        overtimeHours += ot;
        totalEarnings +=
          regularHours * emp.hourly_rate + ot * emp.overtime_rate;
      }

      return {
        ...session,
        employee_name: emp?.name || "Unknown",
      };
    }) || [];

  return NextResponse.json({
    sessions: sessionsWithNames,
    totals: {
      total_hours: totalHours,
      overtime_hours: overtimeHours,
      total_earnings: totalEarnings,
    },
  });
}
