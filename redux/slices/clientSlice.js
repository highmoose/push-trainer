import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@lib/axios";

// Fetch all clients for the trainer
export const fetchClients = createAsyncThunk(
  "clients/fetchAll",
  async (searchString = "", { rejectWithValue }) => {
    try {
      console.log("fetchClients: Starting API call...");
      const res = await api.get("/api/trainer/clients", {
        params: searchString ? { search: searchString } : {},
      });
      console.log("fetchClients: Success", res.data);
      return res.data.clients;
    } catch (err) {
      console.error("fetchClients: Error", err.response || err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch clients"
      );
    }
  }
);

// Add a new client
export const addClient = createAsyncThunk(
  "clients/add",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/trainer/clients", payload);
      return res.data.client;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add client"
      );
    }
  }
);

// Add a temporary client to be linked to a real client later
export const addTempClient = createAsyncThunk(
  "clients/addTemp",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/trainer/clients/addTemp", payload);
      return res.data.client;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add temp client"
      );
    }
  }
);

// Get a single client by ID
export const getClient = createAsyncThunk(
  "clients/get",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/trainer/clients/${id}`);
      return res.data.client;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch client"
      );
    }
  }
);

// Update a client
export const updateClient = createAsyncThunk(
  "clients/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/trainer/clients/${id}`, data);
      return res.data.client;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update client"
      );
    }
  }
);

// Delete a client
export const deleteClient = createAsyncThunk(
  "clients/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/trainer/clients/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete client"
      );
    }
  }
);

const clientSlice = createSlice({
  name: "clients",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      if (state.status === "failed") {
        state.status = "idle";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addTempClient.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(fetchClients.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addClient.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.list.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      });
  },
});

export const { clearError } = clientSlice.actions;

export default clientSlice.reducer;
