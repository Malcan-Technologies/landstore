"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import Exclamation from "@/components/svg/Exclamation";

const basePanelClassName =
  "w-full max-w-[520px] overflow-hidden rounded-lg bg-white px-6 py-5 text-left align-middle transition-all";

const baseTextareaClassName =
  "h-[100px] w-full resize-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-3 text-sm text-[#111827] outline-none placeholder:text-[#B0B7C3]";

export default function RequestChangesModal({ open, onClose, listingId = "LS-000128", onConfirm }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  const handleClose = () => {
    setReason("");
    onClose?.();
  };

  const handleConfirm = () => {
    onConfirm?.(reason);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      panelClassName={basePanelClassName}
      overlayClassName="bg-black/30"
      containerClassName="flex min-h-full items-center justify-center p-4"
      closeButtonClassName="absolute right-4 top-4 text-[24px] leading-none text-[#9CA3AF] transition hover:text-[#6B7280]"
      showCloseButton
    >
      <div className="text-center">
        <h2 className="text-[18px] font-semibold leading-none text-[#111827]">Request Changes</h2>
        <p className="mt-2 text-[14px] text-[#6B7280]">Target id: {listingId}</p>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-lg border border-[#E9DDFD] bg-[#F6F0FE] px-4 py-3 text-[#7C3AED]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#C4B5FD]/30 bg-[#F6F0FE]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#A78BFA]/65 bg-[#F6F0FE]">
            <Exclamation size={18} color="#8B5CF6" />
          </span>
        </span>
        <p className="text-[12px] leading-4">
          Return this listing to Draft status. Provide a detailed explanation for the user to rectify specific fields.
        </p>
      </div>

      <div className="mt-5">
        <label className="block text-[13px] font-medium text-[#6B7280]">Administrative Reason</label>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Enter reason"
          className={`${baseTextareaClassName} mt-2`}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#26835E] px-4 text-[14px] font-medium text-white transition hover:opacity-95"
        >
          Confirm changes
        </button>
      </div>
    </Modal>
  );
}
