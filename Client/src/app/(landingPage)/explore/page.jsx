"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import LoginRequiredModal from "@/components/auth/modals/LoginRequiredModal";
import ChooseFolder from "@/components/userDashboard/explore/ChooseFolder";
import FilterPanel from "@/components/userDashboard/explore/FilterPanel";
import PropertyCard from "@/components/userDashboard/explore/PropertyCard";
import MapView from "@/components/userDashboard/explore/MapView";
import Funnel from "@/components/svg/Funnel";
import { adminService } from "@/services/adminService";
import { folderService } from "@/services/folderService";
import { landService } from "@/services/landService";
import { checkAuth } from "@/utils/auth";

const fallbackListingImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80";
const defaultMapCenter = { lat: 3.0459, lng: 101.7083 };
const defaultRadiusKm = 5;

const dealTagMap = {
  buy: "Buy",
  jv: "JV",
  financing: "Financing",
};

const defaultDealTypeFilterOptions = [
  { value: "buy", label: "Buy" },
  { value: "jv", label: "JV" },
  { value: "financing", label: "Financing" },
];

const defaultTerrainFilterOptions = [
  { value: "flat", label: "Flat" },
  { value: "hilly", label: "Hilly" },
  { value: "mix", label: "Mixed" },
];

const exploreNegeriDaerahMap = {
  Johor: ["Johor Bahru", "Pontian", "Kota Tinggi", "Kluang", "Batu Pahat", "Muar", "Segamat", "Mersing", "Tangkak", "Kulai"],
  Kedah: ["Kota Setar", "Kubang Pasu", "Padang Terap", "Langkawi", "Kedah Selatan", "Yan", "Kuala Muda", "Sik", "Baling", "Bandar Baharu"],
  Kelantan: ["Kota Bharu", "Pasir Mas", "Tumpat", "Bachok", "Tanah Merah", "Pasir Puteh", "Kuala Krai", "Machang", "Jeli", "Gua Musang"],
  Malacca: ["Malacca City", "Melaka Tengah", "Alor Gajah", "Jasin"],
  "Negeri Sembilan": ["Seremban", "Port Dickson", "Rembau", "Jempol", "Kuala Pilah", "Jelebu", "Tampin"],
  Pahang: ["Kuantan", "Bentong", "Bera", "Cameron Highlands", "Jerantut", "Lipis", "Maran", "Pekan", "Raub", "Rompin", "Temerloh"],
  Penang: ["George Town", "Timur Laut", "Barat Daya", "Seberang Perai Utara", "Seberang Perai Tengah", "Seberang Perai Selatan"],
  Perak: ["Kinta", "Larut & Matang", "Manjung", "Hilir Perak", "Batang Padang", "Kerian", "Kuala Kangsar", "Perak Tengah", "Hulu Perak", "Kampar", "Bagan Datuk", "Muallim"],
  Perlis: ["Kangar", "Arau", "Padang Besar"],
  Selangor: ["Petaling", "Hulu Langat", "Gombak", "Klang", "Kuala Langat", "Sepang", "Hulu Selangor", "Kuala Selangor", "Sabak Bernam"],
  Terengganu: ["Kuala Terengganu", "Besut", "Setiu", "Kuala Nerus", "Hulu Terengganu", "Marang", "Dungun", "Kemaman"],
  Sabah: ["Kota Kinabalu", "Kudat", "West Coast", "Interior", "Sandakan", "Tawau", "Tuaran", "Keningau"],
  Sarawak: ["Kuching", "Samarahan", "Serian", "Sri Aman", "Betong", "Sarikei", "Sibu", "Mukah", "Kapit", "Bintulu", "Miri", "Limbang"],
};

const defaultStateFilterOptions = Object.keys(exploreNegeriDaerahMap).map((label) => ({
  value: label,
  label,
}));

const allDaerahSuggestions = Array.from(new Set(Object.values(exploreNegeriDaerahMap).flat()));

