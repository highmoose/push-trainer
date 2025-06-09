import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@lib/axios";

// Fetch all sessions for the authenticated trainer
export const fetchSessions = createAsyncThunk(
  "sessions/fetchAll",
  async (includePast = false, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/sessions", {
        params: includePast ? { include_past: true } : {},
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch sessions"
      );
    }
  }
);

// Create a new session
export const createSession = createAsyncThunk(
  "sessions/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/sessions", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create session"
      );
    }
  }
);

// Update an existing session
export const updateSession = createAsyncThunk(
  "sessions/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/sessions/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update session"
      );
    }
  }
);

// Cancel a session (via PUT)
export const cancelSession = createAsyncThunk(
  "sessions/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/sessions/${id}`, { status: "cancelled" });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to cancel session"
      );
    }
  }
);

const sessionSlice = createSlice({
  name: "sessions",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(cancelSession.fulfilled, (state, action) => {
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export default sessionSlice.reducer;
