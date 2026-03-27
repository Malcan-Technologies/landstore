"use client";

import { use, useState } from "react";
import Image from "next/image";
import MapView from "@/components/userDashboard/explore/MapView";
import EyeOpen from "@/components/svg/EyeOpen";
import Sheet from "@/components/svg/Sheet";
import Sheild from "@/components/svg/Sheild";
import Person from "@/components/svg/Person";
import Check from "@/components/svg/Check";
import Delete from "@/components/svg/Delete";
import Pointer from "@/components/svg/Pointer";
import Building from "@/components/svg/Building";
import Bag from "@/components/svg/Bag";
import PersonCheck from "@/components/svg/PersonCheck";
import RequestChangesModal from "@/components/adminDashboard/modals/RequestChangesModal";
import RejectListingModal from "@/components/adminDashboard/modals/RejectListingModal";
import PermanentDeleteModal from "@/components/adminDashboard/modals/PermanentDeleteModal";
import Telephone from "@/components/svg/Telephone";

const listingDetails = {
  title: "Kuala Langat, Selangor",
  code: "LS - 000128",
  price: "RM 1.2M",
  category: "Agriculture",
  area: "5.2 Acres",
  dealType: "Buy",
  owner: "Dato' Ridzuan Shah",
  memberId: "U123",
  ownerType: "Third-Party Rep",
  ownerDescription: "Represented by licensed agent with valid authorization letter.",
  phone: "+60 12-345 6789",
  publicDescription:
    "Excellent agriculture potential with direct road access. Soil is suitable for various high-value crops. This listing follows strict privacy guidelines. For full documentation including Geran details, please submit a professional enquiry",
  lotNo: "PT 8421",
  mukim: "Ulu Semenyih",
  seksyen: "Sek. 14",
  bumiLot: "Non-Bumi",
  utilization: "Vacant",
  leaseholdStartYear: "03/28/2024",
  leaseholdPeriod: "30 years",
  priceAnalysis: "RM 5.29",
  lat: 3.14,
  lng: 101.69,
  images: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  ],
};

const confidentialFields = [
  { label: "Lot no", value: listingDetails.lotNo },
  { label: "Mukim", value: listingDetails.mukim },
  { label: "Seksyen", value: listingDetails.seksyen },
  { label: "Bumi Lot", value: listingDetails.bumiLot },
  { label: "Utilization", value: listingDetails.utilization },
  { label: "Bumi Lot", value: listingDetails.bumiLot },
  { label: "Leasehold start year", value: listingDetails.leaseholdStartYear },
  { label: "Leasehold Period", value: listingDetails.leaseholdPeriod },
];

const verificationChecklist = [
  { label: "Photos do not contain bypass info", tone: "green" },
  { label: "Map pin acceptable", tone: "neutral" },
  { label: "Description does not contain bypass info", tone: "neutral" },
];

const propertyMapMarkers = [
  {
    id: "review-listing-location",
    price: "RM 108K",
    area: "250 Acres",
    category: "Industrial",
    image: listingDetails.images[0],
    lat: listingDetails.lat,
    lng: listingDetails.lng,
  },
];

const infoLabelClass = "mb-2 text-[12px] font-medium text-white/50";
const fieldLabelClass = "mb-2 text-[11px] font-medium text-white/35";
const fieldBoxClass = "rounded-[9px] border border-white/6 bg-[#153127] px-4 py-3 text-[13px] font-medium text-white/56";