const normalizeLocationToken = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const negeriLabelByToken = {
  ...Object.keys(exploreNegeriDaerahMap).reduce((collection, negeriLabel) => {
    collection[normalizeLocationToken(negeriLabel)] = negeriLabel;
    return collection;
  }, {}),
  melaka: "Malacca",
  malacca: "Malacca",
  "pulau-pinang": "Penang",
};

const resolveNegeriLabel = (value) => {
  const normalized = normalizeLocationToken(value);

  if (!normalized) {
    return "";
  }

  return negeriLabelByToken[normalized] || String(value || "").trim();
};

const defaultExploreFilters = {
  locationSearch: "",
  selectedState: "",
  selectedDealTypes: [],
  selectedCategories: [],
  selectedTerrain: [],
  selectedUtilization: [],
  tanahRizab: "both",
  landArea: [0, 100],
  landAreaUnit: "acres",
  pricePerSqft: "",
  titleType: "",
  myListings: false,
  myShortlistings: false,
  myEnquiries: false,
};

const normalizeSelectOptions = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const value = item?.id ?? item?.value ?? item?._id;
      const label = item?.name ?? item?.label ?? item?.title ?? item?.value;

      if (!value || !label) {
        return null;
      }

      return { value: String(value), label: String(label) };
    })
    .filter(Boolean);
};

const extractItemsFromPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const normalizeDealTypeValue = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";
  if (normalized === "buy" || normalized === "purchase") return "buy";
  if (normalized === "jv" || normalized === "joint venture" || normalized === "joint_venture") return "jv";
  if (normalized === "financing" || normalized === "finance") return "financing";
  return "";
};

const normalizeTerrainValue = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";
  if (normalized === "flat") return "flat";
  if (normalized === "hilly") return "hilly";
  if (normalized === "mix" || normalized === "mixed") return "mix";
  return "";
};

const buildExploreFilterQuery = (filters) => {
  const query = {};

  const state = resolveNegeriLabel(filters?.selectedState || filters?.locationSearch?.trim());
  if (state) {
    query.location = state;
  }

  if (Array.isArray(filters?.selectedDealTypes) && filters.selectedDealTypes.length > 0) {
    const dealTypes = filters.selectedDealTypes
      .map((item) => normalizeDealTypeValue(item))
      .filter(Boolean);

    if (dealTypes.length > 0) {
      query.dealTypes = dealTypes;
    }
  }

  if (Array.isArray(filters?.selectedCategories) && filters.selectedCategories.length > 0) {
    query.categoryId = filters.selectedCategories[0];
  }

  if (Array.isArray(filters?.selectedTerrain) && filters.selectedTerrain.length > 0) {
    const terrainChips = filters.selectedTerrain
      .map((item) => normalizeTerrainValue(item))
      .filter(Boolean);

    if (terrainChips.length > 0) {
      query.terrainChips = terrainChips;
    }
  }

  if (Array.isArray(filters?.selectedUtilization) && filters.selectedUtilization.length > 0) {
    query.utilizationId = filters.selectedUtilization[0];
  }

  if (filters?.tanahRizab === "yes") {
    query.tanahRizabMelayu = true;
  } else if (filters?.tanahRizab === "no") {
    query.tanahRizabMelayu = false;
  }

  if (Array.isArray(filters?.landArea) && filters.landArea.length === 2) {
    const [minimum, maximum] = filters.landArea;
    const parsedMinimum = Number(minimum);
    const parsedMaximum = Number(maximum);
    const isDefaultRange = parsedMinimum === 0 && parsedMaximum === 100;

    if (!isDefaultRange && Number.isFinite(parsedMinimum)) {
      query.landAreaMin = parsedMinimum;
    }

    if (!isDefaultRange && Number.isFinite(parsedMaximum)) {
      query.landAreaMax = parsedMaximum;
    }
  }

  const parsedPricePerSqft = Number(filters?.pricePerSqft);
  if (Number.isFinite(parsedPricePerSqft) && parsedPricePerSqft > 0) {
    query.pricePerSqft = parsedPricePerSqft;
  }

  if (filters?.titleType) {
    query.titleTypeId = filters.titleType;
  }

  if (filters?.myListings === true) {
    query.myListings = true;
  }

  if (filters?.myShortlistings === true) {
    query.myShortlistings = true;
  }

  if (filters?.myEnquiries === true) {
    query.myEnquiries = true;
  }

  return query;
};

const isLikelyUuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const extractFolderItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const extractFolderIdsContainingProperty = (payload, propertyId) => {
  const targetId = String(propertyId || "");
  if (!targetId) {
    return [];
  }

  return extractFolderItems(payload)
    .flatMap((folder) => {
      const folderId = folder?.id ?? folder?._id;
      if (!folderId) {
        return [];
      }

      const properties = Array.isArray(folder?.properties) ? folder.properties : [];
      const hasProperty = properties.some((entry) => {
        const property = entry?.property ?? entry;
        const entryId = property?.id ?? entry?.propertyId;
        return String(entryId || "") === targetId;
      });

      return hasProperty ? [folderId] : [];
    })
    .filter((folderId, index, collection) => collection.indexOf(folderId) === index);
};

const toRadians = (value) => (value * Math.PI) / 180;

const toFiniteNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const extractListingItems = (response) => {
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const formatPrice = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "RM 0";

  const absoluteValue = Math.abs(numericValue);
  const formatCompact = (divisor, suffix) => {
    const compactValue = numericValue / divisor;
    return `RM ${compactValue.toLocaleString("en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })}${suffix}`;
  };

  if (absoluteValue >= 1_000_000_000_000) return formatCompact(1_000_000_000_000, "T");
  if (absoluteValue >= 1_000_000_000) return formatCompact(1_000_000_000, "B");
  if (absoluteValue >= 1_000_000) return formatCompact(1_000_000, "M");
  if (absoluteValue >= 1_000) return formatCompact(1_000, "K");

  return `RM ${numericValue.toLocaleString("en-US")}`;
};

const formatArea = (landArea, landAreaUnit) => {
  const numericValue = Number(landArea);
  const area = Number.isFinite(numericValue) ? numericValue.toLocaleString("en-US") : String(landArea || "-");
  const unit = landAreaUnit ? ` ${landAreaUnit}` : "";
  return `${area}${unit}`;
};

const getStatusMeta = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "draft") {
    return { label: "Draft", color: "#64748B" };
  }

  if (normalizedStatus === "review" || normalizedStatus === "under_review" || normalizedStatus === "under review") {
    return { label: "Under review", color: "#D97706" };
  }

  if (normalizedStatus === "reserved") {
    return { label: "Reserved", color: "#2563EB" };
  }

  return { label: "Active", color: "var(--color-green-secondary)" };
};

