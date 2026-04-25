"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";

import Loading from "@/components/common/Loading";
import ChooseFolder from "@/components/userDashboard/explore/ChooseFolder";
import LoginRequiredModal from "@/components/auth/modals/LoginRequiredModal";
import SelectDropdown from "@/components/common/SelectDropdown";
import PropertyGallery from "@/components/landingPage/property/PropertyGallery";
import MapView from "@/components/userDashboard/explore/MapView";
import Bag from "@/components/svg/Bag";
import Bag2 from "@/components/svg/Bag2";
import Building from "@/components/svg/Building";
import Calendar from "@/components/svg/Calendar";
import Check from "@/components/svg/Check";
import Heart from "@/components/svg/Heart";
import Layer from "@/components/svg/Layer";
import List2 from "@/components/svg/List2";
import Map2 from "@/components/svg/Map2";
import Pointer from "@/components/svg/Pointer";
import Plus from "@/components/svg/Plus";
import Sheild from "@/components/svg/Sheild";
import Person from "@/components/svg/Person";
import { enquiryService } from "@/services/enquiryService";
import { enquiryRoleService } from "@/services/enquiryRoleService";
import { folderService } from "@/services/folderService";
import { landService } from "@/services/landService";
import { roleService } from "@/services/roleService";
import { checkAuth } from "@/utils/auth";

const fallbackGalleryImage = "/Land.jpg";
const defaultMapCenter = { lat: 4.2105, lng: 101.9758 };

const dealTypeLabelMap = {
  buy: "Buy",
  jv: "JV",
  financing: "Financing",
};

const terrainLabelMap = {
  flat: "Flat",
  hilly: "Hilly",
  mix: "Mixed",
};

const featureTagLabelMap = {
  road_access: "Road Access",
  water: "Water",
  electricity: "Electricity",
};

const descriptionPreviewSteps = [1000, 2000];

const extractProperty = (response) => {
  if (response?.property) return response.property;
  if (response?.data?.property) return response.data.property;
  if (response?.result?.property) return response.result.property;
  if (response?.data) return response.data;
  return null;
};

const toNumberOrFallback = (value, fallback) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const formatDate = (value) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (value, { compact = false, maximumFractionDigits = 2 } = {}) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    return "RM 0";
  }

  return `RM ${parsedValue.toLocaleString("en-US", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits,
  })}`;
};

const formatArea = (landArea, landAreaUnit) => {
  if (landArea === undefined || landArea === null || landArea === "") {
    return "";
  }

  const parsedValue = Number(landArea);
  const formattedArea = Number.isFinite(parsedValue)
    ? parsedValue.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : String(landArea);

  return `${formattedArea}${landAreaUnit ? ` ${landAreaUnit}` : ""}`.trim();
};

const formatStatusLabel = (value) =>
  String(value || "active")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusStyle = (status) => {
  const normalizedStatus = typeof status === "string" ? status.trim().toLowerCase() : "";

  if (normalizedStatus === "pending") {
    return "bg-[#FFF7E8] text-[#F59E0B]";
  }
  if (normalizedStatus === "draft") {
    return "bg-[#F3F4F6] text-gray5";
  }
  if (normalizedStatus === "review" || normalizedStatus === "under review" || normalizedStatus === "under_review") {
    return "bg-[#FFF7E8] text-[#F59E0B]";
  }
  if (normalizedStatus === "active") {
    return "bg-[#EAF8F1] text-green-secondary";
  }
  if (normalizedStatus === "inactive" || normalizedStatus === "reserved") {
    return "bg-[#EEF4FF] text-[#2563EB]";
  }

  return "bg-activebg text-active";
};

const formatEnquiryCode = (enquiryId) => {
  if (!enquiryId || typeof enquiryId !== "string") {
    return "ENQ-000000";
  }

  return `ENQ-${enquiryId.replace(/-/g, "").toUpperCase().slice(0, 6)}`;
};

const extractInterestTypeItems = (response) => {
  const rawItems = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.result)
      ? response.result
      : Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response?.data?.items)
          ? response.data.items
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : Array.isArray(response?.result?.items)
              ? response.result.items
              : Array.isArray(response?.result?.data)
                ? response.result.data
                : [];

  return rawItems
    .map((item) => {
      if (typeof item === "string") {
        return { id: null, name: item };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      return {
        id:
          item.id ||
          item._id ||
          item.interestTypeId ||
          item?.interestType?.id ||
          item?.type?.id ||
          null,
        name:
          item.name ||
          item.label ||
          item.title ||
          item.value ||
          item?.interestType?.name ||
          item?.type?.name ||
          "",
      };
    })
    .filter((item) => typeof item?.name === "string" && item.name.trim());
};

