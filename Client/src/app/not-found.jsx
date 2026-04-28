"use client";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background-primary px-6 py-16">
      <div className="text-center text-[#0F8A4A]">
        <h1 className="text-5xl font-semibold uppercase tracking-[0.2em]">404</h1>
        <h1 className="mt-4 text-xl font-bold sm:text-3xl">Page not found</h1>
        <p className="mt-3 text-sm sm:text-base">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center rounded-lg border border-[#0F8A4A] px-5 py-2.5 text-sm font-semibold text-[#0F8A4A] transition hover:bg-[#EAFBF1]"
          >
            Back
          </button>
        </div>
      </div>
    </main>
  );
}
