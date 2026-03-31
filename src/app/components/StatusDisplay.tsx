import type { JobStatus } from "@/app/lib/api";

export type UiPhase =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "failed";

export interface StatusDisplayProps {
  phase: UiPhase;
  jobStatus?: JobStatus | null;
  pollError?: string | null;
  jobError?: string | null;
  uploadError?: string | null;
  jobId?: string | null;
}

export function StatusDisplay({
  phase,
  jobStatus,
  pollError,
  jobError,
  uploadError,
  jobId,
}: StatusDisplayProps) {
  return (
    <section
      className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      aria-live="polite"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Job status
      </h2>

      <div className="mt-4 space-y-3 text-sm">
        {phase === "idle" ? (
          <p className="text-zinc-600 dark:text-zinc-400">No job yet. Upload an image to begin.</p>
        ) : null}

        {phase === "uploading" ? (
          <p className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-100">
            <span aria-hidden>⏳</span>
            Uploading…
          </p>
        ) : null}

        {phase === "processing" ? (
          <p className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-200">
            <span aria-hidden>⏳</span>
            Processing…
            {jobStatus ? (
              <span className="font-normal text-zinc-600 dark:text-zinc-400">({jobStatus})</span>
            ) : null}
          </p>
        ) : null}

        {phase === "completed" ? (
          <p className="flex items-center gap-2 font-medium text-emerald-800 dark:text-emerald-200">
            <span aria-hidden>✅</span>
            Completed
          </p>
        ) : null}

        {phase === "failed" ? (
          <p className="flex items-center gap-2 font-medium text-red-800 dark:text-red-200">
            <span aria-hidden>❌</span>
            Failed
          </p>
        ) : null}

        {jobId ? (
          <p className="font-mono text-xs text-zinc-500 dark:text-zinc-500">
            Job ID: <span className="break-all text-zinc-700 dark:text-zinc-300">{jobId}</span>
          </p>
        ) : null}

        {uploadError ? (
          <p className="text-red-600 dark:text-red-400" role="alert">
            {uploadError}
          </p>
        ) : null}

        {pollError ? (
          <p className="text-amber-700 dark:text-amber-300" role="alert">
            Polling: {pollError}
          </p>
        ) : null}

        {jobError ? (
          <p className="text-red-600 dark:text-red-400" role="alert">
            {jobError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
