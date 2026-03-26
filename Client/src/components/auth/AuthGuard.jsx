"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Loading from "@/components/common/Loading";
import LoginRequiredModal from "@/components/auth/modals/LoginRequiredModal";
import { checkAuth } from "@/utils/auth";

const AuthGuard = ({ children }) => {
  const { isAuth, hydrated } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  const authenticated = useMemo(() => isAuth || checkAuth(), [isAuth]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!authenticated) {
      setShowLoginRequiredModal(true);
      setIsChecking(false);
      return;
    }

    setShowLoginRequiredModal(false);
    setIsChecking(false);
  }, [authenticated, hydrated]);

  if (!hydrated || isChecking) {
    return <Loading />;
  }

  if (!authenticated) {
    return (
      <>
        <LoginRequiredModal open={showLoginRequiredModal} onClose={() => setShowLoginRequiredModal(false)} />
        <div className="min-h-[60vh]" />
      </>
    );
  }

  return children;
};

export default AuthGuard;
