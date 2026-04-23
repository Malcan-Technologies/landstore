"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Drawer from "@mui/material/Drawer";
import ArrowDown from "@/components/svg/ArrowDown";
import Dashboard from "@/components/svg/Dashboard";
import Note from "@/components/svg/Note";
import Map from "@/components/svg/Map";
import Map2 from "@/components/svg/Map2";
import Monitor from "@/components/svg/Monitor";
import Chat from "@/components/svg/Chat";
import Persons from "@/components/svg/Persons";
import DoubleArrows from "@/components/svg/DoubleArrows";

const sidebarItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: Dashboard,
  },
  {
    label: "Map",
    href: "/admin/map",
    icon: Map2,
  },
  {
    label: "Review Listings",
    href: "/admin/review-listings",
    legacyHref: "/admin/review-lisitings",
    icon: Note,
  },
  {
    label: "Enquiry Hub",
    href: "/admin/enquiry-hub",
    icon: Chat,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Persons,
  },
  {
    label: "Admin Management",
    href: "/admin/admin-management",
    icon: Persons,
  },
  {
    label: "Homepage Content",
    href: "/admin/homepage-content",
    icon: Monitor,
  },
];

const SideBar = ({ mobileOpen = false, onClose = () => {} }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const displayName = user?.name || "shadcn";
  const displayEmail = user?.email || "m@example.com";
  const profileImageSrc =
    user?.profilePicture?.url ||
    user?.profilePicture?.fileUrl ||
    (typeof user?.profilePicture === "string" ? user.profilePicture : "") ||
    user?.profileMedia?.fileUrl ||
    user?.profileImage ||
    user?.image ||
    "/user.png";
  const resolvedProfileImageSrc =
    typeof profileImageSrc === "string" && profileImageSrc.trim() ? profileImageSrc : "/user.png";

  const isSidebarItemActive = (itemHref) => {
    if (!pathname) return false;

    if (itemHref === "/admin") {
      return pathname === "/admin";
    }

    return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
  };

  const isReviewListingsActive = () => {
    if (!pathname) return false;

    return (
      pathname === "/admin/review-listings" ||
      pathname.startsWith("/admin/review-listings/") ||
      pathname === "/admin/review-lisitings" ||
      pathname.startsWith("/admin/review-lisitings/")
    );
  };

  const handleNavigate = (href) => {
    router.push(href);
    onClose();
  };

  const mobileDrawerContent = (
    <div className="flex min-h-screen w-60.5 flex-col border-r border-[#E5E7EB] bg-white">
      <div className="flex h-17 items-center justify-between border-b border-[#E5E7EB] px-5">
        <button type="button" onClick={() => handleNavigate("/admin")} className="flex items-center gap-3">
          <div className="relative h-7 w-7">
            <Image src="/logo.png" alt="LandStore" fill sizes="28px" className="object-contain" priority />
          </div>
          <span className="text-[14px] font-semibold tracking-[-0.01em] text-green-logo">
            LandStore<span className="font-normal text-green-secondary">.my</span>
          </span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[26px] leading-none text-gray5 transition hover:bg-background-primary hover:text-gray2"
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      <div className="flex-1 px-4 py-4">
        <p className="px-3 text-[12px] font-medium text-[#3F3F46]">Platform</p>
        <nav className="mt-3 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === "Review Listings" ? isReviewListingsActive() : isSidebarItemActive(item.href);

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavigate(item.href)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition ${
                  isActive ? "bg-[#F3F4F6] font-medium text-[#111827]" : "text-[#3F3F46] hover:bg-[#F9FAFB]"
                }`}
              >
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  <Icon
                    size={16}
                    color={isActive ? "#111827" : "#3F3F46"}
                    className={item.label === "Enquiry Hub" ? "scale-[0.9]" : ""}
                  />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-4 py-4">
        <button type="button" className="flex w-full items-center gap-3 rounded-2xl bg-white text-left transition hover:bg-[#F9FAFB]" aria-label="Open user menu">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray1">
            <Image
              src={resolvedProfileImageSrc}
              alt="Admin profile"
              fill
              sizes="40px"
              className="object-cover"
              unoptimized
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold leading-none text-[#27272A]">{displayName}</span>
            <span className="mt-1 block truncate text-[14px] leading-none text-[#52525B]">{displayEmail}</span>
          </span>
          <span className="inline-flex h-5 w-5 items-center justify-center text-[#3F3F46]">
            <ArrowDown size={16} color="#3F3F46" className="-rotate-90" />
          </span>
        </button>
      </div>
    </div>
  );

  const renderNavItems = () => (
    <nav className="mt-3 space-y-1">
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.label === "Review Listings" ? isReviewListingsActive() : isSidebarItemActive(item.href);

        return (
          <button
            key={item.href}
            type="button"
            onClick={() => handleNavigate(item.href)}
            className={`flex w-full items-center rounded-xl text-left text-[15px] transition md:justify-center md:px-0 lg:justify-start lg:px-3 ${
              isActive ? "bg-[#F3F4F6] font-medium text-[#111827]" : "text-[#3F3F46] hover:bg-[#F9FAFB]"
            } px-3 py-2.5 gap-3`}
          >
            <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
              <Icon
                size={16}
                color={isActive ? "#111827" : "#3F3F46"}
                className={item.label === "Enquiry Hub" ? "scale-[0.9]" : ""}
              />
            </span>
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden min-h-screen w-22 shrink-0 border-r border-[#E5E7EB] bg-white md:flex md:flex-col lg:w-60.5">
        <div className="flex h-17 items-center border-b border-[#E5E7EB] px-5 lg:px-5 md:justify-center lg:justify-start">
          <button type="button" onClick={() => handleNavigate("/admin")} className="flex items-center gap-3">
            <div className="relative h-7 w-7 sm:h-8 sm:w-8">
              <Image src="/logo.png" alt="LandStore" fill sizes="32px" className="object-contain" priority />
            </div>
            <span className="hidden text-[14px] font-semibold tracking-[-0.01em] text-green-logo lg:inline sm:text-[15px]">
              LandStore<span className="font-normal text-green-secondary">.my</span>
            </span>
          </button>
        </div>

        <div className="flex-1 px-3 py-4 lg:px-4">
          <p className="hidden px-3 text-[12px] font-medium text-[#3F3F46] lg:block">Platform</p>
          {renderNavItems()}
        </div>

        <div className="px-2 py-3 lg:hidden">
          <button type="button" className="flex w-full items-center justify-center rounded-2xl bg-white text-left transition hover:bg-[#F9FAFB]" aria-label="Open user menu">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray1">
              <Image
                src={resolvedProfileImageSrc}
                alt="Admin profile"
                fill
                sizes="40px"
                className="object-cover"
                unoptimized
              />
            </span>
          </button>
        </div>

        <div className="hidden px-4 py-4 lg:block">
          <button type="button" className="flex w-full items-center gap-3 rounded-2xl bg-white text-left transition hover:bg-[#F9FAFB]" aria-label="Open user menu">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray1">
              <Image
                src={resolvedProfileImageSrc}
                alt="Admin profile"
                fill
                sizes="40px"
                className="object-cover"
                unoptimized
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold leading-none text-[#27272A]">{displayName}</span>
              <span className="mt-1 block truncate text-[14px] leading-none text-[#52525B]">{displayEmail}</span>
            </span>
            <span className="inline-flex h-5 w-5 items-center justify-center text-[#3F3F46]">
              <DoubleArrows size={16} color="#3F3F46" className="" />
            </span>
          </button>
        </div>
      </aside>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 242,
            maxWidth: "100%",
            boxSizing: "border-box",
            borderRight: "none",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            backgroundColor: "#ffffff",
          },
        }}
      >
        {mobileDrawerContent}
      </Drawer>
    </>
  );
};

export default SideBar;
