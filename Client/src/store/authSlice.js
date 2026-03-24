import { createSlice } from "@reduxjs/toolkit";
import { checkAuth, clearStoredUser, getStoredUser, persistUser } from "@/utils/auth";

const initialState = {
  isAuth: false,
  user: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuth = true;
      state.user = action.payload;
      state.hydrated = true;
      persistUser(action.payload);
    },
    logout: (state) => {
      state.isAuth = false;
      state.user = null;
      state.hydrated = true;
      clearStoredUser();
    },
    hydrateAuth: (state) => {
      if (typeof window === "undefined") {
        state.hydrated = true;
        return;
      }

      state.isAuth = checkAuth();
      state.user = getStoredUser();
      state.hydrated = true;
    },
  },
});

export const { loginSuccess, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
