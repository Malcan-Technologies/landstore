import { createSlice } from "@reduxjs/toolkit";

const AUTH_STORAGE_KEY = "landstore_auth";

const initialState = {
  isAuthenticated: false,
  user: null,
  hydrated: false,
};

const persistAuth = (authState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
};

const clearPersistedAuth = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.hydrated = true;

      persistAuth({
        isAuthenticated: true,
        user: action.payload,
      });
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.hydrated = true;

      clearPersistedAuth();
    },
    hydrateAuth: (state) => {
      if (typeof window === "undefined") {
        state.hydrated = true;
        return;
      }

      const rawAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);

      if (!rawAuth) {
        state.isAuthenticated = false;
        state.user = null;
        state.hydrated = true;
        return;
      }

      try {
        const parsedAuth = JSON.parse(rawAuth);
        state.isAuthenticated = Boolean(parsedAuth?.isAuthenticated);
        state.user = parsedAuth?.user ?? null;
      } catch {
        state.isAuthenticated = false;
        state.user = null;
        clearPersistedAuth();
      }

      state.hydrated = true;
    },
  },
});

export const { loginSuccess, logout, hydrateAuth } = authSlice.actions;
export { AUTH_STORAGE_KEY };
export default authSlice.reducer;
