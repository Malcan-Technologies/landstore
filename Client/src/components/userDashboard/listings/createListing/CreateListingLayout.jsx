import Arrow from "@/components/svg/Arrow";
import File from "@/components/svg/File";
import CreateListingStepper from "@/components/userDashboard/listings/createListing/CreateListingStepper";

const CreateListingLayout = ({ currentStep, children, onBack, onNext, isLastStep = false, nextLabel = "Next step" }) => {
  return (
    <main className="min-h-screen bg-background-primary py-10">
      <div className="mx-auto max-w-[1080px] px-4 md:px-6">
        <header className="text-center">
          <h1 className="text-[30px] font-semibold tracking-tight text-gray2 md:text-[34px]">List your land</h1>
          <p className="mx-auto mt-3 max-w-[500px] text-[14px] leading-6 text-gray5">
            Post your land with complete details, images, and location to reach genuine buyers and investors effortlessly.
          </p>
        </header>

        <div className="mt-10">
          <CreateListingStepper currentStep={currentStep} />
        </div>

        <section className="mt-12 rounded-[24px] bg-white px-5 py-6 shadow-[0px_10px_35px_rgba(15,61,46,0.04)] md:px-8 md:py-8">
          {children}
        </section>
      </div>

      <div className="mt-14 border-t border-border-card bg-white/90">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-4 py-4 md:px-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border-input bg-white px-4 text-[13px] font-medium text-gray5 transition hover:bg-background-primary"
          >
            <span className="rotate-180"><Arrow size={14} color="currentColor" /></span>
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border-input bg-white px-4 text-[13px] font-medium text-gray5 transition hover:bg-background-primary"
            >
              <File size={16} color="currentColor" />
              Save draft
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-secondary px-4 text-[13px] font-medium text-white transition hover:bg-green-primary"
            >
              {nextLabel}
              <Arrow size={14} color="white" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateListingLayout;