const extractRoleItems = (response) => {
  const rawItems = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.result)
      ? response.result
      : Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response?.data?.items)
          ? response.data.items
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : Array.isArray(response?.result?.items)
              ? response.result.items
              : Array.isArray(response?.result?.data)
                ? response.result.data
                : [];

  return rawItems
    .map((item) => {
      if (typeof item === "string") {
        return { id: null, name: item };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      return {
        id: item.id || item._id || item.roleId || item?.role?.id || null,
        name: item.name || item.label || item.title || item.value || item?.role?.name || "",
      };
    })
    .filter((item) => typeof item?.name === "string" && item.name.trim());
};

const mapPropertyToDetails = (property) => {
  const locationTitle = [property?.location?.district, property?.location?.state]
    .filter(Boolean)
    .join(", ");

  const mappedDealTypes = Array.isArray(property?.dealTypes)
    ? property.dealTypes
        .map((item) => dealTypeLabelMap[String(item).toLowerCase()] || String(item || ""))
        .filter(Boolean)
    : [];

  const mappedTerrain = Array.isArray(property?.terrainChips)
    ? property.terrainChips
        .map((item) => terrainLabelMap[String(item).toLowerCase()] || String(item || ""))
        .filter(Boolean)
    : [];

  const mappedFeatures = Array.isArray(property?.featureTags)
    ? property.featureTags
        .map((item) => featureTagLabelMap[String(item).toLowerCase()] || String(item || ""))
        .filter(Boolean)
    : [];

  const landAreaText = formatArea(property?.landArea, property?.landAreaUnit);
  const latitude = toNumberOrFallback(property?.location?.latitude, defaultMapCenter.lat);
  const longitude = toNumberOrFallback(property?.location?.longitude, defaultMapCenter.lng);
  const pricePerSqftValue = Number(property?.pricePerSqrft);
  const galleryImages = Array.isArray(property?.media)
    ? property.media
        .map((item) => item?.fileUrl || item?.url || item?.signedUrl)
        .filter((imageUrl) => typeof imageUrl === "string" && imageUrl.trim())
    : [];

  return {
    id: property?.id || "",
    title: property?.title || locationTitle || "Untitled property",
    valuation: formatCurrency(property?.estimatedValuation ?? property?.price, {
      compact: true,
      maximumFractionDigits: 1,
    }),
    ownerType: property?.ownershipType?.name || "-",
    category: property?.category?.name || "-",
    area: landAreaText || "-",
    code: property?.listingCode || "-",
    updatedAt: formatDate(property?.updatedAt),
    status: formatStatusLabel(property?.status),
    dealTypes: mappedDealTypes,
    terrain: mappedTerrain[0] || "-",
    utilization: property?.utilization?.name || "-",
    tanahRezab:
      property?.tanahRizabMelayu === true
        ? "Yes"
        : property?.tanahRizabMelayu === false
          ? "No"
          : "-",
    negeri:
      [property?.location?.state, property?.location?.district].filter(Boolean).join(" / ") ||
      "-",
    landArea: landAreaText || "-",
    pricePerSqft: Number.isFinite(pricePerSqftValue)
      ? `${formatCurrency(pricePerSqftValue, { maximumFractionDigits: 2 })} / sqft`
      : "-",
    features: mappedFeatures,
    lat: latitude,
    lng: longitude,
    description: property?.description || "No description provided.",
    images: galleryImages.length > 0 ? galleryImages : [fallbackGalleryImage],
    isApproximate: property?.location?.isApproximate !== false,
    isMine: Boolean(property?.isMine),
    adminAction: property?.adminAction || null,
  };
};

