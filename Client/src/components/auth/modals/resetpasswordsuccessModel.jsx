"use client";

import Modal from "@/components/common/Modal";
import True from "@/components/svg/true";

const ResetPasswordSuccessModal = ({ open, onClose, onBackToLogin }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      panelClassName="w-full max-w-[640px] transform overflow-hidden rounded-2xl bg-white px-6 py-6 text-left align-middle shadow-[0px_30px_60px_rgba(15,61,46,0.08)] transition-all"
      overlayClassName="bg-black/35"
      containerClassName="flex min-h-full items-center justify-center p-4 text-center"
      closeButtonClassName="absolute right-6 top-5 text-[28px] font-light leading-none text-gray5 transition hover:text-gray7"
      closeLabel="Close reset password success modal"
      showCloseButton
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-input bg-white">
          <True size={22} color="#414651" />
        </div>

        <h2 className="mt-4 text-[20px] font-semibold tracking-tight text-gray2">Password reset</h2>
        <p className="mt-1 max-w-[420px] text-[14px] text-gray5">
          Your password has been successfully reset. Click below to log in magically
        </p>

        <button
          type="button"
          onClick={onBackToLogin || onClose}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-green-primary px-4 text-[14px] font-medium text-white transition hover:opacity-95"
        >
          Reset password
        </button>

        <button
          type="button"
          onClick={onBackToLogin || onClose}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 text-[14px] font-medium text-gray5"
        >
          <span className="text-[16px] leading-none">←</span>
          <span>Back to log in</span>
        </button>
      </div>
    </Modal>
  );
};

export default ResetPasswordSuccessModal;

