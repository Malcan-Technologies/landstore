"use client";

import { useMemo, useState } from "react";
import Table from "@/components/common/Table";
import UserViewModal from "@/components/adminDashboard/modals/UserViewModal";
import Search from "@/components/svg/Search";
import Person from "@/components/svg/Person";
import EyeOpen from "@/components/svg/EyeOpen";
import Envelop from "@/components/svg/Envelop";
import Telephone from "@/components/svg/Telephone";
import RoundX from "@/components/svg/RoundX";
import RoundArrow from "@/components/svg/RoundArrow";

const users = Array.from({ length: 8 }, (_, index) => ({
  id: `user-${index + 1}`,
  userId: `#U-${String(index + 123).padStart(3, "0")}`,
  entityType: ["Individual", "Corporate", "Koperasi"][index % 3],
  name: ["Dato' Ridzuan Shah", "Aina Sofea", "Koperasi Makmur Jaya"][index % 3],
  company: ["Ridzuan Holdings Sdn Bhd", "Individual Member", "Koperasi Makmur Jaya"][index % 3],
  email: "ridzuan.shah@estate.com",
  phone: "+60 (555) 000-0000",
  identityNo: ["202201012345", "900315-10-2048", "KPM-778812-A"][index % 3],
  status: index % 4 === 0 || index % 4 === 1 ? "Active" : "Suspended",
  actionVariant: index % 4 === 0 || index % 4 === 1 ? "deactivate" : "reactivate",
  preferences: {
    emailNotifications: true,
    appAlerts: true,
  },
}));

const statusStyles = {
  Active: "bg-[#EAFBF1] text-[#1E9E57]",
  Suspended: "bg-[#FFF1F2] text-[#EF4444]",
};

const actionButtonBase =
  "inline-flex h-8 w-8 items-center justify-center rounded-[6px] transition border-0";

export default function UsersPage() {
  const [selectedUserId, setSelectedUserId] = useState(null);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId]
  );

  const headers = [
    { label: "User ID" },
    { label: "Entity type" },
    { label: "Name/Company" },
    { label: "Email/Phone" },
    { label: "Identity No. (SSM/IC)" },
    { label: "Status" },
    { label: "Actions", className: "text-right", contentClassName: "text-right" },
  ];

  const rows = users.map((user) => ({
    key: user.id,
    cells: [
      {
        key: "user-id",
        content: <span className="text-[12px] font-medium text-[#111827]">{user.userId}</span>,
      },
      {
        key: "entity-type",
        content: <span className="text-[12px] font-medium text-[#111827]">{user.entityType}</span>,
      },
      {
        key: "name-company",
        content: (
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF]">
              <Person size={16} color="#9CA3AF" />
            </span>
            <div className="min-w-0 leading-4">
              <div className="truncate text-[12px] font-medium text-[#111827]">{user.name}</div>
              <div className="truncate text-[11px] text-gray5">{user.company}</div>
            </div>
          </div>
        ),
      },
      {
        key: "email-phone",
        content: (
          <div className="space-y-1 text-[11px] leading-4 sm:text-[12px]">
            <div className="flex items-center gap-1.5 text-[#111827]">
              <Envelop size={12} color="#298064" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#111827]">
              <Telephone size={12} color="#8B5CF6" />
              <span className="truncate">{user.phone}</span>
            </div>
          </div>
        ),
      },
      {
        key: "identity-no",
        content: <span className="text-[12px] font-medium text-[#111827]">{user.identityNo}</span>,
      },
      {
        key: "status",
        content: (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium leading-none ${statusStyles[user.status]}`}>
            {user.status}
          </span>
        ),
      },
      {
        key: "actions",
        content: (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedUserId(user.id)}
              className={`${actionButtonBase} bg-[#18181B] text-white`}
              aria-label="View user"
            >
              <EyeOpen size={14} color="#FFFFFF" />
            </button>
            {user.actionVariant === "deactivate" ? (
              <button
                type="button"
                className={`${actionButtonBase} bg-[#FFF1F2] text-[#EF4444]`}
                aria-label="Deactivate user"
              >
                <RoundX size={14} color="#EF4444" />
              </button>
            ) : (
              <button
                type="button"
                className={`${actionButtonBase} bg-[#ECFDF3] text-[#1E9E57]`}
                aria-label="Reactivate user"
              >
                <RoundArrow size={14} color="#1E9E57" />
              </button>
            )}
          </div>
        ),
        contentClassName: "flex justify-end",
      },
    ],
  }));

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-primary px-4 py-5 sm:px-5">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E9EDF5] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-semibold text-[#111827] sm:text-[22px]">Users Management</h1>
            <span className="inline-flex h-5 min-w-7 items-center justify-center rounded-full bg-[#EEF2FF] px-2 text-[12px] font-medium leading-none text-[#4338CA]">
              23 members
            </span>
          </div>

          <label className="flex h-8 w-full max-w-[180px] items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[#9CA3AF] sm:max-w-[180px]">
            <Search size={16} color="#111827" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full border-0 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            />
          </label>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-hidden sm:max-h-[calc(100vh-210px)] sm:overflow-y-auto no-scrollbar">
          <Table
            headers={headers}
            rows={rows}
            className="border-none shadow-none"
            tableClassName="min-w-[1120px]"
            headClassName="bg-white"
            rowClassName="hover:bg-[#FAFBFD]"
          />
        </div>

        <UserViewModal
          open={Boolean(selectedUser)}
          onClose={() => setSelectedUserId(null)}
          user={selectedUser}
        />
      </section>
    </main>
  );
}
