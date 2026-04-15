"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import ChooseFolder from "@/components/userDashboard/explore/ChooseFolder";
import CreateFolder from "@/components/userDashboard/explore/createFolder";
import DeleteFolderModal from "@/components/userDashboard/explore/DeleteFolderModal";
import FilterPanel from "@/components/userDashboard/explore/FilterPanel";
import PropertyCard from "@/components/userDashboard/explore/PropertyCard";
import Funnel from "@/components/svg/Funnel";
import { folderService } from "@/services/folderService";

const initialShortlistFolders = [
  { id: "saved", label: "Saved", count: 3 },
  { id: "investment-ideas", label: "Investment ideas", count: 3 },
  { id: "johor-potentials", label: "Johor Potentials", count: 3 },
];

const fallbackListingImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80";

const formatPrice = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "RM 0";

  return `RM ${numericValue.toLocaleString("en-US")}`;
};

const formatArea = (landArea, landAreaUnit) => {
  const numericValue = Number(landArea);
  const area = Number.isFinite(numericValue) ? numericValue.toLocaleString("en-US") : String(landArea || "-");
  const unit = landAreaUnit ? ` ${landAreaUnit}` : "";
  return `${area}${unit}`;
};

/*
const shortlistedProperties = [
  {
    id: "LS-000128",
    status: "Active",
    statusColor: "var(--color-green-secondary)",
    image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80",
    category: "Agriculture",
    area: "5.2 Acres",
    code: "LS - 000128",
    title: "Palm Valley Agricultural Land",
    dealTags: ["Buy", "Financing", "JV"],
    extraDealsLabel: "+2 more",
    price: "RM 850k",
    valuation: "RM1000/sqft",
    folderId: "saved",
  },
  {
    id: "LS-000129",
    status: "Active",
    statusColor: "var(--color-green-secondary)",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    category: "Agriculture",
    area: "5.2 Acres",
    code: "LS - 000128",
    title: "Palm Valley Agricultural Land",
    dealTags: ["Buy", "Financing", "JV"],
    extraDealsLabel: "+2 more",
    price: "RM 850k",
    valuation: "RM1000/sqft",
    folderId: "saved",
  },
  {
    id: "LS-000130",
    status: "Active",
    statusColor: "var(--color-green-secondary)",
    image: "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=1200&q=80",
    category: "Agriculture",
    area: "5.2 Acres",
    code: "LS - 000128",
    title: "Palm Valley Agricultural Land",
    dealTags: ["Buy", "Financing", "JV"],
    extraDealsLabel: "+2 more",
    price: "RM 850k",
    valuation: "RM1000/sqft",
    folderId: "saved",
  },
  {
    id: "LS-000131",
    status: "Active",
    statusColor: "var(--color-green-secondary)",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    category: "Agriculture",
    area: "5.2 Acres",
    code: "LS - 000128",
    title: "Palm Valley Agricultural Land",
    dealTags: ["Buy", "Financing", "JV"],
    extraDealsLabel: "+2 more",
    price: "RM 850k",
    valuation: "RM1000/sqft",
    folderId: "investment-ideas",
  },
  {
    id: "LS-000132",
    status: "Active",
    statusColor: "var(--color-green-secondary)",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    category: "Agriculture",
    area: "5.2 Acres",
    code: "LS - 000128",
    title: "Palm Valley Agricultural Land",
    dealTags: ["Buy", "Financing", "JV"],
    extraDealsLabel: "+2 more",
    price: "RM 850k",
    valuation: "RM1000/sqft",
    folderId: "investment-ideas",
  },
  {
    id: "LS-000133",
    status: "Active",
    statusColor: "var(--color-green-secondary)",
    image: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
    category: "Agriculture",
    area: "5.2 Acres",
    code: "LS - 000128",
    title: "Palm Valley Agricultural Land",
    dealTags: ["Buy", "Financing", "JV"],
    extraDealsLabel: "+2 more",
    price: "RM 850k",
    valuation: "RM1000/sqft",
    folderId: "johor-potentials",
  },
  {
    id: "LS-000141",
    status: "Active",
    statusColor: "var(--color-green-secondary)",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    category: "Agriculture",
    area: "5.2 Acres",
    code: "LS - 000128",
    title: "Palm Valley Agricultural Land",
    dealTags: ["Buy", "Financing", "JV"],
    extraDealsLabel: "+2 more",
    price: "RM 850k",
    valuation: "RM1000/sqft",
    folderId: "investment-ideas",
  },
  {
    id: "LS-000142",
    status: "Active",
    statusColor: "var(--color-green-secondary)",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    category: "Agriculture",
    area: "5.2 Acres",
    code: "LS - 000128",
    title: "Palm Valley Agricultural Land",
    dealTags: ["Buy", "Financing", "JV"],
    extraDealsLabel: "+2 more",
    price: "RM 850k",
    valuation: "RM1000/sqft",
    folderId: "investment-ideas",
  },
  {
    id: "LS-000153",
    status: "Active",
    statusColor: "var(--color-green-secondary)",
    image: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
    category: "Agriculture",
    area: "5.2 Acres",
    code: "LS - 000128",
    title: "Palm Valley Agricultural Land",
    dealTags: ["Buy", "Financing", "JV"],
    extraDealsLabel: "+2 more",
    price: "RM 850k",
    valuation: "RM1000/sqft",
    folderId: "johor-potentials",
  },
];
*/

