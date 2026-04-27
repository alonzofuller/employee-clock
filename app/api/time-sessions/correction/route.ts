import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { employee_id, session_id, clock_in, clock_out, reason } = body;

  // Get employee
  const { data: employee, error: empError } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employee_id)
    .single();

  if (empError || !employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  if (session_id) {
    // Update existing session
    const { data: oldSession } = await supabase
      .from("time_sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    const { data: session, error } = await supabase
      .from("time_sessions")
      .update({
        clock_in: new Date(clock_in).toISOString(),
        clock_out: clock_out ? new Date(clock_out).toISOString() : null,
        status: clock_out ? "completed" : "working",
      })
      .eq("id", session_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      employee_id,
      employee_name: employee.name,
      action: "Time Correction",
      details: {
        session_id,
        old_clock_in: oldSession?.clock_in,
        old_clock_out: oldSession?.clock_out,
        new_clock_in: clock_in,
        new_clock_out: clock_out,
        reason,
      },
      performed_by: "Admin",
    });

    return NextResponse.json(session);
  } else {
    // Create new session
    const { data: session, error } = await supabase
      .from("time_sessions")
      .insert({
        employee_id,
        clock_in: new Date(clock_in).toISOString(),
        clock_out: clock_out ? new Date(clock_out).toISOString() : null,
        status: clock_out ? "completed" : "working",
        notes: `Admin correction: ${reason}`,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      employee_id,
      employee_name: employee.name,
      action: "Manual Time Entry",
      details: {
        session_id: session.id,
        clock_in,
        clock_out,
        reason,
      },
      performed_by: "Admin",
    });

    return NextResponse.json(session);
  }
}
