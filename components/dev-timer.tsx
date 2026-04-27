"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Square } from "lucide-react";
import { formatTime } from "@/lib/utils";
import {
  useCurrentAppSession,
  startAppSession,
  pauseAppSession,
  resumeAppSession,
  stopAppSession,
} from "@/lib/hooks/use-settings";

export function DevTimer() {
  const { session } = useCurrentAppSession();
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Update display seconds based on session state
  useEffect(() => {
    if (!session) {
      setDisplaySeconds(0);
      return;
    }

    if (session.status === "paused") {
      setDisplaySeconds(session.duration_seconds);
      return;
    }

    if (session.status === "running") {
      const startTime = new Date(session.start_time).getTime();
      const baseSeconds = session.duration_seconds;

      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setDisplaySeconds(baseSeconds + elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session]);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await startAppSession();
    } catch (error) {
      console.error("Failed to start session:", error);
    }
    setIsLoading(false);
  };

  const handlePause = async () => {
    setIsLoading(true);
    try {
      await pauseAppSession();
    } catch (error) {
      console.error("Failed to pause session:", error);
    }
    setIsLoading(false);
  };

  const handleResume = async () => {
    setIsLoading(true);
    try {
      await resumeAppSession();
    } catch (error) {
      console.error("Failed to resume session:", error);
    }
    setIsLoading(false);
  };

  const handleStop = async () => {
    setIsLoading(true);
    try {
      await stopAppSession();
    } catch (error) {
      console.error("Failed to stop session:", error);
    }
    setIsLoading(false);
  };

  const isRunning = session?.status === "running";
  const isPaused = session?.status === "paused";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center gap-3 rounded-xl bg-card border border-border p-3 shadow-lg ${
          isRunning ? "timer-running" : ""
        }`}
      >
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Dev Time</p>
          <p className="font-mono text-lg font-bold text-foreground">
            {formatTime(displaySeconds)}
          </p>
        </div>
        <div className="flex gap-1">
          {!session || session.status === "stopped" ? (
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
              title="Start"
            >
              <Play className="h-4 w-4" />
            </button>
          ) : (
            <>
              {isRunning ? (
                <button
                  onClick={handlePause}
                  disabled={isLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning text-white hover:bg-warning/90 transition-colors disabled:opacity-50"
                  title="Pause"
                >
                  <Pause className="h-4 w-4" />
                </button>
              ) : isPaused ? (
                <button
                  onClick={handleResume}
                  disabled={isLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
                  title="Resume"
                >
                  <Play className="h-4 w-4" />
                </button>
              ) : null}
              <button
                onClick={handleStop}
                disabled={isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                title="Stop"
              >
                <Square className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
