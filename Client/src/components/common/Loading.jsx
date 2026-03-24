"use client";

const Loading = () => (
  <div className="flex min-h-[40vh] w-full items-center justify-center px-4">
    <div className="inline-flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray5 shadow-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border-card border-t-green-primary" />
      Loading...
    </div>
  </div>
);

export default Loading;
