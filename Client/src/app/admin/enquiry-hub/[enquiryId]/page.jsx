"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Loading from "@/components/common/Loading";
import Sheild from "@/components/svg/Sheild";
import Pointer from "@/components/svg/Pointer";
import Building from "@/components/svg/Building";
import Bag from "@/components/svg/Bag";
import Telephone from "@/components/svg/Telephone";
import Envelop from "@/components/svg/Envelop";
import Calendar from "@/components/svg/Calendar";
import Note from "@/components/svg/Note";
import UpRight from "@/components/svg/UpRight";
import ArrowDown from "@/components/svg/ArrowDown";
import SelectDropdown from "@/components/common/SelectDropdown";
import ChatSection from "@/components/userDashboard/enquiries/ChatSection";
import Bag2 from "@/components/svg/Bag2";
import Bag3 from "@/components/svg/Bag3";
import Clock2 from "@/components/svg/Clock2";
import Profile from "@/components/svg/Profile";
import Verify from "@/components/svg/Verify";
import { enquiryService } from "@/services/enquiryService";
import { messageService } from "@/services/messageService";

const fallbackEnquiryImage = "/Land.jpg";

const normalizeEnquiryPayload = (payload) => {
  const resolved = payload?.data ?? payload?.result?.data ?? payload ?? null;

  if (Array.isArray(resolved)) {
    return resolved[0] ?? null;
  }

  return resolved;
};

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
    fallbackEnquiryImage
  );
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const formatEnquiryCode = (id) => {
  if (!id || typeof id !== "string") {
    return "ENQ - 000000";
  }

  return `ENQ - ${id.replace(/-/g, "").toUpperCase().slice(0, 6)}`;
};

const formatArea = (landArea, landAreaUnit) => {
  const numericValue = Number(landArea);

  if (Number.isFinite(numericValue)) {
    return `${numericValue.toLocaleString("en-US")}${landAreaUnit ? ` ${landAreaUnit}` : ""}`;
  }

  return "-";
};

