"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import CreateListingLayout from "@/components/userDashboard/listings/createListing/CreateListingLayout";
import BasicInfoStep from "@/components/userDashboard/listings/createListing/BasicInfoStep";
import LocationStep from "@/components/userDashboard/listings/createListing/LocationStep";
import ReviewStep from "@/components/userDashboard/listings/createListing/ReviewStep";
import { adminService } from "@/services/adminService";
import { landService } from "@/services/landService";
import { revokeFilePreviewUrl } from "@/utils/filePreview";

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

const dealTypeLabelMap = Object.fromEntries(Object.entries(dealTypeEnumMap).map(([label, value]) => [value, label]));
const terrainLabelMap = Object.fromEntries(Object.entries(terrainEnumMap).map(([label, value]) => [value, label]));
const featureTagLabelMap = Object.fromEntries(Object.entries(featureTagEnumMap).map(([label, value]) => [value, label]));

const extractItems = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response)) return response;
  return [];
};

const extractProperty = (response) => {
  if (response?.property) return response.property;
  if (response?.data?.property) return response.data.property;
  if (response?.result?.property) return response.result.property;
  if (response?.data) return response.data;
  return null;
};

const toSelectOptions = (items) =>
  items
    .filter((item) => item?.id && item?.name)
    .map((item) => ({ value: item.id, label: item.name }));

const toNumberOrZero = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toNumberOrFallback = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const parseDateAtStartOfDay = (value) => {
  if (!value) return null;

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
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
  existingPhotos: [],
  documents: [],
  existingDocuments: [],
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
  listingId: "",
  listingCode: "",
  status: "draft",
  acceptedTerms: false,
};

const stepFieldMap = {
  1: ["photos", "ownership", "utilization", "category", "landArea", "pricePerSqft"],
  2: ["negeri", "daerah", "mukim", "seksyen", "titleType", "leaseStartDate", "leasePeriod"],
  3: ["documents", "acceptedTerms"],
};

