"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";

import DualNote from "@/components/svg/DualNote";
import Verify from "@/components/svg/Verify";
import Edit from "@/components/svg/Edit";
import Sheild from "@/components/svg/Sheild";
import ProfileCheck from "@/components/svg/ProfileCheck";

const lockIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_1_21859)">
      <path
        d="M1.5 12C1.5 9.87868 1.5 8.81802 2.15901 8.15901C2.81802 7.5 3.87868 7.5 6 7.5H12C14.1213 7.5 15.182 7.5 15.841 8.15901C16.5 8.81802 16.5 9.87868 16.5 12C16.5 14.1213 16.5 15.182 15.841 15.841C15.182 16.5 14.1213 16.5 12 16.5H6C3.87868 16.5 2.81802 16.5 2.15901 15.841C1.5 15.182 1.5 14.1213 1.5 12Z"
        stroke="#838383"
        stroke-width="1.5"
      />
      <path
        d="M4.5 7.5V6C4.5 3.51472 6.51472 1.5 9 1.5C11.4853 1.5 13.5 3.51472 13.5 6V7.5"
        stroke="#838383"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_1_21859">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const inputClassName =
  "h-11 w-full rounded-lg border border-border-input bg-white px-4 text-[14px] text-gray2 outline-none transition focus:border-green-secondary focus:ring-1 focus:ring-border-green disabled:bg-background-primary disabled:text-gray5";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("MY");
  const [phone, setPhone] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [appAlerts, setAppAlerts] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [saveError, setSaveError] = useState("");

  const profileImageSrc =
    profileImagePreview ||
    profile?.profilePicture?.url ||
    profile?.profilePicture ||
    profile?.profileMedia?.fileUrl ||
    profile?.profileImage ||
    profile?.image ||
    "/user.jpg";
  const isEmailVerified = Boolean(profile?.emailVerified);
  const displayName =
    profile?.name ||
    profile?.individual?.fullName ||
    profile?.company?.companyName ||
    profile?.koperasi?.koperasiName ||
    "User";
  const memberId = profile?.id || "-";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authService.myProfile();

        const profileData = response?.result || response?.data || response?.profile || response?.user || null;

        if (profileData) {
          setProfile(profileData);
          setEmail(profileData.email || "");
          setPhone(profileData.phone || "");

          const notificationPreferences = profileData.notificationPreferences;
          setEmailNotifications(Boolean(notificationPreferences?.emailEnabled));
          setAppAlerts(Boolean(notificationPreferences?.pushEnabled));
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  const handleProfileImageChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setSaveError("Please select a valid image file.");
      return;
    }

    setSaveError("");
    setSelectedProfileImage(selectedFile);

    const previewUrl = URL.createObjectURL(selectedFile);
    setProfileImagePreview((previousPreview) => {
      if (previousPreview) {
        URL.revokeObjectURL(previousPreview);
      }
      return previewUrl;
    });
  };

  const handleEditProfileClick = async () => {
    if (!isEditing) {
      setIsEditing(true);
      setSaveError("");
      return;
    }

    try {
      setIsSavingProfile(true);
      setSaveError("");

      const payload = new FormData();
      payload.append("email", email);
      payload.append("phone", phone);

      if (selectedProfileImage) {
        payload.append("image", selectedProfileImage);
      }

      const response = await userService.updateProfileMe(payload);
      const updatedProfile =
        response?.user || response?.result || response?.data || null;

      if (updatedProfile) {
        setProfile((previousProfile) => ({
          ...(previousProfile || {}),
          ...updatedProfile,
        }));
      }

      setIsEditing(false);
      setSelectedProfileImage(null);
      setProfileImagePreview((previousPreview) => {
        if (previousPreview) {
          URL.revokeObjectURL(previousPreview);
        }
        return "";
      });
    } catch (error) {
      setSaveError(
        error?.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <main className="bg-background-primary pb-14 pt-10">
      <div className="lg:mx-16 md:mx-4 mx-2 w-auto px-4 py-7 sm:px-6 md:px-10 md:py-9">
        <header className="mb-10">
          <h1 className="text-[24px] font-bold tracking-tight text-gray2 sm:text-[28px] md:text-[32px]">
            Profile
          </h1>
          <p className="mt-1 text-[13px] font-medium text-gray5 sm:text-[14px] md:text-[16px]">
            Manage your identity, entity verification, and preferences.
          </p>
        </header>

        <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
            <div className="relative md:h-36 md:w-36 shrink-0 h-30 w-30">
              <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white shadow-[0px_4px_18px_rgba(15,61,46,0.08)]">
                <Image
                  src={profileImageSrc || "/user.jpg"}
                  alt="User profile"
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="143px"
                />
              </div>
              {isEditing && (
                <>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-image-input"
                    className="absolute inset-0 z-20 cursor-pointer rounded-full"
                  >
                    <span className="absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray2 shadow-md transition hover:bg-gray-50">
                      <Edit
                        size={14}
                        stroke="currentColor"
                        accentStroke="currentColor"
                      />
                    </span>
                  </label>
                </>
              )}
              {isEmailVerified && (
                <span className="absolute bottom-2 md:bottom-2 right-1 md:right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full z-10">
                  <Verify width={28} height={28} />
                </span>
              )}
            </div>

            <div className="max-w-155 items-center sm:items-start flex flex-col">
              <h2 className="text-[22px] font-semibold leading-tight text-gray2 sm:text-[24px] md:text-[26px]">
                {isLoading ? "Loading..." : displayName}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold ${
                    isEmailVerified
                      ? "bg-[#ECFDF3] text-active"
                      : "bg-[#FEF3F2] text-[#B42318]"
                  }`}
                >
                  <Sheild
                    size={14}
                    color={isEmailVerified ? "var(--color-active)" : "#B42318"}
                  />
                  {isEmailVerified ? "Identity Verified" : "Identity Not Verified"}
                </span>
                <span className="inline-flex items-center rounded-full bg-[#1F1F1F] px-2.5 py-1 text-[12px] font-medium text-white">
                  Member ID: {memberId}
                </span>
                <span className="inline-flex items-center rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[12px] font-medium text-[#3538CD]">
                  User Type: {profile?.userType || "-"}
                </span>
              </div>
              <p className="mt-4 max-w-140 text-[14px] leading-6 text-gray5 md:text-[15px] text-center sm:text-left">
                Registered as a{" "}
                <span className="font-semibold text-gray2">
                  {profile?.profileType === "individual" ? "Individual" : profile?.profileType === "company" ? "Company" : profile?.profileType === "koperasi" ? "Koperasi" : "User"}
                </span>{" "}
                user. Access limited to verified land assets and mediated enquiries.
              </p>
            </div>
          </div>
          <div className="flex sm:items-center sm:justify-start justify-center">
            <button
              type="button"
              onClick={handleEditProfileClick}
              disabled={isSavingProfile}
              className={`inline-flex h-11 items-center justify-center gap-2 self-start whitespace-nowrap rounded-lg px-3 text-[14px] font-medium transition md:px-4 ${
                isEditing
                  ? "bg-green-primary text-white hover:bg-green-secondary"
                  : "border border-border-input  text-gray2 hover:bg-background-primary"
              } ${isSavingProfile ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {!isEditing ? (
                <Edit
                  size={16}
                  stroke="currentColor"
                  accentStroke="currentColor"
                />
              ) : (
                ""
              )}
              {isSavingProfile
                ? "Saving..."
                : isEditing
                ? "Save profile"
                : "Edit profile"}
            </button>
          </div>
        </section>

        {saveError && (
          <p className="mb-6 text-[13px] font-medium text-[#B42318]">{saveError}</p>
        )}

        <section className="mb-10">
          <h3 className="text-[18px] font-semibold text-gray2 md:text-[22px]">
            Contract details
          </h3>
          <div className="mt-5 h-px w-full bg-border-card" />

          <div className="mt-6 space-y-4 mx-4">
            <div className="grid grid-cols-1 items-center gap-2 md:gap-40 md:grid-cols-[180px_minmax(0,1fr)]">
              <label
                htmlFor="email"
                className="text-[14px] font-semibold text-gray2"
              >
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className={`${inputClassName} pr-10`}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={!isEditing}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  {" "}
                  <ProfileCheck size={16} />{" "}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-2 md:gap-40 md:grid-cols-[180px_minmax(0,1fr)]">
              <label
                htmlFor="phone"
                className="text-[14px] font-semibold text-gray2"
              >
                Phone number
              </label>
              <div className="relative flex rounded-lg border border-border-input bg-white">
                <select
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  className="h-11 rounded-l-lg border-r border-border-input bg-transparent px-3 text-[14px] text-gray2 outline-none disabled:text-gray5"
                  disabled={!isEditing}
                  aria-label="Country code"
                >
                  <option value="MY">MY</option>
                  <option value="SG">SG</option>
                  <option value="ID">ID</option>
                </select>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-11 w-full rounded-r-lg bg-transparent px-4 pr-10 text-[14px] text-gray2 outline-none disabled:text-gray5"
                  disabled={!isEditing}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <ProfileCheck size={16} />{" "}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[18px] font-semibold text-gray2 md:text-[22px]">
              Entity information
            </h3>
            <div className="inline-flex items-center gap-2 text-[14px] text-gray5">
              <span className="text-gray5">{lockIcon}</span>
              <span>Locked after verification</span>
            </div>
          </div>
          <div className="mt-5 h-px w-full bg-border-card" />

          <div className="mt-6 space-y-4 mx-4">
            <div className="grid grid-cols-1 items-center gap-2 md:gap-40 md:grid-cols-[180px_minmax(0,1fr)]">
              <span className="text-[14px] font-semibold text-gray2">
                Entity Type
              </span>
              <input
                type="text"
                className={inputClassName}
                value={profile?.profileType === "individual" ? "Individual" : profile?.profileType === "company" ? "Company" : profile?.profileType === "koperasi" ? "Koperasi" : "-"}
                disabled
              />
            </div>

            {profile?.profileType === "individual" && (
              <>
                <div className="grid grid-cols-1 items-center gap-2 md:gap-40 md:grid-cols-[180px_minmax(0,1fr)]">
                  <span className="text-[14px] font-semibold text-gray2">
                    Full Name
                  </span>
                  <input
                    type="text"
                    className={inputClassName}
                    value={profile?.individual?.fullName || "-"}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 items-center gap-2 md:gap-40 md:grid-cols-[180px_minmax(0,1fr)]">
                  <span className="text-[14px] font-semibold text-gray2">
                    Identity Number (IC)
                  </span>
                  <input
                    type="text"
                    className={inputClassName}
                    value={profile?.individual?.identityNo || "-"}
                    disabled
                  />
                </div>
              </>
            )}

            {profile?.profileType === "company" && (
              <>
                <div className="grid grid-cols-1 items-center gap-2 md:gap-40 md:grid-cols-[180px_minmax(0,1fr)]">
                  <span className="text-[14px] font-semibold text-gray2">
                    Company Name
                  </span>
                  <input
                    type="text"
                    className={inputClassName}
                    value={profile?.company?.companyName || "-"}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 items-center gap-2 md:gap-40 md:grid-cols-[180px_minmax(0,1fr)]">
                  <span className="text-[14px] font-semibold text-gray2">
                    Registration Number (SSM)
                  </span>
                  <input
                    type="text"
                    className={inputClassName}
                    value={profile?.company?.registrationNo || "-"}
                    disabled
                  />
                </div>
              </>
            )}

            {profile?.profileType === "koperasi" && (
              <>
                <div className="grid grid-cols-1 items-center gap-2 md:gap-40 md:grid-cols-[180px_minmax(0,1fr)]">
                  <span className="text-[14px] font-semibold text-gray2">
                    Koperasi Name
                  </span>
                  <input
                    type="text"
                    className={inputClassName}
                    value={profile?.koperasi?.koperasiName || "-"}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 items-center gap-2 md:gap-40 md:grid-cols-[180px_minmax(0,1fr)]">
                  <span className="text-[14px] font-semibold text-gray2">
                    Registration Number
                  </span>
                  <input
                    type="text"
                    className={inputClassName}
                    value={profile?.koperasi?.registrationNo || "-"}
                    disabled
                  />
                </div>
              </>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-[18px] font-semibold text-gray2 md:text-[22px]">
            Notification Preferences
          </h3>
          <div className="mt-5 h-px w-full bg-border-card" />

          <div className="mt-6 space-y-5 mx-4">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[13px] font-semibold text-gray2 md:text-[16px]">
                  Email Notifications
                </p>
                <p className="text-[10px] md:text-[13px]  text-gray5">
                  Receive weekly market reports and listing updates via email
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications((prev) => !prev)}
                className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${
                  emailNotifications ? "bg-green-secondary" : "bg-border-input"
                }`}
                aria-pressed={emailNotifications}
                aria-label="Toggle email notifications"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    emailNotifications ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[13px] font-semibold text-gray2 md:text-[16px]">
                  In-App Alerts
                </p>
                <p className="text-[10px] md:text-[13px] text-gray5">
                  Instant notifications for new enquiries and status changes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAppAlerts((prev) => !prev)}
                className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${
                  appAlerts ? "bg-green-secondary" : "bg-border-input"
                }`}
                aria-pressed={appAlerts}
                aria-label="Toggle in-app alerts"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    appAlerts ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
