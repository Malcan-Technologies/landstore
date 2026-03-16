import Image from "next/image";

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
      <div className="mx-auto w-full max-w-350 px-4 md:px-6 xl:px-9">
        <section className="rounded-[22px] border border-border-card bg-white px-4 py-4 shadow-[0px_6px_24px_rgba(15,61,46,0.04)] md:px-4 md:py-4">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-center">
              <div className="relative h-25 w-25 shrink-0 overflow-hidden rounded-2xl">
                <Image src={enquiry.image} alt={enquiry.title} fill unoptimized className="object-cover" sizes="100px" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#F5F5F5] px-2 py-1 text-[10px] font-medium tracking-[0.02em] text-gray5">{enquiry.code}</span>
                  <span className="rounded-md bg-[#F5F5F5] px-2.5 py-1 text-[10px] font-medium text-[#7B7B7B]">{enquiry.status}</span>
                </div>

                <h1 className="mt-3 flex items-center gap-2 text-[26px] font-semibold leading-tight text-gray2 md:text-[28px]">
                  <Pointer size={18} color="var(--color-green-secondary)" />
                  {enquiry.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-[#7D7D7D]">
                  <span className="flex items-center gap-1.5">
                    <Bag size={14} color="var(--color-gray5)" />
                    {enquiry.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray5">
                    <span className="text-[14px] leading-none">▥</span>
                    {enquiry.area}
                  </span>
                  {enquiry.dealTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border-card px-3 py-0.5 text-[12px] font-medium text-gray5">
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

            <div className="flex flex-wrap items-center gap-5 lg:justify-end">
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
            <div className="mx-auto flex max-w-190 items-start justify-between gap-2 px-2 lg:gap-20">
              {progressSteps.map((step, index) => {
                const currentStep = 1;
                const stepNumber = index + 1;
                const isCurrent = currentStep === stepNumber;
                const isCompleted = currentStep > stepNumber;
                const showLine = index < progressSteps.length - 1;

                return (
                  <div key={step} className="relative flex flex-1 flex-col items-center justify-start text-center">
                    <div className="relative flex h-11 w-full items-center justify-center">
                      {isCompleted ? (
                        <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-green-secondary shadow-[0px_4px_10px_rgba(38,143,109,0.18)]">
                          <StepperTick width={16} height={14} color="white" />
                        </div>
                      ) : isCurrent ? (
                        <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-green-secondary bg-white">
                          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-green-secondary">
                            <span className="h-3 w-3 rounded-full bg-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-border-card bg-white">
                          <span className="h-2.5 w-2.5 rounded-full bg-border-card" />
                        </div>
                      )}

                      {showLine ? (
                        <span
                          className={`absolute left-1/2 top-1/2 h-[2px] w-full -translate-y-1/2 lg:w-[180%] ${isCompleted ? "bg-green-secondary" : "bg-border-card"}`}
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <span className="mt-3 flex min-h-10 w-full items-start justify-center text-center text-[13px] font-medium text-gray2">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between gap-4 border-t border-border-card pt-7">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-gray2 md:text-[16px]">
              <Chat2 size={20} color="var(--color-green-secondary)" />
              Mediation Log
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray5 md:text-[14px]">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-green-secondary text-green-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-green-secondary" />
              </span>
              Secure Admin Mediation
            </div>
          </div>

          <div className="mt-5 rounded-[18px] border border-[#F1F3F2] bg-[#FAFBFA] px-3 py-5 md:px-6 md:py-6">
            <div className="flex gap-3 md:gap-4">
              <span className="mt-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1F1F1F] text-white">
                <Person size={16} color="white" />
              </span>

              <div className="flex-1 space-y-4">
                <article className="rounded-2xl border border-[#D9DDE3] bg-white px-4 py-4 shadow-[0px_4px_12px_rgba(15,61,46,0.03)] md:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[12px] font-semibold text-gray2 md:text-[16px]">Original Submission</h2>
                      <p className="mt-3 max-w-[640px] text-[12px] italic leading-6 text-gray5 md:text-[14px]">
                        “Interested in purchasing the full lot for agricultural development. Please provide matching details.”
                      </p>
                    </div>
                    <span className="text-[12px] text-gray5 md:text-[14px]">05/20/2025</span>
                  </div>

                  <div className="mt-4 border-t border-border-card pt-3 text-[12px] text-gray5 md:text-[14px]">
                    Interest: <span className="font-medium text-gray2">Buy</span>
                    <span className="mx-3 text-[#CACACA]">|</span>
                    Entity: <span className="font-medium text-gray2">Individual</span>
                  </div>
                </article>

                <div className="flex items-start justify-end gap-3">
                  <article className="w-full max-w-157.5 rounded-2xl border border-[#BFEBDD] bg-[#EDFCF6] px-4 py-4 text-right shadow-[0px_4px_12px_rgba(15,61,46,0.02)] md:px-5">
                    <div className="flex items-center justify-between gap-3 text-[12px] text-[#74A79A] md:text-[14px]">
                      <span>05/20/2025</span>
                      <span className="font-semibold text-green-secondary">Admin notification</span>
                    </div>
                    <p className="mt-3 text-[12px] italic leading-6 text-[#517A6E] md:text-[14px]">
                      “Interested in purchasing the full lot for agricultural development. Please provide matching details.”
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
            <div className="w-full max-w-167.5">
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
                <span>◌ Encrypted communication</span>
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
