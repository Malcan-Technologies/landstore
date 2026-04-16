"use client";

import Modal from "@/components/common/Modal";
import Check from "@/components/svg/Check";

const formatEnquiryCode = (enquiryId) => {
  if (!enquiryId || typeof enquiryId !== "string") {
    return "ENQ-000000";
  }

  const compact = enquiryId.replace(/-/g, "").toUpperCase();
  return `ENQ-${compact.slice(0, 6)}`;
};

const EnquirySubmittedModal = ({ open, onClose, onViewEnquiries, enquiryId }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={false}
      overlayClassName="bg-black/35"
      panelClassName="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white px-8 py-10 text-center shadow-2xl"
      containerClassName="flex min-h-full items-center justify-center p-4"
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-secondary/10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-secondary">
          <Check size={28} stroke="white" />
        </div>
      </div>

      <h3 className="mt-7 text-[38px] font-semibold leading-tight text-gray2">Interest Submitted</h3>
      <p className="mx-auto mt-4 max-w-107.5 text-[16px] leading-7 text-gray7">
        Your enquiry ({formatEnquiryCode(enquiryId)}) has been logged. Our land specialists will review your profile for matching with the seller.
      </p>

      <div className="mt-9 flex justify-center">
        <button
          type="button"
          onClick={onViewEnquiries}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-green-primary px-6 text-[14px] font-semibold text-white transition hover:opacity-95"
        >
          View my enquiries
          <span aria-hidden>→</span>
        </button>
      </div>
    </Modal>
  );
};

export default EnquirySubmittedModal;
