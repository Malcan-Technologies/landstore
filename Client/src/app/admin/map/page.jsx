"use client";

import { useEffect, useMemo, useState } from "react";

import Loading from "@/components/common/Loading";
import StatCard from "@/components/adminDashboard/home/StatCard";
import MapView from "@/components/userDashboard/explore/MapView";
import Search from "@/components/svg/Search";
import MapStatTotal from "@/components/svg/MapStatTotal";
import MapStatActive from "@/components/svg/MapStatActive";
import MapStatPending from "@/components/svg/MapStatPending";
import MapStatReview from "@/components/svg/MapStatReview";
import MapStatNeedInfo from "@/components/svg/MapStatNeedInfo";
import { landService } from "@/services/landService";

const fallbackListingImage = "/Land.jpg";
const defaultMapCenter = { lat: 4.2105, lng: 101.9758 };

const extractListingItems = (response) => {
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const toFiniteNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

const normalizeStatus = (status) => String(status || "").trim().toLowerCase().replace(/\s+/g, "_");

const toTrimmedImageUrl = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue || null;
};

const resolveListingImage = (listing) => {
  const mediaItems = Array.isArray(listing?.media)
    ? listing.media
    : listing?.media
      ? [listing.media]
      : [];

  for (const mediaItem of mediaItems) {
    const mediaImage =
      toTrimmedImageUrl(mediaItem?.fileUrl) ||
      toTrimmedImageUrl(mediaItem?.url) ||
      toTrimmedImageUrl(mediaItem?.signedUrl);

    if (mediaImage) {
      return mediaImage;
    }
  }

  return (
    toTrimmedImageUrl(listing?.image) ||
    toTrimmedImageUrl(listing?.images?.[0]?.fileUrl) ||
    toTrimmedImageUrl(listing?.images?.[0]?.url) ||
    fallbackListingImage
  );
};

