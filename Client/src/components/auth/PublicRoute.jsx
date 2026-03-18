"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Loading from "@/components/common/Loading";
import { checkAuth } from "@/utils/auth";

const PublicRoute = ({ children }) => {
  const router = useRouter();
  const { isAuth, hydrated } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  const authenticated = useMemo(() => isAuth || checkAuth(), [isAuth]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (authenticated) {
      router.replace("/");
      return;
    }

    setIsChecking(false);
  }, [authenticated, hydrated, router]);

  if (!hydrated || isChecking) {
    return <Loading />;
  }

  return children;
};

export default PublicRoute;
