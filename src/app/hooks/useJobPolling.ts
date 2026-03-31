"use client";

import { useEffect, useState } from "react";
import type { Job } from "@/app/lib/api";
import { getJob } from "@/app/lib/api";

export interface UseJobPollingResult {
  job: Job | null;
  error: string | null;
}

export function useJobPolling(jobId: string | null): UseJobPollingResult {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setError(null);
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const poll = async () => {
      try {
        const next = await getJob(jobId);
        if (cancelled) return;
        setError(null);
        setJob(next);
        if (next.status === "COMPLETED" || next.status === "FAILED") {
          if (intervalId !== undefined) {
            clearInterval(intervalId);
            intervalId = undefined;
          }
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to fetch job status");
      }
    };

    // Assign interval before the first async poll so a fast terminal response can clear it.
    intervalId = setInterval(poll, 2000);
    void poll();

    return () => {
      cancelled = true;
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [jobId]);

  return { job, error };
}
