"use client";

import { useState } from "react";
import Image from "next/image";
import { Switch } from "@headlessui/react";
import Modal from "@/components/common/Modal";
import IdentityVerified from "@/components/svg/IdentityVerified";
import InputVerified from "@/components/svg/InputVerified";
import Person from "@/components/svg/Person";
import Lock from "@/components/svg/Lock";
import UserVerified from "@/components/svg/UserVerified";

const panelClassName =
  "w-full max-w-[980px] overflow-hidden rounded-[24px] bg-white px-6 py-6 text-left align-middle transition-all sm:px-7 sm:py-7";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[13px] text-[#6B7280] outline-none";

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <div>
      <p className="text-[13px] font-medium text-[#111827]">{label}</p>
      <p className="mt-1 text-[12px] leading-4 text-[#6B7280]">{description}</p>
    </div>
    <Switch
      checked={checked}
      onChange={onChange}
      className={`${checked ? "bg-green-primary" : "bg-[#D1D5DB]"} relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition`}
    >
      <span
        className={`${checked ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 rounded-full bg-white transition`}
      />
    </Switch>
  </div>
);

const InfoField = ({ label, value, rightIcon, prefix }) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-4">
    <div className="text-[12px] font-medium text-[#111827]">{label}</div>
    <div className="relative">
      <div className={`${inputClassName} flex items-center gap-2 pr-9`}>
        {prefix ? <span className="shrink-0 text-[12px] text-[#9CA3AF]">{prefix}</span> : null}
        <span className="truncate">{value}</span>
      </div>
      {rightIcon ? <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</span> : null}
    </div>
  </div>
);

export default function UserViewModal({ open, onClose, user }) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appAlerts, setAppAlerts] = useState(true);

  if (!user) {
    return null;
  }

  const entityLabel = user.entityType === "Corporate" ? "Corporate" : user.entityType;
  const registrationLabel = user.entityType === "Corporate" ? "Corporate" : "corporate";

  return (
    <Modal
      open={open}
      onClose={onClose}
      panelClassName={panelClassName}
      overlayClassName="bg-black/40"
      containerClassName="flex min-h-full items-center justify-center p-3 sm:p-6"
      closeButtonClassName="absolute right-5 top-5 text-[28px] leading-none text-[#9CA3AF] transition hover:text-[#6B7280]"
      showCloseButton
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB] sm:h-24 sm:w-24">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="96px" />
              ) : (
                <Person size={34} color="#9CA3AF" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 inline-flex items-center justify-center">
              <UserVerified size={29} />
            </span>
          </div>

          <div className="flex-1">
            <h2 className="text-[24px] font-semibold text-[#111827]">{user.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-medium text-[#1E9E57]">
                <IdentityVerified size={15} />
                <span className="font-medium">Identity Verified</span>
              </span>
              <span className="inline-flex rounded-full bg-[#111827] px-2.5 py-1 text-[11px] font-medium text-white">
                Member ID: {user.userId.replace("#", "")}
              </span>
            </div>
            <p className="mt-3 max-w-[520px] text-[14px] leading-6 text-[#6B7280]">
              Registered as a {registrationLabel} user. Access limited to verified land assets and mediated enquiries.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-[16px] font-semibold text-[#111827] border-b border-[#EEF2F6] pb-5">Contract details</h3>
          <div className="mt-4 space-y-3">
            <InfoField label="Email address" value={user.email} rightIcon={<InputVerified size={20} />} />
            <InfoField label="Phone number" value={user.phone} prefix="MY" rightIcon={<InputVerified size={20} />} />
          </div>
        </div>

        <div className="pt-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-5 border-[#EEF2F6]">
            <h3 className="text-[16px] font-semibold text-[#111827]">Entity information</h3>
            <span className="inline-flex items-center gap-1 text-[12px] text-[#9CA3AF]">
              <Lock size={14} color="#9CA3AF" />
              <span>Locked after verification</span>
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <InfoField label="Entity Type" value={entityLabel} />
            <InfoField label="Company Name" value={user.company} />
            <InfoField label="ID Number (SSM / IC)" value={user.identityNo} />
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-[16px] font-semibold text-[#111827] border-b border-[#EEF2F6] pb-5">Notification Preferences</h3>
          <div className="mt-2">
            <ToggleRow
              label="Email Notifications"
              description="Receive weekly market reports and listing updates via email"
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
            <ToggleRow
              label="In-App Alerts"
              description="Instant notifications for new enquiries and status changes"
              checked={appAlerts}
              onChange={setAppAlerts}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
