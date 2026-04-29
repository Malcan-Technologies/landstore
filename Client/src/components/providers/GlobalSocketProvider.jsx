"use client";

import { useEffect, useState } from "react";
import { useGlobalSocketNotifications } from "@/hooks/useGlobalSocketNotifications";
import { getStoredUser } from "@/utils/auth";


const GlobalSocketProvider = ({ children }) => {
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    setHasUser(!!user?.token);

    const handleStorageChange = () => {
      const currentUser = getStoredUser();
      setHasUser(!!currentUser?.token);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useGlobalSocketNotifications(hasUser);

  return children;
};

export default GlobalSocketProvider;
