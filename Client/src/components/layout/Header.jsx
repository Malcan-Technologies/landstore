"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Plus from "@/components/svg/Plus";
import Bell from "@/components/svg/Bell";
import Person from "@/components/svg/Person";
import Button from "@/components/common/Button";
import LoginModal from "@/components/auth/LoginModal";
import NotificationPopup from "@/components/userDashboard/notifications/NotificationPopup";
import { notificationItems } from "@/components/userDashboard/notifications/notificationData";
import { logout } from "@/store/authSlice";

const Header = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, hydrated } = useSelector((state) => state.auth);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);

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

  const handleLogout = () => {
    dispatch(logout());
    setProfileMenuOpen(false);
    router.push("/");
  };

  const handleOpenProfile = () => {
    setProfileMenuOpen(false);
    router.push("/profile");
  };

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <div className="shadow-sm bg-white">
        <div className="mx-auto flex w-full max-w-[95vw] items-center justify-between gap-6 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3">
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
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium text-gray2 lg:flex">
            <Link href="/explore" className="transition hover:text-green-primary">
              Explore Map
            </Link>
            <Link href="/user-dashboard/shortlists" className="transition hover:text-green-primary">
              Shortlists
            </Link>
            <Link href="/user-dashboard/enquiries" className="transition hover:text-green-primary">
              My Enquiries
            </Link>
          </nav>

          <div className="flex items-center gap-3 text-sm font-medium">
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
                <NotificationPopup notifications={notificationItems} onClose={() => setNotificationOpen(false)} />
              ) : null}
            </div>
            <span className="h-6 w-[1.5px] bg-border-card" aria-hidden />

            {!hydrated ? (
              <div className="h-10 w-24 rounded-lg bg-background-primary" aria-hidden />
            ) : isAuthenticated ? (
              <>
                <Button href="/user-dashboard/listings" className="h-10 rounded-md" label="List a land">
                  <span className="flex h-6 w-6 items-center justify-center text-white">
                    <Plus size={14} color="white" aria-hidden />
                  </span>
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

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialTab={authTab} />
    </>
  );
};

export default Header;