const shortlistedProperties = [];

const ShortlistsPage = () => {
  const [folders, setFolders] = useState(initialShortlistFolders);
  const [properties, setProperties] = useState(shortlistedProperties);
  const [activeFolderId, setActiveFolderId] = useState(initialShortlistFolders[0].id);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [chooseFolderOpen, setChooseFolderOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [pendingFolderName, setPendingFolderName] = useState("");
  const [selectedParentFolderId, setSelectedParentFolderId] = useState(null);
  const [activeFolderMenuId, setActiveFolderMenuId] = useState(null);
  const [renamingFolderId, setRenamingFolderId] = useState(null);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const filterMenuRef = useRef(null);

  const isLikelyUuid = (value) =>
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  useEffect(() => {
    let mounted = true;

    const normalizeFolders = (payload) => {
      const items = Array.isArray(payload) ? payload : payload?.data;
      if (!Array.isArray(items)) {
        return [];
      }

      return items
        .map((folder) => {
          const id = folder?.id ?? folder?._id;
          const label = folder?.label ?? folder?.name;
          if (!id || !label) {
            return null;
          }

          const count = typeof folder?.count === "number" ? folder.count : folder?.propertiesCount;
          const parentId = folder?.parentId ?? folder?.parentFolderId ?? null;

          return {
            id,
            label,
            count: typeof count === "number" ? count : 0,
            parentId,
          };
        })
        .filter(Boolean);
    };

    const normalizeProperties = (payload) => {
      const items = Array.isArray(payload) ? payload : payload?.data;
      if (!Array.isArray(items)) {
        return [];
      }

      return items.flatMap((folder) => {
        const folderId = folder?.id ?? folder?._id;
        const folderProperties = Array.isArray(folder?.properties) ? folder.properties : [];

        return folderProperties
          .map((entry) => {
            const property = entry?.property;
            const propertyId = property?.id ?? entry?.propertyId;

            if (!folderId || !propertyId) {
              return null;
            }

            return {
              id: propertyId,
              status: "Active",
              statusColor: "var(--color-green-secondary)",
              image: fallbackListingImage,
              category: property?.category?.name || "-",
              area: formatArea(property?.landArea, property?.landAreaUnit),
              code: property?.listingCode || "-",
              title: property?.title || "Land listing",
              dealTags: [],
              price: formatPrice(property?.price),
              valuation: property?.pricePerSqrft
                ? `RM ${Number(property.pricePerSqrft).toLocaleString("en-US")}/sqft`
                : "-",
              folderId,
            };
          })
          .filter(Boolean);
      });
    };

    (async () => {
      try {
        const response = await folderService.getFolders();
        const normalized = normalizeFolders(response);
        const normalizedProperties = normalizeProperties(response);

        if (mounted) {
          setProperties(normalizedProperties);
        }

        if (!mounted || normalized.length === 0) {
          if (mounted) {
            setFolders([]);
            setActiveFolderId(null);
          }
          return;
        }

        setFolders(normalized);
        setActiveFolderId((prev) => (normalized.some((folder) => folder.id === prev) ? prev : normalized[0].id));
      } catch (_error) {
        if (!mounted) {
          return;
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isFilterMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isFilterMenuOpen]);

  const handleCreateFolder = (folderName) => {
    setPendingFolderName(folderName);
    setSelectedParentFolderId(null);
    setCreateFolderOpen(false);
    setChooseFolderOpen(true);
  };

  const handleCloseCreateFlow = () => {
    setCreateFolderOpen(false);
    setChooseFolderOpen(false);
    setPendingFolderName("");
    setSelectedParentFolderId(null);
  };

  const handleFolderMenuToggle = (folderId) => {
    setActiveFolderMenuId((prev) => (prev === folderId ? null : folderId));
  };

  const handleDeleteFolderClick = (folder) => {
    setActiveFolderMenuId(null);
    setRenamingFolderId(null);
    setFolderToDelete(folder);
  };

  const handleRenameFolderClick = (folder) => {
    setActiveFolderMenuId(null);
    setRenamingFolderId(folder.id);
    setActiveFolderId(folder.id);
  };

  const handleRenameFolderSave = async (folderId, label) => {
    const trimmedLabel = label.trim();

    if (!trimmedLabel) {
      setRenamingFolderId(null);
      return;
    }

    try {
      if (isLikelyUuid(folderId)) {
        await folderService.renameFolder(folderId, { name: trimmedLabel });
      }

      setFolders((prev) => prev.map((folder) => (folder.id === folderId ? { ...folder, label: trimmedLabel } : folder)));
    } finally {
      setRenamingFolderId(null);
    }
  };

  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete) {
      return;
    }

    const collectFolderIds = (parentId) => {
      const childIds = folders.filter((folder) => folder.parentId === parentId).map((folder) => folder.id);
      return [parentId, ...childIds.flatMap((childId) => collectFolderIds(childId))];
    };

    const folderIdsToDelete = new Set(collectFolderIds(folderToDelete.id));
    const remainingFolders = folders.filter((folder) => !folderIdsToDelete.has(folder.id));

    setFolders(remainingFolders);
    setFolderToDelete(null);

    if (folderIdsToDelete.has(activeFolderId)) {
      setActiveFolderId(remainingFolders[0]?.id ?? null);
    }

    const idsToDeleteOnServer = Array.from(folderIdsToDelete).filter((id) => isLikelyUuid(id));
    await Promise.allSettled(idsToDeleteOnServer.map((id) => folderService.deleteFolder(id)));
  };

  const handleBackToCreateFolder = () => {
    setChooseFolderOpen(false);
    setCreateFolderOpen(true);
  };

  const handleConfirmFolderCreation = async () => {
    const folderName = pendingFolderName.trim();

    if (!folderName) {
      return;
    }

    const folderId = folderName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existingFolder = folders.find(
      (folder) =>
        folder.id === folderId && (folder.parentId ?? null) === (selectedParentFolderId ?? null)
          || folder.label.toLowerCase() === folderName.toLowerCase() && (folder.parentId ?? null) === (selectedParentFolderId ?? null)
    );

    if (existingFolder) {
      setActiveFolderId(existingFolder.id);
      handleCloseCreateFlow();
      return;
    }

    const newFolder = {
      id: `${folderId || "folder"}-${Date.now()}`,
      label: folderName,
      count: 0,
      parentId: selectedParentFolderId ?? null,
    };

    try {
      const created = await folderService.createFolder({ name: folderName });
      const createdId = created?.data?.id ?? created?.id ?? created?._id;

      const folderToAdd = {
        ...newFolder,
        id: createdId || newFolder.id,
      };

      setFolders((prev) => [...prev, folderToAdd]);
      setActiveFolderId(folderToAdd.id);
    } catch (_error) {
      setFolders((prev) => [...prev, newFolder]);
      setActiveFolderId(newFolder.id);
    } finally {
      handleCloseCreateFlow();
    }
  };

  const visibleProperties = useMemo(
    () => properties.filter((property) => property.folderId === activeFolderId),
    [activeFolderId, properties]
  );

  return (
    <main className="bg-background-primary py-12">
      <div className="sm:px-8 px-2">
        <div className="flex items-center justify-between">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold tracking-tight text-gray2 sm:text-[28px] md:text-[32px]">My Shortlists</h1>
            <p className="mt-1 lg:text-[18px] md:text-[16px] text-[12px] text-gray5">Manage your saved land options</p>
          </div>
          <div ref={filterMenuRef} className="relative mb-6 lg:hidden">
            <button
              type="button"
              onClick={() => setIsFilterMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 sm:gap-1.5 md:gap-2 rounded-lg border border-border-card bg-white px-2 py-2 sm:px-2.5 sm:py-1.5 md:px-3 md:py-1.5 text-xs sm:text-sm md:text-base transition-colors hover:bg-gray1"
            >
              <Funnel className="w-4 h-4 md:w-5 md:h-5" />
              <span>Filter</span>
            </button>

            {isFilterMenuOpen ? (
              <div className="absolute right-0 top-12 z-40 flex max-h-[calc(100vh-14rem)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-xl bg-white shadow-lg">
                <FilterPanel
                  showFilters={false}
                  variant="modal"
                  folders={folders}
                  activeFolderId={activeFolderId}
                  onFolderSelect={setActiveFolderId}
                  createFolderLabel="Create new folder"
                  onCreateFolder={() => {
                    setIsFilterMenuOpen(false);
                    setCreateFolderOpen(true);
                  }}
                  activeFolderMenuId={activeFolderMenuId}
                  onFolderMenuToggle={handleFolderMenuToggle}
                  onRenameFolder={handleRenameFolderClick}
                  renamingFolderId={renamingFolderId}
                  onRenameFolderSave={handleRenameFolderSave}
                  onDeleteFolder={handleDeleteFolderClick}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-auto shrink-0 hidden lg:block">
            <FilterPanel
              showFilters={false}
              folders={folders}
              activeFolderId={activeFolderId}
              onFolderSelect={setActiveFolderId}
              createFolderLabel="Create new folder"
              onCreateFolder={() => setCreateFolderOpen(true)}
              activeFolderMenuId={activeFolderMenuId}
              onFolderMenuToggle={handleFolderMenuToggle}
              onRenameFolder={handleRenameFolderClick}
              renamingFolderId={renamingFolderId}
              onRenameFolderSave={handleRenameFolderSave}
              onDeleteFolder={handleDeleteFolderClick}
            />
          </div>

          <section className="flex h-[calc(100vh-8rem)] min-h-0 flex-1 flex-col">
            <div
              className="grid min-h-0 content-start items-start grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              {visibleProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  land={property}
                  className="w-full"
                  // showMenuButton
                />
              ))}
            </div>
          </section>
        </div>

        <CreateFolder
          open={createFolderOpen}
          onClose={handleCloseCreateFlow}
          onSubmit={handleCreateFolder}
        />
        <ChooseFolder
          open={chooseFolderOpen}
          onClose={handleCloseCreateFlow}
          folders={folders}
          selectedFolderId={selectedParentFolderId}
          onSelect={setSelectedParentFolderId}
          onBack={handleBackToCreateFolder}
          onConfirm={handleConfirmFolderCreation}
        />
        <DeleteFolderModal
          open={Boolean(folderToDelete)}
          onClose={() => setFolderToDelete(null)}
          onConfirm={handleConfirmDeleteFolder}
        />
      </div>
    </main>
  );
};

export default ShortlistsPage;
