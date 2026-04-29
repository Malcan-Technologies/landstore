"use client";

import { useEffect, useState } from "react";
import { useGlobalSocketNotifications } from "@/hooks/useGlobalSocketNotifications";
import { getStoredUser } from "@/utils/auth";

console.log("[GlobalSocketProvider] FILE LOADED");

const GlobalSocketProvider = ({ children }) => {
  console.log("[GlobalSocketProvider] COMPONENT EXECUTING");
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    console.log("[GlobalSocketProvider] MOUNTED");
    const user = getStoredUser();
    console.log("[GlobalSocketProvider] User found:", user?.id, "token:", !!user?.token);
    setHasUser(!!user?.token);

    const handleStorageChange = () => {
      const currentUser = getStoredUser();
      console.log("[GlobalSocketProvider] Storage changed, user:", currentUser?.id);
      setHasUser(!!currentUser?.token);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      console.log("[GlobalSocketProvider] UNMOUNTING");
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  console.log("[GlobalSocketProvider] BEFORE HOOK, hasUser:", hasUser);
  useGlobalSocketNotifications(hasUser);
  console.log("[GlobalSocketProvider] AFTER HOOK");

  return children;
};

export default GlobalSocketProvider;
