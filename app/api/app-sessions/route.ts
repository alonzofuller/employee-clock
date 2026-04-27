import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("app_sessions")
    .select("*")
    .order("start_time", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { action } = body;

  if (action === "start") {
    // Check for existing running/paused session
    const { data: existing } = await supabase
      .from("app_sessions")
      .select("*")
      .in("status", ["running", "paused"])
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Session already active" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("app_sessions")
      .insert({
        session_type: "development",
        start_time: new Date().toISOString(),
        status: "running",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  if (action === "pause" || action === "resume" || action === "stop") {
    const { data: session } = await supabase
      .from("app_sessions")
      .select("*")
      .in("status", ["running", "paused"])
      .single();

    if (!session) {
      return NextResponse.json(
        { error: "No active session" },
        { status: 400 }
      );
    }

    const now = new Date();
    let updates: Record<string, unknown> = {};

    if (action === "pause") {
      // Calculate current duration
      const duration =
        session.duration_seconds +
        Math.floor(
          (now.getTime() - new Date(session.start_time).getTime()) / 1000
        );
      updates = {
        status: "paused",
        duration_seconds: duration,
      };
    } else if (action === "resume") {
      updates = {
        status: "running",
        start_time: now.toISOString(),
      };
    } else if (action === "stop") {
      let duration = session.duration_seconds;
      if (session.status === "running") {
        duration += Math.floor(
          (now.getTime() - new Date(session.start_time).getTime()) / 1000
        );
      }
      updates = {
        status: "stopped",
        end_time: now.toISOString(),
        duration_seconds: duration,
      };
    }

    const { data, error } = await supabase
      .from("app_sessions")
      .update(updates)
      .eq("id", session.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
