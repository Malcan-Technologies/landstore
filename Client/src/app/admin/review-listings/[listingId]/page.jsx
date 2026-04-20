"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Loading from "@/components/common/Loading";
import MapView from "@/components/userDashboard/explore/MapView";
import EyeOpen from "@/components/svg/EyeOpen";
import Sheild from "@/components/svg/Sheild";
import Check from "@/components/svg/Check";
import Pointer from "@/components/svg/Pointer";
import Building from "@/components/svg/Building";
import Bag from "@/components/svg/Bag";
import PersonCheck from "@/components/svg/PersonCheck";
import RequestChangesModal from "@/components/adminDashboard/modals/RequestChangesModal";
import RejectListingModal from "@/components/adminDashboard/modals/RejectListingModal";
import PermanentDeleteModal from "@/components/adminDashboard/modals/PermanentDeleteModal";
import Telephone from "@/components/svg/Telephone";
import { landService } from "@/services/landService";

const infoLabelClass = "mb-2 text-[12px] font-medium text-white/50";
const fieldLabelClass = "mb-2 text-[11px] font-medium text-white/35";
const fieldBoxClass = "rounded-[9px] border border-white/6 bg-[#153127] px-4 py-3 text-[12px] font-medium text-white/56";

const formatPrice = (value) => {
  if (!value && value !== 0) return "-";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return "-";
  if (num >= 1_000_000) return `RM ${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `RM ${(num / 1_000).toFixed(0)}K`;
  return `RM ${num.toFixed(2)}`;
};

const formatLandArea = (value, unit) => {
  if (!value && value !== 0) return "-";
  return `${parseFloat(value).toLocaleString()} ${unit || ""}`.trim();
};

const toTitleCase = (value) =>
  String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const mapApiToDetail = (data) => {
  const p = data?.property ?? data;
  return {
    id: p?.id ?? "",
    code: p?.listingCode ?? "-",
    title: p?.title ?? "-",
    price: formatPrice(p?.price),
    estimatedValuation: formatPrice(p?.estimatedValuation),
    pricePerSqft: p?.pricePerSqrft ? `RM ${parseFloat(p.pricePerSqrft).toFixed(2)}` : "-",
    category: p?.category?.name ?? "-",
    area: formatLandArea(p?.landArea, p?.landAreaUnit),
    dealTypes: Array.isArray(p?.dealTypes) ? p.dealTypes.map(toTitleCase) : [],
    description: p?.description ?? "",
    status: p?.status ?? null,
    tanahRizabMelayu: p?.tanahRizabMelayu ?? null,
    owner: p?.user?.name ?? "-",
    userId: p?.userId ?? "-",
    phone: p?.user?.phone ?? "-",
    ownerType: p?.ownershipType?.name ?? "-",
    utilization: p?.utilization?.name ?? "-",
    titleType: p?.titleType?.name ?? "-",
    mukim: p?.location?.mukim ?? "-",
    section: p?.location?.section ?? "-",
    state: p?.location?.state ?? "-",
    district: p?.location?.district ?? "-",
    lat: p?.location?.latitude ? parseFloat(p.location.latitude) : null,
    lng: p?.location?.longitude ? parseFloat(p.location.longitude) : null,
    leaseholdStartYear: p?.leaseholdDetails?.startYear ?? "-",
    leaseholdPeriod: p?.leaseholdDetails?.leasePeriodYears ? `${p.leaseholdDetails.leasePeriodYears} years` : "-",
    images: Array.isArray(p?.media)
      ? p.media.map((m) => m?.fileUrl).filter(Boolean)
      : p?.media?.fileUrl
        ? [p.media.fileUrl]
        : [],
  };
};

const verificationChecklist = [
  { label: "Photos do not contain bypass info", tone: "green" },
  { label: "Map pin acceptable", tone: "neutral" },
  { label: "Description does not contain bypass info", tone: "neutral" },
];

export default function ReviewListingDetailPage({ params }) {
  const resolvedParams = use(params);
  const listingId = resolvedParams?.listingId;

  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    if (!listingId) return;
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const response = await landService.getListingById(listingId);
        if (!isMounted) return;
        setDetail(mapApiToDetail(response));
      } catch (err) {
        if (!isMounted) return;
        setLoadError(err?.message || "Failed to load listing.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [listingId]);

  if (isLoading) {
    return <Loading />;
  }

  if (loadError || !detail) {
    return (
      <main className="flex h-full min-h-0 flex-1 items-center justify-center px-4 py-5">
        <p className="text-[14px] text-[#B42318]">{loadError || "Listing not found."}</p>
      </main>
    );
  }

  const confidentialFields = [
    { label: "Mukim", value: detail.mukim },
    { label: "Section", value: detail.section },
    { label: "Bumi Lot", value: detail.tanahRizabMelayu === true ? "Bumi" : detail.tanahRizabMelayu === false ? "Non-Bumi" : "-" },
    { label: "Utilization", value: detail.utilization },
    { label: "Title Type", value: detail.titleType },
    { label: "Leasehold Start Year", value: detail.leaseholdStartYear },
    { label: "Leasehold Period", value: detail.leaseholdPeriod },
  ];

  const hasLocation = detail.lat !== null && detail.lng !== null;

  const propertyMapMarkers = hasLocation
    ? [{ id: "review-listing-location", price: detail.price, area: detail.area, category: detail.category, image: detail.images[0] ?? null, lat: detail.lat, lng: detail.lng }]
    : [];

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 no-scrollbar sm:px-5">
      <section className="grid min-h-max gap-4 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="overflow-hidden h-fit rounded-[18px] border border-[#E9EDF5] bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4 border-b border-[#E9EDF5] pb-4">
            <div>
              <div className="flex items-center gap-2 text-gray2">
                <EyeOpen size={20} color="#298064" />
                <p className="text-[14px] font-semibold text-gray2 sm:text-[16px]">Public preview</p>
              </div>
              <p className="mt-1 text-[12px] text-gray5 sm:text-[13px]">As Visible to Marketplace Users</p>
            </div>
            <span className="inline-flex items-center rounded-md bg-[#F1F1F1] px-3 py-1 text-[11px] font-medium text-gray5">
              {detail.code}
            </span>
          </div>

          {detail.images.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {detail.images.slice(0, 4).map((image, index) => (
                <div key={`${image}-${index}`} className="relative h-39 overflow-hidden rounded-sm sm:h-44">
                  <Image
                    src={image}
                    alt={`Listing preview ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 25vw, 50vw"
                    loading={index === 0 ? "eager" : "lazy"}
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex h-39 items-center justify-center rounded-sm bg-[#F5F5F5] text-[12px] text-gray5">
              No images uploaded
            </div>
          )}

          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Pointer size={16} color="#298064" />
                <h1 className="truncate text-[18px] font-semibold leading-none text-gray2 sm:text-[20px]">{detail.title}</h1>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-gray5">
                <span className="inline-flex items-center gap-1.5">
                  <Bag size={14} color="currentColor" />
                  {detail.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building size={14} color="currentColor" />
                  {detail.area}
                </span>
                {detail.dealTypes.map((dt) => (
                  <span key={dt} className="inline-flex items-center rounded-full border border-[#D6DAE3] px-2 py-0.5 text-[12px] font-medium text-[#6B7280]">
                    {dt}
                  </span>
                ))}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[18px] font-semibold leading-none text-gray2">{detail.price}</div>
              {detail.estimatedValuation !== "-" && (
                <div className="mt-1 text-[12px] text-gray5">Est. {detail.estimatedValuation}</div>
              )}
            </div>
          </div>

          {detail.description ? (
            <div className="mt-6">
              <h2 className="text-[16px] font-semibold text-gray2">Public Description</h2>
              <p className="mt-2 text-[12px] leading-5 text-gray5 sm:text-[13px]">{detail.description}</p>
            </div>
          ) : null}

          {hasLocation ? (
            <div className="mt-6">
              <h2 className="text-[16px] font-semibold text-gray2">Approximate Location</h2>
              <div className="rounded-[10px] bg-white py-3">
                <div className="relative overflow-hidden rounded-[10px]">
                  <MapView
                    center={{ lat: detail.lat, lng: detail.lng }}
                    zoom={13}
                    markers={propertyMapMarkers}
                    defaultActiveMarkerId="review-listing-location"
                    hideMarkerPin
                    showCenterRings
                    infoWindowOffset={8}
                    containerClassName="min-h-[236px] rounded-[10px] border-none bg-background-primary shadow-none"
                    mapClassName="h-[325px] w-full rounded-[10px]"
                    ringClassName="z-[1]"
                  />
                  <div className="pointer-events-none absolute bottom-4 right-4 z-2 rounded-xl border border-border-card bg-white px-3 py-2 text-[12px] font-semibold text-gray7 shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                    LAT {detail.lat.toFixed(4)} / LNG {detail.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-[18px] border border-[#0E3C2D] bg-[#082B20] p-4 text-white shadow-[0_12px_30px_rgba(6,36,26,0.24)] sm:p-5">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center text-greenbg">
                <Sheild size={16} color="var(--color-greenbg)" />
              </span>
              <div>
                <h2 className="text-[16px] sm:text-[18px] font-semibold leading-none text-activebg">Confidential Data</h2>
                <p className="mt-1 text-[11px] sm:text-[13px] text-white/45">Privileged Access Only</p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-sm bg-green-logo px-2.5 py-1 text-[10px] sm:text-[12px] font-semibold text-greenbg border border-[#17523F]/80">
              Verified Agent
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col">
              <p className={infoLabelClass}>Owner Identity</p>
              <div className="flex h-full flex-col justify-start rounded-[10px] border border-white/6 bg-[#153127] p-4">
                <div className="text-[13px] font-semibold text-white sm:text-[14px]">{detail.owner}</div>
                <div className="mt-1 text-[12px] text-white/50">User ID: {detail.userId}</div>
                <div className="flex flex-col">
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-logo px-1.5 py-0.5 text-[11px] font-medium text-activebg w-fit">
                    <Sheild size={14} color="#ffff" />
                    Corporate identity
                  </div>
                  {detail.phone !== "-" && (
                    <div className="mt-3 inline-flex items-center gap-1 text-[12px] text-green-chart-3">
                      <Telephone size={14} color="#3DB58E" />
                      {detail.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <p className={infoLabelClass}>Ownership type</p>
              <div className="h-full rounded-[10px] border border-white/6 bg-[#153127] p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0E2F24] text-greenbg">
                  <PersonCheck size={16} color="var(--color-greenbg)" />
                </span>
                <div className="mt-4 text-[14px] font-semibold text-white">{detail.ownerType}</div>
                <p className="mt-2 text-[12px] leading-5 text-white/70">{detail.state}{detail.district !== "-" ? `, ${detail.district}` : ""}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-x-4 gap-y-3 sm:grid-cols-2">
            {confidentialFields.map((field, index) => (
              <div key={`${field.label}-${index}`}>
                <p className={fieldLabelClass}>{field.label}</p>
                <div className={fieldBoxClass}>{field.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[10px] border border-white/6 bg-[#153127] p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <div>
                <p className="text-[11px] font-medium text-white/32">Price Analysis</p>
                <div className="mt-1 flex items-end gap-1">
                  <span className="text-[16px] font-semibold leading-none text-white">{detail.pricePerSqft}</span>
                  <span className="text-[12px] text-white/60">/ per sqf</span>
                </div>
              </div>
              <button type="button" className="inline-flex items-center gap-2 text-[12px] font-medium text-greenbg transition hover:opacity-85">
                <DownloadIcon />
                Download Geran
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[14px] font-medium text-white/45">Verification Checklist</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {verificationChecklist.map((item) => (
                <span
                  key={item.label}
                  className={
                    item.tone === "green"
                      ? "inline-flex items-center gap-1.5 rounded-full border border-greenbg/40 bg-[#0F3A2B] px-3 py-1.5 text-[12px] font-medium text-greenbg"
                      : "inline-flex items-center gap-1.5 rounded-full border border-white/28 bg-transparent px-3 py-1.5 text-[12px] font-medium text-white"
                  }
                >
                  {item.tone === "green" ? <Check size={12} stroke="currentColor" /> : null}
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" className="inline-flex items-center justify-center rounded-lg bg-greenbg px-4 py-3 text-[13px] font-medium text-font2-green transition hover:opacity-90">
              Approve
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("requestChanges")}
              className="inline-flex items-center justify-center rounded-lg bg-[#134635] px-4 py-3 text-[13px] font-medium text-white transition hover:bg-[#184D39]"
            >
              Request changes
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("reject")}
              className="inline-flex items-center justify-center rounded-lg bg-[#134635] px-4 py-3 text-[13px] font-medium text-white transition hover:bg-[#184D39]"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("permanentDelete")}
              className="inline-flex items-center justify-center rounded-lg bg-[#30201D] px-4 py-3 text-[13px] font-medium text-[#F87171] transition hover:bg-[#382623]"
            >
              Permanent Delete
            </button>
          </div>
        </div>
      </section>

      <RequestChangesModal
        open={activeModal === "requestChanges"}
        onClose={() => setActiveModal(null)}
        listingId={detail.code}
      />
      <RejectListingModal
        open={activeModal === "reject"}
        onClose={() => setActiveModal(null)}
        listingId={detail.code}
      />
      <PermanentDeleteModal
        open={activeModal === "permanentDelete"}
        onClose={() => setActiveModal(null)}
        listingId={detail.code}
      />
    </main>
  );
}

const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M2.2672 1.8961C2.46578 1.69752 2.78868 1.69752 2.98725 1.8961L3.98476 2.89361C4.18334 3.09218 4.18334 3.41508 3.98476 3.61365L3.47416 4.12426C3.74175 5.00255 4.20672 5.81248 4.83737 6.4631C5.4881 7.09379 6.29796 7.55876 7.17625 7.82635L7.68686 7.31575C7.88544 7.11718 8.20833 7.11718 8.40691 7.31575L9.40442 8.31326C9.603 8.51183 9.603 8.83473 9.40442 9.03331L8.89597 9.54176C8.44613 9.9916 7.78032 10.1712 7.16152 10.0115C5.86005 9.6758 4.67858 8.98875 3.75047 8.06064C2.82235 7.13252 2.1353 5.95105 1.7996 4.64958C1.63992 4.03078 1.81954 3.36497 2.26938 2.91513L2.2672 1.8961Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M7 2.3335V8.16683" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.66699 5.8335L7.00033 8.16683L9.33366 5.8335" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 10.5H10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
