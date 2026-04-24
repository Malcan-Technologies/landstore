"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import Exclamation from "@/components/svg/Exclamation";

const basePanelClassName =
  "w-full max-w-[520px] overflow-hidden rounded-lg bg-white px-6 py-5 text-left align-middle transition-all";

const baseTextareaClassName =
  "h-[100px] w-full resize-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-3 text-sm text-[#111827] outline-none placeholder:text-[#B0B7C3]";

export default function RejectListingModal({ open, onClose, listingId = "LS-000128", onConfirm }) {
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setLocalError("");
    }
  }, [open]);

  const handleClose = () => {
    setReason("");
    setLocalError("");
    onClose?.();
  };

  const handleConfirm = async () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setLocalError("Reason is required.");
      return;
    }

    try {
      await onConfirm?.(trimmedReason);
      handleClose();
    } catch (error) {
      setLocalError(error?.message || "Failed to reject listing.");
    }
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
        <h2 className="text-[18px] font-semibold leading-none text-[#111827]">Reject Listing</h2>
        <p className="mt-2 text-[14px] text-[#6B7280]">Target id: {listingId}</p>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-lg border border-[#F7D7D7] bg-[#FFF1F2] px-4 py-3 text-[#EF4444]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#FCA5A5]/30 bg-[#FFF1F2]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#F87171]/65 bg-[#FFF1F2]">
            <Exclamation size={18} color="#EF4444" />
          </span>
        </span>
        <p className="text-[12px] leading-4">
          Listing will be rejected and locked. User cannot republish without major revisions.
        </p>
      </div>

      <div className="mt-5">
        <label className="block text-[13px] font-medium text-[#6B7280]">Administrative Reason</label>
        <textarea
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            if (localError) {
              setLocalError("");
            }
          }}
          placeholder="Enter reason"
          className={`${baseTextareaClassName} mt-2`}
        />
        {localError ? <p className="mt-2 text-[12px] text-[#B42318]">{localError}</p> : null}
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
          Reject
        </button>
      </div>
    </Modal>
  );
}
