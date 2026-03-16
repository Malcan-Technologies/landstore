import Image from "next/image";
import Link from "next/link";

import Arrow from "@/components/svg/Arrow";
import Bag from "@/components/svg/Bag";
import Calendar from "@/components/svg/Calendar";
import Chat from "@/components/svg/Chat";
import Note from "@/components/svg/Note";
import Plus from "@/components/svg/Plus";
import Pointer from "@/components/svg/Pointer";
import UpRight from "@/components/svg/UpRight";

const enquiryDetails = {
  "enquiry-1": {
    id: "enquiry-1",
    code: "ENQ - 000128",
    status: "Pending Matching",
    title: "Kuala Langat, Selangor",
    category: "Agriculture",
    area: "5.2 Acres",
    dealTags: ["Buy"],
    submittedAt: "05/20/2025",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
  },
};

const progressSteps = ["Submitted", "Verification", "Under negotiation", "Matched", "Completed"];

const EnquiryDetailPage = async ({ params }) => {
  const { enquiryid } = await params;
  const enquiry = enquiryDetails[enquiryid] ?? enquiryDetails["enquiry-1"];

  return (
    <main className="bg-background-primary py-8 md:py-10">
      <div className="mx-auto w-full max-w-[1240px] px-4 md:px-6 xl:px-8">
        <Link href="/user-dashboard/enquiries" className="inline-flex items-center gap-2 text-[14px] font-medium text-gray5 transition hover:text-gray2">
          <span className="inline-flex rotate-180 text-gray5">
            <Arrow size={14} color="currentColor" />
          </span>
          Back to marketplace
        </Link>

        <section className="mt-4 rounded-[22px] border border-border-card bg-white px-4 py-4 shadow-[0px_6px_24px_rgba(15,61,46,0.04)] md:px-5 md:py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-center">
              <div className="relative h-24 w-full overflow-hidden rounded-xl md:w-29">
                <Image src={enquiry.image} alt={enquiry.title} fill unoptimized className="object-cover" sizes="116px" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#F5F5F5] px-2 py-1 text-[10px] font-medium text-gray5">{enquiry.code}</span>
                  <span className="rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[10px] font-medium text-[#667085]">{enquiry.status}</span>
                </div>

                <h1 className="mt-3 flex items-center gap-2 text-[22px] font-semibold leading-tight text-gray2 md:text-[18px] lg:text-[20px] xl:text-[22px]">
                  <Pointer size={18} color="var(--color-green-secondary)" />
                  {enquiry.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-gray5">
                  <span className="flex items-center gap-1.5">
                    <Bag size={14} color="var(--color-gray5)" />
                    {enquiry.category}
                  </span>
                  <span className="text-gray5">▥ {enquiry.area}</span>
                  {enquiry.dealTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border-card px-2.5 py-0.5 text-[11px] font-medium text-gray5">
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

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-transparent px-1 text-[13px] font-medium text-green-secondary transition hover:text-green-primary">
                View Enquiry
                <UpRight size={14} color="var(--color-green-secondary)" />
              </button>
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#FFECEE] px-4 text-[13px] font-medium text-[#E34854] transition hover:bg-[#ffe1e5]">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] leading-none">×</span>
                Close enquiry
              </button>
            </div>
          </div>

          <div className="mt-5 border-t border-border-card pt-7">
            <div className="grid grid-cols-5 gap-2">
              {progressSteps.map((step, index) => {
                const isCurrent = index === 0;
                const isCompleted = index < 1;
                const showLine = index < progressSteps.length - 1;

                return (
                  <div key={step} className="relative flex flex-col items-center text-center">
                    <div className="relative flex h-7 w-full items-center justify-center">
                      {showLine ? <span className="absolute left-1/2 top-1/2 h-[2px] w-full -translate-y-1/2 bg-border-card" aria-hidden /> : null}
                      {isCurrent ? (
                        <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-secondary bg-white">
                          <div className="h-4 w-4 rounded-full bg-green-secondary" />
                        </div>
                      ) : isCompleted ? (
                        <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-green-secondary">
                          <div className="h-2.5 w-2.5 rounded-full bg-white" />
                        </div>
                      ) : (
                        <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-border-card bg-white">
                          <div className="h-2.5 w-2.5 rounded-full bg-border-card" />
                        </div>
                      )}
                    </div>
                    <span className="mt-3 text-[12px] font-medium text-gray2">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-border-card pt-5">
            <div className="flex items-center gap-2 text-[14px] font-medium text-gray2">
              <Chat size={16} color="var(--color-green-secondary)" />
              Mediation Log
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray5">
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-green-secondary text-green-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-green-secondary" />
              </span>
              Secure Admin Mediation
            </div>
          </div>

          <div className="mt-5 rounded-[18px] bg-[#FAFBFA] px-3 py-3 md:px-4 md:py-4">
            <div className="flex gap-3">
              <span className="mt-3 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#222222] text-white">
                <Chat size={12} color="white" />
              </span>

              <div className="flex-1 space-y-4">
                <article className="rounded-2xl border border-border-card bg-white px-4 py-4 shadow-[0px_4px_12px_rgba(15,61,46,0.03)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[12px] font-semibold text-gray2">Original Submission</h2>
                      <p className="mt-3 max-w-[640px] text-[12px] italic leading-5 text-gray5">
                        “Interested in purchasing the full lot for agricultural development. Please provide matching details.”
                      </p>
                    </div>
                    <span className="text-[11px] text-gray5">05/20/2025</span>
                  </div>

                  <div className="mt-4 border-t border-border-card pt-3 text-[11px] text-gray5">
                    Interest: Buy <span className="mx-2">|</span> Entity: Individual
                  </div>
                </article>

                <div className="flex justify-end">
                  <article className="relative w-full max-w-[430px] rounded-2xl border border-[#C8EFE4] bg-[#ECFBF5] px-4 py-3 text-right shadow-[0px_4px_12px_rgba(15,61,46,0.02)]">
                    <span className="absolute -right-2.5 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-secondary text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <div className="flex items-center justify-between gap-3 text-[10px] text-gray5">
                      <span>05/20/2025</span>
                      <span className="font-medium text-green-secondary">Admin notification</span>
                    </div>
                    <p className="mt-3 text-[11px] italic leading-5 text-[#517A6E]">
                      “Interested in purchasing the full lot for agricultural development. Please provide matching details.”
                    </p>
                  </article>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <div className="w-full max-w-[500px]">
              <div className="rounded-2xl border border-border-card bg-white px-4 py-3 shadow-[0px_4px_12px_rgba(15,61,46,0.03)]">
                <textarea
                  placeholder="Type a follow-up note to LandStore admin..."
                  className="min-h-[68px] w-full resize-none bg-transparent text-[12px] text-gray2 outline-none placeholder:text-[#B5B5B5]"
                />

                <div className="mt-3 flex items-center justify-end gap-2 border-t border-border-card pt-3">
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-card bg-white text-gray5 transition hover:bg-background-primary">
                    <span className="rotate-45 text-[12px] leading-none">⌕</span>
                  </button>
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-card bg-white text-gray5 transition hover:bg-background-primary">
                    <span className="text-[12px] leading-none">◔</span>
                  </button>
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-card bg-white text-gray5 transition hover:bg-background-primary">
                    <Plus size={12} color="currentColor" />
                  </button>
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-green-secondary text-white transition hover:opacity-90">
                    <UpRight size={12} color="white" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-gray5">
                <span>© Encrypted communication</span>
                <span>◌ Replies go to admin, not seller</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default EnquiryDetailPage;
