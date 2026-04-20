"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/common/Loading";
import EnquiryCard from "@/components/userDashboard/enquiries/EnquiryCard";
import { enquiryService } from "@/services/enquiryService";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=1200&q=80";

const toTrimmedImageUrl = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue || null;
};

const resolvePropertyImage = (property) => {
  const mediaItems = Array.isArray(property?.media)
    ? property.media
    : property?.media
      ? [property.media]
      : [];

  for (const mediaItem of mediaItems) {
    const mediaImage =
      toTrimmedImageUrl(mediaItem?.fileUrl) ||
      toTrimmedImageUrl(mediaItem?.url) ||
      toTrimmedImageUrl(mediaItem?.signedUrl);

    if (mediaImage) {
      return mediaImage;
    }
  }

  return (
    toTrimmedImageUrl(property?.images?.[0]?.fileUrl) ||
    toTrimmedImageUrl(property?.images?.[0]?.url) ||
    toTrimmedImageUrl(property?.image) ||
    FALLBACK_IMAGE
  );
};

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

const formatEnquiryCode = (id) => {
  if (!id || typeof id !== "string") {
    return "ENQ - 000000";
  }

  return `ENQ - ${id.replace(/-/g, "").toUpperCase().slice(0, 6)}`;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const toStatusLabel = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "pending") {
    return "Pending Matching";
  }
  if (normalized === "under_review" || normalized === "under review") {
    return "Under Review";
  }
  if (normalized === "need_more_info" || normalized === "need more info") {
    return "Need More Info";
  }
  if (normalized === "in_progress" || normalized === "in progress") {
    return "Matched (In Progress)";
  }
  if (normalized === "scheduled") {
    return "Scheduled";
  }

  return "Pending Matching";
};

const EnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEnquiries = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await enquiryService.getMyEnquiries({ page: 1, limit: 50 });
        const items = normalizeEnquiries(response);

        const mappedEnquiries = items.map((item, index) => {
          // API shape: top-level `id` is the enquiry id.
          const enquiryId = item?.id ?? item?.enquiryId ?? item?._id;

          return {
            id: enquiryId || `enquiry-${index + 1}`,
            enquiryId: enquiryId || "",
            propertyId: item?.propertyId ?? item?.property?.id ?? "",
            code: formatEnquiryCode(enquiryId),
            status: toStatusLabel(item?.status),
            title: item?.property?.title || "Property details pending",
            category: item?.property?.category?.name || item?.property?.category || "N/A",
            area: item?.property?.size || "N/A",
            dealTags: [item?.interestType?.name || "General"],
            updatedAt: formatDate(item?.updatedAt || item?.createdAt),
            unreadCount: Number(item?.messagesCount) || 0,
            highlighted: index === 0,
            image: resolvePropertyImage(item?.property),
          };
        });

        setEnquiries(mappedEnquiries);
      } catch (apiError) {
        setError(apiError?.message || "Failed to load enquiries.");
      } finally {
        setIsLoading(false);
      }
    };

    loadEnquiries();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <main className="bg-background-primary py-10 md:py-12">
      <div className="mx-auto w-full  sm:px-8 px-3">
        <header>
          <h1 className="text-[20px] font-bold tracking-tight text-gray2 sm:text-[28px] md:text-[32px]">My Enquiries</h1>
          <p className="mt-1 lg:text-[18px] md:text-[16px] text-[12px] text-gray5">Track your interest across various land parcels.</p>
        </header>

        <section className="mt-6 space-y-4">
          {error ? (
            <p className="text-[14px] text-red-500">{error}</p>
          ) : null}

          {!error && enquiries.length === 0 ? (
            <p className="text-[14px] text-gray5">No enquiries found.</p>
          ) : null}

          {enquiries.map((enquiry) => (
            <EnquiryCard key={enquiry.id} enquiry={enquiry} />
          ))}
        </section>
      </div>
    </main>
  );
};

export default EnquiriesPage;
