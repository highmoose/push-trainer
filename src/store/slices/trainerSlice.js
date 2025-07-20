import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Fetch trainer for the client
export const fetchClientTrainer = createAsyncThunk(
  "trainer/fetchClientTrainer",
  async (_, { rejectWithValue }) => {
    try {
      console.log("fetchClientTrainer: Starting API call...");
      const res = await api.get("/api/client/trainer");
      console.log("fetchClientTrainer: Success", res.data);
      return res.data.trainer;
    } catch (err) {
      console.error("fetchClientTrainer: Error", err.response || err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch trainer"
      );
    }
  }
);

const trainerSlice = createSlice({
  name: "trainer",
  initialState: {
    info: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientTrainer.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchClientTrainer.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.info = action.payload;
        state.error = null;
      })
      .addCase(fetchClientTrainer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearError } = trainerSlice.actions;
export default trainerSlice.reducer;

