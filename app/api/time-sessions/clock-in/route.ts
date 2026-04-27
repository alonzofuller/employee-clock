import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { employee_id } = body;

  // Check if employee exists
  const { data: employee, error: empError } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employee_id)
    .single();

  if (empError || !employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  // Check if already clocked in
  const { data: existingSession } = await supabase
    .from("time_sessions")
    .select("*")
    .eq("employee_id", employee_id)
    .in("status", ["working", "on_break"])
    .single();

  if (existingSession) {
    return NextResponse.json(
      { error: "Employee is already clocked in" },
      { status: 400 }
    );
  }

  // Create new session
  const { data: session, error } = await supabase
    .from("time_sessions")
    .insert({
      employee_id,
      clock_in: new Date().toISOString(),
      status: "working",
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
    action: "Clock In",
    details: { session_id: session.id, time: session.clock_in },
    performed_by: employee.name,
  });

  return NextResponse.json(session);
}
