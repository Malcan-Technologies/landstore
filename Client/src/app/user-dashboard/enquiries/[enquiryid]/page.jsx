"use client";

import Image from "next/image";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Loading from "@/components/common/Loading";
import Bag from "@/components/svg/Bag";
import Calendar from "@/components/svg/Calendar";
import Chat2 from "@/components/svg/Chat2";
import Controls from "@/components/svg/Controls";
import Mic from "@/components/svg/Mic";
import Person from "@/components/svg/Person";
import Plus from "@/components/svg/Plus";
import Pointer from "@/components/svg/Pointer";
import Send from "@/components/svg/Send";
import Sheild from "@/components/svg/Sheild";
import StepperTick from "@/components/svg/StepperTick";
import UpRight from "@/components/svg/UpRight";
import Exclamation from "@/components/svg/Exclamation";
import { enquiryService } from "@/services/enquiryService";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80";
const progressSteps = ["Submitted", "Verification", "Under negotiation", "Matched", "Completed"];

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

const normalizeEnquiryPayload = (payload) => {
  const resolved = payload?.data ?? payload?.result?.data ?? payload ?? null;

  if (Array.isArray(resolved)) {
    return resolved[0] ?? null;
  }

  return resolved;
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

const formatArea = (landArea, landAreaUnit) => {
  const numericValue = Number(landArea);

  if (Number.isFinite(numericValue)) {
    return `${numericValue.toLocaleString("en-US")}${landAreaUnit ? ` ${landAreaUnit}` : ""}`;
  }

  return landArea ? String(landArea) : "N/A";
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
    return "Under negotiation";
  }
  if (normalized === "matched") {
    return "Matched";
  }
  if (normalized === "completed" || normalized === "closed") {
    return "Completed";
  }

  return "Pending Matching";
};

const getProgressStep = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "completed" || normalized === "closed") {
    return 5;
  }
  if (normalized === "matched") {
    return 4;
  }
  if (normalized === "in_progress" || normalized === "in progress") {
    return 3;
  }
  if (normalized === "under_review" || normalized === "under review" || normalized === "need_more_info" || normalized === "need more info") {
    return 2;
  }

  return 1;
};

const buildEnquiryViewModel = (item) => {
  const messages = Array.isArray(item?.messages) ? item.messages : [];
  const latestMessage = messages[messages.length - 1];
  const companyProfiles = item?.user?.companies;
  const hasCompanyProfile =
    Boolean(companyProfiles?.companyName)
    || (Array.isArray(companyProfiles) && companyProfiles.length > 0);

  return {
    id: item?.id ?? item?.enquiryId ?? item?._id ?? "",
    code: formatEnquiryCode(item?.id ?? item?.enquiryId ?? item?._id),
    status: toStatusLabel(item?.status),
    statusValue: item?.status || "pending",
    title: item?.property?.title || "Property details pending",
    category: item?.property?.category?.name || item?.property?.category || "N/A",
    area: formatArea(item?.property?.landArea ?? item?.property?.size, item?.property?.landAreaUnit),
    dealTags: [item?.interestType?.name || "General"],
    submittedAt: formatDate(item?.createdAt),
    image: resolvePropertyImage(item?.property),
    originalMessage: item?.message?.trim() || "No message provided.",
    entityLabel: hasCompanyProfile ? "Company" : "Individual",
    adminDate: formatDate(item?.updatedAt || item?.createdAt),
    adminMessage: latestMessage?.content || "Our team is reviewing your enquiry.",
  };
};

