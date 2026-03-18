"use client";

import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import Check from "@/components/svg/Check";
import FolderGreen from "@/components/svg/FolderGreen";

const ChooseFolder = ({ open, onClose, folders, selectedFolderId, onSelect, onBack, onConfirm }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      panelClassName="w-[540px] transform overflow-hidden rounded-2xl bg-white px-6 py-6 text-left align-middle shadow-[0px_30px_60px_rgba(15,61,46,0.08)] transition-all"
      overlayClassName="bg-black/35"
      containerClassName="flex min-h-full items-center justify-center p-4 text-center"
      closeButtonClassName="absolute right-6 top-5 text-[28px] font-light leading-none text-gray5 transition hover:text-gray7"
      closeLabel="Close choose folder modal"
      showCloseButton
    >
      <div className="mx-1 flex flex-col">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-[24px] font-semibold tracking-tight text-gray2">Choose folder</h2>
          <p className="mt-2 text-[16px] text-gray5">Select a parent folder or leave it unselected to create a new parent folder</p>
        </div>

        <div className="mt-5 space-y-1">
          {folders.map((folder) => {
            const selected = folder.id === selectedFolderId;
            const indentClass = folder.parentId ? "pl-4" : "pl-0";

            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => onSelect(selected ? null : folder.id)}
                className={`flex w-full items-center justify-between rounded-xl border-b border-border-input px-3 py-3 text-left transition ${selected ? "bg-background-primary" : "bg-white hover:bg-background-primary"}`}
              >
                <span className={`flex items-center gap-3 ${indentClass}`}>
                  <FolderGreen size={24} />
                  <span className="text-[14px] font-medium text-gray7">{folder.label}</span>
                </span>
                <span className="flex min-w-8 justify-end text-[13px] font-medium text-green-secondary">
                  {selected ? <span className="inline-flex items-center gap-1"><Check size={18} stroke="var(--color-green-secondary)" /><span>Save</span></span> : null}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 border-t border-border-input" />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button
            type="button"
            onClick={onBack}
            className="h-12 w-full justify-center rounded-xl border border-border-input bg-white px-5 text-[16px] font-medium text-gray2 shadow-none hover:bg-background-primary"
            colorClass=""
            label="Cancel"
          />
          <Button
            type="button"
            onClick={onConfirm}
            className="h-12 w-full justify-center rounded-xl px-5 text-[16px] font-medium shadow-none"
            label="Create new folder"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ChooseFolder;
