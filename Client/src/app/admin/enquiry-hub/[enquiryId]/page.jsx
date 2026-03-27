"use client";

import { use, useMemo, useState } from "react";
import Image from "next/image";
import Person from "@/components/svg/Person";
import Sheild from "@/components/svg/Sheild";
import Pointer from "@/components/svg/Pointer";
import Building from "@/components/svg/Building";
import Bag from "@/components/svg/Bag";
import Telephone from "@/components/svg/Telephone";
import Envelop from "@/components/svg/Envelop";
import Calendar from "@/components/svg/Calendar";
import Clock from "@/components/svg/Clock";
import Send from "@/components/svg/Send";
import Chat from "@/components/svg/Chat";
import Controls from "@/components/svg/Controls";
import Mic from "@/components/svg/Mic";
import Plus from "@/components/svg/Plus";
import Note from "@/components/svg/Note";
import UpRight from "@/components/svg/UpRight";
import Chat2 from "@/components/svg/Chat2";
import ArrowDown from "@/components/svg/ArrowDown";
import SelectDropdown from "@/components/common/SelectDropdown";
import Bag2 from "@/components/svg/Bag2";
import Bag3 from "@/components/svg/Bag3";
import Clock2 from "@/components/svg/Clock2";
import Profile from "@/components/svg/Profile";
import ProfileCheck from "@/components/svg/ProfileCheck";
import Verify from "@/components/svg/Verify";

