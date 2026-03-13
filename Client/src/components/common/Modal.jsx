"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

const Modal = ({
  open,
  onClose,
  title,
  children,
  initialFocus,
  panelClassName =
    "w-full max-w-165 transform overflow-hidden rounded-3xl bg-white px-5 py-6 text-left align-middle shadow-2xl transition-all md:px-7 md:py-7",
  overlayClassName = "bg-black/30",
  containerClassName = "flex min-h-full items-center justify-center p-4 text-center",
  showCloseButton = true,
  closeButtonClassName = "absolute right-4 top-4 text-[30px] leading-none text-[#A3A3A3] transition hover:text-[#6B6B6B]",
  closeLabel = "Close modal",
  as = Fragment,
}) => {
  return (
    <Transition show={open} as={as} appear>
      <Dialog as="div" className="relative z-50" onClose={onClose} initialFocus={initialFocus}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={`fixed inset-0 ${overlayClassName}`} />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className={containerClassName}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-100"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`relative ${panelClassName}`}>
                {showCloseButton ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className={closeButtonClassName}
                    aria-label={closeLabel}
                  >
                    ×
                  </button>
                ) : null}
                {title ? (
                  <Dialog.Title className="text-center text-[24px] font-bold text-black md:text-[28px]">
                    {title}
                  </Dialog.Title>
                ) : null}

                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
