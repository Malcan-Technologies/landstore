"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Controls from "@/components/svg/Controls";
import Mic from "@/components/svg/Mic";
import Plus from "@/components/svg/Plus";
import Send from "@/components/svg/Send";
import Sheild from "@/components/svg/Sheild";
import Exclamation from "@/components/svg/Exclamation";
import Person from "@/components/svg/Person";

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

const ChatSection = ({
  enquiryId,
  existingMessages = [],
  onSendMessage,
  variant = "user",
  isSending = false,
  sendError = "",
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const isAdmin = variant === "admin";
  const messages = useMemo(() => (Array.isArray(existingMessages) ? existingMessages : []), [existingMessages]);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    const nextMessage = inputText.trim();
    if (!nextMessage || isSending) return;

    try {
      const result = await onSendMessage?.(nextMessage, enquiryId);
      if (result !== false) {
        setInputText("");
      }
    } catch {
    }
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between gap-4 border-b border-border-card py-4">
        <div className={`flex items-center gap-2 ${isAdmin ? "text-[12px] sm:text-[16px] lg:text-[14px] xl:text-[16px]" : "sm:text-[14px] text-[12px] font-semibold text-gray2 md:text-[16px]"}`}>
          <Chat2 size={isAdmin ? 16 : 20} color={isAdmin ? "#2F855A" : "var(--color-green-secondary)"} />
          Mediation Log
        </div>
        <div className={`flex items-center gap-2 ${isAdmin ? "text-[9px] sm:text-[13px] lg:text-[11px] xl:text-[13px] text-[#71717A]" : "sm:text-[11px] text-[9px] font-medium text-gray5 md:text-[14px]"}`}>
          <Sheild size={isAdmin ? 14 : 16} color={isAdmin ? "#10B981" : "var(--color-green-secondary)"} />
          Secure Admin Mediation
        </div>
      </div>

      <div 
        ref={messagesContainerRef}
        className={`mt-5 max-h-96 overflow-y-auto overflow-x-hidden rounded-[18px] ${isAdmin ? "bg-[#FAFAFA] p-5" : "border border-[#F1F3F2] bg-[#FAFBFA] px-3 py-5 md:px-6 md:py-6"} no-scrollbar`}
      >
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => (
            <div key={message.id || index} className="flex gap-3 md:gap-4">
              {message.sender === "user" ? (
                <>
                  <span className={`${isAdmin ? "inline-flex h-7 w-7" : "mt-3 inline-flex h-8 w-8"} shrink-0 items-center justify-center rounded-full bg-[#1F1F1F] text-white`}>
                    <Person size={isAdmin ? 14 : 16} color="#FFFFFF" />
                  </span>

                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex min-w-0 items-start justify-start gap-3">
                      <article className={`w-full min-w-0 rounded-2xl border ${isAdmin ? "border-[#E5E7EB] bg-white" : "border-[#D9DDE3] bg-white"} ${isAdmin ? "" : "shadow-[0px_4px_12px_rgba(15,61,46,0.03)]"} ${isAdmin ? "" : "md:px-5"} px-4 py-4`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-nowrap items-center justify-between gap-2">
                              <h2 className={`font-semibold text-gray2 ${isAdmin ? "text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px]" : "text-[10px] sm:text-[12px] md:text-[16px]"}`}>{isAdmin ? "Original Submission" : "Your Message"}</h2>
                              <span className={`text-gray5 ${isAdmin ? "text-[11px] sm:text-[13px] lg:text-[11px] xl:text-[13px]" : "text-[10px] sm:text-[12px] md:text-[14px]"}`}>{formatDate(message.createdAt)}</span>
                            </div>
                            <div className="mt-3">
                              <p className={`max-w-107.5 italic leading-6 text-gray5 ${isAdmin ? "text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px]" : "max-w-full text-[10px] sm:text-[12px] sm:leading-6 md:text-[14px]"}`}>
                                &ldquo;{message.content}&rdquo;
                              </p>
                            </div>
                          </div>
                        </div>
                        {isAdmin && (
                          <>
                            <div className="mx-4 border-t border-[#E5E7EB]" />
                            <div className="flex flex-wrap items-center gap-3 px-4 py-3 text-[9px] sm:text-[13px] lg:text-[11px] xl:text-[13px] text-[#71717A]">
                              <span>
                                Interest: <span className="font-semibold text-[#111827]">Buy</span>
                              </span>
                              <span className="text-[#D4D4D8]">|</span>
                              <span>
                                Entity: <span className="font-semibold text-[#111827]">Individual</span>
                              </span>
                            </div>
                          </>
                        )}
                      </article>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex w-full flex-row-reverse items-start gap-4">
                  <button
                    type="button"
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:opacity-90 ${isAdmin ? "bg-[#2F855A] text-white" : "bg-green-secondary text-white"}`}
                    aria-label="Admin"
                  >
                    <Sheild size={isAdmin ? 14 : 15} color="white" />
                  </button>
                  <article className={`w-full max-w-[calc(100%-2.75rem)] rounded-2xl border px-4 py-3 text-right ${isAdmin ? "border-[#C9F7E8] bg-[#F1FFFA]" : "border-[#BFEBDD] bg-[#EDFCF6] shadow-[0px_4px_12px_rgba(15,61,46,0.02)] sm:max-w-157.5 md:px-5"}`}>
                    <div className={`flex items-start justify-between gap-3 ${isAdmin ? "text-[#2F855A] text-[9px] sm:text-[13px] lg:text-[11px] xl:text-[13px]" : "text-[#74A79A] text-[10px] sm:text-[12px] md:text-[14px]"}`}>
                      <span className={`font-semibold text-end ${isAdmin ? "" : "text-green-secondary"}`}>Admin notification</span>
                      <span>{formatDate(message.createdAt)}</span>
                    </div>
                    <p className={`mt-2 max-w-105 italic leading-6 ${isAdmin ? "text-[#2F855A] text-[12px] sm:text-[14px] lg:text-[12px] xl:text-[14px]" : "mt-3 text-[#517A6E] text-[10px] sm:text-[12px] sm:leading-6 md:text-[14px]"}`}>
                      &ldquo;{message.content}&rdquo;
                    </p>
                  </article>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={isAdmin ? "" : "mt-6 flex justify-center"}>
        <div className={isAdmin ? "" : "w-full max-w-200"}>
          <div className={`rounded-2xl ${isAdmin ? "border border-border-card bg-background-primary p-4" : "border border-[#D9DDE3] bg-white px-4 py-3 shadow-[0px_4px_12px_rgba(15,61,46,0.03)]"}`}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.ctrlKey || e.metaKey) {
                    // Allow default behavior (new line) for Ctrl+Enter or Cmd+Enter
                    return;
                  }
                  // Send message on Enter alone
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={isAdmin ? "Type a mediation update..." : "Type a follow-up note to LandStore admin..."}
              className={`${isAdmin ? "h-24 w-full" : "min-h-27.5 w-full"} resize-none border-0 bg-transparent ${isAdmin ? "text-[11px] sm:text-[15px] lg:text-[13px] xl:text-[15px] text-[#111827] outline-none placeholder:text-[#A1A1AA]" : "text-[14px] text-gray2 outline-none placeholder:text-[#AEAEAE]"} ${isSending ? "cursor-not-allowed opacity-70" : ""}`}
            />

            <div className={`mt-${isAdmin ? "4" : "3"} flex items-center justify-end gap-2 ${isAdmin ? "" : "border-t border-border-card pt-3"}`}>
              <button type="button" className={`inline-flex h-8 w-8 items-center justify-center rounded-[10px] ${isAdmin ? "border border-[#E5E7EB] bg-[#FAFAFA] text-[#71717A] transition hover:bg-[#F4F4F5]" : "border border-border-card bg-[#FCFCFC] text-gray5 transition hover:bg-background-primary"}`}>
                <Controls size={isAdmin ? 14 : 18} color={isAdmin ? "currentColor" : "#7D7D7D"} />
              </button>
              <button type="button" className={`inline-flex h-8 w-8 items-center justify-center rounded-[10px] ${isAdmin ? "border border-[#E5E7EB] bg-[#FAFAFA] text-[#71717A] transition hover:bg-[#F4F4F5]" : "border border-border-card bg-[#FCFCFC] text-gray5 transition hover:bg-background-primary"}`}>
                <Mic size={isAdmin ? 14 : 18} color={isAdmin ? "#71717A" : "#7D7D7D"} />
              </button>
              <button type="button" className={`inline-flex h-8 w-8 items-center justify-center rounded-[10px] ${isAdmin ? "border border-[#E5E7EB] bg-[#FAFAFA] text-[#71717A] transition hover:bg-[#F4F4F5]" : "border border-border-card bg-[#FCFCFC] text-gray5 transition hover:bg-background-primary"}`}>
                <Plus size={isAdmin ? 14 : 14} color="currentColor" />
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={isSending}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-[10px] ${isAdmin ? "bg-[#2F855A] text-white transition hover:opacity-90" : "bg-green-secondary text-white transition hover:opacity-90"} disabled:cursor-not-allowed disabled:opacity-70`}
              >
                <Send size={isAdmin ? 16 : 18} color="white" />
              </button>
            </div>
          </div>

          {sendError ? (
            <p className="mt-2 text-right text-xs leading-5 text-red-500">{sendError}</p>
          ) : null}

          <div className={`mt-3 flex ${isAdmin ? "items-center justify-center gap-2" : "flex-wrap items-center justify-center gap-x-4 gap-y-2"} ${isAdmin ? "text-[10px] sm:text-[12px] lg:text-[10px] xl:text-[12px] text-[#A1A1AA]" : "text-[10px] text-[#9A9A9A] md:text-[11px]"}`}>
            <span className="flex items-center gap-1"><LockIcon /> Encrypted communication</span>
            {!isAdmin && <span className="flex items-center gap-1"><Exclamation size={12} color="currentColor" /> Replies go to admin, not seller</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Chat2 = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M3.5 5V4C3.5 2.61929 4.61929 1.5 6 1.5C7.38071 1.5 8.5 2.61929 8.5 4V5" stroke="#A1A1AA" strokeWidth="1.1" strokeLinecap="round" />
    <rect x="2.5" y="5" width="7" height="5.5" rx="1.5" stroke="#A1A1AA" strokeWidth="1.1" />
  </svg>
);

export default ChatSection;
