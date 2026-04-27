"use client";

import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import RoundX from "@/components/svg/RoundX";
import Delete from "@/components/svg/Delete";
export default function DeleteAdminModal({ open, onClose, onConfirm, target, isLoading = false, error = "" }) {
  return (
    <Modal
      open={open}
      onClose={isLoading ? () => {} : onClose}
      panelClassName="w-full max-w-[520px] overflow-hidden rounded-lg bg-white px-6 py-5 text-left align-middle transition-all"
      overlayClassName="bg-black/30"
      containerClassName="flex min-h-full items-center justify-center p-4"
      closeButtonClassName="absolute right-4 top-4 text-[24px] leading-none text-[#9CA3AF] transition hover:text-[#6B7280]"
      showCloseButton
    >
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1F2]">
          <Delete size={26} color="#EF4444" />
        </div>
        <h2 className="mt-4 text-[18px] font-semibold text-[#111827]">Delete admin</h2>
        <p className="mt-2 text-[14px] text-[#6B7280]">Are you sure you want to delete {target?.name || "this admin"}?</p>
        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button
          onClick={onClose}
          disabled={isLoading}
          className="h-11 w-full justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          colorClass=""
          label="Cancel"
        />
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="h-11 w-full justify-center rounded-lg bg-[#EF4444] px-4 text-[14px] font-medium text-white transition hover:opacity-95"
          colorClass=""
          label={isLoading ? "Deleting..." : "Delete"}
        />
      </div>
    </Modal>
  );
}
