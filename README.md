# K&M Productions — Image to video (frontend)

Next.js (App Router) + TypeScript UI for submitting an image to a backend job queue and watching the job until a video is ready.

## Prerequisites

- Node.js 18+
- A running backend that exposes:

  - `POST /api/jobs` — `multipart/form-data` with field `image` (file), returns `{ jobId }`
  - `GET /api/jobs/:id` — returns `{ id, status, resultUrl?, error? }` with `status` in `PENDING` | `PROCESSING` | `COMPLETED` | `FAILED`

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the API base URL (optional). Create `.env.local` in the project root:

   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   ```

   If unset, the app defaults to `http://localhost:3000`.

3. Run the dev server (use another port if the API already uses 3000):

   ```bash
   npm run dev
   # or
   npm run dev -- -p 3001
   ```

4. Open the printed local URL in your browser.

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

---

## How it works (file upload and job lifecycle)

### 1. Choose an image

The user picks a file with the **Image file** control (`accept="image/*"`). The form validates that a file is selected before submit.

### 2. Upload (create job)

On **Start image-to-video job**:

- The UI enters an **uploading** state: the submit button is disabled and shows **Uploading…** with a spinner.
- The client calls `createJob(file)` in `src/app/lib/api.ts`, which sends a **POST** to `{API_BASE}/api/jobs` as `multipart/form-data` with the `image` field.
- On success, the JSON body is parsed and must include `jobId`. That id is stored in React state.
- On failure (network, 4xx/5xx, invalid JSON), an error message is shown and the user can try again.

### 3. Polling (track job)

After a `jobId` exists:

- `useJobPolling(jobId)` in `src/app/hooks/useJobPolling.ts` runs.
- It immediately fetches `GET {API_BASE}/api/jobs/:id`, then **every 2 seconds** with `setInterval`.
- Polling **stops** when `status` is `COMPLETED` or `FAILED`, or when the component unmounts (interval cleared in the effect cleanup).
- While the job is `PENDING` or `PROCESSING`, the UI shows **Processing…** (with optional live `status` text).
- Transient poll errors are surfaced in the status panel; polling continues unless you change that behavior in the hook.

### 4. Outcome

- **COMPLETED** and `resultUrl` present: a **`<video controls>`** plays the result. Relative URLs are resolved against `NEXT_PUBLIC_API_BASE_URL`.
- **FAILED**: shows **Failed** plus `error` from the API when provided.
- **Upload errors** and **job errors** are shown in the job status section.

### 5. Page structure (high level)

| Area | Role |
|------|------|
| `src/app/page.tsx` | Server entry; passes API base label into the client shell. |
| `src/app/home-page-client.tsx` | Client page: upload handler, job id state, wiring to polling and display. |
| `src/app/components/UploadForm.tsx` | File input + submit + local validation. |
| `src/app/components/StatusDisplay.tsx` | Idle / uploading / processing / completed / failed messaging. |
| `src/app/components/VideoPlayer.tsx` | Video element for `resultUrl`. |
| `src/app/hooks/useJobPolling.ts` | Polling hook (2s interval, terminal states, cleanup). |
| `src/app/lib/api.ts` | `createJob`, `getJob`, types, `resolveMediaUrl`. |

---

## Future improvements

Ideas that would make the product more robust or nicer to use without changing the core contract of the backend:

- **Auth** — Send cookies or `Authorization` with `createJob` / `getJob` if the API requires it.
- **Smarter polling** — Back off interval after many failures; optional exponential backoff; or replace polling with **SSE/WebSockets** when the backend supports push updates.
- **Job history** — Persist recent `jobId`s in `localStorage` and allow reopening a job from a list.
- **Progress** — If the API adds a `progress` field (0–100), show a determinate progress bar instead of only “Processing…”.
- **Larger uploads** — Client-side checks (max size, dimensions) and clearer errors; optional chunked or resumable upload if the API evolves.
- **Accessibility** — Stronger focus management after errors, announcements for status changes, and optional reduced motion for spinners.
- **Testing** — Component tests for forms and integration tests for the API layer (mock `fetch`).
- **Observability** — Centralized logging or error reporting (e.g. Sentry) for failed uploads and repeated poll failures.
- **i18n** — Extract strings for multiple locales if the product goes global.

---

## Deploy

This app can be deployed like any Next.js app (e.g. [Vercel](https://vercel.com)). Set `NEXT_PUBLIC_API_BASE_URL` in the host’s environment to your production API origin, and ensure the API allows your frontend origin via **CORS** if the browser calls it directly.

---

## Tech stack

Next.js (App Router), React, TypeScript, Fetch API (no axios), Tailwind CSS v4. No Redux/Zustand or external UI component libraries.
