"use client";

import Modal from "@/components/common/Modal";

const basePanelClassName =
  "w-full max-w-[420px] overflow-hidden rounded-lg bg-white px-6 py-5 text-left align-middle transition-all";

export default function LoginRequiredModal({
  open,
  onClose,
  title = "Login Required",
  message = "Login is required to access this page",
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      panelClassName={basePanelClassName}
      overlayClassName="bg-black/30"
      containerClassName="flex min-h-full items-center justify-center p-4"
      closeButtonClassName="absolute right-4 top-4 text-[24px] leading-none text-[#9CA3AF] transition hover:text-[#6B7280]"
      showCloseButton
    >
      <div className="text-center">
        <h2 className="text-[18px] font-semibold leading-none text-[#111827]">{title}</h2>
        <p className="mt-3 text-[14px] leading-6 text-[#6B7280]">{message}</p>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#26835E] px-4 text-[14px] font-medium text-white transition hover:opacity-95"
        >
          Okay
        </button>
      </div>
    </Modal>
  );
}
