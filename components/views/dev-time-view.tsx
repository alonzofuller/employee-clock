"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square, Timer } from "lucide-react";
import { useCurrentAppSession, useAppSessions } from "@/lib/hooks/use-settings";
import { formatTime } from "@/lib/utils";

export function DevTimeView() {
  const { currentSession, startSession, pauseSession, resumeSession, stopSession, isLoading } = useCurrentAppSession();
  const { sessions } = useAppSessions();
  const [elapsed, setElapsed] = useState(0);

  const isRunning = currentSession?.status === "running";
  const isPaused = currentSession?.status === "paused";

  useEffect(() => {
    if (!currentSession || !currentSession.start_time) {
      setElapsed(0);
      return;
    }

    const updateElapsed = () => {
      const start = new Date(currentSession.start_time).getTime();
      const now = Date.now();
      let total = Math.floor((now - start) / 1000);
      
      // Add previously accumulated duration if paused
      if (isPaused && currentSession.duration_seconds) {
        total = currentSession.duration_seconds;
      }
      
      setElapsed(total);
    };

    updateElapsed();
    
    if (isRunning) {
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSession, isRunning, isPaused]);

  const handleStart = async () => {
    await startSession();
  };

  const handlePause = async () => {
    await pauseSession();
  };

  const handleResume = async () => {
    await resumeSession();
  };

  const handleStop = async () => {
    await stopSession();
  };

  // Calculate total dev time from past sessions
  const totalDevSeconds = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-[#a0a0b0] uppercase tracking-wider mb-1">
          ProGuide Tech Solutions — Development Time
        </p>
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-[#d4a537] uppercase tracking-wider">
            App Development Time Keeper
          </h1>
          <div className="flex-1 gold-line" />
        </div>
      </div>

      {/* Timer Card */}
      <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-8 text-center max-w-md mx-auto">
        <Timer className="h-12 w-12 text-[#6366f1] mx-auto mb-4" />
        
        <p className={`text-6xl font-mono font-bold tracking-wider mb-4 ${
          isRunning ? "text-[#22c55e]" : isPaused ? "text-[#f59e0b]" : "text-white"
        }`}>
          {formatTime(elapsed)}
        </p>

        <p className="text-sm text-[#a0a0b0] mb-6">
          {isRunning ? "Timer Running" : isPaused ? "Timer Paused" : "Timer Stopped"}
        </p>

        <div className="flex justify-center gap-3">
          {!currentSession || currentSession.status === "stopped" ? (
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50"
            >
              <Play className="h-5 w-5" />
              Start
            </button>
          ) : (
            <>
              {isRunning ? (
                <button
                  onClick={handlePause}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-[#f59e0b] text-white font-medium rounded-lg hover:bg-[#d97706] transition-colors disabled:opacity-50"
                >
                  <Pause className="h-5 w-5" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                >
                  <Play className="h-5 w-5" />
                  Resume
                </button>
              )}
              <button
                onClick={handleStop}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-[#ef4444] text-white font-medium rounded-lg hover:bg-[#dc2626] transition-colors disabled:opacity-50"
              >
                <Square className="h-5 w-5" />
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-4 text-center">
          <p className="text-xs text-[#a0a0b0] uppercase mb-1">Today</p>
          <p className="text-xl font-bold text-white">{formatTime(elapsed)}</p>
        </div>
        <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-4 text-center">
          <p className="text-xs text-[#a0a0b0] uppercase mb-1">Total Sessions</p>
          <p className="text-xl font-bold text-white">{sessions.length}</p>
        </div>
        <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-4 text-center">
          <p className="text-xs text-[#a0a0b0] uppercase mb-1">All Time</p>
          <p className="text-xl font-bold text-[#22c55e]">{formatTime(totalDevSeconds)}</p>
        </div>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="bg-[#242038] rounded-lg border border-[#3d3655] p-6 max-w-2xl mx-auto">
          <h3 className="text-sm font-semibold text-[#d4a537] uppercase tracking-wider mb-4">
            Recent Sessions
          </h3>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg"
              >
                <div>
                  <p className="text-sm text-white">
                    {new Date(session.start_time).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-[#a0a0b0]">
                    {new Date(session.start_time).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {session.end_time && (
                      <> - {new Date(session.end_time).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}</>
                    )}
                  </p>
                </div>
                <p className="font-mono text-[#22c55e]">
                  {formatTime(session.duration_seconds || 0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
