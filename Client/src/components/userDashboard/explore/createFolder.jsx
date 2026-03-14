"use client";

import { useEffect, useRef, useState } from "react";

import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import FolderGreen from "@/components/svg/FolderGreen";

const CreateFolder = ({ open, onClose, onSubmit }) => {
  const inputRef = useRef(null);
  const [folderName, setFolderName] = useState("");

  useEffect(() => {
    if (!open) {
      setFolderName("");
    }
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = folderName.trim();

    if (!trimmedName) {
      return;
    }

    onSubmit?.(trimmedName);
    setFolderName("");
  };

  const handleClose = () => {
    setFolderName("");
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      initialFocus={inputRef}
      panelClassName="w-full max-w-[540px] transform overflow-hidden rounded-2xl bg-white px-6 py-6 text-left align-middle shadow-[0px_30px_60px_rgba(15,61,46,0.08)] transition-all"
      overlayClassName="bg-black/35"
      containerClassName="flex min-h-full items-center justify-center p-4 text-center"
      closeButtonClassName="absolute right-6 top-5 text-[28px] font-light leading-none text-gray5 transition hover:text-gray7"
      closeLabel="Close create folder modal"
      showCloseButton
    >
      <div className="mx-5 flex flex-col">
        <div className="flex flex-col items-center text-center">
          <FolderGreen size={46} />
          <h2 className="mt-6 text-[24px] font-semibold tracking-tight text-gray2">Create folder</h2>
          <p className="mt-2 text-[16px] text-gray5">Please enter a name for the new folder</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col">
          <label htmlFor="folder-name" className="text-[18px] font-medium text-gray7">
            Folder name
          </label>
          <input
            id="folder-name"
            ref={inputRef}
            type="text"
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder="Enter folder name"
            autoComplete="off"
            className="mt-3 h-12 w-full rounded-2xl border border-green-secondary px-5 text-[16px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
          />

          <div className="mt-10 grid grid-cols-2 gap-4">
            <Button
              type="button"
              onClick={handleClose}
              className="h-12 w-full justify-center rounded-2xl border border-border-input bg-white px-5 text-[16px] font-medium text-gray2 shadow-none hover:bg-background-primary"
              colorClass=""
              label="Cancel"
            />
            <Button
              type="submit"
              className="h-12 w-full justify-center rounded-2xl px-5 text-[16px] font-medium shadow-none"
              label="Next"
              disabled={!folderName.trim()}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateFolder;
