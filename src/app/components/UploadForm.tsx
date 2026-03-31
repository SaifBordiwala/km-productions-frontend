"use client";

import { useState } from "react";

const FILE_INPUT_ID = "km-productions-image-upload";

export interface UploadFormProps {
  onSubmit: (file: File) => void | Promise<void>;
  disabled: boolean;
  isUploading: boolean;
}

export function UploadForm({ onSubmit, disabled, isUploading }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const busy = disabled || isUploading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!file) {
      setLocalError("Please choose an image file first.");
      return;
    }
    await onSubmit(file);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/40"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor={FILE_INPUT_ID}
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Image file
        </label>
        <input
          id={FILE_INPUT_ID}
          name="image"
          type="file"
          accept="image/*"
          disabled={busy}
          suppressHydrationWarning
          className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 disabled:opacity-50 dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
          onChange={(e) => {
            setLocalError(null);
            const next = e.target.files?.[0] ?? null;
            setFile(next);
          }}
        />
      </div>

      {localError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {localError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isUploading ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900"
              aria-hidden
            />
            Uploading…
          </span>
        ) : (
          "Start image-to-video job"
        )}
      </button>
    </form>
  );
}
