import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Get all active employees with their current sessions
  const { data: employees, error: empError } = await supabase
    .from("employees")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (empError) {
    return NextResponse.json({ error: empError.message }, { status: 500 });
  }

  // Get current time sessions for employees
  const { data: sessions } = await supabase
    .from("time_sessions")
    .select("*")
    .in("status", ["working", "on_break"]);

  // Get today's completed sessions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data: todaySessions } = await supabase
    .from("time_sessions")
    .select("*")
    .gte("clock_in", today.toISOString())
    .eq("status", "completed");

  // Get this week's sessions for each employee
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  
  const { data: weekSessions } = await supabase
    .from("time_sessions")
    .select("*")
    .gte("clock_in", weekStart.toISOString())
    .eq("status", "completed");

  // Combine data
  const employeesWithSessions = employees?.map((emp) => {
    const currentSession = sessions?.find((s) => s.employee_id === emp.id) || null;
    
    // Calculate today's hours
    const empTodaySessions = todaySessions?.filter((s) => s.employee_id === emp.id) || [];
    let todayHours = empTodaySessions.reduce((acc, s) => {
      if (s.clock_out) {
        const hours = (new Date(s.clock_out).getTime() - new Date(s.clock_in).getTime()) / 1000 / 60 / 60;
        return acc + hours - (s.total_break_minutes || 0) / 60;
      }
      return acc;
    }, 0);

    // Add current session time if working
    if (currentSession) {
      const hours = (Date.now() - new Date(currentSession.clock_in).getTime()) / 1000 / 60 / 60;
      todayHours += hours - (currentSession.total_break_minutes || 0) / 60;
    }

    // Calculate week hours
    const empWeekSessions = weekSessions?.filter((s) => s.employee_id === emp.id) || [];
    const weekHours = empWeekSessions.reduce((acc, s) => {
      if (s.clock_out) {
        const hours = (new Date(s.clock_out).getTime() - new Date(s.clock_in).getTime()) / 1000 / 60 / 60;
        return acc + hours - (s.total_break_minutes || 0) / 60;
      }
      return acc;
    }, 0) + todayHours;

    // Calculate today's earnings
    const regularHours = Math.min(todayHours, 8);
    const overtimeHours = Math.max(0, todayHours - 8);
    const todayEarnings = regularHours * emp.hourly_rate + overtimeHours * emp.overtime_rate;

    return {
      ...emp,
      current_session: currentSession,
      today_hours: todayHours,
      week_hours: weekHours,
      today_earnings: todayEarnings,
    };
  });

  return NextResponse.json(employeesWithSessions);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("employees")
    .insert({
      name: body.name,
      role: body.role || "Employee",
      hourly_rate: body.hourly_rate || 15.0,
      overtime_rate: body.overtime_rate || 22.5,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create audit log
  await supabase.from("audit_logs").insert({
    employee_id: data.id,
    employee_name: data.name,
    action: "Employee Added",
    details: { hourly_rate: data.hourly_rate, role: data.role },
    performed_by: "Admin",
  });

  return NextResponse.json(data);
}
