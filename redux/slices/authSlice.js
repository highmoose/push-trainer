import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@lib/axios";

// Verify current session with server
export const verifyAuth = createAsyncThunk(
  "auth/verify",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/user");
      console.log("Server verification successful:", res.data);
      return res.data;
    } catch (err) {
      console.log(
        "Server verification failed:",
        err.response?.status,
        err.response?.data
      );

      // Clear invalid session data
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("lastActivity");

      return rejectWithValue(err.response?.data?.message || "Session invalid");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    { first_name, last_name, email, password, password_confirmation, role },
    { rejectWithValue }
  ) => {
    try {
      await api.get("/sanctum/csrf-cookie");
      const res = await api.post("/api/register", {
        first_name,
        last_name,
        email,
        password,
        password_confirmation,
        role,
      });

      // Set activity timestamp
      localStorage.setItem("lastActivity", Date.now().toString());

      return res.data;
    } catch (err) {
      const error = err.response?.data?.errors;

      // Custom message for specific validation
      if (error?.email?.[0]) {
        return rejectWithValue("Email already in use");
      }

      // Generic fallback
      return rejectWithValue("Registration failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await api.get("/sanctum/csrf-cookie");
      const res = await api.post("/api/login", {
        email,
        password,
      });

      console.log("Login successful:", res.data);

      // Set activity timestamp
      localStorage.setItem("lastActivity", Date.now().toString());

      return res.data; // should be the user object
    } catch (err) {
      console.error("Login error:", err.response?.data);
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.get("/sanctum/csrf-cookie"); // optional, but safer
      await api.post("/api/logout");
      console.log("✅ Server logout successful");
    } catch (err) {
      console.warn(
        "⚠️ Server logout failed:",
        err.response?.status,
        err.response?.data
      );

      if (err.response?.status === 401) {
        // Session already gone — this is fine, proceed with client-side logout
        console.log(
          "✅ Session already expired, proceeding with client logout"
        );
        return;
      }

      // For other errors, still proceed with client-side logout for security
      // but log the error for debugging
      console.warn(
        "⚠️ Server logout failed, but proceeding with client logout for security"
      );
      return; // Don't reject, just proceed
    } finally {
      // Always clean up client-side data regardless of server response
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("lastActivity");
      console.log("✅ Client-side logout data cleared");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    status: "idle", // idle, loading, succeeded, failed
    error: null,
    hydrated: false,
    isAuthenticated: false,
    sessionExpired: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.hydrated = true;
      state.sessionExpired = false;

      // Update activity timestamp
      if (action.payload) {
        localStorage.setItem("lastActivity", Date.now().toString());
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.hydrated = true;
      state.sessionExpired = false;
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("lastActivity");
    },
    updateActivity: (state) => {
      if (state.isAuthenticated) {
        localStorage.setItem("lastActivity", Date.now().toString());
      }
    },
    setSessionExpired: (state) => {
      state.sessionExpired = true;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("lastActivity");
    },
    resetAuthStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyAuth.pending, (state) => {
        state.status = "loading";
        // Don't clear user while verifying
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.hydrated = true;
        state.sessionExpired = false;
        localStorage.setItem("user", JSON.stringify(action.payload));
        localStorage.setItem("lastActivity", Date.now().toString());
      })
      .addCase(verifyAuth.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.isAuthenticated = false;
        state.hydrated = true;
        state.sessionExpired = false; // Don't automatically set sessionExpired here
        state.error = action.payload;
        // localStorage is already cleared in the thunk
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user || action.payload; // Handle both formats
        state.isAuthenticated = true;
        state.sessionExpired = false;
        state.error = null;

        const userData = action.payload.user || action.payload;
        localStorage.setItem("user", JSON.stringify(userData));

        // Store the auth token separately for API calls
        if (action.payload.token) {
          localStorage.setItem("auth_token", action.payload.token);
          console.log(
            "Auth token stored:",
            action.payload.token.substring(0, 20) + "..."
          );
        }

        localStorage.setItem("lastActivity", Date.now().toString());
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        state.isAuthenticated = false;
        state.sessionExpired = false;
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("lastActivity");
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.sessionExpired = false;
        localStorage.setItem("user", JSON.stringify(action.payload));

        // Store the auth token separately for API calls if returned
        if (action.payload.token) {
          localStorage.setItem("auth_token", action.payload.token);
        }

        localStorage.setItem("lastActivity", Date.now().toString());
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const {
  setUser,
  clearUser,
  updateActivity,
  setSessionExpired,
  resetAuthStatus,
} = authSlice.actions;
export default authSlice.reducer;
