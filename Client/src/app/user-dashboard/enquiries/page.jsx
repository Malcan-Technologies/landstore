import EnquiryCard from "@/components/userDashboard/enquiries/EnquiryCard";

const enquiries = [
  {
    id: "enquiry-1",
    code: "ENQ - 000128",
    status: "Need More Info",
    title: "Kuala Langat, Selangor",
    category: "Agriculture",
    area: "5.2 Acres",
    dealTags: ["Financing"],
    updatedAt: "05/20/2025",
    unreadCount: 2,
    highlighted: true,
    image: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "enquiry-2",
    code: "ENQ - 000128",
    status: "Scheduled",
    title: "Kuala Langat, Selangor",
    category: "Agriculture",
    area: "5.2 Acres",
    dealTags: ["JV"],
    updatedAt: "05/20/2025",
    unreadCount: 0,
    image: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "enquiry-3",
    code: "ENQ - 000128",
    status: "Pending Matching",
    title: "Kuala Langat, Selangor",
    category: "Agriculture",
    area: "5.2 Acres",
    dealTags: ["Buy"],
    updatedAt: "05/20/2025",
    unreadCount: 0,
    image: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "enquiry-4",
    code: "ENQ - 000128",
    status: "Under Review",
    title: "Kuala Langat, Selangor",
    category: "Agriculture",
    area: "5.2 Acres",
    dealTags: ["Buy", "Financing"],
    updatedAt: "05/20/2025",
    unreadCount: 0,
    image: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "enquiry-5",
    code: "ENQ - 000128",
    status: "Matched (In Progress)",
    title: "Kuala Langat, Selangor",
    category: "Agriculture",
    area: "5.2 Acres",
    dealTags: ["Buy", "Financing"],
    updatedAt: "05/20/2025",
    unreadCount: 0,
    image: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=1200&q=80",
  },
];

const EnquiriesPage = () => {
  return (
    <main className="bg-background-primary py-8 md:py-10">
      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-6 xl:px-9">
        <header>
          <h1 className="text-[30px] font-semibold tracking-tight text-gray2 md:text-[40px]">My Enquiries</h1>
          <p className="mt-1 text-[15px] text-gray5 md:text-[18px]">Track your interest across various land parcels.</p>
        </header>

        <section className="mt-6 space-y-4">
          {enquiries.map((enquiry) => (
            <EnquiryCard key={enquiry.id} enquiry={enquiry} />
          ))}
        </section>
      </div>
    </main>
  );
};

export default EnquiriesPage;
