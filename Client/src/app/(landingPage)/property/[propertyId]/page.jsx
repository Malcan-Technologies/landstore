"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Modal from "@/components/common/Modal";
import MapView from "@/components/userDashboard/explore/MapView";
import Bag from "@/components/svg/Bag";
import Bag2 from "@/components/svg/Bag2";
import Building from "@/components/svg/Building";
import Calendar from "@/components/svg/Calendar";
import Check from "@/components/svg/Check";
import Heart from "@/components/svg/Heart";
import Layer from "@/components/svg/Layer";
import List2 from "@/components/svg/List2";
import Map from "@/components/svg/Map";
import Map2 from "@/components/svg/Map2";
import Pointer from "@/components/svg/Pointer";
import Plus from "@/components/svg/Plus";
import Sheild from "@/components/svg/Sheild";
import Person from "@/components/svg/Person";

const propertyDetails = {
  id: "LS-000128",
  title: "Kuala Langat, Selangor",
  valuation: "RM 1.2M",
  ownerType: "Private owner",
  category: "Agriculture",
  area: "5.2 Acres",
  code: "LS - 000128",
  updatedAt: "05/20/2025",
  status: "Active",
  dealTypes: ["Buy", "Financing", "Flat"],
  terrain: "Flat",
  utilization: "Vacant",
  tanahRezab: "Yes",
  negeri: "Melaka / Air Keroh",
  landArea: "15.5 acres",
  pricePerSqft: "RM 450 / sqft",
  features: ["Road Access", "Water Source"],
  lat: 3.14,
  lng: 101.69,
  description:
    "Excellent agriculture potential with direct road access. Soil is suitable for various high-value crops. This listing follows strict privacy guidelines. For full documentation including clean deed, please submit a professional enquiry.",
  images: [
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1439886183900-e79ec0057170?auto=format&fit=crop&w=1200&q=80",
  ],
};

const stats = [
  { label: "Status", values: [{ text: propertyDetails.status, active: true }] },
  { label: "Deal type", values: propertyDetails.dealTypes.slice(0, 2).map((text) => ({ text })) },
  { label: "Terrain", values: [{ text: propertyDetails.terrain }, { text: "Hilly" }] },
  { label: "Utilization", values: [{ text: propertyDetails.utilization }] },
  { label: "Tanah Rezab Melayu", values: [{ text: propertyDetails.tanahRezab }] },
];

const highlightCards = [
  { label: "Negeri/Daerah", value: propertyDetails.negeri, Icon: List2 },
  { label: "Land area", value: propertyDetails.landArea, Icon: Bag2 },
  { label: "Price per sqft", value: propertyDetails.pricePerSqft, Icon: Map2 },
  { label: "Features", value: propertyDetails.features.join(", "), Icon: Layer },
];

