export interface VideoPlayerProps {
  src: string;
  title?: string;
}

export function VideoPlayer({ src, title = "Generated video" }: VideoPlayerProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Result
      </h2>
      <div className="mt-4 overflow-hidden rounded-lg bg-black">
        <video className="aspect-video w-full" controls playsInline preload="metadata">
          <source src={src} />
          Your browser does not support the video tag.
        </video>
      </div>
      <p className="mt-2 truncate text-xs text-zinc-500 dark:text-zinc-500" title={src}>
        {title}
      </p>
    </section>
  );
}
