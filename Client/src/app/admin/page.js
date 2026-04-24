"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";
import StatCard from "@/components/adminDashboard/home/StatCard";
import BuildingEntity from "@/components/svg/BuildingEntity";
import GroupEntity from "@/components/svg/GroupEntity";
import RoundCheck from "@/components/svg/RoundCheck";
import Clock from "@/components/svg/Clock";
import Chat from "@/components/svg/Chat";
import Exclamation from "@/components/svg/Exclamation";
import PersonEntity from "@/components/svg/PersonEntity";
import TrendUpRight from "@/components/svg/TrendUpRight";
import ListingCard from "@/components/userDashboard/listings/ListingCard";
import Chart from "@/components/adminDashboard/home/Chart";
import ChartComboBox from "@/components/adminDashboard/home/ChartComboBox";
import EntityDonutChart from "@/components/adminDashboard/home/EntityDonutChart";
import { analyticsService } from "@/services/analyticsService";
import { enquiryService } from "@/services/enquiryService";
import { landService } from "@/services/landService";

const fallbackListingImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80";

const dealTagMap = {
  buy: "Buy",
  jv: "JV",
  financing: "Financing",
};

const extractListingItems = (response) => {
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const extractEnquiryItems = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result?.data)) return response.result.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response)) return response;
  return [];
};

const toTrimmedImageUrl = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue || null;
};

const resolveListingImage = (item) => {
  const mediaItems = Array.isArray(item?.media)
    ? item.media
    : item?.media
      ? [item.media]
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
    toTrimmedImageUrl(item?.image) ||
    toTrimmedImageUrl(item?.images?.[0]?.fileUrl) ||
    toTrimmedImageUrl(item?.images?.[0]?.url) ||
    fallbackListingImage
  );
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

