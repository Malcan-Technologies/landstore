"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Check from "@/components/svg/Check";
import { authService } from "@/services/authService";

const REDIRECT_SECONDS = 5;

const VerifyEmailCallbackContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const verifiedTokenRef = useRef("");
  const requestIdRef = useRef(0);

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const canShowSuccess = useMemo(() => status === "success", [status]);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    if (verifiedTokenRef.current === token) {
      return;
    }

    verifiedTokenRef.current = token;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const verifyEmail = async () => {
      try {
        setStatus("loading");
        setMessage("Verifying your email address...");

        const response = await authService.verifyEmail(token);

        if (requestId !== requestIdRef.current) {
          return;
        }

        if (response?.success) {
          setStatus("success");
          setMessage(response?.message || "Your email is verified.");
        } else {
          setStatus("error");
          setMessage(response?.message || "Unable to verify your email.");
        }
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setStatus("error");
        setMessage(error?.response?.data?.message || error?.message || "Unable to verify your email.");
      }
    };

    verifyEmail();
  }, [token]);

  useEffect(() => {
    if (status !== "success") {
      return undefined;
    }

    setCountdown(REDIRECT_SECONDS);

    const intervalId = window.setInterval(() => {
      setCountdown((current) => {
        return current > 0 ? current - 1 : 0;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [router, status]);

  useEffect(() => {
    if (status !== "success" || countdown > 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      router.replace("/");
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [countdown, router, status]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background-primary px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_20px_60px_rgba(15,61,46,0.12)] sm:px-10">
        {canShowSuccess ? (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-secondary/10">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-secondary/20 shadow-inner">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-secondary">
                <Check
                  size={28}
                  stroke="white"
                  circleFill="transparent"
                  circleStroke="transparent"
                  className="absolute inset-0 m-auto"
                />
              </div>
            </div>
          </div>
        ) : status === "loading" ? (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-secondary/10">
            <span className="h-14 w-14 animate-spin rounded-full border-4 border-border-card border-t-green-secondary" />
          </div>
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-red-500/10">
            <span className="text-3xl font-bold text-red-500">!</span>
          </div>
        )}

        <h1 className="mt-6 text-[24px] font-semibold text-gray2">
          {status === "success" ? "Your email is verified" : status === "error" ? "Verification failed" : "Verifying email"}
        </h1>

        <p className="mt-2 text-[14px] leading-6 text-gray7">
          {message}
        </p>

        {canShowSuccess ? (
          <p className="mt-4 text-[14px] font-medium text-green-secondary">
            Redirecting you to the home page in {countdown} seconds...
          </p>
        ) : null}
      </div>
    </main>
  );
};

const VerifyEmailCallbackFallback = () => (
  <main className="flex min-h-screen items-center justify-center bg-background-primary px-4 py-10">
    <div className="flex w-full max-w-md flex-col items-center rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_20px_60px_rgba(15,61,46,0.12)] sm:px-10">
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-secondary/10">
        <span className="h-14 w-14 animate-spin rounded-full border-4 border-border-card border-t-green-secondary" />
      </div>
      <h1 className="mt-6 text-[24px] font-semibold text-gray2">Verifying email</h1>
      <p className="mt-2 text-[14px] leading-6 text-gray7">Preparing verification...</p>
    </div>
  </main>
);

export default function VerifyEmailCallbackPage() {
  return (
    <Suspense fallback={<VerifyEmailCallbackFallback />}>
      <VerifyEmailCallbackContent />
    </Suspense>
  );
}