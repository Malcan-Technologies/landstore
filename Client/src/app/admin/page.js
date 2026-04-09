"use client";
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
import { useState } from "react";

const approvedListings = [
  {
    id: "approved-listing-1",
    code: "LS - 000128",
    statusKey: "active",
    statusLabel: "Approved",
    title: "Kuala Langat, Selangor",
    category: "Agriculture",
    area: "5.2 Acres",
    dealTags: ["Buy", "Financing"],
    updatedAt: "05/20/2025",
    price: "RM 1.2M",
    views: 12,
    interests: 3,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
    actions: [{ type: "view", label: "View" }],
  },
  {
    id: "approved-listing-3",
    code: "LS - 000130",
    statusKey: "active",
    statusLabel: "Approved",
    title: "Shah Alam, Selangor",
    category: "Industrial",
    area: "8.0 Acres",
    dealTags: ["Financing"],
    updatedAt: "05/15/2025",
    price: "RM 4.8M",
    views: 32,
    interests: 5,
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
    actions: [{ type: "view", label: "View" }],
  },
  {
    id: "approved-listing-4",
    code: "LS - 000131",
    statusKey: "active",
    statusLabel: "Approved",
    title: "Klang, Selangor",
    category: "Agriculture",
    area: "10.5 Acres",
    dealTags: ["Buy", "Financing", "JV"],
    updatedAt: "05/12/2025",
    price: "RM 3.2M",
    views: 28,
    interests: 6,
    image:
      "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=900&q=80",
    actions: [{ type: "view", label: "View" }],
  },
  {
    id: "approved-listing-5",
    code: "LS - 000132",
    statusKey: "active",
    statusLabel: "Approved",
    title: "Subang Jaya, Selangor",
    category: "Commercial",
    area: "2.3 Acres",
    dealTags: ["Buy"],
    updatedAt: "05/10/2025",
    price: "RM 1.8M",
    views: 19,
    interests: 4,
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    actions: [{ type: "view", label: "View" }],
  },
  {
    id: "approved-listing-6",
    code: "LS - 000133",
    statusKey: "active",
    statusLabel: "Approved",
    title: "Ampang, Selangor",
    category: "Residential",
    area: "1.5 Acres",
    dealTags: ["Financing", "JV"],
    updatedAt: "05/08/2025",
    price: "RM 950K",
    views: 56,
    interests: 12,
    image:
      "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=900&q=80",
    actions: [{ type: "view", label: "View" }],
  },
  {
    id: "approved-listing-7",
    code: "LS - 000134",
    statusKey: "active",
    statusLabel: "Approved",
    title: "Kajang, Selangor",
    category: "Agriculture",
    area: "7.8 Acres",
    dealTags: ["Buy", "Financing"],
    updatedAt: "05/05/2025",
    price: "RM 2.1M",
    views: 23,
    interests: 7,
    image:
      "https://images.unsplash.com/photo-1439886183900-e79ec0057170?auto=format&fit=crop&w=900&q=80",
    actions: [{ type: "view", label: "View" }],
  },
  {
    id: "approved-listing-8",
    code: "LS - 000135",
    statusKey: "active",
    statusLabel: "Approved",
    title: "Rawang, Selangor",
    category: "Industrial",
    area: "12.0 Acres",
    dealTags: ["JV"],
    updatedAt: "05/02/2025",
    price: "RM 6.5M",
    views: 41,
    interests: 9,
    image:
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=900&q=80",
    actions: [{ type: "view", label: "View" }],
  },
  {
    id: "approved-listing-9",
    code: "LS - 000136",
    statusKey: "active",
    statusLabel: "Approved",
    title: "Puchong, Selangor",
    category: "Commercial",
    area: "4.2 Acres",
    dealTags: ["Buy", "JV"],
    updatedAt: "04/28/2025",
    price: "RM 3.8M",
    views: 67,
    interests: 15,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
    actions: [{ type: "view", label: "View" }],
  },
];

export default function AdminPage() {
  const [selectedCombo, setSelectedCombo] = useState("12 months");
  const entityBreakdown = [46, 28, 18, 8];

  return (
    <main className="flex flex-col bg-background-primary px-4 py-5 sm:h-full no-scrollbar sm:min-h-0 sm:overflow-y-auto sm:px-5">
      <div className="shrink-0 grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-3">
        <StatCard
          icon={<Clock />}
          iconBgClassName="bg-[#FFF7E8]"
          value="12"
          label="LISTINGS"
          description="Under review"
        />

        <StatCard
          icon={<Chat size={20} color="#3B82F6" />}
          iconBgClassName="bg-[#EEF4FF]"
          value="8"
          label="ENQUIRIES"
          description="Pending matching"
        />

        <StatCard
          icon={<Exclamation size={20} color="#F04438" />}
          iconBgClassName="bg-[#FEF3F2]"
          value="5"
          label="ENQUIRIES"
          description="Need more info"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4">
          <Chart
            rangeOptions={[
              "Last 7 days",
              "Last 30 days",
              "Last 3 months",
              "Last 12 months",
            ]}
          />
        </div>
        <div className="bg-white rounded-2xl p-4">
          <Chart />
        </div>
      </div>
      <div className="mt-6 flex flex-col bg-white rounded-2xl p-4 border border-border-input">
        <div className="flex items-center gap-1 justify-between">
          <h2 className="text-sm sm:text-base font-semibold text-gray2">
            User breakdown by entity type
          </h2>
          <ChartComboBox
            options={["12 months", "30 days", "7 days", "24 hours"]}
            selectedOption={selectedCombo}
            onSelectOption={setSelectedCombo}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex justify-center w-full col-span-1">
            <EntityDonutChart
              series={entityBreakdown}
              labels={["Individual", "Company", "Koperasi", "Unspecified"]}
              // colors={["#298064", "#339978", "#3DB58E", "#D1D5DB"]}
              totalLabel="Registered users"
            />
          </div>
          <div className="flex flex-col justify-between gap-2 border border-border-input rounded-2xl p-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-chart-1">
              <PersonEntity />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium">Individual</div>
              <div className="flex items-end justify-between gap-2">
                <p className="text-3xl font-bold">680</p>
                <span className="inline-flex items-center gap-1 border border-border-card rounded-lg px-1.5 py-0.5 text-[11px] font-semibold sm:text-[12px]">
                  <TrendUpRight />
                  <span>12.4%</span>
                </span>
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
                <p className="text-3xl font-bold">420</p>
                <span className="inline-flex items-center gap-1 border border-border-card rounded-lg px-1.5 py-0.5 text-[11px] font-semibold sm:text-[12px]">
                  <TrendUpRight />
                  <span>8.6%</span>
                </span>
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
                <p className="text-3xl font-bold">235</p>
                <span className="inline-flex items-center gap-1 border border-border-card rounded-lg px-1.5 py-0.5 text-[11px] font-semibold sm:text-[12px]">
                  <TrendUpRight />
                  <span>6.1%</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="mt-6 flex flex-1 flex-col rounded-2xl border border-border-input bg-white p-4 sm:p-5">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex items-center gap-1 sm:justify-center">
            <span className="inline-flex sm:h-8 sm:w-8 w-3 h-3 items-center justify-center rounded-full -mt-0.25 sm:-mt-1">
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
            className="shrink-0 text-[10px] sm:text-[14px] font-semibold text-green-secondary transition hover:opacity-80 sm:text-[14px]"
          >
            View all
          </button>
        </div>

        <div className="mt-5 overflow-y-auto space-y-4 pr-1 no-scrollbar">
          {approvedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              showFooter={false}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
