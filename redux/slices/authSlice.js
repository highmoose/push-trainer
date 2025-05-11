import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@lib/axios";

export const register = createAsyncThunk(
  "auth/register",
  async (
    { name, email, password, password_confirmation, role },
    { rejectWithValue }
  ) => {
    try {
      await api.get("/sanctum/csrf-cookie");
      const res = await api.post("/api/register", {
        name,
        email,
        password,
        password_confirmation,
        role,
      });
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
      await api.get("http://localhost:8000/sanctum/csrf-cookie");
      const res = await api.post("http://localhost:8000/api/login", {
        email,
        password,
      });
      return res.data; // should be the user object
    } catch (err) {
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
    } catch (err) {
      if (err.response?.status === 401) {
        // Session already gone — proceed
        return;
      }
      return rejectWithValue("Logout failed");
    } finally {
      localStorage.removeItem("user");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    status: "idle",
    error: null,
    hydrated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.hydrated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.hydrated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload)); // ✅ store user
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        localStorage.removeItem("user"); // ✅ remove user
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