const mapListingToExploreCard = (listing) => {
  const lat = toFiniteNumberOrNull(listing?.location?.latitude);
  const lng = toFiniteNumberOrNull(listing?.location?.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const mappedDealTags = Array.isArray(listing?.dealTypes)
    ? listing.dealTypes
        .map((tag) => dealTagMap[String(tag || "").toLowerCase()] || String(tag || "").trim())
        .filter((tag) => tag)
    : [];

  const basePrice = Number.isFinite(Number(listing?.price)) ? Number(listing.price) : Number(listing?.estimatedValuation);
  const pricePerSqft = Number(listing?.pricePerSqrft);
  const statusMeta = getStatusMeta(listing?.status);

  return {
    id: listing?.id || listing?.listingCode || `${lat}-${lng}`,
    status: statusMeta.label,
    statusColor: statusMeta.color,
    image: listing?.media?.fileUrl || listing?.media?.url || fallbackListingImage,
    category: listing?.category?.name || "-",
    area: formatArea(listing?.landArea, listing?.landAreaUnit),
    code: listing?.listingCode || "-",
    title: listing?.title || "Land listing",
    dealTags: mappedDealTags,
    price: formatPrice(basePrice),
    valuation: Number.isFinite(pricePerSqft)
      ? `RM ${pricePerSqft.toLocaleString("en-US")}/sqft`
      : formatPrice(listing?.estimatedValuation),
    lat,
    lng,
    isShortListed: Boolean(listing?.isShortListed),
  };
};

const ExplorePage = () => {
  const { isAuth, hydrated } = useSelector((state) => state.auth);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isDesktopFilterHidden, setIsDesktopFilterHidden] = useState(false);
  const [isLoginRequiredOpen, setIsLoginRequiredOpen] = useState(false);
  const [isChooseFolderOpen, setIsChooseFolderOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [pendingPropertyId, setPendingPropertyId] = useState(null);
  const [savedPropertyIds, setSavedPropertyIds] = useState(() => new Set());
  const [listings, setListings] = useState([]);
  const [mapViewport, setMapViewport] = useState({
    center: defaultMapCenter,
    radiusKm: defaultRadiusKm,
  });
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isSavingToFolder, setIsSavingToFolder] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [pendingFilters, setPendingFilters] = useState(defaultExploreFilters);
  const [activeFilters, setActiveFilters] = useState(defaultExploreFilters);
  const [filterOptions, setFilterOptions] = useState({
    states: defaultStateFilterOptions,
    dealTypes: defaultDealTypeFilterOptions,
    categories: [],
    terrain: defaultTerrainFilterOptions,
    utilizations: [],
    titleTypes: [],
  });

  const filterMenuRef = useRef(null);
  const lastRequestKeyRef = useRef("");
  const requestIdRef = useRef(0);

  const isLoggedIn = useMemo(() => {
    if (hydrated) {
      return Boolean(isAuth);
    }

    return checkAuth();
  }, [hydrated, isAuth]);

  useEffect(() => {
    let isCancelled = false;

    const loadFilterOptions = async () => {
      const [categoriesResult, utilizationsResult, titleTypesResult, interestTypesResult] = await Promise.allSettled([
        adminService.getCategories({ page: 1, limit: 200 }),
        adminService.getUtilizations({ page: 1, limit: 200 }),
        adminService.getTitleTypes({ page: 1, limit: 200 }),
        adminService.getInterestTypes({ page: 1, limit: 200 }),
      ]);

      if (isCancelled) {
        return;
      }

      const categories = categoriesResult.status === "fulfilled"
        ? normalizeSelectOptions(extractItemsFromPayload(categoriesResult.value))
        : [];

      const utilizations = utilizationsResult.status === "fulfilled"
        ? normalizeSelectOptions(extractItemsFromPayload(utilizationsResult.value))
        : [];

      const titleTypes = titleTypesResult.status === "fulfilled"
        ? normalizeSelectOptions(extractItemsFromPayload(titleTypesResult.value))
        : [];

      const fetchedDealTypes = interestTypesResult.status === "fulfilled"
        ? extractItemsFromPayload(interestTypesResult.value)
            .map((item) => {
              const label = item?.name ?? item?.label;
              const value = normalizeDealTypeValue(label);

              if (!value) {
                return null;
              }

              return {
                value,
                label: dealTagMap[value] || String(label),
              };
            })
            .filter(Boolean)
        : [];

      const mergedDealTypesMap = new Map();
      [...fetchedDealTypes, ...defaultDealTypeFilterOptions].forEach((item) => {
        mergedDealTypesMap.set(item.value, item);
      });

      setFilterOptions((previous) => ({
        ...previous,
        categories,
        utilizations,
        titleTypes,
        dealTypes: Array.from(mergedDealTypesMap.values()),
      }));
    };

    loadFilterOptions();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleFiltersChange = useCallback((nextFilters) => {
    setPendingFilters(nextFilters);
  }, []);

  const handleApplyFilters = useCallback((nextFilters) => {
    setIsApplyingFilters(true);
    setPendingFilters(nextFilters);
    setActiveFilters(nextFilters);
    setIsFilterModalOpen(false);
  }, []);

  const handleSummarySelect = useCallback((nextFilters) => {
    setPendingFilters(nextFilters);
    setActiveFilters(nextFilters);
  }, []);

  const activeFilterQuery = useMemo(() => buildExploreFilterQuery(activeFilters), [activeFilters]);

  const locationSuggestions = useMemo(() => {
    const selectedNegeri = resolveNegeriLabel(pendingFilters?.selectedState);

    if (selectedNegeri && exploreNegeriDaerahMap[selectedNegeri]) {
      return [selectedNegeri, ...exploreNegeriDaerahMap[selectedNegeri]];
    }

    return [...Object.keys(exploreNegeriDaerahMap), ...allDaerahSuggestions];
  }, [pendingFilters?.selectedState]);

  useEffect(() => {
    if (!isFilterModalOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isFilterModalOpen]);

  const handleViewportChange = useCallback((viewport) => {
    const lat = Number(viewport?.center?.lat);
    const lng = Number(viewport?.center?.lng);
    const radiusFromBounds = Number(viewport?.radiusKm);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    const safeRadius = Number.isFinite(radiusFromBounds) && radiusFromBounds > 0
      ? radiusFromBounds
      : defaultRadiusKm;

    setMapViewport((previous) => {
      const hasLatChanged = Math.abs(previous.center.lat - lat) > 0.00001;
      const hasLngChanged = Math.abs(previous.center.lng - lng) > 0.00001;
      const hasRadiusChanged = Math.abs(previous.radiusKm - safeRadius) > 0.05;

      if (!hasLatChanged && !hasLngChanged && !hasRadiusChanged) {
        return previous;
      }

      return {
        center: { lat, lng },
        radiusKm: safeRadius,
      };
    });
  }, []);

  useEffect(() => {
    const latitude = Number(mapViewport.center.lat.toFixed(6));
    const longitude = Number(mapViewport.center.lng.toFixed(6));
    const radiusKm = Number(Math.max(0.2, Math.min(mapViewport.radiusKm, 1000)).toFixed(2));

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(radiusKm)) {
      return;
    }

    const requestKey = `${latitude}:${longitude}:${radiusKm}:${JSON.stringify(activeFilterQuery)}`;
    if (requestKey === lastRequestKeyRef.current) {
      setIsApplyingFilters(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      lastRequestKeyRef.current = requestKey;
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setIsLoadingListings(true);
      setFetchError("");

      try {
        const response = await landService.exploreMap({
          latitude,
          longitude,
          radiusKm,
          filters: activeFilterQuery,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        const items = extractListingItems(response);
        const mappedListings = items
          .map(mapListingToExploreCard)
          .filter((item) => item !== null);

        setListings(mappedListings);
        setSavedPropertyIds(new Set(mappedListings.filter((item) => item.isShortListed).map((item) => item.id)));
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setListings([]);
        setFetchError(error?.message || "Failed to load map listings.");
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoadingListings(false);
          setIsApplyingFilters(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeFilterQuery, mapViewport.center.lat, mapViewport.center.lng, mapViewport.radiusKm]);

  const listingsNearCenter = useMemo(() => {
    return [...listings].sort((first, second) => {
      const firstDistance = getDistanceKm(mapViewport.center.lat, mapViewport.center.lng, first.lat, first.lng);
      const secondDistance = getDistanceKm(mapViewport.center.lat, mapViewport.center.lng, second.lat, second.lng);

      if (firstDistance !== secondDistance) {
        return firstDistance - secondDistance;
      }

      return String(first.id).localeCompare(String(second.id));
    });
  }, [listings, mapViewport.center.lat, mapViewport.center.lng]);

  const mapMarkers = useMemo(
    () => listingsNearCenter.map((land) => ({
      id: land.id,
      price: land.price,
      area: land.area,
      category: land.category,
      image: land.image,
      lat: land.lat,
      lng: land.lng,
    })),
    [listingsNearCenter]
  );

  const headerDescription = useMemo(() => {
    if (isLoadingListings) {
      return "Searching visible map area...";
    }

    if (fetchError) {
      return fetchError;
    }

    return "Secured and verified property listings";
  }, [fetchError, isLoadingListings]);

  const handleLoginRequired = useCallback(() => {
    setIsLoginRequiredOpen(true);
  }, []);

  const normalizeFolders = useCallback((payload) => {
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

        const parentId = folder?.parentId ?? folder?.parentFolderId ?? null;

        return {
          id,
          label,
          parentId,
        };
      })
      .filter(Boolean);
  }, []);

  const handleLikeClick = useCallback(async ({ propertyId, isSaved: currentlySaved }) => {
    if (!isLoggedIn) {
      setIsLoginRequiredOpen(true);
      return;
    }

    if (!propertyId) {
      return;
    }

    if (currentlySaved) {
      setSavedPropertyIds((prev) => {
        const next = new Set(prev);
        next.delete(propertyId);
        return next;
      });

      try {
        const foldersResponse = await folderService.getFolders({ page: 1, limit: 200 });
        const folderIds = extractFolderIdsContainingProperty(foldersResponse, propertyId)
          .filter((folderId) => isLikelyUuid(folderId));

        await Promise.allSettled(
          folderIds.map((folderId) => folderService.removeFromFolder(folderId, propertyId))
        );
      } catch {
        // Keep optimistic UI update; server sync will be reflected on next fetch.
      }

      return;
    }

    setPendingPropertyId(propertyId);
    setIsLoadingFolders(true);
    setIsChooseFolderOpen(true);

    try {
      const response = await folderService.getFolders();
      const normalized = normalizeFolders(response);
      setFolders(normalized);
      setSelectedFolderId(normalized[0]?.id ?? null);
    } catch {
      setFolders([]);
      setSelectedFolderId(null);
    } finally {
      setIsLoadingFolders(false);
    }
  }, [isLoggedIn, normalizeFolders]);

  const handleCloseChooseFolder = useCallback(() => {
    if (isSavingToFolder) {
      return;
    }

    setIsChooseFolderOpen(false);
    setIsLoadingFolders(false);
    setIsSavingToFolder(false);
    setPendingPropertyId(null);
    setSelectedFolderId(null);
  }, [isSavingToFolder]);

  const handleConfirmChooseFolder = useCallback(async () => {
    if (!pendingPropertyId || !selectedFolderId || isSavingToFolder) {
      return;
    }

    setIsSavingToFolder(true);

    try {
      await folderService.addToFolder(selectedFolderId, pendingPropertyId);

      setSavedPropertyIds((prev) => {
        const next = new Set(prev);
        next.add(pendingPropertyId);
        return next;
      });

      handleCloseChooseFolder();
    } catch {
      setIsSavingToFolder(false);
    }
  }, [handleCloseChooseFolder, isSavingToFolder, pendingPropertyId, selectedFolderId]);

  return (
    <>
      <main className="bg-background-primary pt-10 pb-2">
      <div className="sm:mx-10 mx-1 flex w-auto gap-6 px-2 lg:items-start lg:px-2 ">
        {!isDesktopFilterHidden ? (
          <div className="hidden md:block h-[calc(100vh-6rem)] xl:h-[calc(100vh-6rem)]">
            <FilterPanel
              collapseBehavior="external"
              showAccountSummary={isLoggedIn}
              onToggleRequest={() => setIsDesktopFilterHidden(true)}
              filterOptions={filterOptions}
              locationSuggestions={locationSuggestions}
              filterValues={pendingFilters}
              onFilterValuesChange={handleFiltersChange}
              onApplyFilters={handleApplyFilters}
              onSummarySelect={handleSummarySelect}
              isApplyLoading={isApplyingFilters}
            />
          </div>
        ) : null}

        <section className="flex-1 space-y-6">
          <div className="flex gap-6">
            <div className="hidden h-[calc(100vh-6rem)] xl:flex xl:w-[42%] xl:flex-col xl:gap-5">
              <header className="rounded-3xl px-6 py-5 pl-0">
                <p className="text-[24px] font-bold text-gray2">Found {listingsNearCenter.length} properties</p>
                <p className={`text-[14px] ${fetchError ? "text-[#DC2626]" : "text-gray5"}`}>{headerDescription}</p>
              </header>
              <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto no-scrollbar">
                {isLoadingListings && listingsNearCenter.length === 0 ? (
                  <div className="rounded-xl bg-white px-4 py-3 text-[14px] text-gray5 shadow-[0_10px_35px_rgba(15,61,46,0.05)]">
                    Loading listings from visible map area...
                  </div>
                ) : null}

                {!isLoadingListings && !fetchError && listingsNearCenter.length === 0 ? (
                  <div className="rounded-xl bg-white px-4 py-3 text-[14px] text-gray5 shadow-[0_10px_35px_rgba(15,61,46,0.05)]">
                    No properties found in this map area. Move or zoom the map to search again.
                  </div>
                ) : null}

                {listingsNearCenter.map((land) => (
                  <PropertyCard
                    key={land.id}
                    land={land}
                    enableCardClick
                    isAuthenticated={isLoggedIn}
                    onLoginRequired={handleLoginRequired}
                    onLikeClick={handleLikeClick}
                    isSaved={savedPropertyIds.has(land.id)}
                    heartStyle="shortlist"
                  />
                ))}
              </div>
            </div>

            <div className="relative h-[calc(100vh-6rem)] w-full xl:w-[58%]">
              <div ref={filterMenuRef} className={`absolute right-4 top-4 z-10 ${isDesktopFilterHidden ? "block" : "md:hidden"}`}>
                <button
                  type="button"
                  onClick={() => {
                    if (isDesktopFilterHidden) {
                      setIsDesktopFilterHidden(false);
                      return;
                    }
                    setIsFilterModalOpen((prev) => !prev);
                  }}
                  className="flex h-auto w-auto items-center justify-center rounded-3xl bg-white p-2 cursor-pointer"
                >
                  <Funnel />
                  <span className="ml-2 text-[14px] font-medium">Filters</span>
                </button>

                {isFilterModalOpen && !isDesktopFilterHidden ? (
                  <div className="absolute right-0 top-12 z-40 flex max-h-[calc(100vh-30rem)] sm:max-h-[calc(100vh-11rem)] sm:w-80 flex-col overflow-hidden rounded-xl bg-white shadow-lg">
                    <FilterPanel
                      variant="modal"
                      showAccountSummary={isLoggedIn}
                      filterOptions={filterOptions}
                      locationSuggestions={locationSuggestions}
                      filterValues={pendingFilters}
                      onFilterValuesChange={handleFiltersChange}
                      onApplyFilters={handleApplyFilters}
                      onSummarySelect={handleSummarySelect}
                      isApplyLoading={isApplyingFilters}
                    />
                  </div>
                ) : null}
              </div>
              <MapView
                center={mapViewport.center}
                markers={mapMarkers}
                onViewportChange={handleViewportChange}
              />
              <div className="absolute inset-x-0 bottom-4 z-2 xl:hidden px-4">
                <div
                  className="mx-auto flex max-w-full gap-4 overflow-x-auto no-scrollbar"
                  style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
                >
                  {listingsNearCenter.map((land) => (
                    <PropertyCard
                      key={land.id}
                      land={land}
                      variant="compact"
                      enableCardClick
                      className=""
                      isAuthenticated={isLoggedIn}
                      onLoginRequired={handleLoginRequired}
                      onLikeClick={handleLikeClick}
                      isSaved={savedPropertyIds.has(land.id)}
                      heartStyle="shortlist"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      </main>

      <LoginRequiredModal
        open={isLoginRequiredOpen}
        onClose={() => setIsLoginRequiredOpen(false)}
        message="Login is required to access this page"
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
    </>
  );
};

export default ExplorePage;
