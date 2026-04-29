"use client";

import Image from "next/image";
import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { isRecentlyToasted, markAsToasted } from "@/utils/toastDedup";
import Bell from "@/components/svg/Bell";
import ArrowDown from "@/components/svg/ArrowDown";
import DoubleArrows from "@/components/svg/DoubleArrows";
import Search from "@/components/svg/Search";
import ThreeBars from "@/components/svg/ThreeBars";
import Button from "@/components/common/Button";
import LoginModal from "@/components/auth/LoginModal";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import NotificationPopup from "@/components/userDashboard/notifications/NotificationPopup";
import { resetSocketConnection, SOCKET_EVENTS, onSocketEvent, offSocketEvent } from "@/services/socketService";
import { logoutUser } from "@/store/authSlice";
import { getStoredUser } from "@/utils/auth";
import { showToast } from "@/utils/toastStore";

const ADMIN_AUTH_STORAGE_KEY = "landstore_admin_auth";

const adminPageTitles = [
  { href: "/admin/homepage-content", label: "Homepage Content" },
  { href: "/admin/admin-management", label: "Admin Management" },
  { href: "/admin/review-listings", label: "Review Listings" },
  { href: "/admin/review-lisitings", label: "Review Listings" },
  { href: "/admin/enquiry-hub", label: "Enquiry Hub" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/map", label: "Map" },
  { href: "/admin", label: "Dashboard" },
];

const getAdminPageTitle = (pathname) => {
  if (!pathname) {
    return "Dashboard";
  }

  const matchedItem = adminPageTitles.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
  return matchedItem?.label || "Dashboard";
};

const AdminSearchParamsHandler = ({ onToken }) => {
  const searchParams = useSearchParams();
  useEffect(() => {
    const tokenFromUrl = searchParams?.get("token") || "";
    if (tokenFromUrl) {
      onToken();
    }
  }, [searchParams, onToken]);
  return null;
};

const AdminHeader = ({ onMenuClick }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isAuth, user, hydrated } = useSelector((state) => state.auth);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);
  const notificationUserId = isAuth && user?.id ? user.id : "";
  const {
    notifications,
    unreadCount,
    isMarkingAllRead,
    markNotificationRead,
    markAllNotificationsRead,
  } = useRealtimeNotifications({
    enabled: hydrated && isAuth && Boolean(notificationUserId),
    userId: notificationUserId,
    limit: 5,
  });

  useEffect(() => {
    if (!isAuth || !user?.id) return;


    const handleNewMessage = (payload) => {
      const msgId = payload?.id;

      // Deduplication: skip if we already toasted this message
      if (isRecentlyToasted(msgId)) {
        return;
      }


      const currentUser = getStoredUser();
      const isOwnMessage = String(payload?.senderId) === String(currentUser?.id);

      if (isOwnMessage) {
        return;
      }

      // Track this message ID
      markAsToasted(msgId);

      const enquiryId = payload?.enquiryId || payload?.data?.enquiryId;
      const messageContent = payload?.content || "";

      const href = enquiryId ? `/admin/enquiry-hub/${enquiryId}` : "/admin";


      const title = enquiryId ? `Enquiry ${enquiryId.slice(0, 8)}...` : "New message";
      const description = messageContent.length > 50
        ? messageContent.slice(0, 50) + "..."
        : messageContent || "New message received";

      showToast({
        type: "socket",
        title,
        message: description,
        duration: 6000,
        data: { href, enquiryId, type: "chat" },
      });
    };

    onSocketEvent(SOCKET_EVENTS.CHAT.NEW_MESSAGE, handleNewMessage);

    return () => {
      offSocketEvent(SOCKET_EVENTS.CHAT.NEW_MESSAGE, handleNewMessage);
    };
  }, [isAuth, user?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }

      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    }

    resetSocketConnection();
    setProfileMenuOpen(false);
    await dispatch(logoutUser());
    router.push("/");
    // setAuthTab("login");
    // setIsLoginOpen(true);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.id || notification?.read) {
      return;
    }

    await markNotificationRead(notification.id);
  };

  const handleMarkAllNotificationsRead = async () => {
    await markAllNotificationsRead();
  };

  const handleOpenProfile = () => {
    setProfileMenuOpen(false);
    router.push("/profile");
  };

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
  const pageTitle = getAdminPageTitle(pathname);

  return (
    <>
      <div className="sticky top-0 z-20 bg-white shadow-xs">
        <div className="flex h-17 w-full items-stretch justify-between gap-4 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2 py-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray2 transition hover:bg-background-primary md:hidden"
              aria-label="Open sidebar"
            >
              <ThreeBars size={18} color="#374151" />
            </button>
            <h1 className="text-[16px] font-semibold leading-none text-gray2 sm:text-[17px]">{pageTitle}</h1>
            {/* <DoubleArrows size={14} color="#6B7280" /> */}
          </div>

          <div className="flex items-center py-3 text-sm font-medium">
            {!hydrated ? (
              <div className="h-10 w-32 rounded-full bg-background-primary" aria-hidden />
            ) : isAuth ? (
              <>
                <div className="relative">
                  <button
                    type="button"
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray2 transition hover:bg-background-primary"
                    aria-label="Search"
                  >
                    <Search size={16} color="currentColor" />
                  </button>
                </div>

                <div ref={notificationRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setNotificationOpen((prev) => !prev)}
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray2 transition hover:bg-background-primary"
                    aria-label="Open notifications"
                  >
                    <Bell width={16} height={16} fill="currentColor" />
                    {unreadCount > 0 ? <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#FDB022]" /> : null}
                  </button>

                  {notificationOpen ? (
                    <NotificationPopup
                      notifications={notifications}
                      onClose={() => setNotificationOpen(false)}
                      onNotificationClick={handleNotificationClick}
                      onMarkAllRead={handleMarkAllNotificationsRead}
                      isMarkingAllRead={isMarkingAllRead}
                      hasUnread={unreadCount > 0}
                    />
                  ) : null}
                </div>

                <div ref={profileMenuRef} className="relative h-10">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="inline-flex h-full w-10 items-center justify-center gap-0 rounded-full bg-white px-1 text-[#0F172A] transition hover:bg-background-primary sm:w-auto sm:justify-start sm:gap-4 sm:pl-1.5 sm:pr-2"
                    aria-label="Open profile menu"
                  >
                    <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray1">
                      <Image
                        src={resolvedProfileImageSrc}
                        alt="Admin profile"
                        fill
                        sizes="32px"
                        className="object-cover"
                        unoptimized
                      />
                    </span>
                    <span className="hidden max-w-36 truncate text-[14px] font-normal leading-none text-[#0F172A] sm:block md:text-[14px]">
                      {user?.name || "Anthony"}
                    </span>
                    <span className="hidden items-center justify-center text-[#0F172A] sm:inline-flex">
                      <ArrowDown size={16} color="#0F172A" />
                    </span>
                  </button>

                  {profileMenuOpen ? (
                    <div className="absolute right-0 top-14 z-40 w-44 rounded-xl border border-border-card bg-white p-1.5 shadow-lg">
                      <button
                        type="button"
                        onClick={handleOpenProfile}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray2 transition hover:bg-background-primary"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray2 transition hover:bg-background-primary"
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setAuthTab("login");
                    setIsLoginOpen(true);
                  }}
                  colorClass="bg-white text-green-primary border border-border-green hover:bg-font-green"
                  className="h-10 rounded-md"
                  label="Login"
                />
                <Button
                  onClick={() => {
                    setAuthTab("register");
                    setIsLoginOpen(true);
                  }}
                  colorClass="bg-font-green text-green-primary focus:ring-1 focus:ring-border-green hover:bg-font-green"
                  className="h-10 rounded-md"
                  label="Register"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <AdminSearchParamsHandler onToken={() => { setAuthTab("login"); setIsLoginOpen(true); }} />
      </Suspense>
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialTab={authTab} />
    </>
  );
};

export default AdminHeader;
