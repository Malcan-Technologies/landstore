"use client";

import { useEffect, useMemo, useState } from "react";

import EyeOpen from "@/components/svg/EyeOpen";
import Star from "@/components/svg/Star";
import UpRight from "@/components/svg/UpRight";
import ListingCard from "@/components/userDashboard/listings/ListingCard";
import { landService } from "@/services/landService";

const listingStats = [
  {
    id: "views",
    label: "Listings views",
    value: "12,440",
    icon: EyeOpen,
    delta: "6.2%",
  },
  {
    id: "clicks",
    label: "Listings clicks",
    value: "12,440",
    icon: EyeOpen,
    delta: "6.2%",
  },
];

const listingTabs = [
  { id: "all", label: "All listings (12)", active: true },
  { id: "drafts", label: "Drafts (5)" },
  { id: "review", label: "Under Review (8)" },
  { id: "active", label: "Active (3)" },
  { id: "inactive", label: "Inactive / History (10)" },
];

const fallbackListingImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80";

const dealTagMap = {
  buy: "Buy",
  jv: "JV",
  financing: "Financing",
};

const extractListingItems = (response) => {
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.result?.items)) return response.result.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
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

  if (absoluteValue > 1_000_000_000_000) {
    return formatCompact(1_000_000_000_000, "T");
  }

  if (absoluteValue > 1_000_000_000) {
    return formatCompact(1_000_000_000, "B");
  }

  if (absoluteValue > 1_000_000) {
    return formatCompact(1_000_000, "M");
  }

  if (absoluteValue > 1_000) {
    return formatCompact(1_000, "K");
  }

  return `RM ${numericValue.toLocaleString("en-US")}`;
};

const formatArea = (landArea, landAreaUnit) => {
  const numericValue = Number(landArea);
  const area = Number.isFinite(numericValue) ? numericValue.toLocaleString("en-US") : String(landArea || "-");
  const unit = landAreaUnit ? ` ${landAreaUnit}` : "";
  return `${area}${unit}`;
};

const toStatusKey = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "draft") return "draft";
  if (normalizedStatus === "review" || normalizedStatus === "under_review" || normalizedStatus === "under review") {
    return "review";
  }
  if (normalizedStatus === "reserved" || normalizedStatus === "inactive" || normalizedStatus === "history") {
    return "reserved";
  }

  return "active";
};

const toStatusLabel = (statusKey) => {
  if (statusKey === "draft") return "Draft";
  if (statusKey === "review") return "Under review";
  if (statusKey === "reserved") return "Reserved";
  return "Active";
};

const toListingActions = (statusKey) => {
  if (statusKey === "reserved") {
    return [
      { type: "request", label: "Request status change" },
      { type: "view", label: "View" },
    ];
  }

  if (statusKey === "active") {
    return [{ type: "delete", label: "Delete" }];
  }

  return [
    { type: "default", label: "Edit" },
    { type: "delete", label: "Delete" },
  ];
};

const mapListingToCard = (item) => {
  const statusKey = toStatusKey(item?.status);

  return {
    id: item?.id,
    code: item?.listingCode || "-",
    statusKey,
    statusLabel: toStatusLabel(statusKey),
    title: item?.title || "-",
    category: item?.category?.name || "-",
    area: formatArea(item?.landArea, item?.landAreaUnit),
    dealTags: Array.isArray(item?.dealTypes)
      ? item.dealTypes.map((tag) => dealTagMap[String(tag).toLowerCase()] || String(tag || ""))
      : [],
    updatedAt: formatDate(item?.updatedAt),
    price: formatPrice(item?.estimatedValuation ?? item?.price),
    views: Number(item?.viewsCount ?? 0),
    interests: Number(item?.clicksCount ?? 0),
    image: item?.media?.fileUrl || fallbackListingImage,
    actions: toListingActions(statusKey),
  };
};

const ListingsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [listings, setListings] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadListings = async () => {
      try {
        const response = await landService.getAllListings();
        const items = extractListingItems(response);

        if (!isMounted) return;
        setListings(items.map(mapListingToCard));
      } catch {
        if (!isMounted) return;
        setListings([]);
      }
    };

    loadListings();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredListings = useMemo(() => {
    switch (activeTab) {
      case "drafts":
        return listings.filter((listing) => listing.statusKey === "draft");
      case "review":
        return listings.filter((listing) => listing.statusKey === "review");
      case "active":
        return listings.filter((listing) => listing.statusKey === "active");
      case "inactive":
        return listings.filter((listing) => listing.statusKey === "reserved");
      default:
        return listings;
    }
  }, [activeTab, listings]);

  return (
    <main className="bg-background-primary py-14">
      <div className="mx-2 md:mx-10 w-fulls px-2 md:px-4">
        <header>
          <h1 className="text-[24px] font-bold tracking-tight text-gray2 sm:text-[28px] md:text-[32px]">My Listings</h1>
          <p className="mt-1 lg:text-[16px] md:text-[16px] text-[14px] text-gray5">Manage your professional land portfolio</p>
        </header>

        <section className="mt-8 flex flex-col lg:flex-row justify-between xl:gap-3 gap-2">
          <div className="flex flex-col sm:flex-row justify-between gap-3 lg:w-[50%]">
          {listingStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article key={stat.id} className="sm:w-[50%] flex justify-center items-center rounded-2xl border border-border-card bg-white px-3 py-3 shadow-[0px_4px_18px_rgba(15,61,46,0.04)]">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center justify-center md:gap-3 gap-4">
                    <span className="inline-flex h-10 w-10 -mt-2 items-center justify-center rounded-lg border border-border-card bg-white text-gray5 shadow-[0px_3px_10px_rgba(15,61,46,0.06)]">
                      <Icon size={20} color="var(--color-gray5)" />
                    </span>

                    <div className="flex flex-col gap-3">
                      <p className="text-[13px] font-medium text-[#8C8C8C] md:text-[14px]">{stat.label}</p>
                      <p className=" text-[18px] font-bold leading-none text-gray2 md:text-[24px]">{stat.value}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-md border border-border-card bg-white px-2 py-1 text-[11px] font-medium text-gray2 shadow-[0px_2px_8px_rgba(15,61,46,0.05)]">
                    <UpRight size={12} color="#17B26A" />
                    {stat.delta}
                  </span>
                </div>
              </article>
            );
          })}

          </div>

          <div className="relative lg:w-[50%] mt-2 lg:mt-0 overflow-hidden rounded-2xl bg-font2-green px-6 py-5 text-white shadow-[0px_10px_24px_rgba(6,36,26,0.18)]">
            <div className="absolute -right-14 -top-5 opacity-20 z-1">
              <Star size={150} color="white" />
            </div>
            <div className="flex h-full flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-[13px] text-white/70">Promote to 45k+ investors today</p>
                <h2 className="mt-2 text-[20px] font-semibold">Boost your reach</h2>
              </div>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-3 rounded-xl bg-greenbg px-5 z-2 sm:text-[14px] text-[12px] font-semibold text-font2-green transition hover:opacity-90"
              >
                <Star size={18} color="var(--color-font2-green)" />
                Promote listing today
              </button>
            </div>
          </div>
        </section>

        <div className="no-scrollbar mt-6 flex flex-nowrap items-center gap-x-4 gap-y-3 overflow-x-auto border-b border-border-card text-[11px] font-medium text-gray5 sm:gap-x-5 sm:text-[12px] md:gap-x-8 md:text-[14px]">
          {listingTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              className={`relative shrink-0 whitespace-nowrap pb-3 transition sm:pb-3.5 md:pb-4 ${activeTab === tab.id ? "text-green-secondary" : "hover:text-gray2"}`}
            >
              {tab.label}
              {activeTab === tab.id ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-green-secondary" /> : null}
            </button>
          ))}
        </div>

        <section className="mt-6 space-y-4">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </section>
      </div>
    </main>
  );
};

export default ListingsPage;
