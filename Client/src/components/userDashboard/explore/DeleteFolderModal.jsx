"use client";

import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import Delete from "@/components/svg/Delete";

const DeleteFolderModal = ({ open, onClose, onConfirm }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      panelClassName="w-full max-w-[550px] h-[300px] transform overflow-hidden rounded-2xl bg-white px-8 py-6 text-left align-middle shadow-[0px_30px_60px_rgba(15,61,46,0.08)] transition-all"
      overlayClassName="bg-black/35"
      containerClassName="flex min-h-full items-center justify-center p-4 text-center"
      closeButtonClassName="absolute right-6 top-5 text-[28px] font-light leading-none text-gray5 transition hover:text-gray7"
      closeLabel="Close delete folder modal"
      showCloseButton
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEE2E2]">
            <Delete size={26} />
          </div>
          <h2 className="mt-5 text-[24px] font-semibold tracking-tight text-gray2">Delete folder</h2>
          <p className="mt-3 max-w-117.5 text-[16px] leading-8 text-gray5">
            Are you sure you want to permanently delete this folder and all of its contents? This action cannot be undone
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="h-12 w-full justify-center rounded-xl border border-border-input bg-white px-5 text-[16px] font-medium text-gray2 shadow-none hover:bg-background-primary"
            colorClass=""
            label="Cancel"
          />
          <Button
            type="button"
            onClick={onConfirm}
            className="h-12 w-full justify-center rounded-xl bg-[#E12D1D] px-5 text-[16px] font-medium text-white shadow-none hover:bg-[#C72115]"
            colorClass=""
            label="Delete folder"
          />
        </div>
      </div>
    </Modal>
  );
};

export default DeleteFolderModal;
