import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { employee_id } = body;

  // Get employee
  const { data: employee, error: empError } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employee_id)
    .single();

  if (empError || !employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  // Get current session
  const { data: session, error: sessionError } = await supabase
    .from("time_sessions")
    .select("*")
    .eq("employee_id", employee_id)
    .in("status", ["working", "on_break"])
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: "No active session found" },
      { status: 400 }
    );
  }

  const clockOut = new Date();
  
  // If on break, end the break first
  let totalBreakMinutes = session.total_break_minutes || 0;
  if (session.status === "on_break" && session.break_start) {
    const breakDuration = Math.floor(
      (clockOut.getTime() - new Date(session.break_start).getTime()) / 1000 / 60
    );
    totalBreakMinutes += breakDuration;
  }

  // Calculate if overtime
  const clockIn = new Date(session.clock_in);
  const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / 1000 / 60;
  const workedHours = (totalMinutes - totalBreakMinutes) / 60;
  const isOvertime = workedHours > 8;

  // Update session
  const { data: updatedSession, error } = await supabase
    .from("time_sessions")
    .update({
      clock_out: clockOut.toISOString(),
      status: "completed",
      total_break_minutes: totalBreakMinutes,
      break_start: null,
      break_end: session.break_start ? clockOut.toISOString() : session.break_end,
      is_overtime: isOvertime,
    })
    .eq("id", session.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate earnings for audit
  const regularHours = Math.min(workedHours, 8);
  const overtimeHours = Math.max(0, workedHours - 8);
  const earnings = regularHours * employee.hourly_rate + overtimeHours * employee.overtime_rate;

  // Create audit log
  await supabase.from("audit_logs").insert({
    employee_id,
    employee_name: employee.name,
    action: "Clock Out",
    details: {
      session_id: session.id,
      clock_in: session.clock_in,
      clock_out: clockOut.toISOString(),
      worked_hours: workedHours.toFixed(2),
      break_minutes: totalBreakMinutes,
      earnings: earnings.toFixed(2),
      is_overtime: isOvertime,
    },
    performed_by: employee.name,
  });

  return NextResponse.json(updatedSession);
}
