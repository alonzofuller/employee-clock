import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employee_id");

  let query = supabase.from("schedules").select("*").order("day_of_week");

  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { employee_id, day_of_week, start_time, end_time, is_day_off } = body;

  // Upsert schedule (update if exists, insert if not)
  const { data, error } = await supabase
    .from("schedules")
    .upsert(
      {
        employee_id,
        day_of_week,
        start_time: is_day_off ? null : start_time,
        end_time: is_day_off ? null : end_time,
        is_day_off,
      },
      {
        onConflict: "employee_id,day_of_week",
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
