"use client";

const Loading = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-primary/90">
    <div className="inline-flex h-18 w-18 items-center justify-center rounded-full bg-white shadow-[0_12px_30px_rgba(15,61,46,0.12)]" role="status" aria-label="Loading" aria-live="polite">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-border-card border-t-green-secondary" />
      <span className="sr-only">Loading</span>
    </div>
  </div>
);

export default Loading;
