import StepperTick from "@/components/svg/StepperTick";

const steps = [
  { id: 1, label: "Basic info" },
  { id: 2, label: "Location" },
  { id: 3, label: "Review" },
];

const CreateListingStepper = ({ currentStep }) => {
  return (
    <div className="mx-auto flex max-w-190 items-start justify-between gap-1 sm:gap-2 lg:gap-20">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const showConnector = index < steps.length - 1;

        return (
          <div key={step.id} className="relative flex flex-1 flex-col items-center justify-start text-center">
            <div className="relative flex h-7 w-full items-center justify-center sm:h-8 md:h-11">
              {isCompleted ? (
                <div className="relative z-[1] flex h-5 w-5 items-center justify-center rounded-full bg-green-secondary shadow-[0px_4px_10px_rgba(38,143,109,0.18)] sm:h-6 sm:w-6 md:h-9 md:w-9">
                  <StepperTick width={16} height={16} color="white" className="sm:h-3 sm:w-3 md:h-auto md:w-auto" />
                </div>
              ) : isActive ? (
                <div className="relative z-[1] flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-secondary bg-white sm:h-8 sm:w-8 md:h-11 md:w-11 md:border-[3px]">
                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-green-secondary sm:h-5.5 sm:w-5.5 md:h-8.5 md:w-8.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white sm:h-2 sm:w-2 md:h-3 md:w-3" />
                  </div>
                </div>
              ) : (
                <div className="relative z-[1] flex h-5 w-5 items-center justify-center rounded-full border border-border-card bg-white sm:h-6 sm:w-6 sm:border-2 md:h-8 md:w-8">
                  <span className="h-1.5 w-1.5 rounded-full bg-border-card sm:h-2 sm:w-2 md:h-2.5 md:w-2.5" />
                </div>
              )}

              {showConnector ? (
                <span
                  className={`absolute left-1/2 top-1/2 h-px w-full -translate-y-1/2 lg:w-[140%] ${currentStep > step.id ? "bg-green-secondary" : "bg-border-card"}`}
                  aria-hidden
                />
              ) : null}
            </div>
            <span className="mt-1.5 flex min-h-7 w-full items-start justify-center text-center text-[9px] font-medium leading-tight text-gray2 sm:mt-2 sm:min-h-8 sm:text-[10px] md:mt-3 md:min-h-10 md:text-[13px]">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CreateListingStepper;
