"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Loading from "@/components/common/Loading";
import Table from "@/components/common/Table";
import UserViewModal from "@/components/adminDashboard/modals/UserViewModal";
import Search from "@/components/svg/Search";
import Person from "@/components/svg/Person";
import EyeOpen from "@/components/svg/EyeOpen";
import Envelop from "@/components/svg/Envelop";
import Telephone from "@/components/svg/Telephone";
import RoundX from "@/components/svg/RoundX";
import RoundArrow from "@/components/svg/RoundArrow";
import { userService } from "@/services/userService";

const PAGE_LIMIT = 5;

const extractUsers = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response)) return response;
  return [];
};

const extractPagination = (response) => {
  if (response?.pagination) return response.pagination;
  if (response?.data?.pagination) return response.data.pagination;
  return null;
};

const toTitleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const mapApiUserToTableUser = (user) => {
  const rawId = String(user?.id || user?.email || "");
  const status = user?.emailVerified ? "Active" : "Suspended";

  return {
    id: rawId,
    userId: rawId ? `#${rawId.slice(0, 8).toUpperCase()}` : "-",
    entityType: toTitleCase(user?.userType || "user"),
    name: user?.name || "-",
    company: user?.userType === "admin" ? "Admin Account" : "Individual Member",
    email: user?.email || "-",
    phone: user?.phone || "-",
    identityNo: user?.identityNo || user?.registrationNo || "-",
    status,
    actionVariant: status === "Active" ? "deactivate" : "reactivate",
    avatar: user?.image || null,
    preferences: {
      emailNotifications: user?.notificationPrefs?.emailEnabled ?? false,
      appAlerts: user?.notificationPrefs?.pushEnabled ?? false,
    },
  };
};

const mergeUniqueUsers = (previousUsers, nextUsers) => {
  const merged = new Map(previousUsers.map((item) => [item.id, item]));

  nextUsers.forEach((item) => {
    if (!merged.has(item.id)) {
      merged.set(item.id, item);
    }
  });

  return Array.from(merged.values());
};

const statusStyles = {
  Active: "bg-[#EAFBF1] text-[#1E9E57]",
  Suspended: "bg-[#FFF1F2] text-[#EF4444]",
};

const actionButtonBase =
  "inline-flex h-8 w-8 items-center justify-center rounded-[6px] transition border-0";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const sentinelRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const fetchUsersPage = useCallback(async (page, rawSearch = "") => {
    const query = rawSearch.trim();
    const response = await userService.getAllUsers({
      page,
      limit: PAGE_LIMIT,
      ...(query ? { search: query } : {}),
    });
    const items = extractUsers(response).map(mapApiUserToTableUser);
    const pagination = extractPagination(response);
    return { items, pagination };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialPage = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        setCurrentPage(1);
        setHasMore(true);

        const { items, pagination } = await fetchUsersPage(1, searchValue);
        if (!isMounted) {
          return;
        }

        setUsers(items);

        const total = Number(pagination?.total);
        setTotalUsers(Number.isFinite(total) ? total : items.length);

        const totalPages = Number(pagination?.totalPages);
        setHasMore(Number.isFinite(totalPages) ? 1 < totalPages : items.length >= PAGE_LIMIT);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setUsers([]);
        setTotalUsers(0);
        setHasMore(false);
        setLoadError(error?.message || "Failed to load users.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const timeoutId = window.setTimeout(() => {
      loadInitialPage();
    }, searchValue.trim() ? 300 : 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [fetchUsersPage, searchValue]);

  useEffect(() => {
    if (isLoading || isFetchingMore || !hasMore) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        const nextPage = currentPage + 1;
        setIsFetchingMore(true);

        try {
          const { items, pagination } = await fetchUsersPage(nextPage, searchValue);
          setUsers((previous) => mergeUniqueUsers(previous, items));
          setCurrentPage(nextPage);

          const total = Number(pagination?.total);
          if (Number.isFinite(total)) {
            setTotalUsers(total);
          }

          const totalPages = Number(pagination?.totalPages);
          setHasMore(Number.isFinite(totalPages) ? nextPage < totalPages : items.length >= PAGE_LIMIT);
        } catch {
          setHasMore(false);
        } finally {
          setIsFetchingMore(false);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [currentPage, fetchUsersPage, hasMore, isFetchingMore, isLoading, searchValue]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
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
        content: <span className="font-medium text-[#111827]">{user.userId}</span>,
      },
      {
        key: "entity-type",
        content: <span className="font-medium text-[#111827]">{user.entityType}</span>,
      },
      {
        key: "name-company",
        content: (
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF]">
              <Person size={16} color="#9CA3AF" />
            </span>
            <div className="min-w-0 leading-4">
              <div className="truncate font-medium text-[#111827]">{user.name}</div>
              <div className="truncate text-gray5">{user.company}</div>
            </div>
          </div>
        ),
      },
      {
        key: "email-phone",
        content: (
          <div className="space-y-1 leading-4">
            <div className="flex items-center gap-1.5 text-[#111827]">
              <Envelop size={12} color="#298064" />
              {user.email !== "-" ? (
                <a href={`mailto:${user.email}`} className="truncate hover:underline">
                  {user.email}
                </a>
              ) : (
                <span className="truncate">{user.email}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[#111827]">
              <Telephone size={12} color="#8B5CF6" />
              {user.phone !== "-" ? (
                <a href={`tel:${user.phone}`} className="truncate hover:underline">
                  {user.phone}
                </a>
              ) : (
                <span className="truncate">{user.phone}</span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "identity-no",
        content: <span className="font-medium text-[#111827]">{user.identityNo}</span>,
      },
      {
        key: "status",
        content: (
          <span className={`inline-flex items-center rounded-full px-3 py-1 font-medium leading-none ${statusStyles[user.status] || statusStyles.Suspended}`}>
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

  if (isLoading && users.length === 0) {
    return <Loading />;
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-primary px-4 py-5 sm:px-5">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E9EDF5] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-semibold text-[#111827] sm:text-[22px]">Users Management</h1>
            <span className="inline-flex h-5 min-w-7 items-center justify-center rounded-full bg-[#EEF2FF] px-2 text-[12px] font-medium leading-none text-[#4338CA]">
              {totalUsers || users.length} members
            </span>
          </div>

          <label className="flex h-8 w-full max-w-45 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[#9CA3AF] sm:max-w-45">
            <Search size={16} color="#111827" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full border-0 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            />
          </label>
        </div>

        <div ref={scrollContainerRef} className="mt-4 min-h-0 flex-1 overflow-hidden sm:max-h-[calc(100vh-210px)] sm:overflow-y-auto no-scrollbar">
          {loadError ? (
            <div className="rounded-xl border border-[#FFE0E0] bg-[#FFF1F2] px-4 py-3 text-[14px] text-[#B42318]">
              {loadError}
            </div>
          ) : null}

          {!loadError ? (
            <>
              <Table
                headers={headers}
                rows={rows}
                className="border-none shadow-none"
                tableClassName="min-w-[1120px]"
                headClassName="bg-white"
                rowClassName="hover:bg-[#FAFBFD]"
              />
              <div ref={sentinelRef} className="h-px" />
              {isFetchingMore ? (
                <div className="flex py-4 items-center justify-center">
                  <span className="h-6 w-6 animate-spin rounded-full border-4 border-border-card border-t-green-secondary" />
                </div>
              ) : null}
            </>
          ) : null}
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