const formatBudget = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return `RM ${numericValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const toStatusLabel = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "pending" || normalized === "pending_matching") {
    return "Pending matching";
  }
  if (normalized === "under_review" || normalized === "under review" || normalized === "underreview") {
    return "Under review";
  }
  if (normalized === "need_more_info" || normalized === "need more info") {
    return "Need more info";
  }
  if (
    normalized === "in_progress"
    || normalized === "in progress"
    || normalized === "matched_inprogress"
    || normalized === "matched inprogress"
    || normalized === "matched in progress"
  ) {
    return "In progress";
  }
  if (normalized === "scheduled") {
    return "Scheduled";
  }
  if (normalized === "closed_successful") {
    return "Closed successful";
  }
  if (normalized === "closed_not_proceeding") {
    return "Closed not proceeding";
  }

  return "Pending matching";
};

const toStatusApiValue = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "pending matching") {
    return "PENDING_MATCHING";
  }
  if (normalized === "under review") {
    return "UNDER_REVIEW";
  }
  if (normalized === "need more info") {
    return "NEED_MORE_INFO";
  }
  if (normalized === "scheduled") {
    return "SCHEDULED";
  }
  if (normalized === "in progress") {
    return "MATCHED_INPROGRESS";
  }
  if (normalized === "closed successful") {
    return "CLOSED_SUCCESSFUL";
  }
  if (normalized === "closed not proceeding") {
    return "CLOSED_NOT_PROCEEDING";
  }

  return "";
};

const getRequesterProfile = (user) => {
  const companyProfiles = Array.isArray(user?.companies)
    ? user.companies
    : user?.companies
      ? [user.companies]
      : [];

  const companyName = companyProfiles.find((item) => item?.companyName)?.companyName;
  const individualName = user?.individuals?.fullName;

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

const getVerificationLabel = (user) => {
  const isVerified = user?.emailVerified ?? user?.isVerified;

  if (isVerified === true) {
    return "Verified";
  }

  if (isVerified === false) {
    return "Unverified";
  }

  return "Verification unavailable";
};

const extractLatestAdminMessage = (messages, requesterId) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  const requesterMessages = messages.filter((item) => String(item?.senderId || "") === String(requesterId || ""));
  const adminMessages = messages.filter((item) => String(item?.senderId || "") !== String(requesterId || ""));

  if (adminMessages.length > 0) {
    return adminMessages[adminMessages.length - 1];
  }

  return requesterMessages[requesterMessages.length - 1] || messages[messages.length - 1];
};

const buildEnquiryDetailModel = (item) => {
  const requesterProfile = getRequesterProfile(item?.user);
  const latestAdminMessage = extractLatestAdminMessage(item?.messages, item?.userId || item?.user?.id);
  const roleNames = Array.isArray(item?.roles)
    ? item.roles
        .map((roleItem) => roleItem?.role?.name)
        .filter(Boolean)
        .join(", ")
    : "";

  const locationLabel =
    [item?.property?.location?.district, item?.property?.location?.state].filter(Boolean).join(", ") ||
    item?.property?.title ||
    "-";

  return {
    id: item?.id || "",
    enquiryId: formatEnquiryCode(item?.id),
    requesterId: item?.user?.id || item?.userId || "",
    listingCode: item?.property?.listingCode || item?.propertyId || "-",
    listingTitle: item?.property?.title || "Property details pending",
    listingCategory: item?.property?.category?.name || item?.property?.category || "-",
    listingArea: formatArea(item?.property?.landArea ?? item?.property?.size, item?.property?.landAreaUnit),
    requester: requesterProfile.name,
    verificationStatus: getVerificationLabel(item?.user),
    requesterType: requesterProfile.type,
    memberId: item?.user?.id || item?.userId || "-",
    ownerName: "-",
    ownerType: roleNames || "-",
    phone: item?.user?.phone || "-",
    email: item?.user?.email || "-",
    quote: item?.message?.trim() || "No message provided.",
    estimatedBudget: formatBudget(item?.budget),
    acquisitionTimeline: item?.timeline || "-",
    mediationMode: item?.interestType?.name || "-",
    location: locationLabel,
    mediationStatus: toStatusLabel(item?.status),
    originalDate: formatDate(item?.createdAt),
    originalMessage: item?.message?.trim() || "No message provided.",
    adminDate: formatDate(latestAdminMessage?.createdAt || item?.updatedAt || item?.createdAt),
    adminMessage: latestAdminMessage?.content || "No admin message yet.",
    image: resolvePropertyImage(item?.property),
  };
};

const extractMessageItems = (payload) => {
  const resolved = payload?.data ?? payload?.result?.data ?? payload ?? [];

  if (Array.isArray(resolved)) {
    return resolved;
  }

  if (Array.isArray(resolved?.items)) {
    return resolved.items;
  }

  return [];
};

const normalizeCreatedMessage = (payload) => payload?.data ?? payload?.result?.data ?? payload ?? null;

const sortChatMessages = (messages) => {
  return [...messages].sort((left, right) => {
    const leftTime = new Date(left?.createdAt || 0).getTime();
    const rightTime = new Date(right?.createdAt || 0).getTime();
    return leftTime - rightTime;
  });
};

const mapMessageToChatMessage = (message, requesterId) => {
  const senderId = message?.senderId || message?.sender?.id || "";
  const content = typeof message?.content === "string" ? message.content.trim() : "";

  if (!content) {
    return null;
  }

  return {
    id: message?.id || `${senderId}-${message?.createdAt || content}`,
    content,
    sender: String(senderId) === String(requesterId || "") ? "user" : "admin",
    createdAt: message?.createdAt || new Date().toISOString(),
  };
};

const buildChatMessages = (enquiry, messagesPayload) => {
  const requesterId = enquiry?.userId || enquiry?.user?.id || "";
  const originalMessage = typeof enquiry?.message === "string" ? enquiry.message.trim() : "";
  const chatMessages = [];

  if (originalMessage) {
    chatMessages.push({
      id: `original-${enquiry?.id || requesterId || "enquiry"}`,
      content: originalMessage,
      sender: "user",
      createdAt: enquiry?.createdAt || new Date().toISOString(),
    });
  }

  extractMessageItems(messagesPayload)
    .map((message) => mapMessageToChatMessage(message, requesterId))
    .filter(Boolean)
    .forEach((message) => {
      if (!chatMessages.some((item) => item.id === message.id)) {
        chatMessages.push(message);
      }
    });

  return sortChatMessages(chatMessages);
};

const mediationStatusOptions = ["Pending matching", "Under review", "Need more info", "Scheduled", "In progress", "Closed successful", "Closed not proceeding"];
const mediationStatusDropdownOptions = mediationStatusOptions.map((option) => ({
  label: option,
  value: option,
  icon: ArrowDown,
}));

export default function EnquiryHubDetailPage({ params }) {
  const resolvedParams = use(params);
  const routeId = resolvedParams?.enquiryId;
  const normalizedRouteId = Array.isArray(routeId) ? routeId[0] : routeId;

  const [enquiryDetail, setEnquiryDetail] = useState(null);
  const [isLoadingEnquiry, setIsLoadingEnquiry] = useState(true);
  const [enquiryLoadError, setEnquiryLoadError] = useState("");
  const [mediationStatus, setMediationStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatError, setChatError] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!normalizedRouteId) {
      setIsLoadingEnquiry(false);
      setEnquiryLoadError("Enquiry ID is missing.");
      setEnquiryDetail(null);
      return;
    }

    let isMounted = true;

    const loadEnquiryDetail = async () => {
      try {
        setIsLoadingEnquiry(true);
        setEnquiryLoadError("");
        setChatError("");

        const [enquiryResult, messageResult] = await Promise.allSettled([
          enquiryService.getEnquiryById(normalizedRouteId),
          messageService.getMessagesByEnquiry(normalizedRouteId, { page: 1, limit: 100 }),
        ]);

        if (enquiryResult.status !== "fulfilled") {
          throw enquiryResult.reason;
        }

        const normalizedEnquiry = normalizeEnquiryPayload(enquiryResult.value);

        if (!isMounted) {
          return;
        }

        if (!normalizedEnquiry) {
          setEnquiryDetail(null);
          setEnquiryLoadError("Enquiry details are unavailable.");
          return;
        }

        const mappedEnquiry = buildEnquiryDetailModel(normalizedEnquiry);
        setEnquiryDetail(mappedEnquiry);
        setMediationStatus(mappedEnquiry.mediationStatus);
        setStatusError("");

        if (messageResult.status === "fulfilled") {
          setChatMessages(buildChatMessages(normalizedEnquiry, messageResult.value));
        } else {
          setChatMessages(buildChatMessages(normalizedEnquiry, { data: normalizedEnquiry?.messages || [] }));
          setChatError(messageResult.reason?.message || "Failed to load chat history.");
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const errorMessage = error?.response?.data?.message || error?.message || "Failed to load enquiry details.";
        setEnquiryLoadError(errorMessage);
        setEnquiryDetail(null);
      } finally {
        if (isMounted) {
          setIsLoadingEnquiry(false);
        }
      }
    };

    loadEnquiryDetail();

    return () => {
      isMounted = false;
    };
  }, [normalizedRouteId]);

  const handleSendMessage = async (content) => {
    if (!normalizedRouteId || !enquiryDetail?.requesterId) {
      setChatError("Unable to send the message right now.");
      return false;
    }

    try {
      setIsSendingMessage(true);
      setChatError("");

      const response = await messageService.createMessage({
        enquiryId: normalizedRouteId,
        content,
        receiverId: enquiryDetail.requesterId,
      });

      const createdMessage = normalizeCreatedMessage(response);
      const mappedMessage = mapMessageToChatMessage(createdMessage, enquiryDetail.requesterId);

      if (mappedMessage) {
        setChatMessages((prev) => sortChatMessages([...prev.filter((item) => item.id !== mappedMessage.id), mappedMessage]));
      }

      return true;
    } catch (apiError) {
      setChatError(apiError?.message || "Failed to send message.");
      return false;
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleMediationStatusChange = async (nextStatus) => {
    if (!normalizedRouteId) {
      setStatusError("Unable to update mediation status.");
      return;
    }

    const apiStatus = toStatusApiValue(nextStatus);
    if (!apiStatus) {
      setStatusError("Selected status is not supported.");
      return;
    }

    const previousStatus = mediationStatus;
    setMediationStatus(nextStatus);
    setStatusError("");

    try {
      setIsUpdatingStatus(true);
      await enquiryService.updateEnquiryStatus(normalizedRouteId, { status: apiStatus });
      setEnquiryDetail((prev) => (prev ? { ...prev, mediationStatus: nextStatus } : prev));
    } catch (apiError) {
      setMediationStatus(previousStatus);
      setStatusError(apiError?.message || "Failed to update mediation status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoadingEnquiry) {
    return <Loading />;
  }

  if (enquiryLoadError) {
    return (
      <main className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-background-primary px-4 py-5 no-scrollbar sm:px-5">
        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-[14px] text-red-500">{enquiryLoadError}</p>
        </div>
      </main>
    );
  }

  if (!enquiryDetail) {
    return (
      <main className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-background-primary px-4 py-5 no-scrollbar sm:px-5">
        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-[14px] text-gray5">Enquiry not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-background-primary px-4 py-5 no-scrollbar sm:px-5">
      <section className="flex flex-col lg:flex-row justify-between min-h-max gap-4 ">
        <div className="rounded-[20px] border border-[#E9EDF5] bg-white p-4 py-3 shadow-none sm:p-5 sm:py-4 lg:w-[65%] h-fit">
          <div className="flex items-center justify-between gap-4 border-b border-[#E9EDF5] pb-4">
            <div className="flex items-start gap-3">
              <div>
              <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white bg-background-primary shadow-sm text-[#A1A1AA] ">
                <Profile size={22} color="#A1A1AA" />
                <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-4.5 w-4.5 items-center justify-center rounded-full">
                  <Verify size={5} color="#298064" />
                </span>
              </span>

              </div>
              <div className="min-w-0 flex h-full flex-col justify-between gap-2.5">
                <h1 className="text-[14px] sm:text-[20px] lg:text-[18px] xl:text-[20px] font-semibold leading-none text-[#111827]">{enquiryDetail.requester}</h1>
                <div className=" inline-flex items-center gap-1.5 rounded-full bg-[#EAFBF1] px-1.5 py-1 text-[7px] sm:text-[11px] lg:text-[9px] xl:text-[11px] font-medium text-active">
                  <Sheild size={14} color="#298064" />
                  {enquiryDetail.verificationStatus}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-background-primary text-[#2F855A] transition hover:bg-[#F8FAFC]"
                aria-label="Call requester"
              >
                <Telephone size={14} color="#2F855A" />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-background-primary text-[#2F855A] transition hover:bg-[#F8FAFC]"
                aria-label="Email requester"
              >
                <Envelop size={15} color="#2F855A" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 border-b border-[#E9EDF5] py-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[18px] bg-[#082B20] px-5 py-4 text-white shadow-none">
              <p className="text-[12px] sm:text-[16px] lg:text-[14px] xl:text-[16px] font-semibold italic leading-normal">
                “{enquiryDetail.quote}”
              </p>
            </div>

            <div className="grid rounded-[18px bg-white">
              <div className="grid grid-cols-[22px_1fr_auto] items-center gap-3 border-b border-[#EEF2F6] px-4 py-3">
                <Bag2 size={16} color="#71717A" />
                <span className="text-[11px] sm:text-[13px] lg:text-[11px] xl:text-[13px] text-[#71717A]">Estimated budget</span>
                <span className="text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px] font-semibold text-[#111827]">{enquiryDetail.estimatedBudget}</span>
              </div>
              <div className="grid grid-cols-[22px_1fr_auto] items-center gap-3 border-b border-[#EEF2F6] px-4 py-3">
                <Clock2 size={16} color="#71717A" />
                <span className="text-[11px] sm:text-[13px] lg:text-[11px] xl:text-[13px] text-[#71717A]">Acquisition timeline</span>
                <span className="text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px] font-semibold text-[#111827]">{enquiryDetail.acquisitionTimeline}</span>
              </div>
              <div className="grid grid-cols-[22px_1fr_auto] items-center gap-3 px-4 py-3">
                <Bag3 size={16} color="#71717A" />
                <span className="text-[11px] sm:text-[13px] lg:text-[11px] xl:text-[13px] text-[#71717A]">Mediation mode</span>
                <span className="text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px] font-semibold text-[#111827]">{enquiryDetail.mediationMode}</span>
              </div>
            </div>
          </div>

          <ChatSection 
            enquiryId={normalizedRouteId}
            existingMessages={chatMessages}
            onSendMessage={handleSendMessage}
            variant="admin"
            isSending={isSendingMessage}
            sendError={chatError}
          />
        </div>

        <div className="space-y-4 lg:w-[35%]">
          <div className="overflow-hidden rounded-[20px] border border-[#0E3C2D] bg-[#082B20] text-white shadow-[0_12px_30px_rgba(6,36,26,0.18)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-5 w-5 items-center justify-center text-greenbg">
                  <Sheild size={16} color="var(--color-greenbg)" />
                </span>
                <h2 className="text-[12px] sm:text-[14px] lg:text-[14px] xl:text-[18px] font-semibold leading-none text-activebg">Confidential Data</h2>
              </div>
              <span className="relative -bottom-px inline-flex items-center text-[10px] sm:text-[12px] lg:text-[10px] xl:text-[12px] leading-none text-white/55">Admin Restricted</span>
            </div>

            <div className=" py-4">
              <div className="flex xl:flex-row lg:flex-col gap-1.5 sm:gap-4 border-b border-white/10 pb-5 px-4">
                <div className="relative h-22 w-22 lg:h-37.5 lg:w-auto shrink-0 overflow-hidden rounded-xl xl:h-22 xl:w-22">
                  <Image
                    src={enquiryDetail.image || fallbackEnquiryImage}
                    alt={enquiryDetail.listingTitle}
                    fill
                    sizes="88px"
                    className="object-cover"
                    unoptimized
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackEnquiryImage;
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center rounded-sm bg-[#0F5132] px-2.5 py-1 text-[7px] sm:text-[11px] lg:text-[9px] xl:text-[11px] font-medium text-[#A7F3D0]">
                    {enquiryDetail.listingCode}
                  </span>
                  <div className="mt-3 flex items-center justify-start gap-0.5 sm:gap-2 ">
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                      <Pointer size={14} color="#5EE9B5" />
                    </span>
                    <h3 className="text-[14px] sm:text-[14px] lg:text-[14px] xl:text-[18px] font-semibold leading-6 text-white">{enquiryDetail.location}</h3>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[9px] sm:text-[13px] lg:text-[11px] xl:text-[13px] text-white/68">
                    <span className="inline-flex items-center gap-1.5">
                      <Building size={14} color="currentColor" />
                      {enquiryDetail.listingCategory}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Bag size={14} color="currentColor" />
                      {enquiryDetail.listingArea}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b border-white/10 py-5 px-4">
                <p className="text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px] text-white/55">Confidential Owner Data</p>
                <div className="mt-4 rounded-2xl border border-white/8 bg-[#123628] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px] font-semibold text-white">{enquiryDetail.ownerName}</h3>
                      <p className="mt-1 text-[10px] sm:text-[12px] lg:text-[10px] xl:text-[12px] text-white/45">Member ID: {enquiryDetail.memberId}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0E2F24] px-2.5 py-1 text-[9px] sm:text-[11px] lg:text-[9px] xl:text-[11px] font-medium text-activebg">
                      <Sheild size={14} color="#ffff" />
                      {enquiryDetail.ownerType}
                    </span>
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-[12px] lg:text-[10px] xl:text-[12px] text-[#A7F3D0]">
                      <span className="inline-flex items-center gap-2">
                        <Telephone size={12} color="#5EE9B5" />
                        {enquiryDetail.phone}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Envelop size={13} color="#5EE9B5" />
                        {enquiryDetail.email}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-white/10 py-5 px-4">
                <p className="text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px] text-white/55">Mediation Status</p>
                <div className="mt-3 relative">
                  <SelectDropdown
                    value={mediationStatus}
                    onChange={handleMediationStatusChange}
                    options={mediationStatusDropdownOptions}
                    placeholder="Select mediation status"
                    disabled={isUpdatingStatus}
                    className=""
                    buttonBorderClassName="border-[#2D6A56]"
                    buttonBgClassName="bg-[#134635]"
                    buttonTextClassName="text-[#D1FAE5]"
                    placeholderClassName="text-[#D1FAE5]"
                    optionsBorderClassName="border-[#2D6A56]"
                    optionsBgClassName="bg-[#134635]"
                    optionTextClassName="text-[#D1FAE5]"
                    optionActiveClassName="bg-[#1B5A45] text-[#ECFDF3]"
                    optionInactiveClassName="text-[#D1FAE5]"
                    optionSelectedClassName="text-[#ECFDF3]"
                    buttonClassName="h-11 rounded-[10px] px-4 text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px] focus-visible:border-[#2D6A56] focus-visible:ring-0"
                    optionClassName="text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px]"
                  />
                  {isUpdatingStatus ? <p className="mt-2 text-[11px] text-[#A7F3D0]">Updating status...</p> : null}
                  {statusError ? <p className="mt-2 text-[11px] text-[#FCA5A5]">{statusError}</p> : null}
                </div>
              </div>

              <div className="grid gap-3 py-5 px-4">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#58E7BE] px-4 text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px] font-medium text-[#0B3B2A] transition hover:opacity-95"
                >
                  <Calendar size={14} color="#0B3B2A" />
                  Schedule visit
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#30201D] px-4 text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px] font-medium text-[#F87171] transition hover:bg-[#382623]"
                >
                  Terminate hub
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#E9EDF5] bg-white p-4 shadow-none">
            <div className="flex items-center gap-2 text-[#111827]">
              <Note size={15} color="#111827" />
              <h2 className="text-[13px] sm:text-[15px] lg:text-[13px] xl:text-[15px] font-medium">Admin Workspace Notes</h2>
            </div>
            <div className="mt-4 rounded-[14px] border border-border-card bg-background-primary p-4">
              <textarea
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Record buyer sentiment, owner’s stance or next mediation steps here..."
                className="h-32.5 w-full resize-none border-0 bg-transparent text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px] text-[#111827] outline-none placeholder:text-[#A1A1AA]"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] sm:text-[12px] lg:text-[10px] xl:text-[12px] text-[#A1A1AA]">
              <span>Internal only</span>
              <button type="button" className="inline-flex items-center gap-1.5 font-medium text-[#2F855A] transition hover:opacity-90">
                Save notes
                <UpRight size={13} color="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
