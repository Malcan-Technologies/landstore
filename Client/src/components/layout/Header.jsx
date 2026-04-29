"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { isRecentlyToasted, markAsToasted } from "@/utils/toastDedup";
import Plus from "@/components/svg/Plus";
import Bell from "@/components/svg/Bell";
import Person from "@/components/svg/Person";
import ArrowDown from "@/components/svg/ArrowDown";
import ThreeBars from "@/components/svg/ThreeBars";
import Button from "@/components/common/Button";
import LoginModal from "@/components/auth/LoginModal";
import LoginRequiredModal from "@/components/auth/modals/LoginRequiredModal";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import NotificationPopup from "@/components/userDashboard/notifications/NotificationPopup";
import { resetSocketConnection, SOCKET_EVENTS, onSocketEvent, offSocketEvent } from "@/services/socketService";
import { logoutUser } from "@/store/authSlice";
import { hasAdminAccess, getStoredUser } from "@/utils/auth";
import { showToast } from "@/utils/toastStore";

const HeaderSearchParamsHandler = ({ onToken, pathname }) => {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const tokenFromUrl = searchParams?.get("token") || "";
    if (tokenFromUrl) {
      onToken();
    }
  }, [searchParams, onToken, pathname]);
  return null;
};

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuth, user, hydrated } = useSelector((state) => state.auth);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoginRequiredOpen, setIsLoginRequiredOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
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

    console.log("[Header] Setting up chat message listener");

    const handleNewMessage = (payload) => {
      const msgId = payload?.id;

      // Deduplication: skip if we already toasted this message
      if (isRecentlyToasted(msgId)) {
        console.log("[Header] Skipping duplicate message:", msgId);
        return;
      }

      console.log("[Header] 📨 Chat message received:", payload);

      const currentUser = getStoredUser();
      const isOwnMessage = String(payload?.senderId) === String(currentUser?.id);

      if (isOwnMessage) {
        console.log("[Header] Skipping own message");
        return;
      }

      // Track this message ID
      markAsToasted(msgId);

      const enquiryId = payload?.enquiryId || payload?.data?.enquiryId;
      const messageContent = payload?.content || "";

      const isAdmin = hasAdminAccess(currentUser);
      const href = enquiryId
        ? isAdmin
          ? `/admin/enquiry-hub/${enquiryId}`
          : `/user-dashboard/enquiries/${enquiryId}`
        : isAdmin
          ? "/admin"
          : "/user-dashboard";

      console.log("[Header] Showing toast for enquiry:", enquiryId, "href:", href);

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
      console.log("[Header] Removing chat message listener");
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

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
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

  const handleProtectedNavigation = (href) => {
    if (!hydrated) {
      return;
    }

    if (!isAuth) {
      setIsLoginRequiredOpen(true);
      return;
    }

    router.push(href);
  };

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";
  const profileDisplayName = user?.name?.trim() || `User ${userInitial}`;
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
  const isAdminUser = hasAdminAccess(user);
  const isExploreActive = pathname === "/explore" || pathname.startsWith("/explore/");
  const isListingsActive =
    pathname === "/user-dashboard/listings" || pathname.startsWith("/user-dashboard/listings/");
  const isShortlistsActive =
    pathname === "/user-dashboard/shortlists" || pathname.startsWith("/user-dashboard/shortlists/");
  const isEnquiriesActive =
    pathname === "/user-dashboard/enquiries" || pathname.startsWith("/user-dashboard/enquiries/");
  const getNavLinkClass = (isActive) =>
    `transition hover:text-green-primary ${isActive ? "text-green-primary" : ""}`.trim();

  return (
    <>
      <div className="shadow-sm bg-white fixed w-full z-10">
        <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 md:px-6 lg:gap-6">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger Menu - Show below lg */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex items-center justify-center lg:hidden"
              aria-label="Open menu"
            >
              <ThreeBars size={24} color="#22863a" />
            </button>

            {/* Logo - Hide below sm, show in sidebar */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="hidden items-center gap-3 sm:flex"
            >
              <div className="relative h-10 w-10 md:h-12 md:w-12">
                <Image
                  src="/logo.png"
                  alt="LandStore"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-lg font-bold text-green-logo">
                LandStore<span className="text-green-secondary font-normal">.my</span>
              </span>
            </button>
          </div>

          {/* Desktop Navigation - Show on lg+ */}
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium text-gray2 lg:flex">
            <button
              type="button"
              onClick={() => router.push("/explore")}
              className={getNavLinkClass(isExploreActive)}
            >
              Explore Map
            </button>
            <button
              type="button"
              onClick={() => handleProtectedNavigation("/user-dashboard/listings")}
              className={getNavLinkClass(isListingsActive)}
            >
              Listings
            </button>
            <button
              type="button"
              onClick={() => handleProtectedNavigation("/user-dashboard/shortlists")}
              className={getNavLinkClass(isShortlistsActive)}
            >
              Shortlists
            </button>
            <button
              type="button"
              onClick={() => handleProtectedNavigation("/user-dashboard/enquiries")}
              className={getNavLinkClass(isEnquiriesActive)}
            >
              My Enquiries
            </button>
          </nav>

          <div className="flex items-center gap-3 text-sm font-medium">
            {!hydrated ? (
              <div className="h-10 w-24 rounded-lg bg-background-primary" aria-hidden />
            ) : isAuth ? (
              <>
                <div ref={notificationRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setNotificationOpen((prev) => !prev)}
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full  text-gray2 transition hover:border-green-primary/30 hover:bg-background-primary"
                    aria-label="Open notifications"
                  >
                    <Bell width={18} height={18} fill="currentColor" />
                    {unreadCount > 0 ? <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-green-secondary" /> : null}
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
                <span className="h-6 w-[1.5px] bg-border-card" aria-hidden />

                <Button
                  onClick={() => router.push("/user-dashboard/listings/create-listing")}
                  className="sm:h-10 h-8 justify-center gap-0 rounded-md px-2! sm:gap-2 sm:px-4!"
                >
                  <span className="flex h-6 w-6 items-center justify-center text-white">
                    <Plus size={14} color="white" aria-hidden />
                  </span>
                  <span className="hidden sm:inline">List a land</span>
                </Button>

                <div ref={profileMenuRef} className="relative flex items-center self-center">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className={isAdminUser
                      ? "relative inline-flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border-card bg-white text-green-primary transition hover:border-green-secondary/40 hover:bg-background-primary sm:h-11 sm:w-auto sm:gap-2 sm:overflow-visible sm:rounded-none sm:border-none sm:bg-transparent sm:px-2 sm:text-gray2 sm:hover:border-none sm:hover:bg-transparent"
                      : "relative inline-flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border-card bg-white text-green-primary transition hover:border-green-secondary/40 hover:bg-background-primary"
                    }
                    aria-label="Open profile menu"
                  >
                    <span className={isAdminUser
                      ? "relative block h-10 w-10 overflow-hidden rounded-full sm:h-9 sm:w-9"
                      : "relative block h-10 w-10 overflow-hidden rounded-full"
                    }
                    >
                      <Image
                        src={resolvedProfileImageSrc}
                        alt="User profile"
                        fill
                        sizes="40px"
                        className="object-cover"
                        unoptimized
                      />
                    </span>
                    {isAdminUser ? (
                      <>
                        <span className="hidden max-w-32 items-center truncate text-[17px] font-normal leading-normal text-gray2 sm:inline-flex">
                          {profileDisplayName}
                        </span>
                        <ArrowDown size={18} color="#111827" className="hidden shrink-0 sm:block" />
                      </>
                    ) : null}
                  </button>

                  {profileMenuOpen ? (
                    <div className="absolute right-0 top-12 z-40 w-44 rounded-xl border border-border-card bg-white p-1.5 shadow-lg">
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

      {/* Mobile Sidebar - Show below lg */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/35 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden
        />
      )}
      <div
        ref={mobileMenuRef}
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-30 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border-card px-4">
          <button type="button" onClick={() => { router.push("/"); setMobileMenuOpen(false); }} className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image
                src="/logo.png"
                alt="LandStore"
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-sm font-bold text-green-logo">
              LandStore<span className="text-green-secondary font-normal">.my</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none text-gray5 transition hover:bg-background-primary hover:text-gray2"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <button
            type="button"
            onClick={() => {
              router.push("/explore");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
              isExploreActive
                ? "bg-background-primary text-green-primary"
                : "text-gray2 hover:bg-background-primary"
            }`}
          >
            Explore Map
          </button>
          <button
            type="button"
            onClick={() => {
              handleProtectedNavigation("/user-dashboard/listings");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
              isListingsActive
                ? "bg-background-primary text-green-primary"
                : "text-gray2 hover:bg-background-primary"
            }`}
          >
            Listings
          </button>
          <button
            type="button"
            onClick={() => {
              handleProtectedNavigation("/user-dashboard/shortlists");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
              isShortlistsActive
                ? "bg-background-primary text-green-primary"
                : "text-gray2 hover:bg-background-primary"
            }`}
          >
            Shortlists
          </button>
          <button
            type="button"
            onClick={() => {
              handleProtectedNavigation("/user-dashboard/enquiries");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
              isEnquiriesActive
                ? "bg-background-primary text-green-primary"
                : "text-gray2 hover:bg-background-primary"
            }`}
          >
            My Enquiries
          </button>
        </nav>
      </div>

      <Suspense fallback={null}>
        <HeaderSearchParamsHandler
          pathname={pathname}
          onToken={() => { setAuthTab("login"); setIsLoginOpen(true); }}
        />
      </Suspense>
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialTab={authTab} />
      <LoginRequiredModal open={isLoginRequiredOpen} onClose={() => setIsLoginRequiredOpen(false)} />
    </>
  );
};

export default Header;
