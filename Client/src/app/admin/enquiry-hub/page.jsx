"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";
import Table from "@/components/common/Table";
import Search from "@/components/svg/Search";
import Person from "@/components/svg/Person";
import EyeOpen from "@/components/svg/EyeOpen";
import RedCross from "@/components/svg/RedCross";
import Sheet from "@/components/svg/Sheet";
import { enquiryService } from "@/services/enquiryService";

const normalizeEnquiries = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.result?.data)) {
    return response.result.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB");
};

const formatEnquiryCode = (id) => {
  if (!id || typeof id !== "string") {
    return "ENQ - 000000";
  }

  return `ENQ - ${id.replace(/-/g, "").toUpperCase().slice(0, 6)}`;
};

const toStatusLabel = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "pending") {
    return "Under review";
  }
  if (normalized === "under_review" || normalized === "under review") {
    return "Under review";
  }
  if (normalized === "need_more_info" || normalized === "need more info") {
    return "Need More Info";
  }
  if (normalized === "in_progress" || normalized === "in progress") {
    return "In Progress";
  }
  if (normalized === "scheduled") {
    return "Scheduled";
  }

  return "Under review";
};

const getRequester = (user) => {
  const individualName = user?.individuals?.fullName;
  const companyName = user?.companies?.companyName;

  if (individualName) {
    return { name: individualName, type: "Individual" };
  }

  if (companyName) {
    return { name: companyName, type: "Corporate Entity" };
  }

  return {
    name: user?.email || "Unknown requester",
    type: "User",
  };
};

const statusStyles = {
  "Under review": "bg-[#FFF7ED] text-[#F59E0B]",
  "Need More Info": "bg-[#FEF2F2] text-[#EF4444]",
  "In Progress": "bg-[#EEF2FF] text-[#3B82F6]",
  Scheduled: "bg-[#ECFDF3] text-[#16A34A]",
};

const interestBadgeClass =
  "inline-flex items-center rounded-full border border-[#D6DAE3] bg-white px-2 py-1 font-medium leading-none text-[#52525B]";

const iconButtonBase =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg transition border-0";

export default function EnquiryHubPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadEnquiries = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await enquiryService.getAllEnquiries({ page: 1, limit: 100 });
        const items = normalizeEnquiries(response);

        const mappedItems = items.map((item, index) => {
          const requester = getRequester(item?.user);

          return {
            id: item?.id || `enquiry-${index + 1}`,
            enquiryId: formatEnquiryCode(item?.id),
            listingId: item?.property?.listingCode || item?.propertyId || "-",
            inDate: formatDate(item?.createdAt),
            updatedDate: formatDate(item?.updatedAt),
            requester: requester.name,
            requesterType: requester.type,
            status: toStatusLabel(item?.status),
            interestType: item?.interestType?.name || "General",
          };
        });

        setEnquiries(mappedItems);
      } catch (apiError) {
        setError(apiError?.message || "Failed to load enquiries.");
      } finally {
        setIsLoading(false);
      }
    };

    loadEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return enquiries;
    }

    return enquiries.filter((item) => {
      return [item.enquiryId, item.listingId, item.requester, item.requesterType, item.status, item.interestType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [enquiries, searchTerm]);

  if (isLoading) {
    return <Loading />;
  }

  const handleOpenEnquiry = (enquiryId) => {
    router.push(`/admin/enquiry-hub/${enquiryId}`);
  };

  const headers = [
    { label: "Enquiry ID" },
    { label: "Listing ID" },
    { label: "Activity Dates" },
    { label: "Requester" },
    { label: "Status" },
    { label: "Interest type" },
    { label: "Actions", className: "text-right", contentClassName: "text-right" },
  ];

  const rows = filteredEnquiries.map((enquiry) => ({
    key: enquiry.id,
    cells: [
      {
        key: "enquiry-id",
        content: (
          <span className="inline-flex items-center rounded-sm bg-[#F4F4F5] px-2 py-1 font-medium leading-none text-[#71717A]">
            {enquiry.enquiryId}
          </span>
        ),
      },
      {
        key: "listing-id",
        content: <span className="font-semibold text-[#111827]">{enquiry.listingId}</span>,
      },
      {
        key: "activity-dates",
        content: (
          <div className="space-y-0.5 leading-4">
            <div className="text-[#52525B]">
              <span className="font-medium text-[#71717A]">IN:</span>{" "}
              <span className="font-medium text-active">{enquiry.inDate}</span>
            </div>
            <div className="text-[#52525B]">
              <span className="font-medium text-[#71717A]">UP:</span>{" "}
              <span className="font-medium text-active">{enquiry.updatedDate}</span>
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
              <div className="truncate font-medium text-[#111827]">{enquiry.requester}</div>
              <div className="truncate text-gray5">{enquiry.requesterType}</div>
            </div>
          </div>
        ),
      },
      {
        key: "status",
        content: (
          <span className={`inline-flex items-center rounded-full px-2 py-1 font-medium leading-none ${statusStyles[enquiry.status]}`}>
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
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleOpenEnquiry(enquiry.id);
              }}
              className={`${iconButtonBase} bg-[#18181B] text-white`}
              aria-label="View enquiry"
            >
              <EyeOpen size={14} color="#FFFFFF" />
            </button>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className={`${iconButtonBase} bg-[#EAFBF1] text-[#0F8A4A]`}
              aria-label="Open files"
            >
              <Sheet size={14} color="#0F8A4A" />
            </button>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className={`${iconButtonBase} bg-[#FFF1F2] text-[#F43F5E]`}
              aria-label="Delete enquiry"
            >
              <RedCross size={14} />
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
              {enquiries.length}
            </span>
          </div>

          <label className="flex h-8 w-full max-w-55 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[#9CA3AF] sm:max-w-50">
            <Search size={16} color="#111827" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full border-0 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            />
          </label>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-hidden sm:max-h-[calc(100vh-210px)] sm:overflow-y-auto no-scrollbar">
          {error ? <p className="text-[14px] text-red-500">{error}</p> : null}
          {!error && rows.length === 0 ? <p className="text-[14px] text-gray5">No enquiries found.</p> : null}

          <Table
            headers={headers}
            rows={rows}
            onRowClick={(row) => handleOpenEnquiry(row.key)}
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
