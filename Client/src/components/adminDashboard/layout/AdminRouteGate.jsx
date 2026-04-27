"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Arrow from "@/components/svg/Arrow";
import EyeClose from "@/components/svg/EyeClose";
import EyeOpen from "@/components/svg/EyeOpen";
import Exclamation from "@/components/svg/Exclamation";
import { authService } from "@/services/authService";
import { loginSuccess } from "@/store/authSlice";

const ADMIN_AUTH_STORAGE_KEY = "landstore_admin_auth";
const MAX_ADMIN_ATTEMPTS = 3;

const persistAdminAuth = (payload) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(payload));
};

const clearAdminAuth = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
};

const AdminRouteGate = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, hydrated } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (user?.userType === "admin" || user?.userType === "superadmin") {
      setIsAllowed(true);
    } else {
      clearAdminAuth();
      setIsAllowed(false);
    }

    setIsReady(true);
  }, [hydrated, user?.userType]);

  const handleFailedAttempt = (message) => {
    const nextAttemptCount = attemptCount + 1;
    const attemptsRemaining = MAX_ADMIN_ATTEMPTS - nextAttemptCount;

    setAttemptCount(nextAttemptCount);
    clearAdminAuth();

    if (attemptsRemaining > 0) {
      setErrorMessage(`${message} ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} left.`);
      setIsRedirecting(false);
      return;
    }

    setErrorMessage(`${message} No attempts left.`);
    setIsRedirecting(true);

    window.setTimeout(() => {
      router.replace("/");
    }, 1400);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting || isRedirecting) {
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await authService.login({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      const loggedInUser = response?.user;

      if (loggedInUser?.userType === "admin" || loggedInUser?.userType === "superadmin") {
        dispatch(loginSuccess(loggedInUser));
        persistAdminAuth({ email: loggedInUser.email || trimmedEmail, userType: loggedInUser?.userType || "admin" });
        setErrorMessage("");
        setIsRedirecting(false);
        setAttemptCount(0);
        setIsAllowed(true);
        router.replace("/admin");
        return;
      }

      handleFailedAttempt("Only admin accounts can access this route.");
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.message || "Wrong admin credentials.";
      handleFailedAttempt(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hydrated || !isReady) {
    return null;
  }

  return (
    <>
      {isAllowed ? children : null}

      <Modal
        open={!isAllowed}
        onClose={() => {}}
        showCloseButton={false}
        panelClassName="w-full max-w-125 transform overflow-hidden rounded-[28px] bg-white px-5 py-6 text-left align-middle shadow-2xl transition-all sm:px-7 sm:py-7"
        containerClassName="flex min-h-full items-center justify-center p-4 text-center"
      >
        <div className="text-center">
          <h2 className="text-[24px] font-bold text-gray2 md:text-[28px]">Admin login</h2>
          <p className="mt-1.5 text-[15px] text-gray5 md:text-[16px]">
            Enter the admin username and password to continue.
          </p>
        </div>

        {errorMessage ? (
          <div
            className={`mt-5 flex items-start gap-3 rounded-2xl px-4 py-3 text-left ${
              isRedirecting ? "border border-[#FECACA] bg-[#FEF2F2]" : "border border-[#FDE68A] bg-[#FFFBEB]"
            }`}
          >
            <Exclamation size={22} color={isRedirecting ? "#DC2626" : "#D97706"} className="mt-0.5 shrink-0" />
            <div>
              <p className={`text-[15px] font-semibold ${isRedirecting ? "text-[#B91C1C]" : "text-[#B45309]"}`}>
                {errorMessage}
              </p>
              <p className={`mt-1 text-[13px] ${isRedirecting ? "text-[#DC2626]" : "text-[#D97706]"}`}>
                {isRedirecting ? "" : "Please try again carefully."}
              </p>
            </div>
          </div>
        ) : null}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-[15px] font-medium text-gray7 md:text-[16px]">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="text"
              placeholder="Enter admin username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-xl border border-border-input px-4 text-[15px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
              disabled={isRedirecting || isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-2 block text-[15px] font-medium text-gray7 md:text-[16px]">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="**********"
                value={password}
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-xl border border-border-input px-4 pr-11 text-[15px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
                disabled={isRedirecting || isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray5"
                aria-label="Toggle password visibility"
                disabled={isRedirecting || isSubmitting}
              >
                {showPassword ? <EyeOpen size={16} /> : <EyeClose size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="h-11 w-full justify-center rounded-xl text-[16px] font-medium"
              disabled={isRedirecting || isSubmitting}
            >
              <span className="flex items-center gap-2">
                <span>{isRedirecting ? "Redirecting..." : isSubmitting ? "Checking..." : "Sign in as admin"}</span>
                <Arrow size={14} color="white" />
              </span>
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AdminRouteGate;
