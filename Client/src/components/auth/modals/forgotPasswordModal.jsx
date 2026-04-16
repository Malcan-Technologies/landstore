"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/common/Modal";
import Key from "@/components/svg/key";

const ForgotPasswordModal = ({ open, onClose, onBackToLogin, onSuccess, isLoading = false, apiError = "" }) => {
  const inputRef = useRef(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email address is required");
      return;
    }
    setError("");

    onSuccess?.(trimmedEmail);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      initialFocus={inputRef}
      panelClassName="w-full max-w-[540px] transform overflow-hidden rounded-2xl bg-white px-6 py-6 text-left align-middle shadow-[0px_30px_60px_rgba(15,61,46,0.08)] transition-all"
      overlayClassName="bg-black/35"
      containerClassName="flex min-h-full items-center justify-center p-4 text-center"
      closeButtonClassName="absolute right-6 top-5 text-[28px] font-light leading-none text-gray5 transition hover:text-gray7"
      closeLabel="Close forgot password modal"
      showCloseButton
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-input bg-white">
          <Key size={22} color="#414651" />
        </div>

        <h2 className="mt-4 text-[20px] font-semibold tracking-tight text-gray2">Forgot password?</h2>
        <p className="mt-1 text-[14px] text-gray5">No worries, we&apos;ll send you reset instructions</p>

        <form onSubmit={handleSubmit} className="mt-5 w-full text-left">
          <label htmlFor="forgot-email" className="mb-2 block text-[14px] font-medium text-gray7">
            Email address
          </label>
          <input
            id="forgot-email"
            ref={inputRef}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter email"
            autoComplete="email"
            className="h-11 w-full rounded-xl border border-border-input px-4 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
          />

          {error ? <p className="mt-2 text-[13px] text-red-500">{error}</p> : null}
          {apiError ? <p className="mt-2 text-[13px] text-red-500">{apiError}</p> : null}

          <button
            type="submit"
            disabled={!email.trim() || isLoading}
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-green-primary px-4 text-[14px] font-medium text-white transition hover:opacity-95 disabled:opacity-60"
          >
            {isLoading ? "Sending..." : "Reset password"}
          </button>

          <button
            type="button"
            onClick={onBackToLogin || onClose}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 text-[14px] font-medium text-gray5"
          >
            <span className="text-[16px] leading-none">←</span>
            <span>Back to log in</span>
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
