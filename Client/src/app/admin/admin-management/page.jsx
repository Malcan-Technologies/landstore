"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Loading from "@/components/common/Loading";
import Table from "@/components/common/Table";
import UserViewModal from "@/components/adminDashboard/modals/UserViewModal";
import Search from "@/components/svg/Search";
import Person from "@/components/svg/Person";
import EyeOpen from "@/components/svg/EyeOpen";
import Envelop from "@/components/svg/Envelop";
import RoundX from "@/components/svg/RoundX";
import RoundArrow from "@/components/svg/RoundArrow";
import Edit from "@/components/svg/Edit";
import Plus from "@/components/svg/Plus";
import Button from "@/components/common/Button";
import DeleteAdminModal from "@/components/adminDashboard/modals/DeleteAdminModal";
import CreateAdminModal from "@/components/adminDashboard/modals/CreateAdminModal";
import EditAdminModal from "@/components/adminDashboard/modals/EditAdminModal";
import Delete from "@/components/svg/Delete";
import { adminService } from "@/services/adminService";

const mapApiAdminToTableUser = (user) => {
  const rawId = String(user?.id || user?.email || "");
  const status = user?.status === "active" ? "Active" : user?.status === "inactive" ? "Inactive" : "Suspended";

  return {
    id: rawId,
    userId: rawId ? `#${rawId.slice(0, 8).toUpperCase()}` : "-",
    name: user?.name || "-",
    email: user?.email || "-",
    phone: user?.phone || "-",
    firstName: user?.firstName || "-",
    lastName: user?.lastName || "-",
    status,
    actionVariant: status === "Active" ? "deactivate" : "reactivate",
    avatar: user?.image || null,
  };
};

const statusStyles = {
  Active: "bg-[#EAFBF1] text-[#1E9E57]",
  Suspended: "bg-[#FFF1F2] text-[#EF4444]",
};

const normalizeAdminStatusSearch = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (["active", "inactive", "suspended"].includes(normalized)) {
    return normalized;
  }

  return undefined;
};

