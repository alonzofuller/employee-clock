import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: employee, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get current session if any
  const { data: session } = await supabase
    .from("time_sessions")
    .select("*")
    .eq("employee_id", id)
    .in("status", ["working", "on_break"])
    .single();

  return NextResponse.json({
    ...employee,
    current_session: session || null,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  // Get old data for audit log
  const { data: oldData } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("employees")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create audit log
  await supabase.from("audit_logs").insert({
    employee_id: id,
    employee_name: data.name,
    action: "Employee Updated",
    details: { old: oldData, new: data },
    performed_by: "Admin",
  });

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Get employee data for audit log
  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  // Soft delete - set is_active to false
  const { error } = await supabase
    .from("employees")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create audit log
  if (employee) {
    await supabase.from("audit_logs").insert({
      employee_id: id,
      employee_name: employee.name,
      action: "Employee Removed",
      details: { employee },
      performed_by: "Admin",
    });
  }

  return NextResponse.json({ success: true });
}
