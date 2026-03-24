import StatCard from "@/components/adminDashboard/home/StatCard";
import RoundCheck from "@/components/svg/RoundCheck";
import Clock from "@/components/svg/Clock";
import Chat from "@/components/svg/Chat";
import Exclamation from "@/components/svg/Exclamation";
import ListingCard from "@/components/userDashboard/listings/ListingCard";

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
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
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
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
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
    image: "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=900&q=80",
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
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
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
    image: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=900&q=80",
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
    image: "https://images.unsplash.com/photo-1439886183900-e79ec0057170?auto=format&fit=crop&w=900&q=80",
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
    image: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=900&q=80",
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
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
    actions: [{ type: "view", label: "View" }],
  },
 
];

export default function AdminPage() {
  return (
    <main className="flex flex-col bg-background-primary px-4 py-5 sm:h-full sm:min-h-0 sm:overflow-hidden sm:px-5">
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
      <section className="mt-6 flex h-[70vh] flex-none flex-col overflow-hidden rounded-2xl border border-border-input bg-white p-4 sm:min-h-0 sm:flex-1 sm:p-5">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex items-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full ">
              <RoundCheck size={18} />
            </span>
            <div>
              <h2 className="text-[16px] font-semibold capitalize text-gray2 sm:text-[18px]">Recently approved listing</h2>
              {/* <p className="mt-1 text-[13px] text-gray5">Latest land listing approved for publishing</p> */}
            </div>
          </div>

          <button type="button" className="shrink-0 text-[13px] font-semibold text-green-secondary transition hover:opacity-80 sm:text-[14px]">
            View all
          </button>
        </div>

        <div className="mt-5 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 no-scrollbar">
          {approvedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} showFooter={false} />
          ))}
        </div>
      </section>
    </main>
  );
}
