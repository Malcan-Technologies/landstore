"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Table from "@/components/common/Table";
import Search from "@/components/svg/Search";
import Person from "@/components/svg/Person";
import EyeOpen from "@/components/svg/EyeOpen";
import Check from "@/components/svg/Check";
import RedCross from "@/components/svg/RedCross";
import Sheild from "@/components/svg/Sheild";
import Sheet from "@/components/svg/Sheet";
import { landService } from "@/services/landService";

const extractListingItems = (response) => {
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatRelativeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

const toTitleCase = (value) =>
  String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const mapListingToReviewRow = (item, index) => {
  const ownerName = item?.user?.name || item?.createdBy?.name || "Unknown Owner";
  const ownerType = item?.user?.profileType ? toTitleCase(item.user.profileType) : "Unknown Profile";
  const region = item?.location?.state || "-";
  const area = item?.location?.district || item?.location?.mukim || "-";

  return {
    id: item?.id || `review-listing-${index + 1}`,
    listingSlug: item?.id || item?.listingCode || `review-listing-${index + 1}`,
    listingId: item?.listingCode ? `#${item.listingCode}` : "-",
    submittedDate: formatDate(item?.createdAt),
    submittedAgo: formatRelativeTime(item?.createdAt),
    ownerName,
    ownerType,
    region,
    area,
    dealTypes: Array.isArray(item?.dealTypes) ? item.dealTypes.map((deal) => toTitleCase(deal)) : [],
    status: item?.status ?? null,
    flagState: item?.status === "review" ? "red" : "green",
  };
};

const dealBadgeClass =
  "inline-flex items-center rounded-full border border-[#D6DAE3] bg-white px-2 py-1 font-medium text-[#52525B]";

const flagIconWrapClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-full";

const iconButtonBase =
  "inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAFAFA] transition hover:bg-[#F3F4F6]";

const actionButtonBase =
  "inline-flex h-10 w-10 items-center justify-center rounded-lg transition border-0";

export default function ReviewListingsPage() {
  const router = useRouter();
  const [reviewListings, setReviewListings] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [updatingIds, setUpdatingIds] = useState({});
  const sentinelRef = useRef(null);
  const PAGE_LIMIT = 20;

  const headers = [
    { label: "Listing ID" },
    { label: "Submitted Date" },
    { label: "Owner Profile" },
    { label: "Negeri / Daerah" },
    { label: "Deal Types" },
    { label: "Flags" },
    { label: "Actions" },
  ];

  const openListing = (listing) => {
    router.push(`/admin/review-listings/${listing.listingSlug}`);
  };

  const fetchPage = useCallback(async (pageNum, signal) => {
    const response = await landService.getAdminListings({
      page: pageNum,
      limit: PAGE_LIMIT,
      recentlyApproved: false,
    });
    if (signal?.aborted) return null;
    return response;
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadInitial = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        setPage(1);
        setHasMore(true);

        const response = await fetchPage(1, controller.signal);
        if (!isMounted || !response) return;

        const items = extractListingItems(response);
        const pagination = response?.pagination ?? response?.data?.pagination ?? {};
        setReviewListings(items.map((item, i) => mapListingToReviewRow(item, i)));
        setHasMore(pagination.page < pagination.totalPages);
      } catch (error) {
        if (!isMounted) return;
        setReviewListings([]);
        setLoadError(error?.message || "Failed to load listing review queue.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchPage]);

  useEffect(() => {
    if (!hasMore || isFetchingMore || isLoading) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        const nextPage = page + 1;
        setIsFetchingMore(true);
        try {
          const response = await fetchPage(nextPage);
          if (!response) return;
          const items = extractListingItems(response);
          const pagination = response?.pagination ?? response?.data?.pagination ?? {};
          setReviewListings((prev) => [
            ...prev,
            ...items.map((item, i) => mapListingToReviewRow(item, prev.length + i)),
          ]);
          setPage(nextPage);
          setHasMore(nextPage < pagination.totalPages);
        } catch {
          /* silently ignore load-more errors */
        } finally {
          setIsFetchingMore(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, isLoading, page, fetchPage]);

  const updateListingStatus = useCallback(async (listing, newStatus) => {
    const id = listing.id;
    setUpdatingIds((prev) => ({ ...prev, [id]: newStatus }));
    try {
      await landService.updateListing(id, { status: newStatus });
      setReviewListings((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, status: newStatus, flagState: newStatus === "review" ? "red" : "green" }
            : l
        )
      );
    } catch {
      /* leave row unchanged on error */
    } finally {
      setUpdatingIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }, []);

  const filteredReviewListings = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) return reviewListings;

    return reviewListings.filter((listing) => {
      const text = [
        listing.listingId,
        listing.ownerName,
        listing.ownerType,
        listing.region,
        listing.area,
        listing.dealTypes.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [reviewListings, searchValue]);

  const rows = filteredReviewListings.map((listing) => ({
    key: listing.id,
    data: listing,
    cells: [
      <div key="listing-id" className="font-medium text-[#111827]">
        {listing.listingId}
      </div>,
      <div key="submitted-date" className="space-y-0.5">
        <div className="font-medium text-[#111827]">{listing.submittedDate}</div>
        <div className="text-gray5">{listing.submittedAgo}</div>
      </div>,
      <div key="owner-profile" className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280]">
          <Person size={18} color="#6B7280" />
        </span>
        <div className="min-w-0">
          <div className="truncate font-medium text-[#111827]">{listing.ownerName}</div>
          <div className="truncate text-gray5">{listing.ownerType}</div>
        </div>
      </div>,
      <div key="region" className="space-y-0.5">
        <div className="font-medium text-[#111827]">{listing.region}</div>
        <div className="text-gray5">{listing.area}</div>
      </div>,
      <div key="deal-types" className="flex flex-nowrap gap-2">
        {listing.dealTypes.map((deal) => (
          <span key={deal} className={dealBadgeClass}>
            {deal}
          </span>
        ))}
      </div>,
      <div key="flags" className="flex items-center gap-2">
        <span
          className={flagIconWrapClass}
          style={{ backgroundColor: listing.flagState === "green" ? "#ECFDF2" : "#F8F8F8" }}
        >
          <Sheet
            size={14}
            color={listing.flagState === "green" ? "#15803D" : "#9D9D9D"}
          />
        </span>
        <span
          className={flagIconWrapClass}
          style={{ backgroundColor: listing.flagState === "red" ? "#FEF2F2" : "#F8F8F8" }}
        >
          <Sheild
            size={14}
            color={listing.flagState === "red" ? "#DC2626" : "#9D9D9D"}
          />
        </span>
      </div>,
      <div key="actions" className="flex items-center gap-2">
        <button type="button" className={iconButtonBase} aria-label="View listing" onClick={(event) => { event.stopPropagation(); openListing(listing); }}>
          <EyeOpen size={18} color="#111827" />
        </button>
        <button
          type="button"
          disabled={!!updatingIds[listing.id]}
          className={actionButtonBase + " border border-[#D5F5E3] bg-[#EAFBF1] text-[#0F8A4A] disabled:opacity-50"}
          aria-label="Approve listing"
          onClick={(event) => { event.stopPropagation(); updateListingStatus(listing, "active"); }}
        >
          <Check size={18} stroke="#0F8A4A" />
        </button>
        <button
          type="button"
          disabled={!!updatingIds[listing.id]}
          className={actionButtonBase + " border border-[#FFE0E0] bg-[#FFF1F2] text-[#EF4444] disabled:opacity-50"}
          aria-label="Set to draft"
          onClick={(event) => { event.stopPropagation(); updateListingStatus(listing, "draft"); }}
        >
          <RedCross size={18} />
        </button>
      </div>,
    ],
  }));

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-primary px-4 py-5 sm:px-5">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E9EDF5] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-semibold text-[#111827] sm:text-[22px]">Listing Review Queue</h1>
            <span className="inline-flex h-4 min-w-7 items-center justify-center rounded-full bg-[#EEF2FF] px-2 text-[12px] font-medium leading-none text-[#4338CA]">
              {filteredReviewListings.length}
            </span>
          </div>

          <label className="flex h-8 w-full max-w-[220px] items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[#9CA3AF] sm:max-w-[200px]">
            <Search size={16} color="var(--color-font2-green)" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full border-0 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            />
          </label>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-hidden sm:max-h-[calc(100vh-210px)] sm:overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[14px] text-gray5">
              Loading listings...
            </div>
          ) : null}

          {!isLoading && loadError ? (
            <div className="rounded-xl border border-[#FFE0E0] bg-[#FFF1F2] px-4 py-3 text-[14px] text-[#B42318]">
              {loadError}
            </div>
          ) : null}

          {!isLoading && !loadError ? (
            <>
              <Table
                headers={headers}
                rows={rows}
                className="border-none shadow-none"
                tableClassName="min-w-[1024px]"
                onRowClick={(row) => openListing(row.data)}
              />
              <div ref={sentinelRef} className="h-px" />
              {isFetchingMore ? (
                <div className="py-4 text-center text-[13px] text-gray5">Loading more...</div>
              ) : null}
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
