import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Get the period
  const { data: period, error: periodError } = await supabase
    .from("payroll_periods")
    .select("*")
    .eq("id", id)
    .single();

  if (periodError || !period) {
    return NextResponse.json({ error: "Period not found" }, { status: 404 });
  }

  // Get all completed sessions in this period
  const { data: sessions } = await supabase
    .from("time_sessions")
    .select("*, employees(*)")
    .eq("status", "completed")
    .gte("clock_in", period.start_date)
    .lte("clock_in", period.end_date + "T23:59:59.999Z");

  // Calculate totals
  let totalHours = 0;
  let overtimeHours = 0;
  let totalAmount = 0;

  sessions?.forEach((session) => {
    if (session.clock_out && session.employees) {
      const hours =
        (new Date(session.clock_out).getTime() -
          new Date(session.clock_in).getTime()) /
          1000 /
          60 /
          60 -
        (session.total_break_minutes || 0) / 60;

      totalHours += hours;

      const emp = session.employees;
      const regularHours = Math.min(hours, 8);
      const ot = Math.max(0, hours - 8);
      overtimeHours += ot;

      totalAmount += regularHours * emp.hourly_rate + ot * emp.overtime_rate;
    }
  });

  // Update the period
  const { data: updatedPeriod, error } = await supabase
    .from("payroll_periods")
    .update({
      status: "closed",
      total_hours: totalHours,
      total_overtime_hours: overtimeHours,
      total_amount: totalAmount,
      closed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create audit log
  await supabase.from("audit_logs").insert({
    employee_name: "System",
    action: "Payroll Period Closed",
    details: {
      period_id: id,
      total_hours: totalHours.toFixed(2),
      overtime_hours: overtimeHours.toFixed(2),
      total_amount: totalAmount.toFixed(2),
    },
    performed_by: "Admin",
  });

  return NextResponse.json(updatedPeriod);
}
