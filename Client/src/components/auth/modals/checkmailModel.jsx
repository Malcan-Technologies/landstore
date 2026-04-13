"use client";

import Modal from "@/components/common/Modal";
import Message from "@/components/svg/message";

const CheckMailModal = ({ open, onClose, email, onContinue, onBackToLogin }) => {
  const resolvedEmail = typeof email === "string" ? email.trim() : "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      panelClassName="w-full max-w-[540px] transform overflow-hidden rounded-2xl bg-white px-6 py-6 text-left align-middle shadow-[0px_30px_60px_rgba(15,61,46,0.08)] transition-all"
      overlayClassName="bg-black/35"
      containerClassName="flex min-h-full items-center justify-center p-4 text-center"
      closeButtonClassName="absolute right-6 top-5 text-[28px] font-light leading-none text-gray5 transition hover:text-gray7"
      closeLabel="Close check mail modal"
      showCloseButton
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-input bg-white">
          <Message size={22} color="#414651" />
        </div>

        <h2 className="mt-4 text-[20px] font-semibold tracking-tight text-gray2">Check your email</h2>
        <p className="mt-1 text-[14px] text-gray5">
          We sent a password reset link{resolvedEmail ? " to " : ""}
          {resolvedEmail ? <span className="font-medium text-gray7">{resolvedEmail}</span> : null}
        </p>

        <button
          type="button"
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-green-primary px-4 text-[14px] font-medium text-white transition hover:opacity-95"
          onClick={onContinue}
        >
          Open email app
        </button>

        <p className="mt-3 text-[12px] text-gray5">
          Didn&apos;t receive the email?{" "}
          <span className="font-medium text-green-secondary">Click to resend</span>
        </p>

        <button
          type="button"
          onClick={onBackToLogin || onClose}
          className="mt-3 inline-flex items-center justify-center gap-2 text-[14px] font-medium text-gray5"
        >
          <span className="text-[16px] leading-none">←</span>
          <span>Back to log in</span>
        </button>
      </div>
    </Modal>
  );
};

export default CheckMailModal;
