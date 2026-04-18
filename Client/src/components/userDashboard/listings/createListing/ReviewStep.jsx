import { useRef } from "react";

import DangerSheild from "@/components/svg/DangerSheild";
import Upload from "@/components/svg/Upload";

const ReviewStep = ({ formData, updateField, errors = {} }) => {
  const documentInputRef = useRef(null);
  const documents = formData.documents ?? [];
  const existingDocuments = formData.existingDocuments ?? [];
  const isEditMode = Boolean(formData.listingId);
  const documentRows = [
    ...existingDocuments.map((doc) => ({
      key: `existing-${doc.id || doc.name}`,
      name: doc.name || doc.fileUrl || "Existing document",
      fileUrl: doc.fileUrl || "",
      isExisting: true,
    })),
    ...documents.map((file, index) => ({
      key: `new-${file.name}-${index}`,
      name: file.name,
      isExisting: false,
      index,
    })),
  ];

  const handleDocumentUpload = (event) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    updateField("documents", [...documents, ...selectedFiles]);
    event.target.value = "";
  };

  const removeDocument = (indexToRemove) => {
    updateField(
      "documents",
      documents.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="relative">
        <button
          type="button"
          onClick={() => documentInputRef.current?.click()}
          className={`flex min-h-35 w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 text-center sm:min-h-40 sm:px-5 md:min-h-43.75 md:px-6 ${
            errors.documents
              ? "border-red-400 bg-red-50"
              : "border-green-secondary/50 bg-green-secondary/10"
          }`.trim()}
        >
          <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-input bg-white text-gray7 sm:mb-4 sm:h-9 sm:w-9 sm:rounded-xl md:h-10 md:w-10">
            <Upload size={16} color="var(--color-green-secondary)" />
          </span>
          <p className="text-[16px] font-semibold text-gray2 sm:text-[18px] md:text-[20px]">Geran Upload</p>
          <p className="mt-2 max-w-105 text-[11px] leading-5 text-gray5 sm:text-[12px] md:text-[13px] md:leading-6">
            Upload the official Geran document for verification. This is for admin review only and will never be shown publicly.
          </p>
        </button>

        {errors.documents ? (
          <p className="pointer-events-none absolute left-0 top-full mt-1 text-[11px] text-red-500">{errors.documents}</p>
        ) : null}
      </div>

      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={handleDocumentUpload}
      />

      {documentRows.length > 0 ? (
        <div className="rounded-xl border border-border-card bg-white p-3">
          <p className="mb-2 text-[12px] font-medium text-gray2">Uploaded documents</p>
          <div className="space-y-1.5">
            {documentRows.map((doc) => (
              <div key={doc.key} className="flex items-center justify-between gap-3 text-[12px] text-gray5">
                <span className="truncate">{doc.name}</span>
                {doc.isExisting ? (
                  <span className="inline-flex items-center rounded-full bg-[#F4F7F5] px-2 py-0.5 text-[10px] font-medium text-gray5">
                    Existing
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.index)}
                    className="text-red-500 transition hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {isEditMode ? (
        <div className="rounded-xl border border-border-card bg-white px-3 py-2 text-[11px] text-gray5">
          Existing listing documents remain attached. Upload files only if you want to add new documents.
        </div>
      ) : null}

      <div className="rounded-2xl bg-font2-green px-4 py-4 text-white sm:px-5 sm:py-5">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-secondary/20 text-greenbg sm:h-9 sm:w-9">
            <DangerSheild size={16} color="var(--color-greenbg)" />
          </span>
          <div>
            <p className="text-[13px] font-semibold sm:text-[14px] md:text-[15px]">Anti-Bypass Agreement</p>
            <p className="mt-1 max-w-180 text-[10px] leading-4 text-white/70 sm:text-[11px] sm:leading-5 md:text-[12px]">
              By submitting this listing, you agree to Landstore.my acting as the professional mediator. Any attempt to circumvent the platform with direct buyers will lead to account termination and legal action as per Section 4.2 of our Terms.
            </p>
               <div className="relative mt-4 sm:mt-5">
          <label className="flex items-start gap-2.5 text-[11px] font-medium text-white sm:items-center sm:gap-3 sm:text-[12px] md:text-[13px]">
            <input
              type="checkbox"
              checked={formData.acceptedTerms}
              onChange={(event) => updateField("acceptedTerms", event.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border border-white/50 bg-transparent accent-greenbg sm:mt-0 sm:h-4 sm:w-4"
            />
            I accept the terms and professional conduct guidelines
          </label>
          {errors.acceptedTerms ? (
            <p className="pointer-events-none absolute left-0 top-full mt-1 text-[11px] text-[#FFD6D6] sm:text-[12px]">
              {errors.acceptedTerms}
            </p>
          ) : null}
        </div>
          </div>
        </div>

     
      </div>
    </div>
  );
};

export default ReviewStep;
