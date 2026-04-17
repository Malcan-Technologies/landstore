"use client";

import { useEffect, useState, Suspense } from "react";
import { useDispatch } from "react-redux";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import Register from "@/components/auth/Register";
import ForgotPasswordModal from "@/components/auth/modals/forgotPasswordModal";
import CheckMailModal from "@/components/auth/modals/checkmailModel";
import SetNewPasswordModal from "@/components/auth/modals/setNewPasswordModel";
import ResetPasswordSuccessModal from "@/components/auth/modals/resetpasswordsuccessModel";
import Arrow from "@/components/svg/Arrow";
import EyeClose from "@/components/svg/EyeClose";
import EyeOpen from "@/components/svg/EyeOpen";
import { loginSuccess } from "@/store/authSlice";
import { authService } from "@/services/authService";
import { validateForm, loginValidation } from "@/validators";

const LoginModalSearchParamsHandler = ({ open, onToken }) => {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!open) return;
    const tokenFromUrl = searchParams?.get("token") || "";
    if (tokenFromUrl) {
      onToken(tokenFromUrl);
    }
  }, [open, searchParams, onToken]);
  return null;
};

const LoginModal = ({ open, onClose, initialTab = "login" }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [checkMailOpen, setCheckMailOpen] = useState(false);
  const [setNewPasswordOpen, setSetNewPasswordOpen] = useState(false);
  const [resetPasswordSuccessOpen, setResetPasswordSuccessOpen] = useState(false);
  const [checkMailEmail, setCheckMailEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const resetLoginState = () => {
    setShowPassword(false);
    setEmail("");
    setPassword("");
    setErrors({});
    setIsLoading(false);
  };

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      resetLoginState();
      setForgotPasswordOpen(false);
      setCheckMailOpen(false);
      setSetNewPasswordOpen(false);
      setResetPasswordSuccessOpen(false);
      setCheckMailEmail("");
      setResetToken("");
      setForgotPasswordLoading(false);
      setForgotPasswordError("");
      setResetPasswordLoading(false);
      setResetPasswordError("");
    }
  }, [open, initialTab]);

  const handleToken = (tokenFromUrl) => {
    setResetToken(tokenFromUrl);
    setForgotPasswordOpen(false);
    setCheckMailOpen(false);
    setResetPasswordSuccessOpen(false);
    setSetNewPasswordOpen(true);
  };

  const handleForgotPasswordSuccess = async (submittedEmail) => {
    setForgotPasswordLoading(true);
    setForgotPasswordError("");

    try {
      const result = await authService.forgotPassword(submittedEmail);

      const tokenFromResponse =
        (typeof result?.token === "string" && result.token) ||
        (typeof result?.data?.token === "string" && result.data.token) ||
        "";

      setForgotPasswordOpen(false);
      setCheckMailEmail(submittedEmail);

      if (tokenFromResponse) {
        setResetToken(tokenFromResponse);
        setCheckMailOpen(false);
        setResetPasswordSuccessOpen(false);
        setSetNewPasswordOpen(true);
      } else {
        setCheckMailOpen(true);
      }
    } catch (error) {
      setForgotPasswordError(error?.response?.data?.message || error?.message || "Failed to send reset email");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleCheckMailContinue = () => {
    if (typeof window !== "undefined") {
      window.open("https://mail.google.com/mail/", "_blank", "noopener,noreferrer");
    }
  };

  const handleSetNewPasswordSuccess = async ({ password: newPassword, token }) => {
    if (!token) {
      setResetPasswordError("Missing reset token");
      return;
    }

    setResetPasswordLoading(true);
    setResetPasswordError("");

    try {
      await authService.resetPassword(token, newPassword);
      if (pathname) {
        router.replace(pathname);
      }
      setSetNewPasswordOpen(false);
      setResetPasswordSuccessOpen(true);
    } catch (error) {
      setResetPasswordError(error?.response?.data?.message || error?.message || "Failed to reset password");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const credentials = {
        email: email.trim(),
        password: password.trim()
      };

      // Validate login data
      const validation = validateForm(credentials, loginValidation);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsLoading(false);
        return;
      }

      // Call Better Auth login API
      const response = await authService.login(credentials);

      // Better Auth returns { user, session }
      if (response.user) {
        dispatch(loginSuccess(response.user));
        resetLoginState();
        onClose();
      } else {
        setErrors({ submit: 'Login failed. Please try again.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: error.message || 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSuccess = () => {
    // setActiveTab("register");
    resetLoginState();
    onClose();
  };

  return (
    <>
      <Suspense fallback={null}>
        <LoginModalSearchParamsHandler open={open} onToken={handleToken} />
      </Suspense>
      <Modal
        open={open && !forgotPasswordOpen && !checkMailOpen && !setNewPasswordOpen && !resetPasswordSuccessOpen}
        onClose={onClose}
        showCloseButton
      >
      <div className="text-center">
        <h2 className="text-[24px] font-bold text-gray2 md:text-[28px]">
          {activeTab === "login" ? "Welcome back" : "Join Landstore"}
        </h2>
        <p className="mt-1.5 text-[16px] text-gray5 md:text-[17px]">
          {activeTab === "login"
            ? "Log in securely to manage your profile"
            : "Create an account to get started"}
        </p>
      </div>

        <div className="mt-5 rounded-2xl bg-background-primary p-1.5">
          <div className="grid grid-cols-2 gap-1.5 text-center text-[15px] font-medium text-gray2 md:text-[16px]">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`cursor-pointer rounded-xl px-4 py-2 ${activeTab === "login" ? "bg-white shadow-sm" : ""}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`cursor-pointer rounded-xl px-4 py-2 ${activeTab === "register" ? "bg-white shadow-sm" : ""}`}
            >
              Register
            </button>
          </div>
        </div>

      {activeTab === "login" ? (
        <form className="mt-5 space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block text-[15px] font-medium text-gray7 md:text-[16px]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`h-11 w-full rounded-xl border px-4 text-[15px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary ${errors.email ? 'border-red-500' : 'border-border-input'}`}
              />
              {errors.email && <p className="mt-1 text-[13px] text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-[15px] font-medium text-gray7 md:text-[16px]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="**********"
                  value={password}
                  autoComplete="new-password"
                  onChange={(event) => setPassword(event.target.value)}
                  className={`h-11 w-full rounded-xl border px-4 pr-11 text-[15px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary ${errors.password ? 'border-red-500' : 'border-border-input'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray5"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOpen size={16} /> : <EyeClose size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[13px] text-red-500">{errors.password}</p>}
              <button
                type="button"
                className="mt-2 cursor-pointer text-[14px] font-medium text-gray5 underline underline-offset-2"
                onClick={() => setForgotPasswordOpen(true)}
              >
                Forgot password?
              </button>
            </div>

            {errors.submit && (
              <div className="rounded-lg bg-red-50 p-3 text-[14px] text-red-600">
                {errors.submit}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full justify-center rounded-xl text-[16px] font-medium"
              >
                <span className="flex items-center gap-2">
                  <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                  {!isLoading && <Arrow size={14} color="white" />}
                </span>
              </Button>
              <p className="mx-auto mt-3 max-w-130 text-center text-[14px] leading-5 text-gray5">
                By continuing, you agree to Landstore&apos;s Professional Standards and Anti-Bypass Policy.
              </p>
            </div>
        </form>
      ) : (
        <div className="mt-4 h-full pr-1">
          <Register onRegisterSuccess={handleRegisterSuccess} />
        </div>
      )}
      </Modal>

      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onBackToLogin={() => setForgotPasswordOpen(false)}
        onSuccess={handleForgotPasswordSuccess}
        isLoading={forgotPasswordLoading}
        apiError={forgotPasswordError}
      />

      <CheckMailModal
        open={checkMailOpen}
        email={checkMailEmail}
        onClose={() => setCheckMailOpen(false)}
        onContinue={handleCheckMailContinue}
        onBackToLogin={() => {
          setCheckMailOpen(false);
          setForgotPasswordOpen(false);
        }}
      />

      <SetNewPasswordModal
        open={setNewPasswordOpen}
        onClose={() => setSetNewPasswordOpen(false)}
        onSuccess={handleSetNewPasswordSuccess}
        isLoading={resetPasswordLoading}
        apiError={resetPasswordError}
        token={resetToken}
        onBackToLogin={() => {
          setSetNewPasswordOpen(false);
          setForgotPasswordOpen(false);
          setCheckMailOpen(false);
        }}
      />

      <ResetPasswordSuccessModal
        open={resetPasswordSuccessOpen}
        onClose={() => setResetPasswordSuccessOpen(false)}
        onBackToLogin={() => {
          setResetPasswordSuccessOpen(false);
          setSetNewPasswordOpen(false);
          setForgotPasswordOpen(false);
          setCheckMailOpen(false);
        }}
      />
    </>
  );
};

export default LoginModal;
