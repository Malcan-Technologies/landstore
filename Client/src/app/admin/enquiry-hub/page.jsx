"use client";

import Table from "@/components/common/Table";
import Search from "@/components/svg/Search";
import Person from "@/components/svg/Person";
import EyeOpen from "@/components/svg/EyeOpen";
import File from "@/components/svg/File";
import Delete from "@/components/svg/Delete";
import Sheet from "@/components/svg/Sheet";

const enquiries = [
  {
    id: "enquiry-1",
    enquiryId: "ENQ - 000128",
    listingId: "#L001",
    inDate: "20/05/2024",
    updatedDate: "20/05/2024",
    requester: "Dato' Ridzuan",
    requesterType: "Corporate Entity",
    status: "Under review",
    interestType: "Buy",
  },
  {
    id: "enquiry-2",
    enquiryId: "ENQ - 000128",
    listingId: "#L001",
    inDate: "20/05/2024",
    updatedDate: "20/05/2024",
    requester: "Dato' Ridzuan",
    requesterType: "Corporate Entity",
    status: "Need More Info",
    interestType: "Financing",
  },
  {
    id: "enquiry-3",
    enquiryId: "ENQ - 000128",
    listingId: "#L001",
    inDate: "20/05/2024",
    updatedDate: "20/05/2024",
    requester: "Dato' Ridzuan",
    requesterType: "Corporate Entity",
    status: "In Progress",
    interestType: "Buy",
  },
  {
    id: "enquiry-4",
    enquiryId: "ENQ - 000128",
    listingId: "#L001",
    inDate: "20/05/2024",
    updatedDate: "20/05/2024",
    requester: "Dato' Ridzuan",
    requesterType: "Corporate Entity",
    status: "Scheduled",
    interestType: "JV",
  },
  {
    id: "enquiry-5",
    enquiryId: "ENQ - 000128",
    listingId: "#L001",
    inDate: "20/05/2024",
    updatedDate: "20/05/2024",
    requester: "Dato' Ridzuan",
    requesterType: "Corporate Entity",
    status: "In Progress",
    interestType: "Buy",
  },
  {
    id: "enquiry-6",
    enquiryId: "ENQ - 000128",
    listingId: "#L001",
    inDate: "20/05/2024",
    updatedDate: "20/05/2024",
    requester: "Dato' Ridzuan",
    requesterType: "Corporate Entity",
    status: "Scheduled",
    interestType: "Financing",
  },
  {
    id: "enquiry-7",
    enquiryId: "ENQ - 000128",
    listingId: "#L001",
    inDate: "20/05/2024",
    updatedDate: "20/05/2024",
    requester: "Dato' Ridzuan",
    requesterType: "Corporate Entity",
    status: "In Progress",
    interestType: "Buy",
  },
  {
    id: "enquiry-8",
    enquiryId: "ENQ - 000128",
    listingId: "#L001",
    inDate: "20/05/2024",
    updatedDate: "20/05/2024",
    requester: "Dato' Ridzuan",
    requesterType: "Corporate Entity",
    status: "Scheduled",
    interestType: "Financing",
  },
];

const statusStyles = {
  "Under review": "bg-[#FFF7ED] text-[#F59E0B]",
  "Need More Info": "bg-[#FEF2F2] text-[#EF4444]",
  "In Progress": "bg-[#EEF2FF] text-[#3B82F6]",
  Scheduled: "bg-[#ECFDF3] text-[#16A34A]",
};

const interestBadgeClass =
  "inline-flex items-center rounded-full border border-[#D6DAE3] bg-white px-2 py-1 text-[12px] font-medium leading-none text-[#52525B]";

const iconButtonBase =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg transition border-0";

export default function EnquiryHubPage() {
  const headers = [
    { label: "Enquiry ID" },
    { label: "Listing ID" },
    { label: "Activity Dates" },
    { label: "Requester" },
    { label: "Status" },
    { label: "Interest type" },
    { label: "Actions", className: "text-right", contentClassName: "text-right" },
  ];

  const rows = enquiries.map((enquiry) => ({
    key: enquiry.id,
    cells: [
      {
        key: "enquiry-id",
        content: (
          <span className="inline-flex items-center rounded-[4px] bg-[#F4F4F5] px-2 py-1 text-[10px] font-medium leading-none text-[#71717A] sm:text-[11px]">
            {enquiry.enquiryId}
          </span>
        ),
      },
      {
        key: "listing-id",
        content: <span className="text-[12px] font-semibold text-[#111827]">{enquiry.listingId}</span>,
      },
      {
        key: "activity-dates",
        content: (
          <div className="space-y-0.5 text-[11px] leading-4 sm:text-[12px]">
            <div className="text-[#52525B]">
              <span className="font-medium text-[#71717A]">IN:</span>{" "}
              <span className="font-medium text-[#15803D]">{enquiry.inDate}</span>
            </div>
            <div className="text-[#52525B]">
              <span className="font-medium text-[#71717A]">UP:</span>{" "}
              <span className="font-medium text-[#15803D]">{enquiry.updatedDate}</span>
            </div>
          </div>
        ),
      },
      {
        key: "requester",
        content: (
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F4F4F5] text-[#A1A1AA]">
              <Person size={12} color="#A1A1AA" />
            </span>
            <div className="min-w-0 leading-4">
              <div className="truncate text-[12px] font-medium text-[#111827]">{enquiry.requester}</div>
              <div className="truncate text-[11px] text-[#8B95A7]">{enquiry.requesterType}</div>
            </div>
          </div>
        ),
      },
      {
        key: "status",
        content: (
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium leading-none sm:text-[11px] ${statusStyles[enquiry.status]}`}>
            {enquiry.status}
          </span>
        ),
      },
      {
        key: "interest-type",
        content: <span className={interestBadgeClass}>{enquiry.interestType}</span>,
      },
      {
        key: "actions",
        content: (
          <div className="flex items-center justify-end gap-2">
            <button type="button" className={`${iconButtonBase} bg-[#18181B] text-white`} aria-label="View enquiry">
              <EyeOpen size={14} color="#FFFFFF" />
            </button>
            <button type="button" className={`${iconButtonBase} bg-[#EAFBF1] text-[#0F8A4A]`} aria-label="Open files">
              <Sheet size={14} color="#0F8A4A" />
            </button>
            <button type="button" className={`${iconButtonBase} bg-[#FFF1F2] text-[#F43F5E]`} aria-label="Delete enquiry">
              <Delete size={14} className="text-[#F43F5E]" />
            </button>
          </div>
        ),
        contentClassName: "flex justify-end",
      },
    ],
  }));

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-primary px-4 py-5 sm:px-5">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E9EDF5] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-semibold text-[#111827] sm:text-[22px]">Enquiry Hub</h1>
            <span className="inline-flex h-4 min-w-7 items-center justify-center rounded-full bg-[#EEF2FF] px-2 text-[12px] font-medium leading-none text-[#4338CA]">
              23
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

        <div className="mt-4 min-h-0 flex-1 overflow-hidden sm:max-h-[calc(100vh-210px)] sm:overflow-y-auto no-scrollbar">
          <Table
            headers={headers}
            rows={rows}
            className="border-none shadow-none"
            tableClassName="min-w-[1100px]"
            headClassName="bg-white"
            rowClassName="hover:bg-[#FAFBFD]"
          />
        </div>
      </section>
    </main>
  );
}
