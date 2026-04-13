"use client";

import { useEffect, useMemo, useState } from "react";

import CreateListingLayout from "@/components/userDashboard/listings/createListing/CreateListingLayout";
import BasicInfoStep from "@/components/userDashboard/listings/createListing/BasicInfoStep";
import LocationStep from "@/components/userDashboard/listings/createListing/LocationStep";
import ReviewStep from "@/components/userDashboard/listings/createListing/ReviewStep";
import { adminService } from "@/services/adminService";
import { landService } from "@/services/landService";

const dealTypeEnumMap = {
  Buy: "buy",
  JV: "jv",
  Financing: "financing",
};

const terrainEnumMap = {
  Flat: "flat",
  Hilly: "hilly",
  Mixed: "mix",
};

const featureTagEnumMap = {
  "Road Access": "road_access",
  Water: "water",
  Electricity: "electricity",
};

const extractItems = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response)) return response;
  return [];
};

const toSelectOptions = (items) =>
  items
    .filter((item) => item?.id && item?.name)
    .map((item) => ({ value: item.id, label: item.name }));

const toNumberOrZero = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getLeasePeriodYears = (leasePeriod) => {
  const match = String(leasePeriod || "").match(/\d+/);
  return match ? Number(match[0]) : null;
};

const buildListingCode = () => {
  const year = new Date().getFullYear();
  const suffix = `${Date.now()}`.slice(-6);
  return `LAND-${year}-${suffix}`;
};

const initialFormData = {
  photos: [],
  documents: [],
  dealTypes: ["Buy", "JV"],
  terrain: ["Flat"],
  features: [],
  ownership: "",
  utilization: "",
  category: "",
  landArea: "",
  areaUnit: "acres",
  rizabMalayu: "yes",
  pricePerSqft: "",
  description: "",
  negeri: "",
  daerah: "",
  mukim: "",
  seksyen: "",
  lotNumber: "",
  latitude: 3.114,
  longitude: 101.69,
  titleType: "",
  leaseStartDate: "",
  leasePeriod: "30-years",
  calendarYear: String(new Date().getFullYear()),
  status: "draft",
  acceptedTerms: false,
};

const CreateListingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [referenceOptions, setReferenceOptions] = useState({
    categories: [],
    ownershipTypes: [],
    utilizations: [],
    titleTypes: [],
  });
  const [isReferenceLoading, setIsReferenceLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value],
    }));
  };

  useEffect(() => {
    let isMounted = true;

    const loadReferenceOptions = async () => {
      try {
        setIsReferenceLoading(true);

        const [categoriesResponse, ownershipResponse, utilizationResponse, titleTypeResponse] = await Promise.all([
          adminService.getCategories(),
          adminService.getOwnershipTypes(),
          adminService.getUtilizations(),
          adminService.getTitleTypes(),
        ]);

        if (!isMounted) return;

        const categories = toSelectOptions(extractItems(categoriesResponse));
        const ownershipTypes = toSelectOptions(extractItems(ownershipResponse));
        const utilizations = toSelectOptions(extractItems(utilizationResponse));
        const titleTypes = toSelectOptions(extractItems(titleTypeResponse));

        setReferenceOptions({
          categories,
          ownershipTypes,
          utilizations,
          titleTypes,
        });

        setFormData((prev) => ({
          ...prev,
          category: prev.category || categories[0]?.value || "",
          ownership: prev.ownership || ownershipTypes[0]?.value || "",
          utilization: prev.utilization || utilizations[0]?.value || "",
          titleType: prev.titleType || titleTypes[0]?.value || "",
        }));
      } catch (error) {
        if (!isMounted) return;
        setSubmitError(error.message || "Failed to load listing reference data.");
      } finally {
        if (isMounted) {
          setIsReferenceLoading(false);
        }
      }
    };

    loadReferenceOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const createListingFormData = () => {
    const payload = new FormData();

    const listingCode = buildListingCode();
    const title = [formData.daerah, formData.negeri].filter(Boolean).join(", ") || "Land listing";
    const landArea = toNumberOrZero(formData.landArea);
    const pricePerSqrft = toNumberOrZero(formData.pricePerSqft);
    const estimatedValuation = landArea > 0 && pricePerSqrft > 0 ? landArea * pricePerSqrft : pricePerSqrft;

    payload.append("title", title);
    payload.append("categoryId", formData.category);
    payload.append("ownershipTypeId", formData.ownership);
    payload.append("utilizationId", formData.utilization);
    payload.append("titleTypeId", formData.titleType);
    payload.append("landAreaUnit", formData.areaUnit || "acres");
    payload.append("listingCode", listingCode);
    payload.append("landArea", String(landArea));
    payload.append("price", String(estimatedValuation));
    payload.append("pricePerSqrft", String(pricePerSqrft));
    payload.append("tanahRizabMelayu", String(formData.rizabMalayu === "yes"));
    payload.append("status", formData.status || "draft");
    payload.append("estimatedValuation", String(estimatedValuation));
    payload.append("agreementAccepted", String(Boolean(formData.acceptedTerms)));

    if (formData.acceptedTerms) {
      payload.append("agreementAcceptedAt", new Date().toISOString());
    }

    if (formData.description) {
      payload.append("description", formData.description);
    }

    formData.dealTypes
      .map((item) => dealTypeEnumMap[item])
      .filter(Boolean)
      .forEach((item) => payload.append("dealTypes", item));

    formData.terrain
      .map((item) => terrainEnumMap[item])
      .filter(Boolean)
      .forEach((item) => payload.append("terrainChips", item));

    formData.features
      .map((item) => featureTagEnumMap[item])
      .filter(Boolean)
      .forEach((item) => payload.append("featureTags", item));

    if (formData.negeri) payload.append("location.state", formData.negeri);
    if (formData.daerah) payload.append("location.district", formData.daerah);
    if (formData.mukim) payload.append("location.mukim", formData.mukim);
    if (formData.seksyen) payload.append("location.section", formData.seksyen);
    payload.append("location.latitude", String(formData.latitude));
    payload.append("location.longitude", String(formData.longitude));
    payload.append("location.isApproximate", "true");

    const selectedTitleType = referenceOptions.titleTypes.find((option) => option.value === formData.titleType);
    const isLeasehold = selectedTitleType
      ? selectedTitleType.label.toLowerCase().includes("leasehold")
      : String(formData.titleType).toLowerCase().includes("leasehold");

    if (isLeasehold) {
      const startYear = formData.leaseStartDate ? new Date(formData.leaseStartDate).getFullYear() : null;
      const leasePeriodYears = getLeasePeriodYears(formData.leasePeriod);

      if (startYear) {
        payload.append("leaseholdDetails.startYear", String(startYear));
      }

      if (leasePeriodYears) {
        payload.append("leaseholdDetails.leasePeriodYears", String(leasePeriodYears));
      }
    }

    (formData.photos || []).forEach((file) => {
      payload.append("images", file);
    });

    (formData.documents || []).forEach((file) => {
      payload.append("documents", file);
    });

    return payload;
  };

  const submitListing = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    const missingFields = [];
    if (!formData.category) missingFields.push("category");
    if (!formData.ownership) missingFields.push("ownership relationship");
    if (!formData.utilization) missingFields.push("utilization");
    if (!formData.titleType) missingFields.push("title type");
    if (!formData.landArea) missingFields.push("land area");
    if (!formData.pricePerSqft) missingFields.push("price per sqft");
    if (!formData.acceptedTerms) missingFields.push("anti-bypass agreement");

    if (missingFields.length > 0) {
      setSubmitError(`Please complete: ${missingFields.join(", ")}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = createListingFormData();

      await landService.createListing(payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitSuccess("Listing submitted successfully.");
      setCurrentStep(1);
      setFormData((prev) => ({
        ...initialFormData,
        category: referenceOptions.categories[0]?.value || "",
        ownership: referenceOptions.ownershipTypes[0]?.value || "",
        utilization: referenceOptions.utilizations[0]?.value || "",
        titleType: referenceOptions.titleTypes[0]?.value || "",
        dealTypes: prev.dealTypes,
        terrain: prev.terrain,
      }));
    } catch (error) {
      setSubmitError(error.message || "Failed to submit listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepContent = useMemo(() => {
    if (currentStep === 1) {
      return (
        <BasicInfoStep
          formData={formData}
          updateField={updateField}
          toggleArrayValue={toggleArrayValue}
          ownershipOptions={referenceOptions.ownershipTypes}
          utilizationOptions={referenceOptions.utilizations}
          categoryOptions={referenceOptions.categories}
        />
      );
    }

    if (currentStep === 2) {
      return <LocationStep formData={formData} updateField={updateField} titleTypeOptions={referenceOptions.titleTypes} />;
    }

    return <ReviewStep formData={formData} updateField={updateField} />;
  }, [
    currentStep,
    formData,
    referenceOptions.categories,
    referenceOptions.ownershipTypes,
    referenceOptions.utilizations,
    referenceOptions.titleTypes,
  ]);

  const handleNext = () => {
    if (isSubmitting) return;

    if (currentStep < 3) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      return;
    }

    submitListing();
  };

  const handleBack = () => {
    if (isSubmitting) return;
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <CreateListingLayout
      currentStep={currentStep}
      onBack={handleBack}
      onNext={handleNext}
      isLastStep={currentStep === 3}
      nextLabel={currentStep === 3 ? (isSubmitting ? "Submitting..." : "Submit for approval") : "Next step"}
    >
      <div className="space-y-3">
        {isReferenceLoading ? (
          <div className="rounded-lg border border-border-card bg-white px-3 py-2 text-[12px] text-gray5">
            Loading listing reference data...
          </div>
        ) : null}

        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {submitError}
          </div>
        ) : null}

        {submitSuccess ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-700">
            {submitSuccess}
          </div>
        ) : null}

        {stepContent}
      </div>
    </CreateListingLayout>
  );
};

export default CreateListingPage;