const EnquiryDetailPage = ({ params }) => {
  const router = useRouter();
  const resolvedParams = use(params);
  const enquiryid = Array.isArray(resolvedParams?.enquiryid) ? resolvedParams.enquiryid[0] : resolvedParams?.enquiryid;
  const [enquiryData, setEnquiryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enquiryid) {
      setIsLoading(false);
      setError("Enquiry ID is missing.");
      return;
    }

    let mounted = true;

    const loadEnquiry = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await enquiryService.getEnquiryById(enquiryid);
        const normalized = normalizeEnquiryPayload(response);

        if (mounted) {
          if (!normalized) {
            setEnquiryData(null);
            setError("Enquiry details are unavailable.");
            return;
          }

          setEnquiryData(buildEnquiryViewModel(normalized));
        }
      } catch (apiError) {
        if (mounted) {
          setError(apiError?.message || "Failed to load enquiry details.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadEnquiry();

    return () => {
      mounted = false;
    };
  }, [enquiryid]);

  const enquiry = enquiryData;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <main className="bg-background-primary py-12 md:py-14">
        <div className="mx-auto w-full  px-4 md:px-16 xl:px-24">
          <p className="mb-4 text-[14px] text-red-500">{error}</p>
        </div>
      </main>
    );
  }

  if (!enquiry) {
    return (
      <main className="bg-background-primary py-12 md:py-14">
        <div className="mx-auto w-full  px-4 md:px-16 xl:px-24">
          <p className="mb-4 text-[14px] text-gray5">Enquiry not found.</p>
        </div>
      </main>
    );
  }

  const currentStep = useMemo(() => getProgressStep(enquiry.statusValue), [enquiry.statusValue]);

  return (
    <main className="bg-background-primary py-12 md:py-14">
      <div className="mx-auto w-full  px-4 md:px-16 xl:px-24">
        <button type="button" onClick={() => router.push("/explore")} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray5 transition hover:text-gray2 md:mb-6">
          <ArrowLeftIcon />
          Back to marketplace
        </button>

        <section className="rounded-lg border border-border-card bg-white p-3 shadow-[0px_6px_24px_rgba(15,61,46,0.04)] md:px-4 md:py-4">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-center">
              <div className="relative h-25 w-25 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={enquiry.image || FALLBACK_IMAGE}
                  alt={enquiry.title}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="100px"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#F5F5F5] px-2 py-1 sm:text-[10px] text-[9px] font-medium tracking-[0.02em] text-gray5">{enquiry.code}</span>
                  <span className="rounded-md bg-[#F5F5F5] px-2.5 py-1 sm:text-[10px] text-[9px] font-medium text-[#7B7B7B]">{enquiry.status}</span>
                </div>

                <h1 className="mt-3 flex items-center gap-2 text-[18px] font-semibold leading-tight text-gray2 sm:text-[20px] md:text-[24px] lg:text-[26px]">
                  <Pointer size={18} color="var(--color-green-secondary)" />
                  {enquiry.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] sm:text-[14px] text-[#7D7D7D]">
                  <span className="flex items-center gap-1.5">
                    <Bag size={14} color="var(--color-gray5)" />
                    {enquiry.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray5">
                    <span className="text-[12px] sm:text-[14px] leading-none">▥</span>
                    {enquiry.area}
                  </span>
                  {enquiry.dealTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border-card px-3 py-0.5 text-[10px] sm:text-[12px] font-medium text-gray5">
                      {tag}
                    </span>
                  ))}
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} color="var(--color-gray5)" />
                    Submitted on {enquiry.submittedAt}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center sm:gap-3 gap-1 lg:justify-end">
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-transparent px-0 text-[13px] font-medium text-green-secondary transition hover:text-green-primary">
                View Enquiry
                <UpRight size={14} color="var(--color-green-secondary)" />
              </button>
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#FFECEE] px-4 text-[13px] font-medium text-[#E34854] transition hover:bg-[#ffe1e5]">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] leading-none">×</span>
                Close enquiry
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-border-card pt-12">
            <div className="mx-auto flex max-w-190 items-start justify-between gap-0.5 px-0 sm:gap-2 sm:px-2 lg:gap-20">
              {progressSteps.map((step, index) => {
                const stepNumber = index + 1;
                const isCurrent = currentStep === stepNumber;
                const isCompleted = currentStep > stepNumber;
                const showLine = index < progressSteps.length - 1;

                return (
                  <div key={step} className="relative flex flex-1 flex-col items-center justify-start text-center">
                    <div className="relative flex h-7 w-full items-center justify-center sm:h-9 md:h-11">
                      {isCompleted ? (
                        <div className="relative z-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-secondary shadow-[0px_4px_10px_rgba(38,143,109,0.18)] sm:h-7 sm:w-7 md:h-9 md:w-9">
                          <StepperTick width={10} height={8} color="white" className="sm:h-3 sm:w-3 md:h-auto md:w-auto" />
                        </div>
                      ) : isCurrent ? (
                        <div className="relative z-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-secondary bg-white sm:h-9 sm:w-9 md:h-11 md:w-11 md:border-[3px]">
                          <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-green-secondary sm:h-6.5 sm:w-6.5 md:h-8.5 md:w-8.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-white sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative z-1 flex h-5 w-5 items-center justify-center rounded-full border border-border-card bg-white sm:h-7 sm:w-7 sm:border-2 md:h-8 md:w-8">
                          <span className="h-1.5 w-1.5 rounded-full bg-border-card sm:h-2.5 sm:w-2.5" />
                        </div>
                      )}

                      {showLine ? (
                        <span
                          className={`absolute left-1/2 top-1/2 h-px w-full -translate-y-1/2 lg:w-[180%] ${isCompleted ? "bg-green-secondary" : "bg-border-card"}`}
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <span className="mt-1.5 flex min-h-7 w-full items-start justify-center text-center text-[9px] font-medium leading-tight text-gray2 sm:mt-2.5 sm:min-h-9 sm:text-[11px] md:mt-3 md:min-h-10 md:text-[13px]">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between gap-4 border-b border-border-card py-4">
            <div className="flex items-center gap-2 sm:text-[14px] text-[12px] font-semibold text-gray2 md:text-[16px]">
              <Chat2 size={20} color="var(--color-green-secondary)" />
              Mediation Log
            </div>
            <div className="flex items-center gap-2 sm:text-[11px] text-[9px] font-medium text-gray5 md:text-[14px]">
              <Sheild size={16} color="var(--color-green-secondary)" />
              Secure Admin Mediation
            </div>
          </div>

          <div className="mt-5 rounded-[18px] border border-[#F1F3F2] bg-[#FAFBFA] px-3 py-5 md:px-6 md:py-6">
            <div className="flex gap-3 md:gap-4">
              <span className="mt-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1F1F1F] text-white">
                <Person size={16} color="white" />
              </span>

              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex min-w-0 items-start justify-start gap-3">
                <article className="w-full min-w-0 rounded-2xl border border-[#D9DDE3] bg-white px-4 py-4 shadow-[0px_4px_12px_rgba(15,61,46,0.03)] md:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-nowrap items-center justify-between gap-2">
                        <h2 className="text-[10px] font-semibold text-gray2 sm:text-[12px] md:text-[16px]">Original Submission</h2>
                        <span className="text-[10px] text-gray5 sm:text-[12px] md:text-[14px]">{enquiry.submittedAt}</span>
                      </div>
                      <div className="mt-3">
                        <p className="max-w-full text-[10px] italic leading-5 text-gray5 sm:text-[12px] sm:leading-6 md:text-[14px]">
                        “{enquiry.originalMessage}”
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border-card pt-3 text-[10px] text-gray5 sm:text-[12px] md:text-[14px]">
                    Interest: <span className="font-medium text-gray2">{enquiry.dealTags[0] || "General"}</span>
                    <span className="mx-3 text-[#CACACA]">|</span>
                    Entity: <span className="font-medium text-gray2">{enquiry.entityLabel}</span>
                  </div>
                </article>

                </div>

                <div className="flex min-w-0 items-start justify-end gap-3">
                  <article className="w-full min-w-0 max-w-[calc(100%-2.75rem)] rounded-2xl border border-[#BFEBDD] bg-[#EDFCF6] px-4 py-4 text-right shadow-[0px_4px_12px_rgba(15,61,46,0.02)] sm:max-w-157.5 md:px-5">
                    <div className="flex items-center justify-between gap-3 text-[10px] text-[#74A79A] sm:text-[12px] md:text-[14px]">
                      <span>{enquiry.adminDate}</span>
                      <span className="font-semibold text-green-secondary">Admin notification</span>
                    </div>
                    <p className="mt-3 text-[10px] italic leading-5 text-[#517A6E] sm:text-[12px] sm:leading-6 md:text-[14px]">
                      “{enquiry.adminMessage}”
                    </p>
                  </article>
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-secondary text-white">
                    <Sheild size={15} color="white" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-200">
              <div className="rounded-2xl border border-[#D9DDE3] bg-white px-4 py-3 shadow-[0px_4px_12px_rgba(15,61,46,0.03)]">
                <textarea
                  placeholder="Type a follow-up note to LandStore admin..."
                  className="min-h-27.5 w-full resize-none bg-transparent text-[14px] text-gray2 outline-none placeholder:text-[#AEAEAE]"
                />

                <div className="mt-3 flex items-center justify-end gap-2 border-t border-border-card pt-3">
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-card bg-[#FCFCFC] text-gray5 transition hover:bg-background-primary">
                    <Controls size={18} color="#7D7D7D" />
                  </button>
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-card bg-[#FCFCFC] text-gray5 transition hover:bg-background-primary">
                    <Mic size={18} color="#7D7D7D" />
                  </button>
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-card bg-[#FCFCFC] text-gray5 transition hover:bg-background-primary">
                    <Plus size={14} color="currentColor" />
                  </button>
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-secondary text-white transition hover:opacity-90">
                    <Send size={18} color="white" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-[#9A9A9A] md:text-[11px]">
                <span className="flex items-center gap-1"><Sheild size={12} color="currentColor" /> Encrypted communication</span>
                <span className="flex items-center gap-1"><Exclamation size={12} color="currentColor" /> Replies go to admin, not seller</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M11.6673 7.00016H2.33398M2.33398 7.00016L6.33398 11.0002M2.33398 7.00016L6.33398 3.00016"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default EnquiryDetailPage;
