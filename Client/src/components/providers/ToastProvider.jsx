"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  socket: {
    container: "border border-[#C4B5FD] bg-[#F5F3FF] text-[#7C3AED] cursor-pointer hover:bg-[#EDE9FE]",
  },
};

const ToastItem = ({ toast }) => {
  const styles = toastStyles[toast.type] || toastStyles.info;
  const router = useRouter();

  const handleClick = () => {
    if (typeof toast.onClick === "function") {
      toast.onClick(toast.data);
    }
    if (toast.data?.href) {
      router.push(toast.data.href);
    }
    dismissToast(toast.id);
  };

  const isClickable = toast.type === "socket" || toast.onClick || toast.data?.href;

  const showBoth = toast.title && toast.message;

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={`pointer-events-auto flex min-w-[180px] max-w-[240px] items-start gap-2 rounded-md px-3 py-2 ${styles.container} ${isClickable ? "cursor-pointer" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="min-w-0 flex-1">
        {showBoth ? (
          <>
            <p className="truncate text-sm font-semibold leading-5">{toast.title}</p>
            <p className="truncate text-xs leading-4 opacity-90">{toast.message}</p>
          </>
        ) : (
          <p className="truncate text-sm font-medium leading-5">{toast.title || toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          dismissToast(toast.id);
        }}
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
