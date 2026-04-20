"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Plus from "@/components/svg/Plus";
import Bell from "@/components/svg/Bell";
import Person from "@/components/svg/Person";
import Button from "@/components/common/Button";
import LoginModal from "@/components/auth/LoginModal";
import LoginRequiredModal from "@/components/auth/modals/LoginRequiredModal";
import NotificationPopup from "@/components/userDashboard/notifications/NotificationPopup";
import { notificationService } from "@/services/notificationService";
import { logoutUser } from "@/store/authSlice";

const HeaderSearchParamsHandler = ({ onToken }) => {
  const searchParams = useSearchParams();
  useEffect(() => {
    const tokenFromUrl = searchParams?.get("token") || "";
    if (tokenFromUrl) {
      onToken();
    }
  }, [searchParams, onToken]);
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
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!isAuth || !user?.id) {
      setNotifications([]);
      return;
    }

    let mounted = true;

    const mapNotification = (item) => {
      const apiType = item?.type;
      const type = apiType === "urgent" ? "warning" : "success";
      const createdAt = item?.createdAt ? new Date(item.createdAt) : null;

      return {
        id: item?.id,
        title: apiType === "urgent" ? "Action needed" : "Notification",
        message: item?.content || "",
        timeLabel: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleString() : "",
        type,
        href: "/user-dashboard/notifications",
        read: Boolean(item?.isRead),
      };
    };

    (async () => {
      try {
        const response = await notificationService.getNotifications({ page: 1, limit: 5, userId: user.id });
        const items = Array.isArray(response) ? response : response?.data;
        const mapped = Array.isArray(items) ? items.map(mapNotification).filter((n) => n?.id) : [];
        if (mounted) {
          setNotifications(mapped);
        }
      } catch (_error) {
        if (mounted) {
          setNotifications([]);
        }
      }
    })();

    return () => {
      mounted = false;
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
    setProfileMenuOpen(false);
    await dispatch(logoutUser());
    router.push("/");
    // setAuthTab("login");
    // setIsLoginOpen(true);
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
  const isExploreActive = pathname === "/explore" || pathname.startsWith("/explore/");
  const isShortlistsActive =
    pathname === "/user-dashboard/shortlists" || pathname.startsWith("/user-dashboard/shortlists/");
  const isEnquiriesActive =
    pathname === "/user-dashboard/enquiries" || pathname.startsWith("/user-dashboard/enquiries/");
  const getNavLinkClass = (isActive) =>
    `transition hover:text-green-primary ${isActive ? "text-green-primary" : ""}`.trim();

  return (
    <>
      <div className="shadow-sm bg-white fixed w-full z-10">
        <div className="mx-auto flex w-full items-center justify-between gap-6 px-4 py-3 md:px-6">
          <button type="button" onClick={() => router.push("/")} className="flex items-center gap-3">
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
            <span className="text-lg font-bold text-green-logo hidden sm:block">
              LandStore<span className="text-green-secondary font-normal">.my</span>
            </span>
          </button>

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
                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-green-secondary" />
                  </button>

                  {notificationOpen ? (
                    <NotificationPopup notifications={notifications} onClose={() => setNotificationOpen(false)} />
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

                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-card bg-white text-green-primary transition hover:border-green-secondary/40 hover:bg-background-primary"
                    aria-label="Open profile menu"
                  >
                    {user?.name ? (
                      <span className="text-[14px] font-semibold text-green-primary">{userInitial}</span>
                    ) : (
                      <Person size={16} color="var(--color-green-primary)" />
                    )}
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

      <Suspense fallback={null}>
        <HeaderSearchParamsHandler onToken={() => { setAuthTab("login"); setIsLoginOpen(true); }} />
      </Suspense>
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialTab={authTab} />
      <LoginRequiredModal open={isLoginRequiredOpen} onClose={() => setIsLoginRequiredOpen(false)} />
    </>
  );
};

export default Header;