const propertyMapMarkers = [
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

const interestTypeOptions = ["Buy", "JV", "Financing"];
const roleOptions = ["Developer", "Buyer", "Financier", "Representative"];

const PropertyPage = () => {
  const router = useRouter();
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [interestType, setInterestType] = useState(interestTypeOptions[0]);
  const [message, setMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState(roleOptions[0]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleOpenGallery = useCallback((index) => {
    setActiveImageIndex(index);
    setIsGalleryOpen(true);
  }, []);

  const handleCloseGallery = useCallback(() => {
    setIsGalleryOpen(false);
  }, []);

  const handlePreviousImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev === 0 ? propertyDetails.images.length - 1 : prev - 1));
  }, []);

  const handleNextImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev === propertyDetails.images.length - 1 ? 0 : prev + 1));
  }, []);

  return (
    <main className="bg-background-primary py-20">
      <div className="flex mx-3 flex-col gap-8 px-2 lg:px-6 xl:px-10 lg:flex-row lg:items-start">
        <section className="w-full space-y-6 lg:w-[67%] lg:max-w-[87%] lg:flex-none">
          <button type="button" onClick={() => router.push("/explore")} className="inline-flex items-center absolute top-22 gap-2 text-sm font-medium text-gray5">
            <ArrowLeftIcon />
            Back to marketplace
          </button>

          <div className="grid gap-2 sm:grid-cols-3 items-stretch">
            <button type="button" onClick={() => handleOpenGallery(0)} className="relative sm:h-100 h-60 sm:rounded-l-xl rounded-t-xl text-left sm:col-span-2 w-full">
              <Image
                src={propertyDetails.images[0]}
                alt="Main property view"
                fill
                className="sm:rounded-l-xl sm:rounded-tr-none rounded-t-xl object-cover"
                sizes="(min-width: 1024px) 66vw, 100vw"
                unoptimized
              />
            </button>
            <div className="flex h-30 gap-2 sm:h-auto sm:flex-col">
              <button type="button" onClick={() => handleOpenGallery(1)} className="relative sm:h-49 flex-1 rounded-r-none rounded-bl-xl text-left sm:w-full sm:flex-none sm:rounded-bl-none sm:rounded-tr-xl">
                <Image
                  src={propertyDetails.images[1]}
                  alt="Property gallery image 2"
                  fill
                  className="rounded-r-none rounded-bl-xl object-cover sm:rounded-bl-none sm:rounded-tr-xl"
                  sizes="(min-width: 1024px) 24vw, 80vw"
                  unoptimized
                />
              </button>
              <button type="button" onClick={() => handleOpenGallery(2)} className="relative sm:h-49 flex-1 rounded-r-xl text-left sm:w-full sm:flex-none sm:rounded-br-xl">
                <Image
                  src={propertyDetails.images[2]}
                  alt="Property gallery image 3"
                  fill
                  className="rounded-br-xl object-cover sm:rounded-br-xl"
                  sizes="(min-width: 1024px) 24vw, 80vw"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-r-xl bg-black/30 text-white sm:rounded-br-xl">
                  +15 more
                </div>
              </button>
            </div>
          </div>

          <header className="flex flex-col gap-4 border-b w-full border-border-input pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2 w-full">
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
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 lg:gap-4 text-[10px] sm:text-xs lg:text-sm xl:text-lg text-gray5">
                <span className="flex items-center gap-1.5 text-gray2 font-bold">
                  <Person size={14} color="black" className="sm:w-4 sm:h-4 w-2.5 h-2.5" />
                  {propertyDetails.ownerType}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building size={14} color="currentColor" className="text-gray5 sm:w-4 sm:h-4 w-2.5 h-2.5" />
                  {propertyDetails.category}
                </span>
                <span className="flex items-center gap-1.5">
                  <Bag size={14} color="currentColor" className="text-gray5 sm:w-4 sm:h-4 w-2.5 h-2.5" />
                  {propertyDetails.area}
                </span>
                <span className="rounded-md border border-border-card px-2 py-1  font-medium text-gray7">{propertyDetails.code}</span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} color="currentColor" className="text-gray5 sm:w-4 sm:h-4 w-2.5 h-2.5" />
                  Updated {propertyDetails.updatedAt}
                </span>
              </div>
            </div>
           
          </header>

          <div className="flex md:justify-between gap-4 border-b border-border-input pb-5 flex-wrap lg:gap-0">
            {stats.map((item, index) => (
              <div key={item.label} className={`space-y-2 lg:flex-1 lg:px-6 ${index !== 0 ? "lg:border-l lg:border-border-input" : ""}`}>
                <p className="text-[12px] font-medium text-gray7">{item.label}</p>
                <div className="flex flex-nowrap gap-2">
                  {item.values.map((value) => (
                    <span
                      key={`${item.label}-${value.text}`}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        value.active
                          ? "border-border-green bg-activebg text-green-primary"
                          : "border-border-input text-gray5"
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
            <p className="max-w-4xl text-[10px] sm:text-xs lg:text-sm xl:text-lg sm:leading-6 text-gray7 leading-snug">{propertyDetails.description}</p>
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
                <div className="pointer-events-none absolute bottom-6 right-6 z-[2] rounded-[14px] border border-border-card bg-white px-4 py-3 text-[12px] font-semibold text-gray7 shadow-[0_6px_18px_rgba(15,23,42,0.16)]">
                  LAT {propertyDetails.lat.toFixed(2)} / LNG {propertyDetails.lng.toFixed(2)}
                </div>
              </div>

              <div className="inline-flex items-center gap-3 h-12 rounded-xl border border-border-card bg-[#FFFCF2] px-3 py-2 text-sm font-medium text-[#DFA403] shadow-[0_6px_16px_rgba(15,61,46,0.08)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-yellow-200/30 bg-[#FFFCF2]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-yellow-300 bg-[#FFFCF2]">
                    <WarningRingIcon />
                  </span>
                </span>
                <span>Location is approximate. Owner identity is protected</span>
              </div>
            </div>
          </div>
        </section>

        <aside className="h-fit w-auto  rounded-xl border border-border-card bg-white p-6 shadow-[0_10px_30px_rgba(16,24,40,0.08)]">
          {showInterestForm ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray7">Interest type</label>
                <div className="relative">
                  <select
                    value={interestType}
                    onChange={(event) => setInterestType(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-border-input bg-white px-4 text-sm font-semibold text-gray2 outline-none"
                  >
                    {interestTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray5">
                    <ChevronDownIcon />
                  </span>
                </div>
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

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray7">Your role</label>
                <div className="flex flex-wrap gap-3">
                  {roleOptions.map((role) => {
                    const active = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${
                          active
                            ? "border-border-green bg-activebg text-green-secondary"
                            : "border-border-input bg-white text-gray2"
                        }`}
                      >
                        {active ? <Check size={16} className="mr-2 text-green-secondary" /> : null}
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button className="flex h-11 w-full items-center justify-center rounded-lg bg-green-primary text-sm font-semibold text-white">
                Confirm selection
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
              <button
                type="button"
                onClick={() => setShowInterestForm(true)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-primary text-sm font-semibold text-white"
              >
                <Plus size={16} color="white" />
                Submit interest
              </button>
              <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border-card bg-white text-sm font-semibold text-green-primary">
                <Heart size={16} color="currentColor" />
                Add to shortlist
              </button>
              <p className="text-center text-xs leading-5 text-gray5">No direct seller contact. Bypass attempts result in immediate account suspension.</p>
            </div>
          )}
        </aside>
      </div>

      <Modal
        open={isGalleryOpen}
        onClose={handleCloseGallery}
        panelClassName="w-full max-w-[1100px] overflow-visible bg-transparent px-4 py-4 text-left shadow-none md:px-5 md:py-5"
        overlayClassName="bg-black/70"
        containerClassName="flex min-h-full items-center justify-center p-4"
        closeButtonClassName="absolute right-5 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-[34px] leading-none text-white/80 backdrop-blur-sm transition hover:bg-black/70 hover:text-white"
        closeLabel="Close gallery"
      >
        <div className="relative space-y-4 rounded-[28px] bg-[#0D0D0D] p-4 shadow-2xl md:p-5">
          <div className="relative z-10 overflow-hidden rounded-[22px] bg-black/50">
            <div className="relative h-[70vh] min-h-105 w-full">
              <Image
                src={propertyDetails.images[activeImageIndex]}
                alt={`Property gallery image ${activeImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                unoptimized
              />
            </div>

            <button
              type="button"
              onClick={handlePreviousImage}
              className="absolute left-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Previous image"
            >
              <span className="text-[22px] leading-none">‹</span>
            </button>

            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Next image"
            >
              <span className="text-[22px] leading-none">›</span>
            </button>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-3 text-sm text-white/80">
            <span>
              Image {activeImageIndex + 1} of {propertyDetails.images.length}
            </span>
          </div>

          <div className="relative z-10 flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
            {propertyDetails.images.map((image, index) => {
              const isActive = activeImageIndex === index;

              return (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                    isActive ? "border-green-secondary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Open image ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`Property thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="112px"
                    unoptimized
                  />
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
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
