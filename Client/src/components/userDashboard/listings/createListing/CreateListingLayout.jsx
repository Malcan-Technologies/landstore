import Arrow from "@/components/svg/Arrow";
import File from "@/components/svg/File";
import CreateListingStepper from "@/components/userDashboard/listings/createListing/CreateListingStepper";

const CreateListingLayout = ({ currentStep, children, onBack, onNext, isLastStep = false, nextLabel = "Next step" }) => {
  return (
    <main className="min-h-screen bg-background-primary pt-10 sm:pt-8 md:pt-10">
      <div className="mx-2 w-auto px-3 mb-16 sm:px-4 md:px-6 lg:mx-10">
        <header className="text-center">
          <h1 className="text-[24px] font-semibold tracking-tight text-gray2 sm:text-[30px] md:text-[40px]">List your land</h1>
          <p className="mx-auto mt-2 max-w-[500px] text-[12px] leading-5 text-gray5 sm:mt-3 sm:text-[13px] md:text-[14px] md:leading-6">
            Post your land with complete details, images, and location to reach genuine buyers and investors effortlessly.
          </p>
        </header>

        <div className="mt-7 sm:mt-8 md:mt-10">
          <CreateListingStepper currentStep={currentStep} />
        </div>

        <section className="mt-8  px-3 py-4 sm:mt-10 sm:px-4 sm:py-5 md:mt-12 md:px-8 md:py-8">
          {children}
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 mt-10 border-t border-border-card bg-white sm:mt-12 md:mt-14">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4 md:px-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border-input bg-white px-3 text-[11px] font-medium text-gray5 transition hover:bg-background-primary sm:h-10 sm:px-4 sm:text-[12px] md:text-[13px]"
          >
            <span className="rotate-180"><Arrow size={12} color="currentColor" className="sm:h-[14px] sm:w-[14px]" /></span>
            Back
          </button>

          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <button
              type="button"
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-border-input bg-white px-3 text-[11px] font-medium text-gray5 transition hover:bg-background-primary sm:h-10 sm:flex-none sm:px-4 sm:text-[12px] md:text-[13px]"
            >
              <File size={14} color="currentColor" className="sm:h-4 sm:w-4" />
              Save draft
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-green-secondary px-3 text-[11px] font-medium text-white transition hover:bg-green-primary sm:h-10 sm:flex-none sm:px-4 sm:text-[12px] md:text-[13px]"
            >
              {nextLabel}
              <Arrow size={12} color="white" className="sm:h-[14px] sm:w-[14px]" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateListingLayout;