const enquiryRecords = [
  {
    id: "enquiry-1",
    enquiryId: "ENQ - 000128",
    listingCode: "ID - 000128",
    listingTitle: "Kuala Langat, Selangor",
    listingCategory: "Agriculture",
    listingArea: "5.2 Acres",
    requester: "Dato' Ridzuan",
    verificationStatus: "Identity Verified",
    requesterType: "Individual",
    memberId: "U123",
    ownerName: "Tan Sri Dr. Lim Chong",
    ownerType: "Corporate identity",
    phone: "+60 12-345 6789",
    email: "lim.chong@holdings.my",
    quote: "I would like to purchase this land for a family retreat. Is the title transfer process straightforward?",
    estimatedBudget: "RM 1.5M - 2.0M",
    acquisitionTimeline: "Next 6 months",
    mediationMode: "Corporate buy",
    location: "Kuala Langat, Selangor",
    mediationStatus: "Pending matching",
    originalDate: "05/20/2025",
    originalMessage: "Interested in purchasing the full lot for agricultural development. Please provide matching details.",
    adminDate: "05/20/2025",
    adminMessage: "Interested in purchasing the full lot for agricultural development. Please provide matching details.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "enquiry-2",
    enquiryId: "ENQ - 000129",
    listingCode: "ID - 000129",
    listingTitle: "Sepang, Selangor",
    listingCategory: "Industrial",
    listingArea: "4.1 Acres",
    requester: "Dato' Ridzuan",
    verificationStatus: "Identity Verified",
    requesterType: "Corporate Entity",
    memberId: "U124",
    ownerName: "Apex Horizon Holdings",
    ownerType: "Corporate identity",
    phone: "+60 13-998 1122",
    email: "director@apexhorizon.my",
    quote: "We are exploring land parcels suitable for a logistics expansion. Please confirm access road conditions.",
    estimatedBudget: "RM 2.5M - 3.0M",
    acquisitionTimeline: "Next 3 months",
    mediationMode: "Corporate buy",
    location: "Sepang, Selangor",
    mediationStatus: "Need more info",
    originalDate: "05/22/2025",
    originalMessage: "Need a logistics-ready parcel with direct highway access. Please share due diligence requirements.",
    adminDate: "05/23/2025",
    adminMessage: "Admin has requested further intended-use documentation before the match can proceed.",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "enquiry-3",
    enquiryId: "ENQ - 000130",
    listingCode: "ID - 000130",
    listingTitle: "Cyberjaya, Selangor",
    listingCategory: "Commercial",
    listingArea: "3.8 Acres",
    requester: "Dato' Ridzuan",
    verificationStatus: "Identity Verified",
    requesterType: "Individual",
    memberId: "U125",
    ownerName: "Midanah Estates",
    ownerType: "Corporate identity",
    phone: "+60 17-221 8899",
    email: "owner@midanah.com",
    quote: "I am comparing several commercial plots. Could you advise whether partial acquisition is possible?",
    estimatedBudget: "RM 4.0M - 4.8M",
    acquisitionTimeline: "Next 12 months",
    mediationMode: "Joint venture",
    location: "Cyberjaya, Selangor",
    mediationStatus: "Scheduled",
    originalDate: "05/24/2025",
    originalMessage: "Interested in a commercial parcel with phased acquisition terms and governance clarity.",
    adminDate: "05/24/2025",
    adminMessage: "A site visit proposal has been prepared for internal matching review.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
];

const mediationStatusOptions = ["Pending matching", "Need more info", "Scheduled", "In progress"];
const mediationStatusDropdownOptions = mediationStatusOptions.map((option) => ({
  label: option,
  value: option,
  icon: ArrowDown,
}));

export default function EnquiryHubDetailPage({ params }) {
  const resolvedParams = use(params);
  const routeId = resolvedParams?.enquiryId;

  const enquiryDetail = useMemo(() => {
    return enquiryRecords.find((item) => item.id === routeId) || enquiryRecords[0];
  }, [routeId]);

  const [mediationStatus, setMediationStatus] = useState(enquiryDetail.mediationStatus);
  const [adminNote, setAdminNote] = useState("");
  const [message, setMessage] = useState("");

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-background-primary px-4 py-5 no-scrollbar sm:px-5">
      <section className="flex flex-col md:flex-row justify-between min-h-max gap-4 ">
        <div className="rounded-[20px] border border-[#E9EDF5] bg-white p-4 shadow-none sm:p-5 md:w-[65%]">
          <div className="flex items-start justify-between gap-4 border-b border-[#E9EDF5] pb-4">
            <div className="flex items-start gap-3">
              <div>
              <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white bg-background-primary shadow-sm text-[#A1A1AA] ">
                <Profile size={22} color="#A1A1AA" />
                <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-4.5 w-4.5 items-center justify-center rounded-full">
                  <Verify size={5} color="#298064" />
                </span>
              </span>

              </div>
              <div>
                <h1 className="text-[20px] font-semibold leading-none text-[#111827]">{enquiryDetail.requester}</h1>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#EAFBF1] px-2.5 py-1 text-[11px] font-medium text-[#15803D]">
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
              <p className="text-[16px] font-semibold italic leading-normal">
                “{enquiryDetail.quote}”
              </p>
            </div>

            <div className="grid rounded-[18px bg-white">
              <div className="grid grid-cols-[22px_1fr_auto] items-center gap-3 border-b border-[#EEF2F6] px-4 py-3">
                <Bag2 size={16} color="#71717A" />
                <span className="text-[13px] text-[#71717A]">Estimated budget</span>
                <span className="text-[14px] font-semibold text-[#111827]">{enquiryDetail.estimatedBudget}</span>
              </div>
              <div className="grid grid-cols-[22px_1fr_auto] items-center gap-3 border-b border-[#EEF2F6] px-4 py-3">
                <Clock2 size={16} color="#71717A" />
                <span className="text-[13px] text-[#71717A]">Acquisition timeline</span>
                <span className="text-[14px] font-semibold text-[#111827]">{enquiryDetail.acquisitionTimeline}</span>
              </div>
              <div className="grid grid-cols-[22px_1fr_auto] items-center gap-3 px-4 py-3">
                <Bag3 size={16} color="#71717A" />
                <span className="text-[13px] text-[#71717A]">Mediation mode</span>
                <span className="text-[14px] font-semibold text-[#111827]">{enquiryDetail.mediationMode}</span>
              </div>
            </div>
          </div>

          <div className="py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#111827]">
                <Chat2 size={16} color="#2F855A" />
                <h2 className="text-[16px] font-semibold">Mediation Log</h2>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#71717A]">
                <Sheild size={14} color="#10B981" />
                <span>Secure Admin Mediation</span>
              </div>
            </div>

            <div className="mt-5 rounded-[18px] bg-[#FAFAFA] p-5">
              <div className="flex gap-4">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#18181B] text-white">
                  <Person size={14} color="#FFFFFF" />
                </span>
                <div className="flex-1 rounded-[16px] border border-[#E5E7EB] bg-white">
                  <div className="flex items-start justify-between gap-3 px-4 py-4">
                    <div>
                      <h3 className="text-[14px] font-semibold text-[#111827]">Original Submission</h3>
                      <p className="mt-3 max-w-[430px] text-[14px] italic leading-6 text-[#71717A]">“{enquiryDetail.originalMessage}”</p>
                    </div>
                    <span className="text-[13px] text-[#71717A]">{enquiryDetail.originalDate}</span>
                  </div>
                  <div className="mx-4 border-t border-[#E5E7EB]" />
                  <div className="flex flex-wrap items-center gap-3 px-4 py-3 text-[13px] text-[#71717A]">
                    <span>
                      Interest: <span className="font-semibold text-[#111827]">Buy</span>
                    </span>
                    <span className="text-[#D4D4D8]">|</span>
                    <span>
                      Entity: <span className="font-semibold text-[#111827]">{enquiryDetail.requesterType}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-4">
                <div className="flex-1 rounded-[16px] border border-[#C9F7E8] bg-[#F1FFFA] px-4 py-3">
                  <div className="flex items-start justify-between gap-3 text-[13px] text-[#2F855A]">
                    <span>{enquiryDetail.adminDate}</span>
                    <span className="font-semibold">Admin notification</span>
                  </div>
                  <p className="mt-2 max-w-[420px] text-right text-[14px] italic leading-6 text-[#2F855A]">“{enquiryDetail.adminMessage}”</p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2F855A] text-white transition hover:opacity-90"
                  aria-label="Refresh mediation"
                >
                  <Sheild />
                </button>
              </div>
            </div>
          </div>

          <div className="">
            <div className="rounded-[16px] border border-border-card bg-background-primary p-4">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type a follow-up note to LandStore admin..."
                className="h-[96px] w-full resize-none border-0 bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#A1A1AA]"
              />
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#FAFAFA] text-[#71717A] transition hover:bg-[#F4F4F5]"
                  aria-label="Adjust settings"
                >
                  <Controls size={14} color="currentColor" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#FAFAFA] text-[#71717A] transition hover:bg-[#F4F4F5]"
                  aria-label="Attach audio"
                >
                  <Mic size={14} color="#71717A" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#FAFAFA] text-[#71717A] transition hover:bg-[#F4F4F5]"
                  aria-label="Add item"
                >
                  <Plus size={14} color="#71717A" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#2F855A] text-white transition hover:opacity-90"
                  aria-label="Send note"
                >
                  <Send size={16} color="white" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-[12px] text-[#A1A1AA]">
              <LockIcon />
              <span>Encrypted communication</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:w-[35%]">
          <div className="overflow-hidden rounded-[20px] border border-[#0E3C2D] bg-[#082B20] text-white shadow-[0_12px_30px_rgba(6,36,26,0.18)]">
            <div className="flex items-start justify-between border-b border-white/10 px-4 py-4">
              <div className="flex items-start gap-2.5">
                <span className="inline-flex h-5 w-5 items-center justify-center text-greenbg">
                  <Sheild size={16} color="var(--color-greenbg)" />
                </span>
                <div className="flex flex-1 justify-center">
                  <h2 className="text-[18px] font-semibold leading-none text-activebg">Confidential Data</h2>
                </div>
              </div>
              <span className="text-[12px] text-white/55">Admin Restricted</span>
            </div>

            <div className=" py-4">
              <div className="flex gap-4 border-b border-white/10 pb-5 px-4">
                <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[12px]">
                  <Image
                    src={enquiryDetail.image}
                    alt={enquiryDetail.listingTitle}
                    fill
                    sizes="88px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center rounded-[4px] bg-[#0F5132] px-2.5 py-1 text-[11px] font-medium text-[#A7F3D0]">
                    {enquiryDetail.listingCode}
                  </span>
                  <div className="mt-3 flex items-center justify-start gap-2 ">
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                      <Pointer size={14} color="#5EE9B5" />
                    </span>
                    <h3 className="text-[22px] font-semibold leading-6 text-white">{enquiryDetail.location}</h3>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-white/68">
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
                <p className="text-[14px] text-white/55">Confidential Owner Data</p>
                <div className="mt-4 rounded-[16px] border border-white/8 bg-[#123628] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[14px] font-semibold text-white">{enquiryDetail.ownerName}</h3>
                      <p className="mt-1 text-[12px] text-white/45">Member ID: {enquiryDetail.memberId}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0E2F24] px-2.5 py-1 text-[11px] font-medium text-activebg">
                      <Sheild size={14} color="#ffff" />
                      {enquiryDetail.ownerType}
                    </span>
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[#A7F3D0]">
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
                <p className="text-[14px] text-white/55">Mediation Status</p>
                <div className="mt-3 relative">
                  <SelectDropdown
                    value={mediationStatus}
                    onChange={setMediationStatus}
                    options={mediationStatusDropdownOptions}
                    placeholder="Select mediation status"
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
                    buttonClassName="h-11 rounded-[10px] px-4 text-[14px] focus-visible:border-[#2D6A56] focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="grid gap-3 py-5 px-4">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#58E7BE] px-4 text-[14px] font-medium text-[#0B3B2A] transition hover:opacity-95"
                >
                  <Calendar size={14} color="#0B3B2A" />
                  Schedule visit
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#30201D] px-4 text-[14px] font-medium text-[#F87171] transition hover:bg-[#382623]"
                >
                  Terminate hub
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#E9EDF5] bg-white p-4 shadow-none">
            <div className="flex items-center gap-2 text-[#111827]">
              <Note size={15} color="#111827" />
              <h2 className="text-[15px] font-medium">Admin Workspace Notes</h2>
            </div>
            <div className="mt-4 rounded-[14px] border border-border-card bg-background-primary p-4">
              <textarea
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Record buyer sentiment, owner’s stance or next mediation steps here..."
                className="h-[130px] w-full resize-none border-0 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#A1A1AA]"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px] text-[#A1A1AA]">
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

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M3.5 5V4C3.5 2.61929 4.61929 1.5 6 1.5C7.38071 1.5 8.5 2.61929 8.5 4V5" stroke="#A1A1AA" strokeWidth="1.1" strokeLinecap="round" />
    <rect x="2.5" y="5" width="7" height="5.5" rx="1.5" stroke="#A1A1AA" strokeWidth="1.1" />
  </svg>
);

