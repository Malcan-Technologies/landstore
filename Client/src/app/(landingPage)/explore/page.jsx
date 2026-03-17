"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import FilterPanel from "@/components/userDashboard/explore/FilterPanel";
import PropertyCard from "@/components/userDashboard/explore/PropertyCard";
import MapView from "@/components/userDashboard/explore/MapView";
import Funnel from "@/components/svg/Funnel";

const landListings = [
  {
    id: "LS-000128",
    status: "Active",
    statusColor: "var(--color-green-secondary)",
    image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80",
    category: "Agriculture",
    area: "5.2 Acres",
    code: "LS - 000128",
    title: "Palm Valley Agricultural Land",
    dealTags: ["Buy", "Financing", "JV"],
    price: "RM 850k",
    valuation: "RM1000/sqft",
    lat: 3.0946,
    lng: 101.6788,
  },
  {
    id: "LS-000129",
    status: "Active",
    statusColor: "var(--color-green-secondary)",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    category: "Industrial",
    area: "2.5 Acres",
    code: "LS - 000129",
    title: "Bukit Bintang Logistics Hub",
    dealTags: ["Buy", "JV", "Financing"],
    price: "RM 1.2m",
    valuation: "RM1250/sqft",
    lat: 3.0824,
    lng: 101.7003,
  },
  {
    id: "LS-000130",
    status: "Active",
    statusColor: "var(--color-green-secondary)",
    image: "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=1200&q=80",
    category: "Commercial",
    area: "3.1 Acres",
    code: "LS - 000130",
    title: "Bandar Seri Putra Commercial Site",
    dealTags: ["Financing", "Buy"],
    price: "RM 940k",
    valuation: "RM980/sqft",
    lat: 2.9643,
    lng: 101.7879,
  },
];

const mapCenter = { lat: 3.0459, lng: 101.7083 };

const mapMarkers = landListings.map((land) => ({
  id: land.id,
  price: land.price,
  area: land.area,
  category: land.category,
  image: land.image,
  lat: land.lat,
  lng: land.lng,
}));

const toRadians = (value) => (value * Math.PI) / 180;

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

const ExplorePage = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isDesktopFilterHidden, setIsDesktopFilterHidden] = useState(false);
  const filterMenuRef = useRef(null);

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

  const listingsNearCenter = useMemo(() => {
    const nearbyListings = landListings.filter((listing) => {
      if (!Number.isFinite(listing.lat) || !Number.isFinite(listing.lng)) {
        return false;
      }
      return getDistanceKm(mapCenter.lat, mapCenter.lng, listing.lat, listing.lng) <= 60;
    });

    const sourceListings = nearbyListings.length === 0 ? landListings : nearbyListings;

    return [...sourceListings].sort((first, second) => {
      const firstDistance = getDistanceKm(mapCenter.lat, mapCenter.lng, first.lat, first.lng);
      const secondDistance = getDistanceKm(mapCenter.lat, mapCenter.lng, second.lat, second.lng);

      if (firstDistance !== secondDistance) {
        return firstDistance - secondDistance;
      }

      return first.id.localeCompare(second.id);
    });
  }, []);

  return (
    <main className="bg-background-primary pt-10 pb-2">
      <div className="sm:mx-10 mx-1 flex w-auto gap-6 px-2 lg:items-start lg:px-2 ">
        {!isDesktopFilterHidden ? (
          <div className="hidden md:block h-[calc(100vh-6rem)] xl:h-[calc(100vh-6rem)]">
            <FilterPanel collapseBehavior="external" onToggleRequest={() => setIsDesktopFilterHidden(true)} />
          </div>
        ) : null}

        <section className="flex-1 space-y-6">
          <div className="flex  gap-6 ">
            <div className="hidden h-[calc(100vh-6rem)] xl:flex xl:flex-col xl:gap-5">
              <header className="rounded-3xl px-6 py-5 pl-0">
                <p className="text-[24px] font-bold text-gray2">Found 12 properties</p>
                <p className="text-[14px] text-gray5">Secured and verified property listings</p>
              </header>
              <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto no-scrollbar">
                {listingsNearCenter.map((land) => (
                  <PropertyCard key={land.id} land={land} />
                ))}
              </div>
            </div>

            <div className="relative w-full h-[calc(100vh-6rem)]">
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
              <MapView center={mapCenter} markers={mapMarkers} />
              <div className="absolute inset-x-0 bottom-4 z-2 xl:hidden px-4">
                <div
                  className="mx-auto flex max-w-full gap-4 overflow-x-auto no-scrollbar"
                  style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
                >
                  {listingsNearCenter.map((land) => (
                    <PropertyCard key={land.id} land={land} variant="compact" className="" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ExplorePage;