const actionButtonBase = "inline-flex h-8 w-8 items-center justify-center rounded-[6px] transition border-0";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const openDeleteModal = (user) => {
    setDeleteTarget(user);
    setDeleteError("");
  };
  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteError("");
  };
  const openEditModal = (user) => setEditTarget(user);
  const closeEditModal = () => setEditTarget(null);

  const loadAdmins = useCallback(async (rawSearch = "") => {
    try {
      setIsLoading(true);
      setError("");
      const query = rawSearch.trim();
      const matchedStatus = normalizeAdminStatusSearch(query);
      const response = await adminService.getAdmins({
        ...(matchedStatus ? { status: matchedStatus } : {}),
        ...(!matchedStatus && query ? { search: query } : {}),
      });
      const items = Array.isArray(response?.admins) ? response.admins : Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setAdmins(items.map(mapApiAdminToTableUser));
    } catch (err) {
      setError(err?.message || "Failed to load admins");
      setAdmins([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadAdmins(searchValue);
    }, searchValue.trim() ? 300 : 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadAdmins, searchValue]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      await adminService.deleteAdmin(deleteTarget.id);
      await loadAdmins(searchValue);
      if (selectedUserId === deleteTarget.id) {
        setSelectedUserId(null);
      }
      closeDeleteModal();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete admin";
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateAdmin = async (payload) => {
    try {
      await adminService.createAdmin(payload);
      await loadAdmins(searchValue);
      setIsCreateOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateAdmin = async (payload) => {
    if (!editTarget) return;
    try {
      await adminService.updateAdmin(editTarget.id, payload);
      await loadAdmins(searchValue);
      closeEditModal();
    } catch (err) {
      throw err;
    }
  };

  const selectedUser = useMemo(() => admins.find((u) => u.id === selectedUserId) ?? null, [selectedUserId, admins]);

  const headers = [
    { label: "Name" },
    { label: "Email" },
    { label: "Status" },
    { label: "Actions", className: "text-right", contentClassName: "text-right" },
  ];

  const rows = admins.map((user) => ({
    key: user.id,
    cells: [
      {
        key: "name",
        content: (
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF]">
              <Person size={16} color="#9CA3AF" />
            </span>
            <div className="min-w-0 leading-4">
              <div className="truncate font-medium text-[#111827]">{user.name}</div>
              <div className="truncate text-gray5">Admin Account</div>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        content: (
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
        ),
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
              aria-label="View admin"
            >
              <EyeOpen size={14} color="#FFFFFF" />
            </button>

            <button
              type="button"
              onClick={() => openEditModal(user)}
              className={`${actionButtonBase} bg-white text-[#6B7280] border border-[#E5E7EB]`}
              aria-label="Edit admin"
            >
              <Edit size={14} color="#6B7280" />
            </button>

            <button
              type="button"
              onClick={() => openDeleteModal(user)}
              className={`${actionButtonBase} inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FFF1F2] text-[#EF4444]`}
              aria-label="Delete admin"
            >
              <Delete size={14} color="#EF4444" />
            </button>

            {user.actionVariant === "deactivate" ? (
              <button type="button" className={`${actionButtonBase} bg-[#FFF1F2] text-[#EF4444]`} aria-label="Deactivate admin">
                <RoundX size={14} color="#EF4444" />
              </button>
            ) : (
              <button type="button" className={`${actionButtonBase} bg-[#ECFDF3] text-[#1E9E57]`} aria-label="Reactivate admin">
                <RoundArrow size={14} color="#1E9E57" />
              </button>
            )}
          </div>
        ),
        contentClassName: "flex justify-end",
      },
    ],
  }));

  if (isLoading && admins.length === 0) return <Loading />;

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-primary px-4 py-5 sm:px-5">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E9EDF5] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="whitespace-nowrap text-[18px] font-semibold text-[#111827] sm:text-[22px]">Admin Management</h1>
            <span className="inline-flex whitespace-nowrap h-5 min-w-7 items-center justify-center rounded-full bg-[#EEF2FF] px-2 text-[12px] font-medium leading-none text-[#4338CA]">
              {admins.length} members
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex h-8 sm:h-10 w-full max-w-45 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[#9CA3AF] sm:max-w-45">
              <Search size={16} color="#111827" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full border-0 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              />
            </label>

            <Button
              onClick={() => setIsCreateOpen(true)}
              className="group sm:h-10 h-8 justify-center gap-0 rounded-md px-4! sm:gap-2 lg:px-4!"
            >
              <span className="flex  items-center justify-center bg-green-primary group-hover:bg-green-secondary transition-colors rounded text-white">
                <Plus size={14} color="white" aria-hidden />
              </span>
              <span className="hidden md:inline whitespace-nowrap">Add admin</span>
            </Button>
          </div>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-hidden sm:max-h-[calc(100vh-210px)] sm:overflow-y-auto no-scrollbar">
          <Table
            headers={headers}
            rows={rows}
            className="border-none shadow-none"
            tableClassName="min-w-[760px]"
            headClassName="bg-white"
            rowClassName="hover:bg-[#FAFBFD]"
          />
        </div>

        <UserViewModal open={Boolean(selectedUser)} onClose={() => setSelectedUserId(null)} user={selectedUser} />
        <DeleteAdminModal
          open={Boolean(deleteTarget)}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
          target={deleteTarget}
          isLoading={isDeleting}
          error={deleteError}
        />
        <CreateAdminModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          isLoading={isCreating}
          onCreate={async (payload) => {
            setIsCreating(true);
            try {
              await handleCreateAdmin(payload);
            } finally {
              setIsCreating(false);
            }
          }}
        />
        <EditAdminModal
          open={Boolean(editTarget)}
          onClose={closeEditModal}
          isLoading={isUpdating}
          admin={editTarget}
          onUpdate={async (payload) => {
            setIsUpdating(true);
            try {
              await handleUpdateAdmin(payload);
            } finally {
              setIsUpdating(false);
            }
          }}
        />
      </section>
    </main>
  );
}
