"use client";

import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import Register from "@/components/auth/Register";
import Arrow from "@/components/svg/Arrow";
import EyeClose from "@/components/svg/EyeClose";
import EyeOpen from "@/components/svg/EyeOpen";

const LoginModal = ({ open, onClose, initialTab = "login" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      setShowPassword(false);
    }
  }, [open, initialTab]);

  return (
    <Modal open={open} onClose={onClose} showCloseButton>
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
        <form className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-[15px] font-medium text-gray7 md:text-[16px]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter email"
                className="h-11 w-full rounded-xl border border-border-input px-4 text-[15px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
              />
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
                  className="h-11 w-full rounded-xl border border-border-input px-4 pr-11 text-[15px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
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
              <button
                type="button"
                className="mt-2 cursor-pointer text-[14px] font-medium text-gray5 underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="h-11 w-full justify-center rounded-xl text-[16px] font-medium"
              >
                <span className="flex items-center gap-2">
                  <span>Sign in</span>
                  <Arrow size={14} color="white" />
                </span>
              </Button>
              <p className="mx-auto mt-3 max-w-[520px] text-center text-[14px] leading-5 text-gray5">
                By continuing, you agree to Landstore's Professional Standards and Anti-Bypass Policy.
              </p>
            </div>
        </form>
      ) : (
        <div className="mt-4 h-full pr-1">
          <Register />
        </div>
      )}
    </Modal>
  );
};

export default LoginModal;
