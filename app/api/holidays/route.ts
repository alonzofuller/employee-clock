import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("holidays")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("holidays")
    .insert({
      name: body.name,
      date: body.date,
      is_paid: body.is_paid ?? true,
      status: body.status ?? "all_closed",
      holiday_type: body.holiday_type ?? "company",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create audit log
  await supabase.from("audit_logs").insert({
    employee_name: "System",
    action: "Holiday Added",
    details: { holiday: data },
    performed_by: "Admin",
  });

  return NextResponse.json(data);
}