const formatArea = (landArea, landAreaUnit) => {
  const numericValue = Number(landArea);
  const area = Number.isFinite(numericValue) ? numericValue.toLocaleString("en-US") : String(landArea || "-");
  const unit = landAreaUnit ? ` ${landAreaUnit}` : "";
  return `${area}${unit}`;
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

const mapListingToCard = (item) => ({
  id: item?.id,
  code: item?.listingCode || "-",
  statusKey: "active",
  statusLabel: "Approved",
  title: item?.title || "-",
  category: item?.category?.name || "-",
  area: formatArea(item?.landArea, item?.landAreaUnit),
  dealTags: Array.isArray(item?.dealTypes)
    ? item.dealTypes.map((tag) => dealTagMap[String(tag).toLowerCase()] || String(tag || ""))
    : [],
  updatedAt: formatDate(item?.updatedAt || item?.createdAt),
  price: formatPrice(item?.estimatedValuation ?? item?.price),
  views: Number(item?.viewsCount ?? 0),
  interests: Number(item?.clicksCount ?? 0),
  image: resolveListingImage(item),
  actions: [{ type: "view", label: "View" }],
});

const extractGrowthPoints = (response) => {
  const points =
    Array.isArray(response?.data?.dataPoints) ? response.data.dataPoints :
    Array.isArray(response?.data) ? response.data :
    Array.isArray(response?.result) ? response.result :
    Array.isArray(response?.items) ? response.items :
    [];
  const trendPercent =
    response?.data?.summary?.percentageIncrease ??
    response?.data?.trendPercent ??
    response?.trendPercent ??
    null;
  return {
    series: points.map((p) => Number(p?.count ?? p?.value ?? 0)),
    categories: points.map((p) => String(p?.date ?? p?.label ?? p?.period ?? "")),
    trendPercent,
  };
};

const extractBreakdown = (response) => {
  const labelMap = { individual: "Individual", company: "Company", koperasi: "Koperasi" };
  const colorMap = { individual: "#298064", company: "#339978", koperasi: "#3DB58E" };

  const breakdownObj = response?.data?.breakdown ?? response?.breakdown ?? null;

  if (breakdownObj && typeof breakdownObj === "object" && !Array.isArray(breakdownObj)) {
    const keys = Object.keys(breakdownObj).filter((k) => labelMap[k.toLowerCase()]);
    if (keys.length > 0) {
      return {
        labels: keys.map((k) => labelMap[k.toLowerCase()]),
        series: keys.map((k) => Number(breakdownObj[k]?.count ?? breakdownObj[k]?.total ?? 0)),
        colors: keys.map((k) => colorMap[k.toLowerCase()] ?? "#CFCFCF"),
      };
    }
  }

  return {
    labels: ["Individual", "Company", "Koperasi"],
    series: [0, 0, 0],
    colors: ["#298064", "#339978", "#3DB58E"],
  };
};

export default function AdminPage() {
  const router = useRouter();
  const [approvedListings, setApprovedListings] = useState([]);
  const [isLoadingApprovedListings, setIsLoadingApprovedListings] = useState(false);
  const [approvedListingsError, setApprovedListingsError] = useState("");

  const [overviewStats, setOverviewStats] = useState({
    listingsUnderReview: 0,
    enquiriesPending: 0,
    enquiriesNeedInfo: 0,
  });
  const [isLoadingOverviewStats, setIsLoadingOverviewStats] = useState(true);

  const [growthTimeRange, setGrowthTimeRange] = useState("12 months");
  const [growthData, setGrowthData] = useState({ series: [], categories: [], trendPercent: null });
  const [isLoadingGrowth, setIsLoadingGrowth] = useState(false);

  const [activeListingsTimeRange, setActiveListingsTimeRange] = useState("12 months");
  const [activeListingsData, setActiveListingsData] = useState({ series: [], categories: [], trendPercent: null });
  const [isLoadingActiveListings, setIsLoadingActiveListings] = useState(false);

  const [breakdownTimeRange, setBreakdownTimeRange] = useState("12 months");
  const [breakdownData, setBreakdownData] = useState({ labels: ["Individual", "Company", "Koperasi"], series: [0, 0, 0], colors: ["#298064", "#339978", "#3DB58E"] });
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);
  const [breakdownEntityCards, setBreakdownEntityCards] = useState([]);
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadOverviewStats = async () => {
      try {
        setIsLoadingOverviewStats(true);

        const response = await landService.getListingStatistics();

        if (!isMounted) {
          return;
        }

        if (response?.success && response?.data) {
          setOverviewStats({
            listingsUnderReview: response.data.listings.underReview,
            enquiriesPending: response.data.enquiries.pending,
            enquiriesNeedInfo: response.data.enquiries.needMoreInfo,
          });
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setOverviewStats({
          listingsUnderReview: 0,
          enquiriesPending: 0,
          enquiriesNeedInfo: 0,
        });
      } finally {
        if (isMounted) {
          setIsLoadingOverviewStats(false);
        }
      }
    };

    loadOverviewStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadUserGrowth = useCallback(async (timeRange) => {
    setIsLoadingGrowth(true);
    try {
      const response = await analyticsService.getUserGrowth({ timeRange });
      setGrowthData(extractGrowthPoints(response));
    } catch {
      setGrowthData({ series: [], categories: [], trendPercent: null });
    } finally {
      setIsLoadingGrowth(false);
    }
  }, []);

  const loadActiveListings = useCallback(async (timeRange) => {
    setIsLoadingActiveListings(true);
    try {
      const response = await analyticsService.getActiveListings({ timeRange });
      setActiveListingsData(extractGrowthPoints(response));
    } catch {
      setActiveListingsData({ series: [], categories: [], trendPercent: null });
    } finally {
      setIsLoadingActiveListings(false);
    }
  }, []);

  const loadUserBreakdown = useCallback(async (timeRange) => {
    setIsLoadingBreakdown(true);
    try {
      const response = await analyticsService.getUserBreakdown({ timeRange });
      const parsed = extractBreakdown(response);
      setBreakdownData(parsed);
      const labelMap = { individual: "Individual", company: "Company", koperasi: "Koperasi" };
      const breakdownObj = response?.data?.breakdown ?? response?.breakdown ?? {};
      if (breakdownObj && typeof breakdownObj === "object" && !Array.isArray(breakdownObj)) {
        const cards = Object.keys(breakdownObj)
          .filter((k) => labelMap[k.toLowerCase()])
          .map((k) => ({
            key: k,
            label: labelMap[k.toLowerCase()],
            count: Number(breakdownObj[k]?.count ?? breakdownObj[k]?.total ?? 0),
            trend: breakdownObj[k]?.percentageChange ?? breakdownObj[k]?.trendPercent ?? null,
          }));
        setBreakdownEntityCards(cards);
      } else {
        setBreakdownEntityCards([]);
      }
    } catch {
      setBreakdownEntityCards([]);
    } finally {
      setIsLoadingBreakdown(false);
    }
  }, []);

  useEffect(() => { loadUserGrowth(growthTimeRange); }, [growthTimeRange, loadUserGrowth]);
  useEffect(() => { loadActiveListings(activeListingsTimeRange); }, [activeListingsTimeRange, loadActiveListings]);
  useEffect(() => { loadUserBreakdown(breakdownTimeRange); }, [breakdownTimeRange, loadUserBreakdown]);

  useEffect(() => {
    let isMounted = true;

    const loadRecentlyApprovedListings = async () => {
      try {
        setIsLoadingApprovedListings(true);
        setApprovedListingsError("");

        const response = await landService.getAdminListings({
          page: 1,
          limit: 5,
          recentlyApproved: true,
        });

        if (!isMounted) return;

        const items = extractListingItems(response);
        setApprovedListings(items.map(mapListingToCard));
      } catch (error) {
        if (!isMounted) return;
        setApprovedListings([]);
        setApprovedListingsError(error?.message || "Failed to load recently approved listings.");
      } finally {
        if (isMounted) {
          setIsLoadingApprovedListings(false);
        }
      }
    };

    loadRecentlyApprovedListings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasCompletedInitialLoad) {
      return;
    }

    const isAnySectionLoading =
      isLoadingOverviewStats ||
      isLoadingGrowth ||
      isLoadingActiveListings ||
      isLoadingBreakdown ||
      isLoadingApprovedListings;

    if (!isAnySectionLoading) {
      setHasCompletedInitialLoad(true);
    }
  }, [
    hasCompletedInitialLoad,
    isLoadingOverviewStats,
    isLoadingGrowth,
    isLoadingActiveListings,
    isLoadingBreakdown,
    isLoadingApprovedListings,
  ]);

  if (!hasCompletedInitialLoad) {
    return <Loading />;
  }

  return (
    <main className="flex flex-col bg-background-primary px-4 py-5 sm:h-full no-scrollbar sm:min-h-0 sm:overflow-y-auto sm:px-5">
      <div className="shrink-0 grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-3">
        <StatCard
          icon={<Clock />}
          iconBgClassName="bg-[#FFF7E8]"
          value={isLoadingOverviewStats ? "..." : String(overviewStats.listingsUnderReview)}
          label="LISTINGS"
          description="Under review"
        />

        <StatCard
          icon={<Chat size={20} color="#3B82F6" />}
          iconBgClassName="bg-[#EEF4FF]"
          value={isLoadingOverviewStats ? "..." : String(overviewStats.enquiriesPending)}
          label="ENQUIRIES"
          description="Pending matching"
        />

        <StatCard
          icon={<Exclamation size={20} color="#F04438" />}
          iconBgClassName="bg-[#FEF3F2]"
          value={isLoadingOverviewStats ? "..." : String(overviewStats.enquiriesNeedInfo)}
          label="ENQUIRIES"
          description="Need more info"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4">
          <Chart
            title="User growth over time"
            seriesName="Users"
            series={growthData.series}
            categories={growthData.categories}
            timeRange={growthTimeRange}
            onTimeRangeChange={setGrowthTimeRange}
            isLoading={isLoadingGrowth}
            trendPercent={growthData.trendPercent !== null ? `${growthData.trendPercent}%` : null}
          />
        </div>
        <div className="bg-white rounded-2xl p-4">
          <Chart
            title="Active listings over time"
            seriesName="Listings"
            series={activeListingsData.series}
            categories={activeListingsData.categories}
            timeRange={activeListingsTimeRange}
            onTimeRangeChange={setActiveListingsTimeRange}
            isLoading={isLoadingActiveListings}
            trendPercent={activeListingsData.trendPercent !== null ? `${activeListingsData.trendPercent}%` : null}
          />
        </div>
      </div>
      <div className="mt-6 flex flex-col bg-white rounded-2xl p-4 border border-border-input">
        <div className="flex items-center gap-1 justify-between">
          <h2 className="text-sm sm:text-base font-semibold text-gray2">
            User breakdown by entity type
          </h2>
          <ChartComboBox
            options={["12 months", "30 days", "7 days", "24 hours"]}
            selectedValue={breakdownTimeRange}
            onChange={setBreakdownTimeRange}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex justify-center w-full col-span-1">
            {isLoadingBreakdown ? (
              <div className="flex h-37.5 items-center justify-center">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-border-card border-t-green-secondary" />
              </div>
            ) : (
              <EntityDonutChart
                series={breakdownData.series}
                labels={breakdownData.labels}
                colors={breakdownData.colors}
                totalLabel="Registered users"
              />
            )}
          </div>

          {breakdownEntityCards.length > 0 ? breakdownEntityCards.map((card, index) => {
            const iconBg = ["bg-green-chart-1", "bg-green-chart-2", "bg-green-chart-3"][index] ?? "bg-green-chart-1";
            const Icon = [PersonEntity, GroupEntity, BuildingEntity][index] ?? PersonEntity;
            return (
              <div key={card.key} className="flex flex-col justify-between gap-2 border border-border-input rounded-2xl p-4">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon />
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-medium">{card.label}</div>
                  <div className="flex items-end justify-between gap-2">
                    <p className="text-3xl font-bold">{card.count.toLocaleString("en-US")}</p>
                    {card.trend !== null ? (
                      <span className="inline-flex items-center gap-1 border border-border-card rounded-lg px-1.5 py-0.5 text-[11px] font-semibold sm:text-[12px]">
                        <TrendUpRight />
                        <span>{card.trend}%</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          }) : (
            <>
              <div className="flex flex-col justify-between gap-2 border border-border-input rounded-2xl p-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-chart-1">
                  <PersonEntity />
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-medium">Individual</div>
                  <div className="flex items-end justify-between gap-2">
                    <p className="text-3xl font-bold">{breakdownData.series[0] ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-2 border border-border-input rounded-2xl p-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-chart-2">
                  <GroupEntity />
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-medium">Company</div>
                  <div className="flex items-end justify-between gap-2">
                    <p className="text-3xl font-bold">{breakdownData.series[1] ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-2 border border-border-input rounded-2xl p-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-chart-3">
                  <BuildingEntity />
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-medium">Koperasi</div>
                  <div className="flex items-end justify-between gap-2">
                    <p className="text-3xl font-bold">{breakdownData.series[2] ?? 0}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <section className="mt-6 flex flex-1 flex-col rounded-2xl border border-border-input bg-white p-4 sm:p-5">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex items-center gap-1 sm:justify-center">
            <span className="-mt-px inline-flex h-3 w-3 items-center justify-center rounded-full sm:-mt-1 sm:h-8 sm:w-8">
              <RoundCheck size={22} />
            </span>
            <div>
              <h2 className="text-[12px] font-semibold  capitalize text-gray2 sm:text-[18px]">
                Recently approved listing
              </h2>
              {/* <p className="mt-1 text-[13px] text-gray5">Latest land listing approved for publishing</p> */}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/admin/review-listings')}
            className="shrink-0 text-[10px] font-semibold text-green-secondary transition hover:opacity-80 sm:text-[14px]"
          >
            View all
          </button>
        </div>

        <div className="mt-5 overflow-y-auto space-y-4 pr-1 no-scrollbar">
          {isLoadingApprovedListings ? (
            <div className="flex min-h-25 items-center justify-center rounded-xl border border-border-input bg-background-primary px-4 py-3">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-border-card border-t-green-secondary" />
            </div>
          ) : null}

          {!isLoadingApprovedListings && approvedListingsError ? (
            <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#B42318]">
              {approvedListingsError}
            </div>
          ) : null}

          {!isLoadingApprovedListings && !approvedListingsError && approvedListings.length === 0 ? (
            <div className="rounded-xl border border-border-input bg-background-primary px-4 py-3 text-[14px] text-gray5">
              No recently approved listings found.
            </div>
          ) : null}

          {!isLoadingApprovedListings && !approvedListingsError
            ? approvedListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  showFooter={false}
                />
              ))
            : null}
        </div>
      </section>
    </main>
  );
}
