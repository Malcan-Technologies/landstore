import DangerSheild from "@/components/svg/DangerSheild";
import Upload from "@/components/svg/Upload";

const ReviewStep = ({ formData, updateField }) => {
  return (
    <div className="space-y-6">
      <button
        type="button"
        className="flex min-h-[175px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-green-secondary/50 bg-[#F4FBF7] px-6 text-center"
      >
        <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-input bg-white text-gray7">
          <Upload size={18} color="var(--color-green-secondary)" />
        </span>
        <p className="text-[20px] font-semibold text-gray2">Geran Upload</p>
        <p className="mt-2 max-w-[420px] text-[13px] leading-6 text-gray5">
          Upload the official Geran document for verification. This is for admin review only and will never be shown publicly.
        </p>
      </button>

      <div className="rounded-2xl bg-font2-green px-5 py-5 text-white">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-secondary/20 text-greenbg">
            <DangerSheild size={18} color="var(--color-greenbg)" />
          </span>
          <div>
            <p className="text-[15px] font-semibold">Anti-Bypass Agreement</p>
            <p className="mt-1 max-w-[720px] text-[12px] leading-5 text-white/70">
              By submitting this listing, you agree to Landstore.my acting as the professional mediator. Any attempt to circumvent the platform with direct buyers will lead to account termination and legal action as per Section 4.2 of our Terms.
            </p>
          </div>
        </div>

        <label className="mt-5 flex items-center gap-3 text-[13px] font-medium text-white">
          <input
            type="checkbox"
            checked={formData.acceptedTerms}
            onChange={(event) => updateField("acceptedTerms", event.target.checked)}
            className="h-4 w-4 rounded border border-white/50 bg-transparent accent-greenbg"
          />
          I accept the terms and professional conduct guidelines
        </label>
      </div>
    </div>
  );
};

export default ReviewStep;
