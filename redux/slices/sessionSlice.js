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

// Update session time (for drag and drop operations)
export const updateSessionTime = createAsyncThunk(
  "sessions/updateTime",
  async ({ id, start_time, end_time }, { rejectWithValue }) => {
    try {
      // Calculate duration in minutes
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);
      const duration = Math.round((endTime - startTime) / (1000 * 60)); // Convert to minutes

      // Format the date for Laravel - send in local format (YYYY-MM-DD HH:mm:ss)
      let formattedStartTime;
      if (start_time.includes("T") && !start_time.includes("Z")) {
        // Local time format (YYYY-MM-DDTHH:mm:ss) - convert T to space for Laravel
        formattedStartTime = start_time.replace("T", " ");
      } else {
        // ISO format - convert to local time string without timezone
        const localTime = new Date(start_time);
        const year = localTime.getFullYear();
        const month = String(localTime.getMonth() + 1).padStart(2, "0");
        const day = String(localTime.getDate()).padStart(2, "0");
        const hour = String(localTime.getHours()).padStart(2, "0");
        const minute = String(localTime.getMinutes()).padStart(2, "0");
        const second = String(localTime.getSeconds()).padStart(2, "0");
        formattedStartTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      }

      console.log(
        "API call - sending formatted time:",
        formattedStartTime,
        "from original:",
        start_time
      );

      const res = await api.put(`/api/sessions/${id}`, {
        scheduled_at: formattedStartTime,
        duration: duration,
      });

      return res.data;
    } catch (err) {
      console.error("Update session time error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to update session time"
      );
    }
  }
);

// Update an existing session
export const updateSession = createAsyncThunk(
  "sessions/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/sessions/${id}`, payload);
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

// Reinstate a session (via PUT) - only sends status
export const reinstateSession = createAsyncThunk(
  "sessions/reinstate",
  async (id, { rejectWithValue }) => {
    try {
      // Use status-only endpoint to avoid datetime conversion issues
      await api.put(`/api/sessions/${id}/status`, { status: "scheduled" });

      // Then fetch the updated session to get fresh data
      const res = await api.get(`/api/sessions`);
      const updatedSession = res.data.find((s) => s.id === id);

      if (!updatedSession) {
        throw new Error("Session not found after update");
      }

      return updatedSession;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to reinstate session"
      );
    }
  }
);

// Delete a session
export const deleteSession = createAsyncThunk(
  "sessions/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/sessions/${id}`);
      return id; // Return id for removing from state
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete session"
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
  reducers: {
    // Optimistic update for session time changes
    updateSessionTimeOptimistic: (state, action) => {
      const { id, start_time, end_time } = action.payload;
      const index = state.list.findIndex((s) => s.id === id);
      if (index !== -1) {
        console.log("Optimistic update applied:", { id, start_time, end_time });
        // Only update the time fields, preserve all other data
        state.list[index] = {
          ...state.list[index], // Preserve all existing session data
          start_time,
          end_time,
        };
        console.log("Updated session:", state.list[index]);
      } else {
        console.warn("Session not found for optimistic update:", id);
      }
    },
    // Revert optimistic update if API call fails
    revertSessionTimeUpdate: (state, action) => {
      const { id, originalSession } = action.payload;
      const index = state.list.findIndex((s) => s.id === id);
      if (index !== -1) {
        state.list[index] = originalSession;
      }
    },
  },
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
        // Backend now returns all necessary fields
        state.list.push(action.payload);
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        console.log(
          "updateSession.fulfilled - Received payload:",
          action.payload
        );
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        console.log("updateSession.fulfilled - Found session at index:", index);
        if (index !== -1) {
          console.log(
            "updateSession.fulfilled - Old session:",
            state.list[index]
          );
          state.list[index] = action.payload;
          console.log(
            "updateSession.fulfilled - Updated session:",
            state.list[index]
          );
        }
      })
      .addCase(updateSessionTime.pending, (state, action) => {
        console.log("updateSessionTime pending:", action.meta.arg);
      })
      .addCase(updateSessionTime.fulfilled, (state, action) => {
        console.log("updateSessionTime fulfilled:", action.payload);
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          console.log(
            "Confirming optimistic update at index:",
            index,
            "with API data:",
            action.payload
          );

          // Preserve all existing session data as base, only update specific fields from API
          const existingSession = state.list[index];
          state.list[index] = {
            ...existingSession, // Keep all existing data as base
            // Only update safe fields from API response that won't break the UI
            id: action.payload.id,
            status: action.payload.status || existingSession.status,
            notes:
              action.payload.notes !== undefined
                ? action.payload.notes
                : existingSession.notes,
            // Preserve the optimistic time updates (don't let API override them)
            start_time: existingSession.start_time,
            end_time: existingSession.end_time,
          };

          console.log(
            "Final session after API confirmation:",
            state.list[index]
          );
        } else {
          console.warn(
            "Session not found for update confirmation:",
            action.payload.id
          );
        }
      })
      .addCase(updateSessionTime.rejected, (state, action) => {
        console.error("updateSessionTime rejected:", action.payload);
        state.error = action.payload;
      })
      .addCase(cancelSession.fulfilled, (state, action) => {
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(reinstateSession.fulfilled, (state, action) => {
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        // Remove the deleted session from the list
        state.list = state.list.filter((s) => s.id !== action.payload);
      });
  },
});

export const { updateSessionTimeOptimistic, revertSessionTimeUpdate } =
  sessionSlice.actions;
export default sessionSlice.reducer;
