"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/common/Modal";
import EyeClose from "@/components/svg/EyeClose";
import EyeOpen from "@/components/svg/EyeOpen";
import Lock from "@/components/svg/Lock";
import RoundCheck from "@/components/svg/RoundCheck";

const SetNewPasswordModal = ({ open, onClose, onBackToLogin, onSuccess, isLoading = false, apiError = "", token = "" }) => {
  const passwordRef = useRef(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open]);

  const meetsMinLength = password.length >= 8;
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const showPasswordMismatchError = confirmPassword.length > 0 && !passwordsMatch;

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Step 1: Form submitted");
    console.log("Step 2: Password =", password);
    console.log("Step 3: Token =", token);
    console.log("Step 4: Calling onSuccess callback with:", { password, confirmPassword, token });
    onSuccess?.({ password, confirmPassword, token });
    console.log("Step 5: onSuccess callback completed");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      initialFocus={passwordRef}
      panelClassName="w-full max-w-[540px] transform overflow-hidden rounded-2xl bg-white px-6 py-6 text-left align-middle shadow-[0px_30px_60px_rgba(15,61,46,0.08)] transition-all"
      overlayClassName="bg-black/35"
      containerClassName="flex min-h-full items-center justify-center p-4 text-center"
      closeButtonClassName="absolute right-6 top-5 text-[28px] font-light leading-none text-gray5 transition hover:text-gray7"
      closeLabel="Close set new password modal"
      showCloseButton
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-input bg-white">
          <Lock size={20} color="#414651" />
        </div>

        <h2 className="mt-4 text-[20px] font-semibold tracking-tight text-gray2">Set new password</h2>
        <p className="mt-1 text-[14px] text-gray5">Your new password must be different to previously used passwords.</p>

        <form onSubmit={handleSubmit} className="mt-5 w-full text-left">
          <label htmlFor="new-password" className="mb-2 block text-[14px] font-medium text-gray7">
            Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-border-input px-4 pr-10 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray6"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOpen size={16} color="var(--color-gray6)" /> : <EyeClose size={16} color="var(--color-gray6)" />}
            </button>
          </div>

          <label htmlFor="confirm-password" className="mt-4 mb-2 block text-[14px] font-medium text-gray7">
            Confirm password
          </label>
          <div className={`relative ${showPasswordMismatchError ? "mb-5" : ""}`}>
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-border-input px-4 pr-10 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray6"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <EyeOpen size={16} color="var(--color-gray6)" /> : <EyeClose size={16} color="var(--color-gray6)" />}
            </button>
            {showPasswordMismatchError ? (
              <p className="pointer-events-none absolute right-0 top-full mt-1 text-[11px] text-red-500">
                Password and confirm password must match
              </p>
            ) : null}
          </div>

          <div className="mt-4 space-y-2 text-[12px] text-gray5">
            <div className="flex items-center gap-2">
              <RoundCheck
                size={18}
                filled
                color={meetsMinLength ? "var(--color-green-secondary)" : "var(--color-gray3)"}
                tickColor="white"
              />
              <span>Must be at least 8 characters</span>
            </div>
            <div className="flex items-center gap-2">
              <RoundCheck
                size={18}
                filled
                color={hasSpecialChar ? "var(--color-green-secondary)" : "var(--color-gray3)"}
                tickColor="white"
              />
              <span>Must contain one special character</span>
            </div>
          
          </div>

          <button
            type="submit"
            disabled={!(meetsMinLength && hasSpecialChar && passwordsMatch) || isLoading}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-green-primary px-4 text-[14px] font-medium text-white transition hover:opacity-95 disabled:opacity-60"
          >
            {isLoading ? "Resetting..." : "Reset password"}
          </button>

          {apiError ? <p className="mt-2 text-[13px] text-red-500">{apiError}</p> : null}

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

export default SetNewPasswordModal;
