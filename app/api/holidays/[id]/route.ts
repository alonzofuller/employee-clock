import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Get holiday data for audit log
  const { data: holiday } = await supabase
    .from("holidays")
    .select("*")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("holidays").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create audit log
  if (holiday) {
    await supabase.from("audit_logs").insert({
      employee_name: "System",
      action: "Holiday Removed",
      details: { holiday },
      performed_by: "Admin",
    });
  }

  return NextResponse.json({ success: true });
}
