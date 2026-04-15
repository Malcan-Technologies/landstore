"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import LoginRequiredModal from "@/components/auth/modals/LoginRequiredModal";
import ChooseFolder from "@/components/userDashboard/explore/ChooseFolder";
import FilterPanel from "@/components/userDashboard/explore/FilterPanel";
import PropertyCard from "@/components/userDashboard/explore/PropertyCard";
import MapView from "@/components/userDashboard/explore/MapView";
import Funnel from "@/components/svg/Funnel";
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

    const requestKey = `${latitude}:${longitude}:${radiusKm}`;
    if (requestKey === lastRequestKeyRef.current) {
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
          page: 1,
          limit: 80,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        const items = extractListingItems(response);
        const mappedListings = items
          .map(mapListingToExploreCard)
          .filter((item) => item !== null);

        setListings(mappedListings);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setListings([]);
        setFetchError(error?.message || "Failed to load map listings.");
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoadingListings(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [mapViewport.center.lat, mapViewport.center.lng, mapViewport.radiusKm]);

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
            <FilterPanel collapseBehavior="external" onToggleRequest={() => setIsDesktopFilterHidden(true)} />
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
                    <FilterPanel variant="modal" />
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
