export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

/** Use when the API returns a relative path for resultUrl. */
export function resolveMediaUrl(resultUrl: string): string {
  if (/^https?:\/\//i.test(resultUrl)) {
    return resultUrl;
  }
  const base = API_BASE.replace(/\/$/, "");
  const path = resultUrl.startsWith("/") ? resultUrl : `/${resultUrl}`;
  return `${base}${path}`;
}

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface Job {
  id: string;
  status: JobStatus;
  resultUrl?: string;
  error?: string;
}

export interface CreateJobResponse {
  jobId: string;
}

function assertCreateJobResponse(data: unknown): CreateJobResponse {
  if (
    typeof data === "object" &&
    data !== null &&
    "jobId" in data &&
    typeof (data as { jobId: unknown }).jobId === "string"
  ) {
    return { jobId: (data as CreateJobResponse).jobId };
  }
  throw new Error("Invalid response: missing jobId");
}

function assertJob(data: unknown): Job {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid response: expected job object");
  }
  const o = data as Record<string, unknown>;
  if (typeof o.id !== "string") {
    throw new Error("Invalid response: missing id");
  }
  const status = o.status;
  if (
    status !== "PENDING" &&
    status !== "PROCESSING" &&
    status !== "COMPLETED" &&
    status !== "FAILED"
  ) {
    throw new Error("Invalid response: invalid status");
  }
  const job: Job = {
    id: o.id,
    status,
  };
  if (typeof o.resultUrl === "string") {
    job.resultUrl = o.resultUrl;
  }
  if (typeof o.error === "string") {
    job.error = o.error;
  }
  return job;
}

export async function createJob(file: File): Promise<CreateJobResponse> {
  const formData = new FormData();
  formData.append("image", file);

  let res: Response;
  try {
    res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/jobs`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Network error while uploading. Is the API server running?");
  }

  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) message = text;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error("Invalid response: expected JSON");
  }

  return assertCreateJobResponse(json);
}

export async function getJob(jobId: string): Promise<Job> {
  let res: Response;
  try {
    res = await fetch(
      `${API_BASE.replace(/\/$/, "")}/api/jobs/${encodeURIComponent(jobId)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
  } catch {
    throw new Error("Network error while fetching job status.");
  }

  if (!res.ok) {
    let message = `Failed to load job (${res.status})`;
    try {
      const text = await res.text();
      if (text) message = text;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error("Invalid response: expected JSON");
  }

  return assertJob(json);
}
