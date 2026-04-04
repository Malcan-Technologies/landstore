import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/services/authService";
import { persistUser, clearStoredUser, getStoredUser, checkAuth } from "@/utils/auth";

const initialState = {
  isAuth: false,
  user: null,
  hydrated: false,
};

// Async thunk for logout with Better Auth API call
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call Better Auth sign-out endpoint
      await authService.logout();
      return true;
    } catch (error) {
      // Even if API fails, we should still logout locally
      console.error('Logout API failed:', error);
      return rejectWithValue(error.message);
    }
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        // Clear state after successful API call
        state.isAuth = false;
        state.user = null;
        state.hydrated = true;
        clearStoredUser();
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if API call fails, clear state locally
        state.isAuth = false;
        state.user = null;
        state.hydrated = true;
        clearStoredUser();
      });
  },
});

export const { loginSuccess, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