const PropertyPage = () => {
  const router = useRouter();
  const { isAuth, hydrated } = useSelector((state) => state.auth);
  const params = useParams();
  const searchParams = useSearchParams();
  const propertyId = Array.isArray(params?.propertyId) ? params.propertyId[0] : params?.propertyId;
  const openedFromListings = searchParams.get("source") === "listings";
  const backRoute = openedFromListings ? "/user-dashboard/listings" : "/explore";

  const [propertyDetails, setPropertyDetails] = useState(null);
  const [isPropertyLoading, setIsPropertyLoading] = useState(true);
  const [propertyLoadError, setPropertyLoadError] = useState("");
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [interestType, setInterestType] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isLoginRequiredOpen, setIsLoginRequiredOpen] = useState(false);
  const [isOwnListing, setIsOwnListing] = useState(false);

  const showMatchmakingAside = !openedFromListings || isOwnListing;
  const [interestTypes, setInterestTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [interestSubmitError, setInterestSubmitError] = useState("");
  const [interestSubmitSuccess, setInterestSubmitSuccess] = useState("");
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);
  const [isEnquirySuccessOpen, setIsEnquirySuccessOpen] = useState(false);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState("");
  const [isChooseFolderOpen, setIsChooseFolderOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [pendingPropertyId, setPendingPropertyId] = useState(null);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isSavingToFolder, setIsSavingToFolder] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [shortlistFolderId, setShortlistFolderId] = useState(null);
  const [isRemovingShortlist, setIsRemovingShortlist] = useState(false);
  const [shortlistError, setShortlistError] = useState("");
  const [shortlistSuccess, setShortlistSuccess] = useState("");
  const [descriptionExpandLevel, setDescriptionExpandLevel] = useState(0);

  const isLoggedIn = useMemo(() => {
    if (hydrated) {
      return Boolean(isAuth);
    }

    return checkAuth();
  }, [hydrated, isAuth]);

  const handleRequireLogin = () => {
    setIsLoginRequiredOpen(true);
  };

  const handleSubmitInterestClick = () => {
    if (propertyDetails?.isMine) {
      return;
    }

    if (!isLoggedIn) {
      handleRequireLogin();
      return;
    }

    setInterestSubmitError("");
    setInterestSubmitSuccess("");
    setShowInterestForm(true);
  };

  const normalizeFolders = (payload) => {
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.data?.items)
            ? payload.data.items
            : [];

    return items
      .map((folder) => {
        const id = folder?.id ?? folder?._id;
        const label = folder?.label ?? folder?.name;

        if (!id || !label) {
          return null;
        }

        return {
          id,
          label,
          parentId: folder?.parentId ?? folder?.parentFolderId ?? null,
        };
      })
      .filter(Boolean);
  };

  const handleShortlistClick = async () => {
    if (!isLoggedIn) {
      handleRequireLogin();
      return;
    }

    if (!propertyId) {
      return;
    }

    setShortlistError("");
    setShortlistSuccess("");
    setPendingPropertyId(propertyId);
    setIsChooseFolderOpen(true);
    setIsLoadingFolders(true);

    try {
      const response = await folderService.getFolders();
      const normalized = normalizeFolders(response);
      setFolders(normalized);
      setSelectedFolderId(normalized[0]?.id ?? null);

      if (normalized.length === 0) {
        setShortlistError("No folders found. Create a folder from My Shortlists first.");
      }
    } catch (error) {
      setFolders([]);
      setSelectedFolderId(null);
      setShortlistError(error?.message || "Failed to load folders.");
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const handleCloseChooseFolder = () => {
    if (isSavingToFolder) {
      return;
    }

    setIsChooseFolderOpen(false);
    setSelectedFolderId(null);
    setPendingPropertyId(null);
    setIsLoadingFolders(false);
    setIsSavingToFolder(false);
  };

  const handleConfirmChooseFolder = async () => {
    if (!pendingPropertyId || !selectedFolderId || isSavingToFolder) {
      return;
    }

    setIsSavingToFolder(true);
    setShortlistError("");

    try {
      await folderService.addToFolder(selectedFolderId, pendingPropertyId);
      setIsShortlisted(true);
      setShortlistFolderId(selectedFolderId);
      setShortlistSuccess("Property added to shortlist successfully.");
      handleCloseChooseFolder();
    } catch (error) {
      setShortlistError(error?.message || "Failed to add property to shortlist.");
      setIsSavingToFolder(false);
    }
  };

  const handleUnshortlistClick = async () => {
    if (!isLoggedIn) {
      handleRequireLogin();
      return;
    }

    let folderId = shortlistFolderId;

    if (!folderId) {
      try {
        const response = await folderService.getFolders();
        const normalized = normalizeFolders(response);
        const match = normalized.find((folder) =>
          folder.properties?.some?.((p) => (p?.propertyId ?? p?.id) === propertyId)
        );
        folderId = match?.id ?? normalized[0]?.id ?? null;
        if (folderId) setShortlistFolderId(folderId);
      } catch {
        setShortlistError("Unable to find the shortlist folder.");
        return;
      }
    }

    if (!folderId) {
      setShortlistError("Could not find the folder this property is saved in.");
      return;
    }

    setIsRemovingShortlist(true);
    setShortlistError("");
    setShortlistSuccess("");

    try {
      await folderService.removeFromFolder(folderId, propertyId);
      setIsShortlisted(false);
      setShortlistFolderId(null);
      setShortlistSuccess("Removed from shortlist.");
    } catch (error) {
      setShortlistError(error?.message || "Failed to remove from shortlist.");
    } finally {
      setIsRemovingShortlist(false);
    }
  };

  const handleViewMyEnquiries = () => {
    setIsEnquirySuccessOpen(false);
    router.push("/user-dashboard/enquiries");
  };

  const availableInterestTypeOptions = useMemo(() => {
    return interestTypes
      .map((item) => ({ value: item?.id || item?.name, label: item?.name }))
      .filter((option) => option.label && typeof option.label === "string" && option.label.trim());
  }, [interestTypes]);

  const availableRoleOptions = useMemo(() => {
    return roles
      .map((item) => ({ value: item?.id || item?.name, label: item?.name }))
      .filter((option) => option.label && typeof option.label === "string" && option.label.trim());
  }, [roles]);

  const selectedInterestTypeId = useMemo(() => {
    if (!interestType) {
      return interestTypes.find((item) => item?.id)?.id || null;
    }

    return interestTypes.find((item) => String(item?.id) === String(interestType))?.id || null;
  }, [interestType, interestTypes]);

  const handleConfirmSelection = async () => {
    if (!isLoggedIn) {
      handleRequireLogin();
      return;
    }

    setInterestSubmitError("");
    setInterestSubmitSuccess("");

    if (!propertyId) {
      setInterestSubmitError("Property id is missing.");
      return;
    }

    const numericBudget = Number(budget);
    if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
      setInterestSubmitError("Please enter a valid estimated budget.");
      return;
    }

    if (!timeline.trim()) {
      setInterestSubmitError("Please enter your acquisition timeline.");
      return;
    }

    if (!selectedRoleId) {
      setInterestSubmitError("Please select your role.");
      return;
    }

    try {
      setIsSubmittingInterest(true);

      const resolvedInterestTypeId = selectedInterestTypeId;
      if (!resolvedInterestTypeId) {
        setInterestSubmitError("Please select a valid interest type.");
        return;
      }

      const enquiryPayload = {
        propertyId,
        interestTypeId: resolvedInterestTypeId,
        message: message.trim() || "Hello, I am interested in your property. Please contact me at your earliest convenience.",
        budget: String(numericBudget),
        timeline: timeline.trim(),
      };

      const response = await enquiryService.createEnquiry(enquiryPayload);
      const enquiryId = response?.data?.id || response?.result?.id || response?.id || "";

      if (!enquiryId) {
        throw new Error("Enquiry was created, but the server did not return an enquiry id.");
      }

      let successDescription = `Your enquiry (${formatEnquiryCode(enquiryId)}) has been logged. Our land specialists will review your profile for matching with the seller.`;

      try {
        await enquiryRoleService.createEnquiryRole({
          enquiryId,
          roleId: selectedRoleId,
        });
      } catch {
        successDescription = `Your enquiry (${formatEnquiryCode(enquiryId)}) has been logged, but we could not save the selected role.`;
      }

      setInterestSubmitSuccess(successDescription);
      setShowInterestForm(false);
      setMessage("");
      setBudget("");
      setTimeline("");
      setSubmittedEnquiryId(enquiryId);
      setIsEnquirySuccessOpen(true);
    } catch (error) {
      setInterestSubmitError(error?.message || "Failed to submit enquiry.");
    } finally {
      setIsSubmittingInterest(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    const loadFormOptions = async () => {
      const [interestResult, roleResult] = await Promise.allSettled([
        enquiryService.getInterestTypes({ page: 1, limit: 100 }),
        roleService.getRoles({ page: 1, limit: 100 }),
      ]);

      if (!isMounted) {
        return;
      }

      if (interestResult.status === "fulfilled") {
        const items = extractInterestTypeItems(interestResult.value);
        setInterestTypes(items);
        setInterestType((currentValue) => currentValue || items[0]?.id || items[0]?.name || "");
      } else {
        setInterestTypes([]);
      }

      if (roleResult.status === "fulfilled") {
        const items = extractRoleItems(roleResult.value);
        setRoles(items);
        setSelectedRoleId((currentValue) => currentValue || items[0]?.id || items[0]?.name || "");
      } else {
        setRoles([]);
      }
    };

    loadFormOptions();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (availableInterestTypeOptions.length > 0 && !interestType) {
      setInterestType(availableInterestTypeOptions[0]?.value || "");
    }
  }, [availableInterestTypeOptions, interestType]);

  useEffect(() => {
    if (availableRoleOptions.length > 0 && !selectedRoleId) {
      setSelectedRoleId(availableRoleOptions[0]?.value || "");
    }
  }, [availableRoleOptions, selectedRoleId]);

  useEffect(() => {
    let isMounted = true;

    const loadPropertyDetails = async () => {
      if (!propertyId) {
        setIsPropertyLoading(false);
        return;
      }

      try {
        setIsPropertyLoading(true);
        setPropertyLoadError("");

        const response = await landService.getListingById(propertyId);
        const property = extractProperty(response);

        if (!isMounted) return;
        if (!property?.id) {
          setPropertyLoadError("Property details are unavailable right now.");
          return;
        }

        setPropertyDetails(mapPropertyToDetails(property));
        setIsOwnListing(Boolean(property?.isMine));
        if (property?.isShortListed) {
          setIsShortlisted(true);
        }
      } catch (error) {
        if (!isMounted) return;
        setPropertyLoadError(error?.message || "Failed to load property details.");
      } finally {
        if (isMounted) {
          setIsPropertyLoading(false);
        }
      }
    };

    loadPropertyDetails();

    return () => {
      isMounted = false;
    };
  }, [propertyId]);

  useEffect(() => {
    setDescriptionExpandLevel(0);
  }, [propertyDetails?.id]);

  const stats = useMemo(() => {
    if (!propertyDetails) {
      return [];
    }

    return [
      { label: "Status", values: [{ text: propertyDetails.status, active: true }] },
      { label: "Deal type", values: propertyDetails.dealTypes.slice(0, 2).map((text) => ({ text })) },
      { label: "Terrain", values: [{ text: propertyDetails.terrain }] },
      { label: "Utilization", values: [{ text: propertyDetails.utilization }] },
      { label: "Tanah Rezab Melayu", values: [{ text: propertyDetails.tanahRezab }] },
    ];
  }, [propertyDetails]);

  const highlightCards = useMemo(() => {
    if (!propertyDetails) {
      return [];
    }

    return [
      { label: "Negeri/Daerah", value: propertyDetails.negeri, Icon: List2 },
      { label: "Land area", value: propertyDetails.landArea, Icon: Bag2 },
      { label: "Price per sqft", value: propertyDetails.pricePerSqft, Icon: Map2 },
      {
        label: "Features",
        value: propertyDetails.features.length > 0 ? propertyDetails.features.join(", ") : "-",
        Icon: Layer,
      },
    ];
  }, [propertyDetails]);

  const propertyMapMarkers = useMemo(() => {
    if (!propertyDetails) {
      return [];
    }

    return [
      {
        id: "property-marker",
        price: propertyDetails.valuation,
        area: propertyDetails.area,
        category: propertyDetails.category,
        image: propertyDetails.images[0],
        lat: propertyDetails.lat,
        lng: propertyDetails.lng,
      },
    ];
  }, [propertyDetails]);

  if (isEnquirySuccessOpen) {
    return (
      <main className="bg-background-primary py-20">
        <div className="mx-3 flex min-h-[72vh] items-center justify-center px-2 lg:px-6 xl:px-10">
          <section className="flex w-full max-w-xl flex-col items-center text-center">
            <div className="flex h-22 w-22 items-center justify-center rounded-full bg-green-secondary/10">
              <div className="flex h-18 w-18 items-center justify-center rounded-full bg-green-secondary/20 shadow-inner">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-secondary">
                  <Check
                    size={26}
                    stroke="white"
                    circleFill="transparent"
                    circleStroke="transparent"
                    className="absolute inset-0 m-auto"
                  />
                </div>
              </div>
            </div>

            <h2 className="mt-8 text-[40px] font-semibold leading-tight text-gray2">Interest Submitted</h2>
            <p className="mt-4 max-w-110 text-[16px] leading-7 text-gray7">
              {interestSubmitSuccess || `Your enquiry (${formatEnquiryCode(submittedEnquiryId)}) has been logged. Our land specialists will review your profile for matching with the seller.`}
            </p>

            <button
              type="button"
              onClick={handleViewMyEnquiries}
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-green-primary px-6 text-[14px] font-semibold text-white transition hover:opacity-95"
            >
              View my enquiries
              <span aria-hidden>→</span>
            </button>
          </section>
        </div>
      </main>
    );
  }

  if (isPropertyLoading) {
    return <Loading />;
  }

  if (propertyLoadError) {
    return (
      <main className="bg-background-primary py-20">
        <div className="mx-3 flex min-h-[72vh] items-center justify-center px-2 lg:px-6 xl:px-10">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {propertyLoadError}
          </div>
        </div>
      </main>
    );
  }

  if (!propertyDetails) {
    return (
      <main className="bg-background-primary py-20">
        <div className="mx-3 flex min-h-[72vh] items-center justify-center px-2 lg:px-6 xl:px-10">
          <div className="rounded-xl border border-border-card bg-white px-4 py-3 text-sm font-medium text-gray5">
            Property details are unavailable right now.
          </div>
        </div>
      </main>
    );
  }

  const descriptionText = propertyDetails.description || "";
  const firstDescriptionStep = descriptionPreviewSteps[0];
  const shouldUseDescriptionSteps = descriptionText.length > firstDescriptionStep;
  const currentDescriptionLimit =
    descriptionExpandLevel >= descriptionPreviewSteps.length
      ? descriptionText.length
      : descriptionPreviewSteps[descriptionExpandLevel];
  const isShowingFullDescription =
    !shouldUseDescriptionSteps || descriptionText.length <= currentDescriptionLimit;
  const displayedDescription = isShowingFullDescription
    ? descriptionText
    : `${descriptionText.slice(0, currentDescriptionLimit).trimEnd()}...`;
  const canShowMoreDescription = shouldUseDescriptionSteps && !isShowingFullDescription;
  const canShowLessDescription =
    shouldUseDescriptionSteps && isShowingFullDescription && descriptionExpandLevel > 0;

  return (
    <main className="bg-background-primary py-20">
      <div className="flex mx-3 flex-col gap-4 px-2 lg:px-6 xl:px-10 lg:flex-row lg:items-start">
        <section className={`w-full space-y-6 ${showMatchmakingAside ? "lg:w-[67%] lg:max-w-[87%] lg:flex-none" : ""}`}>
          <button type="button" onClick={() => router.push(backRoute)} className="inline-flex items-center absolute top-22 gap-2 text-sm font-medium text-gray5">
            <ArrowLeftIcon />
            {openedFromListings ? "Back to my listings" : "Back to marketplace"}
          </button>

          <PropertyGallery images={propertyDetails.images} />

          <header className="flex flex-col gap-4 border-b w-full border-border-input pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div className=" w-full">
              <div className="flex items-center justify-between sm:gap-6 gap-2">
                <div className="flex items-center justify-start sm:gap-3 gap-1 sm:-mt-6 -mt-4">
                  <Pointer size={24} color="currentColor" className="text-green-secondary shrink-0 sm:w-6 sm:h-6 w-4 h-4" />
                  <h1 className="lg:text-[32px] sm:text-[24px] text-[16px] whitespace-nowrap font-semibold leading-none text-gray2">
                    {propertyDetails.title}
                  </h1>
                </div>
                <div className="text-right leading-tight shrink-0">
                  <p className="lg:text-[30px] sm:text-[20px] text-[14px]  font-semibold text-gray2">{propertyDetails.valuation}</p>
                  <p className="sm:text-sm text-[10px]  text-gray5">Est. Valuation</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:gap-3 text-[10px] sm:text-xs lg:text-sm xl:text-[16px] text-gray5">
                <span className="flex items-center gap-1.5 text-gray2 font-bold border-r border-border-card pr-1 sm:pr-3">
                  <Person size={14} color="black" filled className="sm:w-4 sm:h-4 w-2.5 h-2.5" />
                  {propertyDetails.ownerType}
                </span>
                <span className="flex items-center gap-1.5">
                  <Bag size={14} color="currentColor" className="text-gray5 sm:w-4 sm:h-4 w-2.5 h-2.5" />
                  {propertyDetails.category}
                </span>
                <span className="flex items-center gap-1.5 border-r border-border-card pr-1 sm:pr-3">
                  <Building size={14} color="currentColor" className="text-gray5 sm:w-4 sm:h-4 w-2.5 h-2.5 " />
                  {propertyDetails.area}
                </span>
                <span className="rounded-md px-2 py-1 bg-text-gray-1 font-medium text-gray7 ">{propertyDetails.code}</span>
                <span className="flex items-center gap-1.5 border-l border-border-card pl-1 sm:pl-3">
                  <Calendar size={14} color="currentColor" className="text-gray5 sm:w-4 sm:h-4 w-2.5 h-2.5" />
                  Updated {propertyDetails.updatedAt}
                </span>
              </div>
            </div>
           
          </header>

          <div className="flex sm:justify-between justify-start sm:gap-0 gap-4 border-b border-border-input pb-5 flex-wrap sm:flex-nowrap lg:gap-0">
            {stats.map((item, index) => (
              <div key={item.label} className={`w-fit shrink-0 space-y-2 lg:px-6 ${index !== 0 ? "lg:border-l lg:border-border-input" : ""}`}>
                <p className="text-[12px] font-medium text-gray2 w-fit">{item.label}</p>
                <div className="flex flex-nowrap gap-2">
                  {item.values.map((value) => (
                    <span
                      key={`${item.label}-${value.text}`}
                      className={`rounded-full  px-3 py-1 text-xs font-medium ${
                        item.label === "Status"
                          ? getStatusStyle(value.text)
                          : value.active
                            ? " bg-activebg text-active"
                            : "border border-border-card text-gray7"
                      }`}
                    >
                      {value.text}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 border-b border-border-input pb-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlightCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-border-card px-4 py-3">
                <span className="mb-2 flex h-7 w-7 items-center justify-start rounded-lg text-green-secondary">
                  <card.Icon size={18} color="currentColor" />
                </span>
                <p className="text-xs font-medium text-gray5">{card.label}</p>
                <p className="mt-1 text-[15px] font-semibold text-gray2">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="md:space-y-3 space-y-1 border-b border-border-input pb-5">
            <h2 className="sm:text-[18px] text-[16px] font-semibold text-gray2">Public Description</h2>
            <p className="max-w-4xl text-[10px] sm:text-xs lg:text-sm xl:text-lg sm:leading-6 text-gray7 leading-snug">{displayedDescription}</p>
            {canShowMoreDescription ? (
              <button
                type="button"
                onClick={() =>
                  setDescriptionExpandLevel((previousLevel) =>
                    Math.min(previousLevel + 1, descriptionPreviewSteps.length)
                  )
                }
                className="text-green-secondary"
              >
                show more
              </button>
            ) : null}
            {canShowLessDescription ? (
              <button
                type="button"
                onClick={() => setDescriptionExpandLevel(0)}
                className="text-green-secondary"
              >
                show less
              </button>
            ) : null}
          </div>

          <div className="space-y-3">
            <h2 className="sm:text-[18px] text-[16px] font-semibold text-gray2">Approximate Location</h2>
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl border border-border-card bg-white p-3 shadow-[0_10px_30px_rgba(17,24,39,0.08)]">
                <MapView
                  center={{ lat: propertyDetails.lat, lng: propertyDetails.lng }}
                  zoom={13}
                  markers={propertyMapMarkers}
                  defaultActiveMarkerId="property-marker"
                  hideMarkerPin
                  showCenterRings
                  infoWindowOffset={8}
                  containerClassName="min-h-[322px] rounded-lg border-none bg-background-primary shadow-none"
                  mapClassName="h-[322px] w-full rounded-lg"
                  ringClassName="z-[1]"
                />
                <div className="pointer-events-none absolute bottom-6 right-6 z-2 rounded-[14px] border border-border-card bg-white px-4 py-3 text-[12px] font-semibold text-gray7 shadow-[0_6px_18px_rgba(15,23,42,0.16)]">
                  LAT {propertyDetails.lat.toFixed(2)} / LNG {propertyDetails.lng.toFixed(2)}
                </div>
              </div>

              <div className="inline-flex items-center gap-3 h-12 rounded-xl border border-border-card bg-[#FFFCF2] px-3 py-2 text-sm font-medium text-[#DFA403] shadow-[0_6px_16px_rgba(15,61,46,0.08)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-yellow-200/30 bg-[#FFFCF2]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-yellow-300 bg-[#FFFCF2]">
                    <WarningRingIcon />
                  </span>
                </span>
                <span>
                  {propertyDetails.isApproximate
                    ? "Location is approximate. Owner identity is protected"
                    : "Location visibility is restricted for privacy."}
                </span>
              </div>
            </div>
          </div>
        </section>

        {showMatchmakingAside ? (
        <aside className="h-fit w-auto  rounded-xl border border-border-card bg-white p-6 shadow-[0_10px_30px_rgba(16,24,40,0.08)]">
          {showInterestForm ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <SelectDropdown
                  label="Interest type"
                  value={interestType}
                  onChange={setInterestType}
                  options={availableInterestTypeOptions}
                  placeholder="Select interest type"
                  buttonClassName="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray7">Estimated budget</label>
                <div className="rounded-xl border border-border-input bg-white px-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="Enter your budget in MYR"
                    className="h-11 w-full border-none bg-transparent text-sm text-gray2 outline-none placeholder:text-gray5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray7">Acquisition timeline</label>
                <div className="rounded-xl border border-border-input bg-white px-4">
                  <input
                    type="text"
                    value={timeline}
                    onChange={(event) => setTimeline(event.target.value.slice(0, 100))}
                    placeholder="e.g. 2 years"
                    className="h-11 w-full border-none bg-transparent text-sm text-gray2 outline-none placeholder:text-gray5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <SelectDropdown
                  label="Your role"
                  value={selectedRoleId}
                  onChange={setSelectedRoleId}
                  options={availableRoleOptions}
                  placeholder="Select your role"
                  buttonClassName="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray7">
                  Your Message <span className="text-gray5">(Safe Content Only)</span>
                </label>
                <div className="rounded-xl border border-border-input bg-white px-4 py-3">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value.slice(0, 500))}
                    placeholder="Briefly state your development plans or investment goals..."
                    className="h-24 w-full resize-none border-none bg-transparent text-sm text-gray2 outline-none placeholder:text-gray5"
                  />
                  <p className="text-right text-sm text-gray5">Max 500 chars</p>
                </div>
              </div>

              {interestSubmitError ? (
                <p className="text-center text-xs leading-5 text-red-500">{interestSubmitError}</p>
              ) : null}

              <button
                type="button"
                onClick={handleConfirmSelection}
                disabled={isSubmittingInterest}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-green-primary text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmittingInterest ? "Submitting..." : "Confirm selection"}
              </button>

              <button
                type="button"
                onClick={() => setShowInterestForm(false)}
                className="flex h-11 w-full items-center justify-center rounded-lg border border-border-input bg-white text-sm font-medium text-gray2"
              >
                Cancel
              </button>

              <p className="text-center text-xs leading-5 text-gray5">No direct seller contact. Bypass attempts result in immediate account suspension.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-primary text-white">
                  <Sheild size={16} />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray2">Enterprise Matchmaking</p>
                  <p className="text-xs leading-5 text-gray7">All enquiries are vetted to ensure genuine interest and professional conduct.</p>
                </div>
              </div>
              {!propertyDetails?.isMine ? (
                <button
                  type="button"
                  onClick={handleSubmitInterestClick}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-primary text-sm font-semibold text-white"
                >
                  <Plus size={16} color="white" />
                  Submit interest
                </button>
              ) : propertyDetails?.adminAction ? (
                <div className="rounded-lg border border-[#FFF7E8] bg-[#FFF7E8] px-4 py-3">
                  <p className="text-xs font-semibold text-[#F59E0B] mb-1">Admin Revision</p>
                  <p className="text-sm text-gray2">{propertyDetails.adminAction}</p>
                </div>
              ) : null}
              <button
                type="button"
                onClick={isShortlisted ? handleUnshortlistClick : handleShortlistClick}
                disabled={isRemovingShortlist}
                className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition disabled:opacity-70 ${
                  isShortlisted
                    ? "border-green-primary bg-green-primary text-white"
                    : "border-border-card bg-white text-green-primary"
                }`}
              >
                <Heart
                  size={16}
                  color={isShortlisted ? "white" : "currentColor"}
                />
                {isRemovingShortlist ? "Removing..." : isShortlisted ? "Already shortlisted" : "Add to shortlist"}
              </button>
              {shortlistError ? <p className="text-center text-xs leading-5 text-red-500">{shortlistError}</p> : null}
              {shortlistSuccess ? <p className="text-center text-xs leading-5 text-green-secondary">{shortlistSuccess}</p> : null}
              <p className="text-center text-xs leading-5 text-gray5">No direct seller contact. Bypass attempts result in immediate account suspension.</p>
            </div>
          )}
        </aside>
        ) : null}

        <LoginRequiredModal
          open={isLoginRequiredOpen}
          onClose={() => setIsLoginRequiredOpen(false)}
          title="Login required"
          message="Please log in to submit interest or add this property to your shortlist."
        />

        <ChooseFolder
          open={isChooseFolderOpen}
          onClose={handleCloseChooseFolder}
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelect={setSelectedFolderId}
          onBack={handleCloseChooseFolder}
          onConfirm={handleConfirmChooseFolder}
          title="Choose folder"
          description="Select a folder to save this property to shortlist"
          backLabel="Cancel"
          confirmLabel="Save to folder"
          isConfirmDisabled={!selectedFolderId || isLoadingFolders || isSavingToFolder}
          isConfirmLoading={isLoadingFolders || isSavingToFolder}
        />
      </div>

    </main>
  );
};

const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M11.6673 7.00016H2.33398M2.33398 7.00016L6.33398 11.0002M2.33398 7.00016L6.33398 3.00016"
      className="text-gray5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WarningRingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <circle cx="9" cy="9" r="7.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 5.25V9.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="12.25" r="0.85" fill="currentColor" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default PropertyPage;
