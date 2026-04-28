"use client";

import { useEffect, useState } from "react";
import { dismissToast, getToastSnapshot, subscribeToToasts } from "@/utils/toastStore";

const toastStyles = {
  success: {
    container: "border border-[#D1FADF] bg-[#ECFDF3] text-[#027A48]",
  },
  destructive: {
    container: "border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
  },
  error: {
    container: "border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
  },
  info: {
    container: "border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
  },
};

const ToastItem = ({ toast }) => {
  const styles = toastStyles[toast.type] || toastStyles.info;

  return (
    <div
      className={`pointer-events-auto flex min-w-[180px] max-w-[240px] items-center gap-2 rounded-md px-3 py-2 ${styles.container}`}
      role="status"
      aria-live="polite"
    >
      <p className="min-w-0 flex-1 truncate text-sm font-medium leading-5">{toast.title || toast.message}</p>
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-current/70 transition hover:text-current"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState(() => getToastSnapshot());

  useEffect(() => {
    setToasts(getToastSnapshot());
    return subscribeToToasts(() => {
      setToasts(getToastSnapshot());
    });
  }, []);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-100 flex max-h-[calc(100vh-2rem)] w-full max-w-[calc(100vw-2rem)] flex-col gap-3 overflow-hidden sm:right-6 sm:top-6 sm:max-w-[240px]">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </>
  );
};

export default ToastProvider;