const CreateListingPage = () => {
  const searchParams = useSearchParams();
  const editingListingId = searchParams.get("edit") || "";
  const isEditMode = Boolean(editingListingId);

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
  const [isListingLoading, setIsListingLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (field, value) => {
    if (submitError) setSubmitError("");
    if (submitSuccess) setSubmitSuccess("");
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field] && !(field === "titleType" && (prev.leaseStartDate || prev.leasePeriod))) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];

      if (field === "titleType" && !isLeaseholdSelected(value)) {
        delete next.leaseStartDate;
        delete next.leasePeriod;
      }

      return next;
    });
  };

  const toggleArrayValue = (field, value) => {
    if (submitError) setSubmitError("");
    if (submitSuccess) setSubmitSuccess("");
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value],
    }));
  };

  const isLeaseholdSelected = (titleTypeValue = formData.titleType) => {
    const selectedTitleType = referenceOptions.titleTypes.find((option) => option.value === titleTypeValue);

    if (selectedTitleType?.label) {
      return selectedTitleType.label.toLowerCase().includes("leasehold");
    }

    return String(titleTypeValue).toLowerCase().includes("leasehold");
  };

  const getStepFieldErrors = (step, values = formData) => {
    const stepErrors = {};

    if (step === 1) {
      if (!isEditMode && (!Array.isArray(values.photos) || values.photos.length < 1)) {
        stepErrors.photos = "Please upload at least one photo.";
      }
      if (!values.category) stepErrors.category = "Please select a category.";
      if (!values.ownership) stepErrors.ownership = "Please select ownership relationship.";
      if (!values.utilization) stepErrors.utilization = "Please select utilization.";
      if (!values.landArea || toNumberOrZero(values.landArea) <= 0) {
        stepErrors.landArea = "Please enter a valid land area.";
      }
      if (!values.pricePerSqft || toNumberOrZero(values.pricePerSqft) <= 0) {
        stepErrors.pricePerSqft = "Please select a valid price per sqft.";
      }
    }

    if (step === 2) {
      if (!values.negeri) stepErrors.negeri = "Please select negeri.";
      if (!values.daerah) stepErrors.daerah = "Please select daerah.";
      if (!String(values.mukim || "").trim()) stepErrors.mukim = "Please enter mukim.";
      if (!String(values.seksyen || "").trim()) stepErrors.seksyen = "Please enter seksyen.";
      if (!values.titleType) stepErrors.titleType = "Please select a title type.";

      if (isLeaseholdSelected(values.titleType) && values.leaseStartDate) {
        const leaseStartDate = parseDateAtStartOfDay(values.leaseStartDate);
        const today = getStartOfToday();

        if (!leaseStartDate) {
          stepErrors.leaseStartDate = "Please select a valid leasehold start date.";
        } else if (leaseStartDate < today) {
          stepErrors.leaseStartDate = "Leasehold start date cannot be before today.";
        }
      }

      if (isLeaseholdSelected(values.titleType) && !values.leasePeriod) {
        stepErrors.leasePeriod = "Please select leasehold period.";
      }
    }

    if (step === 3) {
      if (!isEditMode && (!Array.isArray(values.documents) || values.documents.length < 1)) {
        stepErrors.documents = "Please upload at least one document.";
      }
      if (!values.acceptedTerms) stepErrors.acceptedTerms = "Please accept the anti-bypass agreement.";
    }

    return stepErrors;
  };

  const validateStep = (step) => {
    const stepErrors = getStepFieldErrors(step);

    setFieldErrors((prev) => {
      const next = { ...prev };
      const fields = stepFieldMap[step] || [];

      fields.forEach((field) => {
        delete next[field];
      });

      return {
        ...next,
        ...stepErrors,
      };
    });

    return stepErrors;
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

  useEffect(() => {
    let isMounted = true;

    const loadListingForEdit = async () => {
      if (!isEditMode || !editingListingId) return;

      try {
        setIsListingLoading(true);

        const response = await landService.getListingById(editingListingId);
        const property = extractProperty(response);

        if (!isMounted) return;
        if (!property?.id) {
          setSubmitError("Failed to load listing for editing.");
          return;
        }

        const mappedDealTypes = Array.isArray(property.dealTypes)
          ? property.dealTypes
              .map((item) => dealTypeLabelMap[String(item).toLowerCase()] || "")
              .filter((item) => item && dealTypeEnumMap[item])
          : [];

        const mappedTerrain = Array.isArray(property.terrainChips)
          ? property.terrainChips
              .map((item) => terrainLabelMap[String(item).toLowerCase()] || "")
              .filter((item) => item && terrainEnumMap[item])
          : [];

        const mappedFeatures = Array.isArray(property.featureTags)
          ? property.featureTags
              .map((item) => featureTagLabelMap[String(item).toLowerCase()] || "")
              .filter((item) => item && featureTagEnumMap[item])
          : [];

        const titleParts = String(property.title || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        const fallbackDistrict = titleParts[0] || "";
        const fallbackState = titleParts[1] || "";

        const existingPhotos = property?.media?.fileUrl ? [property.media.fileUrl] : [];
        const existingDocuments = Array.isArray(property?.documents)
          ? property.documents
              .map((doc, index) => ({
                id: doc?.id || `existing-doc-${index + 1}`,
                name:
                  doc?.media?.fileUrl?.split("/").pop() ||
                  doc?.fileUrl?.split("/").pop() ||
                  `Document ${index + 1}`,
                fileUrl: doc?.media?.fileUrl || doc?.fileUrl || "",
              }))
              .filter((doc) => Boolean(doc.fileUrl || doc.name))
          : [];

        const leaseStartYear = property.leaseholdDetails?.startYear;
        const leaseStartDate =
          typeof leaseStartYear === "number"
            ? new Date(Date.UTC(leaseStartYear, 0, 1)).toISOString()
            : "";

        const leasePeriodYears = property.leaseholdDetails?.leasePeriodYears;
        const leasePeriodValue = leasePeriodYears ? `${leasePeriodYears}-years` : initialFormData.leasePeriod;

        setFormData((prev) => ({
          ...prev,
          listingId: property.id || editingListingId,
          listingCode: property.listingCode || "",
          category: property.categoryId || prev.category,
          ownership: property.ownershipTypeId || prev.ownership,
          utilization: property.utilizationId || prev.utilization,
          titleType: property.titleTypeId || prev.titleType,
          landArea: property.landArea !== undefined && property.landArea !== null ? String(property.landArea) : "",
          areaUnit: property.landAreaUnit || prev.areaUnit,
          rizabMalayu: property.tanahRizabMelayu ? "yes" : "no",
          pricePerSqft: property.pricePerSqrft !== undefined && property.pricePerSqrft !== null ? String(property.pricePerSqrft) : "",
          description: property.description || "",
          negeri: property.location?.state || fallbackState,
          daerah: property.location?.district || fallbackDistrict,
          mukim: property.location?.mukim || "",
          seksyen: property.location?.section || "",
          latitude: toNumberOrFallback(property.location?.latitude, prev.latitude),
          longitude: toNumberOrFallback(property.location?.longitude, prev.longitude),
          leaseStartDate,
          leasePeriod: leasePeriodValue,
          calendarYear: leaseStartYear ? String(leaseStartYear) : prev.calendarYear,
          dealTypes: mappedDealTypes.length > 0 ? mappedDealTypes : prev.dealTypes,
          terrain: mappedTerrain.length > 0 ? mappedTerrain : prev.terrain,
          features: mappedFeatures,
          status: property.status || prev.status,
          acceptedTerms: Boolean(property.agreementAccepted),
          existingPhotos,
          existingDocuments,
          photos: [],
          documents: [],
        }));

        setCurrentStep(1);
        setFieldErrors({});
      } catch (error) {
        if (!isMounted) return;
        setSubmitError(error.message || "Failed to load listing for editing.");
      } finally {
        if (isMounted) {
          setIsListingLoading(false);
        }
      }
    };

    loadListingForEdit();

    return () => {
      isMounted = false;
    };
  }, [isEditMode, editingListingId]);

  const createListingFormData = () => {
    const payload = new FormData();

    const listingCode = formData.listingCode || buildListingCode();
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

    const leaseStartDate = parseDateAtStartOfDay(formData.leaseStartDate);
    const startYear = leaseStartDate ? leaseStartDate.getFullYear() : null;
    const leasePeriodYears = getLeasePeriodYears(formData.leasePeriod);

    if (leaseStartDate) {
      payload.append("leaseStartDate", leaseStartDate.toISOString());
    }

    if (startYear && leasePeriodYears) {
      payload.append("leaseholdDetails.startYear", String(startYear));
      payload.append("leaseholdDetails.leasePeriodYears", String(leasePeriodYears));
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

    const step1Errors = getStepFieldErrors(1);
    const step2Errors = getStepFieldErrors(2);
    const step3Errors = getStepFieldErrors(3);
    const finalFieldErrors = { ...step1Errors, ...step2Errors, ...step3Errors };

    if (Object.keys(finalFieldErrors).length > 0) {
      setFieldErrors(finalFieldErrors);

      if (Object.keys(step1Errors).length > 0) {
        setCurrentStep(1);
      } else if (Object.keys(step2Errors).length > 0) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }

      return;
    }

    try {
      setIsSubmitting(true);
      const payload = createListingFormData();

      const requestConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEditMode && editingListingId) {
        await landService.updateListing(editingListingId, payload, requestConfig);
      } else {
        await landService.createListing(payload, requestConfig);
      }

      (formData.photos || []).forEach((file) => {
        revokeFilePreviewUrl(file);
      });

      if (isEditMode) {
        setSubmitSuccess("Listing updated successfully.");
      } else {
        setSubmitSuccess("Listing submitted successfully.");
        setCurrentStep(1);
        setFieldErrors({});
        setFormData((prev) => ({
          ...initialFormData,
          category: referenceOptions.categories[0]?.value || "",
          ownership: referenceOptions.ownershipTypes[0]?.value || "",
          utilization: referenceOptions.utilizations[0]?.value || "",
          titleType: referenceOptions.titleTypes[0]?.value || "",
          dealTypes: prev.dealTypes,
          terrain: prev.terrain,
        }));
      }
    } catch (error) {
      setSubmitError(error.message || "Failed to save listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  let stepContent = <ReviewStep formData={formData} updateField={updateField} errors={fieldErrors} />;

  if (currentStep === 1) {
    stepContent = (
      <BasicInfoStep
        formData={formData}
        updateField={updateField}
        toggleArrayValue={toggleArrayValue}
        ownershipOptions={referenceOptions.ownershipTypes}
        utilizationOptions={referenceOptions.utilizations}
        categoryOptions={referenceOptions.categories}
        errors={fieldErrors}
      />
    );
  } else if (currentStep === 2) {
    stepContent = (
      <LocationStep
        formData={formData}
        updateField={updateField}
        titleTypeOptions={referenceOptions.titleTypes}
        errors={fieldErrors}
      />
    );
  }

  const handleNext = () => {
    if (isSubmitting || isListingLoading) return;

    setSubmitSuccess("");

    if (currentStep < 3) {
      const stepErrors = validateStep(currentStep);
      if (Object.keys(stepErrors).length > 0) {
        return;
      }

      setCurrentStep((prev) => Math.min(prev + 1, 3));
      return;
    }

    submitListing();
  };

  const handleBack = () => {
    if (isSubmitting || isListingLoading) return;
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <CreateListingLayout
      currentStep={currentStep}
      onBack={handleBack}
      onNext={handleNext}
      isLastStep={currentStep === 3}
      nextLabel={
        currentStep === 3
          ? isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Submitting..."
            : isEditMode
              ? "Update listing"
              : "Submit for approval"
          : "Next step"
      }
    >
      <div className="space-y-3">
        {isReferenceLoading ? (
          <div className="rounded-lg border border-border-card bg-white px-3 py-2 text-[12px] text-gray5">
            Loading listing reference data...
          </div>
        ) : null}

        {isListingLoading ? (
          <div className="rounded-lg border border-border-card bg-white px-3 py-2 text-[12px] text-gray5">
            Loading listing details...
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
