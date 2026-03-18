import { memo, useEffect, useMemo, useRef, useState } from "react";

import Button from "@/components/common/Button";
import Delete from "@/components/svg/Delete";
import Folder from "@/components/svg/Folder";
import Rename from "@/components/svg/Rename";

const FolderSection = memo(
  ({
    folders,
    activeFolderId,
    onFolderSelect,
    createFolderLabel,
    onCreateFolder,
    activeFolderMenuId,
    onFolderMenuToggle,
    onRenameFolder,
    renamingFolderId,
    onRenameFolderSave,
    onDeleteFolder,
  }) => {
  const orderedFolders = useMemo(() => {
    const mapFolder = (parentId = null, depth = 0) =>
      folders
        .filter((folder) => (folder.parentId ?? null) === parentId)
        .flatMap((folder) => [{ ...folder, depth }, ...mapFolder(folder.id, depth + 1)]);

    return mapFolder();
  }, [folders]);

  const inputRef = useRef(null);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    if (!renamingFolderId) {
      setDraftName("");
      return;
    }

    const folderBeingRenamed = folders.find((folder) => folder.id === renamingFolderId);

    if (folderBeingRenamed) {
      setDraftName(folderBeingRenamed.label);
    }
  }, [folders, renamingFolderId]);

  useEffect(() => {
    if (renamingFolderId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingFolderId]);

  const handleRenameSubmit = (folderId) => {
    onRenameFolderSave?.(folderId, draftName);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {orderedFolders.map((folder) => {
          const active = folder.id === activeFolderId;
          const menuOpen = activeFolderMenuId === folder.id;
          const isRenaming = renamingFolderId === folder.id;
          return (
            <div key={folder.id} className="relative">
              <div
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 transition ${
                  active ? "border-gray2 bg-gray2 text-white" : "border-border-input bg-white text-gray7"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isRenaming) {
                      onFolderSelect?.(folder.id);
                    }
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  style={{ paddingLeft: `${folder.depth * 16}px` }}
                >
                  <Folder size={18} color={active ? "white" : "currentColor"} className={active ? "text-white" : "text-gray7"} />
                  {isRenaming ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      onBlur={() => handleRenameSubmit(folder.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleRenameSubmit(folder.id);
                        }
                      }}
                      className={`h-8 w-full rounded-md border px-2 text-[14px] font-medium outline-none ${
                        active
                          ? "border-white/30 bg-white text-gray2 placeholder:text-gray5"
                          : "border-border-input bg-white text-gray2 placeholder:text-gray5"
                      }`}
                    />
                  ) : (
                    <span className="truncate text-[14px] font-medium">{folder.label}</span>
                  )}
                </button>
                <div className="ml-2 flex shrink-0 items-center gap-2">
                  {typeof folder.count === "number" ? (
                    <span
                      className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                        active ? "bg-white/15 text-white" : "bg-background-primary text-gray5"
                      }`}
                    >
                      {folder.count}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onFolderMenuToggle?.(folder.id)}
                    disabled={isRenaming}
                    className={`text-lg leading-none ${active ? "text-white" : "text-gray5"}`}
                    aria-label={`Open actions for ${folder.label}`}
                  >
                    ⋮
                  </button>
                </div>
              </div>

              {menuOpen ? (
                <div className="absolute right-8 top-[calc(100%-10px)] z-20 w-60 rounded-xl border border-border-input bg-white p-2 shadow-[0px_14px_30px_rgba(15,61,46,0.12)]">
                  <button
                    type="button"
                    onClick={() => onRenameFolder?.(folder)}
                    className="flex h-6 w-full items-center gap-3 rounded-md px-4 text-[15px] font-medium text-gray2 transition hover:bg-background-primary"
                  >
                    <Rename />
                    <span>Rename folder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteFolder?.(folder)}
                    className="mt-2.5 flex h-6 w-full items-center gap-3 rounded-md px-4 text-[15px] text-gray2 font-medium hover:text-red-500 transition hover:bg-red-200/50"
                  >
                    <Delete size={20} className=" " />
                    <span>Delete folder</span>
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {onCreateFolder ? (
        <Button
          type="button"
          onClick={onCreateFolder}
          className="w-full justify-center rounded-lg text-[14px] font-medium"
          label={createFolderLabel}
        >
          <span className="text-base leading-none">+</span>
        </Button>
      ) : null}
    </div>
  );
});

export default FolderSection;
