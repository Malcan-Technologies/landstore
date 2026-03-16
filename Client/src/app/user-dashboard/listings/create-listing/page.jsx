"use client";

import { useMemo, useState } from "react";

import CreateListingLayout from "@/components/userDashboard/listings/createListing/CreateListingLayout";
import BasicInfoStep from "@/components/userDashboard/listings/createListing/BasicInfoStep";
import LocationStep from "@/components/userDashboard/listings/createListing/LocationStep";
import ReviewStep from "@/components/userDashboard/listings/createListing/ReviewStep";

const initialFormData = {
  dealTypes: ["Buy", "JV"],
  terrain: ["Flat"],
  features: [],
  ownership: "owned",
  utilization: "",
  category: "",
  landArea: "",
  areaUnit: "acres",
  rizabMalayu: "yes",
  pricePerSqft: "4500",
  description: "",
  negeri: "",
  daerah: "",
  mukim: "",
  seksyen: "",
  lotNumber: "",
  titleType: "leasehold",
  leaseStartDate: "",
  leasePeriod: "30-years",
  calendarYear: "2025",
  acceptedTerms: false,
};

const CreateListingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value],
    }));
  };

  const stepContent = useMemo(() => {
    if (currentStep === 1) {
      return <BasicInfoStep formData={formData} updateField={updateField} toggleArrayValue={toggleArrayValue} />;
    }

    if (currentStep === 2) {
      return <LocationStep formData={formData} updateField={updateField} />;
    }

    return <ReviewStep formData={formData} updateField={updateField} />;
  }, [currentStep, formData]);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <CreateListingLayout
      currentStep={currentStep}
      onBack={handleBack}
      onNext={handleNext}
      isLastStep={currentStep === 3}
      nextLabel={currentStep === 3 ? "Submit for approval" : "Next step"}
    >
      {stepContent}
    </CreateListingLayout>
  );
};

export default CreateListingPage;
