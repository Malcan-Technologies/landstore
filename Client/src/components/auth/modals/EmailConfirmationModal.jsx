"use client";

import React from "react";
import Modal from "@/components/common/Modal";
import Check from "@/components/svg/Check";

const EmailConfirmationModal = ({ open, onClose, onResend }) => {
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

        <h3 className="mt-5 text-[22px] font-semibold text-[#111827]">Check your email</h3>
        <p className="mt-2 max-w-xs text-[14px] leading-6 text-[#5E5E5E]">
          We've sent a verification link to your email address. Please click it to activate your account.
        </p>

        <div className="mt-6 w-full space-y-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-xl bg-[#1F774E] text-[15px] font-semibold text-white transition hover:bg-[#18603F]"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={onResend}
            className="h-11 w-full rounded-xl border border-[#D7DEE7] bg-white text-[14px] font-medium text-[#1A1A1A] transition hover:bg-[#F7F7F7]"
          >
            Resend verification email
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EmailConfirmationModal;