const mapListingToMarker = (listing) => {
  const lat = toFiniteNumberOrNull(listing?.location?.latitude);
  const lng = toFiniteNumberOrNull(listing?.location?.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const normalizedStatus = normalizeStatus(listing?.status);

  return {
    id: listing?.id || listing?.listingCode || `${lat}-${lng}`,
    title: listing?.title || "",
    code: listing?.listingCode || "",
    status: normalizedStatus,
    price: formatPrice(listing?.price ?? listing?.estimatedValuation),
    area: formatArea(listing?.landArea, listing?.landAreaUnit),
    category: listing?.category?.name || "-",
    image: resolveListingImage(listing),
    lat,
    lng,
  };
};

const matchesSearch = (marker, searchValue) => {
  const normalizedSearch = String(searchValue || "").trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return [marker?.title, marker?.code, marker?.category, marker?.status]
    .map((value) => String(value || "").toLowerCase())
    .some((value) => value.includes(normalizedSearch));
};

const getListingStatusCounts = (listings) => {
  return listings.reduce(
    (counts, listing) => {
      const status = normalizeStatus(listing?.status);

      if (status === "active" || status === "approved" || status === "published") {
        counts.active += 1;
      }

      if (status === "pending" || status === "pending_matching") {
        counts.pending += 1;
      }

      if (status === "review" || status === "under_review") {
        counts.review += 1;
      }

      if (status === "need_more_info" || status === "need_info") {
        counts.needInfo += 1;
      }

      return counts;
    },
    {
      total: listings.length,
      active: 0,
      pending: 0,
      review: 0,
      needInfo: 0,
    }
  );
};

export default function AdminMapPage() {
  const [listings, setListings] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadListings = async () => {
      try {
        setIsLoadingListings(true);
        setListingsError("");

        const response = await landService.getAdminListings({ page: 1, limit: 500, recentlyApproved: false });

        if (!isMounted) {
          return;
        }

        setListings(extractListingItems(response));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const errorMessage = error?.response?.data?.message || error?.message || "Unable to load map listings.";
        setListingsError(errorMessage);
        setListings([]);
      } finally {
        if (isMounted) {
          setIsLoadingListings(false);
        }
      }
    };

    loadListings();

    return () => {
      isMounted = false;
    };
  }, []);

  const listingStats = useMemo(() => getListingStatusCounts(listings), [listings]);

  const markers = useMemo(
    () => listings.map((listing) => mapListingToMarker(listing)).filter(Boolean),
    [listings]
  );

  const filteredMarkers = useMemo(
    () => markers.filter((marker) => matchesSearch(marker, searchValue)),
    [markers, searchValue]
  );

  const defaultActiveMarkerId = filteredMarkers[0]?.id || null;

  const mapCenter = useMemo(() => {
    const firstMarker = filteredMarkers[0];
    if (!firstMarker) {
      return defaultMapCenter;
    }

    return { lat: firstMarker.lat, lng: firstMarker.lng };
  }, [filteredMarkers]);

  const statCards = useMemo(
    () => [
      {
        id: "total",
        icon: <MapStatTotal size={20} />,
        iconBgClassName: "bg-[#F3F4F6]",
        value: isLoadingListings ? "..." : String(listingStats.total),
        label: "LISTINGS",
        description: "Total",
      },
      {
        id: "active",
        icon: <MapStatActive size={20} />,
        iconBgClassName: "bg-[#ECFDF3]",
        value: isLoadingListings ? "..." : String(listingStats.active),
        label: "LISTINGS",
        description: "Active",
      },
      {
        id: "pending",
        icon: <MapStatPending size={20} />,
        iconBgClassName: "bg-[#EEF4FF]",
        value: isLoadingListings ? "..." : String(listingStats.pending),
        label: "LISTINGS",
        description: "Pending matching",
      },
      {
        id: "review",
        icon: <MapStatReview size={20} />,
        iconBgClassName: "bg-[#FFF7E8]",
        value: isLoadingListings ? "..." : String(listingStats.review),
        label: "LISTINGS",
        description: "Under review",
      },
      {
        id: "need-info",
        icon: <MapStatNeedInfo size={20} />,
        iconBgClassName: "bg-[#FEF3F2]",
        value: isLoadingListings ? "..." : String(listingStats.needInfo),
        label: "LISTINGS",
        description: "Need more info",
      },
    ],
    [isLoadingListings, listingStats]
  );

  if (isLoadingListings) {
    return <Loading />;
  }

  return (
    <main className="flex flex-col bg-background-primary px-4 py-5 sm:h-full sm:min-h-0 sm:overflow-y-auto sm:px-5 no-scrollbar">
      <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
        {statCards.map((card) => (
          <StatCard
            key={card.id}
            icon={card.icon}
            iconBgClassName={card.iconBgClassName}
            value={card.value}
            label={card.label}
            description={card.description}
          />
        ))}
      </div>

      <section className="mt-6 flex flex-col rounded-2xl border border-[#E9EDF5] bg-white p-4 sm:flex-1 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-semibold text-[#111827] sm:text-[22px]">Map</h1>
            <span className="inline-flex h-5 min-w-7 items-center justify-center rounded-full bg-[#EEF2FF] px-2 text-[12px] font-medium leading-none text-[#4338CA]">
              {`${filteredMarkers.length} Listings`}
            </span>
          </div>

          <label className="flex h-8 w-full max-w-55 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[#9CA3AF] sm:max-w-50">
            <Search size={16} color="#111827" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full border-0 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            />
          </label>
        </div>

        {listingsError ? (
          <div className="mt-4 flex min-h-135 flex-1 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 text-center text-sm font-medium text-red-600">
            {listingsError}
          </div>
        ) : null}

        {!listingsError && filteredMarkers.length === 0 ? (
          <div className="mt-4 flex min-h-135 flex-1 items-center justify-center rounded-2xl border border-[#EEF2F6] bg-background-primary px-4 text-center text-sm font-medium text-gray5">
            No listings found for the current search.
          </div>
        ) : null}

        {!listingsError && filteredMarkers.length > 0 ? (
          <MapView
            markers={filteredMarkers}
            center={mapCenter}
            zoom={8}
            defaultActiveMarkerId={defaultActiveMarkerId}
            infoWindowOffset={18}
            markerColor="#18181B"
            containerClassName="mt-4 min-h-[540px] flex-1 rounded-2xl border border-[#EEF2F6] shadow-none"
            mapClassName="h-full min-h-[540px] w-full"
          />
        ) : null}
      </section>
    </main>
  );
}
