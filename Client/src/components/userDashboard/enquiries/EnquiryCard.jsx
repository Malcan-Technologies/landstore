"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import Arrow from "@/components/svg/Arrow";
import Bag from "@/components/svg/Bag";
import Calendar from "@/components/svg/Calendar";
import Chat from "@/components/svg/Chat";
import Pointer from "@/components/svg/Pointer";

const statusStyles = {
  "Need More Info": "bg-[#FFECEE] text-[#E34854]",
  Scheduled: "bg-[#E9F8EF] text-[#2F9E5B]",
  "Pending Matching": "bg-[#F2F4F7] text-[#667085]",
  "Under Review": "bg-[#FFF4D8] text-[#D79A00]",
  "Matched (In Progress)": "bg-[#E7F0FF] text-[#386BF6]",
};

const EnquiryCard = ({ enquiry }) => {
  const router = useRouter();
  const {
    id,
    code,
    status,
    title,
    category,
    area,
    dealTags,
    updatedAt,
    image,
    unreadCount = 0,
    highlighted = false,
  } = enquiry;

  const hasUnread = unreadCount > 0;

  return (
    <button
      type="button"
      onClick={() => router.push(`/user-dashboard/enquiries/${id}`)}
      className="block w-full rounded-xl border border-border-card bg-white px-3 sm:!pr-5 py-3 shadow-[0px_6px_18px_rgba(15,61,46,0.04)] transition hover:border-[#67DCC3] md:px-2 md:py-2"
    >
      <article className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row md:items-center">
          <div className="relative h-40 sm:w-60 w-full overflow-hidden rounded-lg ">
            <Image
              src={image}
              alt={title}
              fill
              unoptimized
              className="object-cover"
              sizes="198px"
            />
          </div>

          <div className="min-w-0 flex-1 flex md:flex-row flex-col gap-3 justify-between items-start md:items-center ">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:text-[11px] text-[9px] font-medium text-gray5">
                <span className="rounded-sm bg-[#F5F5F5] px-2 py-1 text-[10px] font-medium tracking-[0.02em] text-gray5">
                  {code}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[status] ?? "bg-[#F2F4F7] text-[#667085]"}`}
                >
                  {status}
                </span>
              </div>

              <h2 className="mt-4 flex min-w-0 items-center gap-2 sm:text-[18px] text-[15px] font-bold leading-tight text-gray2">
                <Pointer size={18} color="var(--color-green-secondary)" />
                <span className="truncate">{title}</span>
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 sm:text-[12px] text-[10px] font-semibold text-gray5">
                <span className="flex items-center gap-1.5">
                  <Bag size={14} color="var(--color-gray5)" />
                  {category}
                </span>
                <span className="text-gray5">▥ {area}</span>
                {dealTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border-card px-2.5 py-0.5 text-gray5"
                  >
                    {tag}
                  </span>
                ))}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} color="var(--color-gray5)" />
                  Updated {updatedAt}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 lg:pl-4">
              <span
                className={`inline-flex h-10 w-auto items-center justify-center gap-1.5 rounded-lg px-3 sm:text-[12px] text-[10px] font-semibold transition ${
                  hasUnread
                    ? "bg-green-secondary text-white hover:opacity-90"
                    : "bg-[#F5F6F7] text-[#B8B8B8]"
                }`}
              >
                <Chat size={14} color={hasUnread ? "white" : "#B8B8B8"} />
                {hasUnread ? (
                  <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-greenbg px-1 text-[9px] leading-none text-green-950">{unreadCount}</span>
                ) : null}
              </span>

              <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#E3F3EC] px-4 sm:text-[13px] text-[11px] font-medium text-green-secondary transition hover:bg-[#d7ede4]">
                View details
                <Arrow size={14} color="var(--color-green-secondary)" />
              </span>
            </div>
          </div>
          
        </div>
      </article>
    </button>
  );
};

export default EnquiryCard;