export default function ReviewListingDetailPage({ params }) {
  const resolvedParams = use(params);
  const listingId = resolvedParams?.listingId || listingDetails.code;
  const [activeModal, setActiveModal] = useState(null);

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto  px-4 py-5 no-scrollbar sm:px-5">
      {/* <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/admin/review-lisitings"
          className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8F8F8]"
        >
          <span className="text-lg leading-none">←</span>
          Back to queue
        </Link>
        <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#4338CA]">
          {listingId}
        </span>
      </div> */}

      <section className="grid min-h-max gap-4 xl:grid-cols-[1.04fr_0.96fr]">
        <div className="overflow-hidden h-fit rounded-[18px] border border-[#E9EDF5] bg-white p-4 sm:p-5" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="flex items-start justify-between gap-4 border-b border-[#E9EDF5] pb-4">
            <div>
              <div className="flex items-center gap-2 text-gray2">
                <EyeOpen size={20} color="#298064" />
                <p className="text-[14px] font-semibold text-gray2 sm:text-[16px]">Public preview</p>
              </div>
              <p className="mt-1 text-[12px] text-gray5 sm:text-[13px]">As Visible to Marketplace Users</p>
            </div>
            <span className="inline-flex items-center rounded-md bg-[#F7F7F8] px-3 py-1 text-[11px] font-medium text-[#8E8E8E]">
              {listingDetails.code}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {listingDetails.images.map((image, index) => (
              <div key={`${image}-${index}`} className="relative h-[156px] overflow-hidden rounded-[4px] sm:h-[176px]">
                <Image src={image} alt={`Listing preview ${index + 1}`} fill className="object-cover" sizes="(min-width: 1280px) 25vw, 50vw" unoptimized />
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Pointer size={16} color="#298064" />
                <h1 className="truncate text-[18px] font-semibold leading-none text-gray2 sm:text-[20px]">{listingDetails.title}</h1>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-gray5">
                <span className="inline-flex items-center gap-1.5">
                  <Bag size={14} color="currentColor" />
                  {listingDetails.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building size={14} color="currentColor" />
                  {listingDetails.area}
                </span>
                <span className="inline-flex items-center rounded-full border border-[#D6DAE3] px-2 py-0.5 text-[12px] font-medium text-[#6B7280]">
                  {listingDetails.dealType}
                </span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[18px] font-semibold leading-none text-gray2">{listingDetails.price}</div>
              <div className="mt-1 text-[12px] text-gray5">Est. Valuation</div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-[16px] font-semibold text-gray2">Public Description</h2>
            <p className="mt-2 text-[12px] leading-5 text-gray5 sm:text-[13px]">{listingDetails.publicDescription}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-[16px] font-semibold text-gray2">Approximate Location</h2>
            <div className=" rounded-[10px] bg-white py-3">
              <div className="relative overflow-hidden rounded-[10px]">
                <MapView
                  center={{ lat: listingDetails.lat, lng: listingDetails.lng }}
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
                  LAT 3.14 / LNG 101.69
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-[#0E3C2D] bg-[#082B20] p-4 text-white shadow-[0_12px_30px_rgba(6,36,26,0.24)] sm:p-5">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center text-greenbg">
                <Sheild size={16} color="var(--color-greenbg)" />
              </span>
              <div>
                <h2 className="text-[18px] font-semibold leading-none text-activebg">Confidential Data</h2>
                <p className="mt-1 text-[13px] text-white/45">Privileged Access Only</p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-[4px] bg-greenbg px-2.5 py-1 text-[11px] font-medium text-font2-green">
              Verified Agent
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col">
              <p className={infoLabelClass}>Owner Identity</p>
              <div className="flex h-full flex-col justify-start rounded-[10px] border border-white/6 bg-[#153127] p-4">
                <div className="text-[13px] font-semibold text-white sm:text-[14px]">{listingDetails.owner}</div>
                <div className="mt-1 text-[12px] text-white/50">Member ID: {listingDetails.memberId}</div>
               <div className="flex flex-col">

                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-logo px-1.5 py-0.5 text-[11px] font-medium text-activebg w-fit">
                  <Sheild size={14} color="#ffff" />
                  Corporate identity
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-[12px] text-[#3DB58E]">
                  <Telephone size={14} color="#3DB58E" />
                  {listingDetails.phone}
                </div>
               </div>
              </div>
            </div>

            <div className="flex flex-col">
              <p className={infoLabelClass}>Ownership type</p>
              <div className="h-full rounded-[10px] border border-white/6 bg-[#153127] p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0E2F24] text-greenbg">
                  <PersonCheck size={16} color="var(--color-greenbg)" />
                </span>
                <div className="mt-4 text-[14px] font-semibold text-white">{listingDetails.ownerType}</div>
                <p className="mt-2 text-[12px] leading-5 text-white/70">{listingDetails.ownerDescription}</p>
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
                  <span className="text-[16px] font-semibold leading-none text-white">{listingDetails.priceAnalysis}</span>
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
            <button type="button" className="inline-flex items-center justify-center rounded-[8px] bg-greenbg px-4 py-3 text-[13px] font-medium text-font2-green transition hover:opacity-90">
              Approve
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("requestChanges")}
              className="inline-flex items-center justify-center rounded-[8px] bg-[#134635] px-4 py-3 text-[13px] font-medium text-white transition hover:bg-[#184D39]"
            >
              Request changes
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("reject")}
              className="inline-flex items-center justify-center rounded-[8px] bg-[#134635] px-4 py-3 text-[13px] font-medium text-white transition hover:bg-[#184D39]"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("permanentDelete")}
              className="inline-flex items-center justify-center rounded-[8px] bg-[#30201D] px-4 py-3 text-[13px] font-medium text-[#F87171] transition hover:bg-[#382623]"
            >
              Permanent Delete
            </button>
          </div>
        </div>
      </section>

      <RequestChangesModal
        open={activeModal === "requestChanges"}
        onClose={() => setActiveModal(null)}
        listingId={listingDetails.code}
      />
      <RejectListingModal
        open={activeModal === "reject"}
        onClose={() => setActiveModal(null)}
        listingId={listingDetails.code}
      />
      <PermanentDeleteModal
        open={activeModal === "permanentDelete"}
        onClose={() => setActiveModal(null)}
        listingId={listingDetails.code}
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
