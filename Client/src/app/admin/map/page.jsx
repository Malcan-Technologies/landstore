"use client";

import StatCard from "@/components/adminDashboard/home/StatCard";
import MapView from "@/components/userDashboard/explore/MapView";
import Search from "@/components/svg/Search";
import MapStatTotal from "@/components/svg/MapStatTotal";
import MapStatActive from "@/components/svg/MapStatActive";
import MapStatPending from "@/components/svg/MapStatPending";
import MapStatReview from "@/components/svg/MapStatReview";
import MapStatNeedInfo from "@/components/svg/MapStatNeedInfo";

const statCards = [
  {
    id: "total",
    icon: <MapStatTotal size={20} />,
    iconBgClassName: "bg-[#F3F4F6]",
    value: "120",
    label: "LISTINGS",
    description: "Total",
  },
  {
    id: "active",
    icon: <MapStatActive size={20} />,
    iconBgClassName: "bg-[#ECFDF3]",
    value: "85",
    label: "LISTINGS",
    description: "Active",
  },
  {
    id: "pending",
    icon: <MapStatPending size={20} />,
    iconBgClassName: "bg-[#EEF4FF]",
    value: "8",
    label: "LISTINGS",
    description: "Pending matching",
  },
  {
    id: "review",
    icon: <MapStatReview size={20} />,
    iconBgClassName: "bg-[#FFF7E8]",
    value: "12",
    label: "LISTINGS",
    description: "Under review",
  },
  {
    id: "need-info",
    icon: <MapStatNeedInfo size={20} />,
    iconBgClassName: "bg-[#FEF3F2]",
    value: "5",
    label: "LISTINGS",
    description: "Need more info",
  },
];

const listings = [
  {
    id: "listing-1",
    price: "RM 108K",
    area: "#1 250 Acres",
    category: "Industrial",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
    lat: 3.1408,
    lng: 101.6932,
  },
  {
    id: "listing-2",
    price: "RM 108K",
    area: "#1 250 Acres",
    category: "Industrial",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
    lat: 3.1466,
    lng: 101.6958,
  },
  {
    id: "listing-3",
    price: "RM 108K",
    area: "#1 250 Acres",
    category: "Industrial",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80",
    lat: 3.1432,
    lng: 101.7028,
  },
  {
    id: "listing-4",
    price: "RM 108K",
    area: "#1 250 Acres",
    category: "Industrial",
    image:
      "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=600&q=80",
    lat: 3.1374,
    lng: 101.6974,
  },
  {
    id: "listing-5",
    price: "RM 108K",
    area: "#1 250 Acres",
    category: "Industrial",
    image:
      "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=600&q=80",
    lat: 3.1329,
    lng: 101.6918,
  },
  {
    id: "listing-6",
    price: "RM 108K",
    area: "#1 250 Acres",
    category: "Industrial",
    image:
      "https://images.unsplash.com/photo-1439886183900-e79ec0057170?auto=format&fit=crop&w=600&q=80",
    lat: 3.1335,
    lng: 101.7041,
  },
  {
    id: "listing-7",
    price: "RM 108K",
    area: "#1 250 Acres",
    category: "Industrial",
    image:
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=600&q=80",
    lat: 3.1268,
    lng: 101.6976,
  },
  {
    id: "listing-8",
    price: "RM 108K",
    area: "#1 250 Acres",
    category: "Industrial",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
    lat: 3.1222,
    lng: 101.6937,
  },
  {
    id: "listing-9",
    price: "RM 108K",
    area: "#1 250 Acres",
    category: "Industrial",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
    lat: 3.1216,
    lng: 101.7029,
  },
];

export default function AdminMapPage() {
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
              120 Listings
            </span>
          </div>

          <label className="flex h-8 w-full max-w-[220px] items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[#9CA3AF] sm:max-w-[200px]">
            <Search size={16} color="#111827" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full border-0 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            />
          </label>
        </div>

        <MapView
          markers={listings}
          center={{ lat: 3.1345, lng: 101.6978 }}
          zoom={15}
          defaultActiveMarkerId="listing-4"
          infoWindowOffset={18}
          markerColor="#18181B"
          containerClassName="mt-4 min-h-[540px] flex-1 rounded-2xl border border-[#EEF2F6] shadow-none"
          mapClassName="h-full min-h-[540px] w-full"
        />
      </section>
    </main>
  );
}
