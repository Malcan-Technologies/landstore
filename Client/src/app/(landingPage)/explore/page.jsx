"use client";

import { useMemo } from "react";

import FilterPanel from "@/components/userDashboard/explore/FilterPanel";
import PropertyCard from "@/components/userDashboard/explore/PropertyCard";
import MapView from "@/components/userDashboard/explore/MapView";

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

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const ExplorePage = () => {
  console.log("ExplorePage rendered");
  const randomizedListingsNearCenter = useMemo(() => {
    const nearbyListings = landListings.filter((listing) => {
      if (!Number.isFinite(listing.lat) || !Number.isFinite(listing.lng)) {
        return false;
      }
      return getDistanceKm(mapCenter.lat, mapCenter.lng, listing.lat, listing.lng) <= 60;
    });

    if (nearbyListings.length === 0) {
      return shuffle(landListings);
    }

    return shuffle(nearbyListings);
  }, []);

  return (
    <main className="bg-background-primary py-10">
      <div className="mx-4 flex w-full flex-col gap-8 px-4 lg:flex-row lg:items-start lg:px-8">
        <FilterPanel />

        <section className="flex-1 space-y-6">
          <div className="flex flex-col gap-6 xl:flex-row">
            <div className="flex flex-col gap-5">
              <header className="rounded-3xl px-6 py-5">
                <p className="text-[20px] font-semibold text-gray2">Found 12 properties</p>
                <p className="text-[14px] text-gray5">Secured and verified property listings</p>
              </header>
              {randomizedListingsNearCenter.map((land) => (
                <PropertyCard key={land.id} land={land} />
              ))}
            </div>

            <div className="w-full">
              <MapView center={mapCenter} markers={mapMarkers} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ExplorePage;
