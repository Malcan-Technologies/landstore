import StepperTick from "@/components/svg/StepperTick";

const steps = [
  { id: 1, label: "Basic info" },
  { id: 2, label: "Location" },
  { id: 3, label: "Review" },
];

const CreateListingStepper = ({ currentStep }) => {
  return (
    <div className="mx-auto flex max-w-190 items-start justify-between gap-2 lg:gap-20">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const showConnector = index < steps.length - 1;

        return (
          <div key={step.id} className="relative flex flex-1 flex-col items-center justify-start text-center">
            <div className="relative flex h-11 w-full items-center justify-center">
              {isCompleted ? (
                <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-green-secondary shadow-[0px_4px_10px_rgba(38,143,109,0.18)]">
                  <StepperTick width={16} height={14} color="white" />
                </div>
              ) : isActive ? (
                <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-green-secondary bg-white">
                  <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-green-secondary">
                    <span className="h-3 w-3 rounded-full bg-white" />
                  </div>
                </div>
              ) : (
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-border-card bg-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-border-card" />
                </div>
              )}

              {showConnector ? (
                <span
                  className={`absolute left-1/2 top-1/2 h-[2px] w-full lg:w-[140%] -translate-y-1/2 ${currentStep > step.id ? "bg-green-secondary" : "bg-border-card"}`}
                  aria-hidden
                />
              ) : null}
            </div>
            <span className="mt-3 flex min-h-10 w-full items-start justify-center text-center text-[13px] font-medium text-gray2">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CreateListingStepper;
