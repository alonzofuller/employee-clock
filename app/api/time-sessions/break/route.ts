import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { employee_id, action } = body;

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

  const now = new Date();

  if (action === "start") {
    if (session.status === "on_break") {
      return NextResponse.json(
        { error: "Already on break" },
        { status: 400 }
      );
    }

    const { data: updatedSession, error } = await supabase
      .from("time_sessions")
      .update({
        status: "on_break",
        break_start: now.toISOString(),
      })
      .eq("id", session.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      employee_id,
      employee_name: employee.name,
      action: "Break Started",
      details: { session_id: session.id, time: now.toISOString() },
      performed_by: employee.name,
    });

    return NextResponse.json(updatedSession);
  } else if (action === "end") {
    if (session.status !== "on_break") {
      return NextResponse.json(
        { error: "Not currently on break" },
        { status: 400 }
      );
    }

    // Calculate break duration
    const breakStart = new Date(session.break_start!);
    const breakDuration = Math.floor(
      (now.getTime() - breakStart.getTime()) / 1000 / 60
    );
    const totalBreakMinutes = (session.total_break_minutes || 0) + breakDuration;

    const { data: updatedSession, error } = await supabase
      .from("time_sessions")
      .update({
        status: "working",
        break_end: now.toISOString(),
        total_break_minutes: totalBreakMinutes,
      })
      .eq("id", session.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      employee_id,
      employee_name: employee.name,
      action: "Break Ended",
      details: {
        session_id: session.id,
        break_duration_minutes: breakDuration,
        total_break_minutes: totalBreakMinutes,
      },
      performed_by: employee.name,
    });

    return NextResponse.json(updatedSession);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
