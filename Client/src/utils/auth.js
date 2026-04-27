export const AUTH_STORAGE_KEY = "user";

export const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawUser) {
      return null;
    }

    return JSON.parse(rawUser);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const checkAuth = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(getStoredUser());
};

export const getNormalizedAdminRole = (value) => {
  const rawRole = typeof value === "string" ? value : value?.adminRole;
  const normalizedRole = typeof rawRole === "string" ? rawRole.trim().toLowerCase() : "";

  return normalizedRole || null;
};

export const hasAdminAccess = (user) => {
  const adminRole = getNormalizedAdminRole(user);

  return adminRole === "admin" || adminRole === "superadmin";
};

export const persistUser = (user) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};
