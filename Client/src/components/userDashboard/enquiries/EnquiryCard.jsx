import Image from "next/image";
import Link from "next/link";

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
    <Link
      href={`/user-dashboard/enquiries/${id}`}
      className="block rounded-2xl border border-border-card bg-white px-3 py-3 shadow-[0px_6px_18px_rgba(15,61,46,0.04)] transition hover:border-[#67DCC3] md:px-4"
    >
      <article className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          <div className="relative h-40 w-60  overflow-hidden rounded-xl ">
            <Image src={image} alt={title} fill unoptimized className="object-cover" sizes="198px" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#F5F5F5] px-2 py-1 text-[10px] font-medium tracking-[0.02em] text-gray5">
                {code}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[status] ?? "bg-[#F2F4F7] text-[#667085]"}`}>
                {status}
              </span>
            </div>

            <h2 className="mt-4 flex items-center gap-2 text-[22px] font-semibold leading-tight text-gray2">
              <Pointer size={18} color="var(--color-green-secondary)" />
              <span className="truncate">{title}</span>
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-gray5">
              <span className="flex items-center gap-1.5">
                <Bag size={14} color="var(--color-gray5)" />
                {category}
              </span>
              <span className="text-gray5">▥ {area}</span>
              {dealTags.map((tag) => (
                <span key={tag} className="rounded-full border border-border-card px-2.5 py-0.5 text-[12px] font-medium text-gray5">
                  {tag}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <Calendar size={14} color="var(--color-gray5)" />
                Updated {updatedAt}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 lg:pl-4">
          <span
            className={`inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold transition ${
              hasUnread ? "bg-green-secondary text-white hover:opacity-90" : "bg-[#F5F6F7] text-[#B8B8B8]"
            }`}
          >
            <Chat size={14} color={hasUnread ? "white" : "#B8B8B8"} />
            {hasUnread ? <span className="leading-none">{unreadCount}</span> : null}
          </span>

          <span
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#E3F3EC] px-4 text-[13px] font-medium text-green-secondary transition hover:bg-[#d7ede4]"
          >
            View details
            <Arrow size={14} color="var(--color-green-secondary)" />
          </span>
        </div>
      </article>
    </Link>
  );
};

export default EnquiryCard;
