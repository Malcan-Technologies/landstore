"use client";

import React from "react";
import Modal from "@/components/common/Modal";
import Check from "@/components/svg/Check";

const EmailConfirmationModal = ({ open, onClose, onConfirm, onResend }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
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

        <h3 className="mt-5 text-[22px] font-semibold text-gray2">Check your email</h3>
        <p className="mt-2 max-w-xs text-[14px] leading-6 text-gray7">
          We&apos;ve sent a verification link to your email address. Please click it to activate your account.
        </p>

        <div className="mt-6 w-full space-y-3">
          <button
            type="button"
            onClick={onConfirm || onClose}
            className="h-11 w-full rounded-xl bg-green-primary text-[15px] font-semibold text-white transition hover:bg-green-primary"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={onResend}
            className="h-11 w-full rounded-xl border border-border-input bg-white text-[14px] font-medium text-gray2 transition hover:bg-background-primary"
          >
            Resend verification email
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EmailConfirmationModal;
