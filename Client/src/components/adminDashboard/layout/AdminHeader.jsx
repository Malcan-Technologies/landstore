"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Bell from "@/components/svg/Bell";
import ArrowDown from "@/components/svg/ArrowDown";
import DoubleArrows from "@/components/svg/DoubleArrows";
import Person from "@/components/svg/Person";
import Search from "@/components/svg/Search";
import ThreeBars from "@/components/svg/ThreeBars";
import Button from "@/components/common/Button";
import LoginModal from "@/components/auth/LoginModal";
import NotificationPopup from "@/components/userDashboard/notifications/NotificationPopup";
import { notificationItems } from "@/components/userDashboard/notifications/notificationData";
import { logoutUser } from "@/store/authSlice";

const ADMIN_AUTH_STORAGE_KEY = "landstore_admin_auth";

const AdminHeader = ({ onMenuClick }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuth, user, hydrated } = useSelector((state) => state.auth);

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

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    }

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

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

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
            <h1 className="text-[16px] font-semibold leading-none text-gray2 sm:text-[17px]">Dashboard</h1>
            <DoubleArrows size={14} color="#6B7280" />
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
                    <Search size={16} color="#374151" />
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
                    <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#FDB022]" />
                  </button>

                  {notificationOpen ? (
                    <NotificationPopup notifications={notificationItems} onClose={() => setNotificationOpen(false)} />
                  ) : null}
                </div>

                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="inline-flex items-center gap-3 rounded-full bg-white pl-1 pr-1 text-[#0F172A] transition hover:bg-background-primary sm:gap-4 sm:pl-1.5 sm:pr-2"
                    aria-label="Open profile menu"
                  >
                    <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full text-[14px] bg-gray1 font-semibold text-[#111827] sm:h-8 sm:w-8 sm:text-[14px]">
                      {user?.name ? userInitial : <Person size={16} color="#111827" />}
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

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialTab={authTab} />
    </>
  );
};

export default AdminHeader;
