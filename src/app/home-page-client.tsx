"use client";

import { useCallback, useMemo, useState } from "react";
import { UploadForm } from "@/app/components/UploadForm";
import { StatusDisplay, type UiPhase } from "@/app/components/StatusDisplay";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import { useJobPolling } from "@/app/hooks/useJobPolling";
import { createJob, resolveMediaUrl } from "@/app/lib/api";

export interface HomePageClientProps {
  apiBaseLabel: string;
}

export function HomePageClient({ apiBaseLabel }: HomePageClientProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { job, error: pollError } = useJobPolling(jobId);

  const phase: UiPhase = useMemo(() => {
    if (isUploading) return "uploading";
    if (!jobId) return "idle";
    if (!job) return "processing";
    if (job.status === "COMPLETED") return "completed";
    if (job.status === "FAILED") return "failed";
    return "processing";
  }, [isUploading, jobId, job]);

  const handleSubmit = useCallback(async (file: File) => {
    setUploadError(null);
    setJobId(null);
    setIsUploading(true);
    try {
      const { jobId: nextId } = await createJob(file);
      setJobId(nextId);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const showVideo = phase === "completed" && job?.resultUrl;

  return (
    <div className="min-h-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Image to video
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Upload an image to create a video job. The page polls the API every 2 seconds until the
            job completes or fails.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            API base:{" "}
            <code className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono dark:bg-zinc-800">
              {apiBaseLabel}
            </code>
            {" — "}
            run this app on another port (e.g.{" "}
            <code className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono dark:bg-zinc-800">
              npm run dev -- -p 3001
            </code>
            ) if your backend already uses 3000.
          </p>
        </header>

        <UploadForm onSubmit={handleSubmit} disabled={false} isUploading={isUploading} />

        <StatusDisplay
          phase={phase}
          jobStatus={job?.status ?? null}
          pollError={pollError}
          jobError={job?.error ?? null}
          uploadError={uploadError}
          jobId={jobId}
        />

        {showVideo && job.resultUrl ? (
          <VideoPlayer src={resolveMediaUrl(job.resultUrl)} />
        ) : null}
      </main>
    </div>
  );
}
