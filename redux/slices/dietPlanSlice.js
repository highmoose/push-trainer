import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@lib/axios";

// Fetch all diet plans for the trainer
export const fetchDietPlans = createAsyncThunk(
  "dietPlans/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/diet-plans");
      return res.data.plans;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch diet plans"
      );
    }
  }
);

// Create a new diet plan
export const createDietPlan = createAsyncThunk(
  "dietPlans/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/diet-plans", payload);
      return res.data.plan;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create diet plan"
      );
    }
  }
);

// Generate diet plan using AI
export const generateDietPlan = createAsyncThunk(
  "dietPlans/generate",
  async (
    {
      prompt,
      aiProvider = "openai",
      clientId = null,
      title,
      planType,
      mealsPerDay,
      mealComplexity,
      customCalories = null,
      additionalNotes = "",
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/api/diet-plans/generate", {
        prompt,
        ai_provider: aiProvider,
        client_id: clientId,
        title,
        plan_type: planType,
        meals_per_day: mealsPerDay,
        meal_complexity: mealComplexity,
        custom_calories: customCalories,
        additional_notes: additionalNotes,
      });
      return res.data.plan;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to generate diet plan"
      );
    }
  }
);

// Fetch single diet plan details
export const fetchPlanDetails = createAsyncThunk(
  "dietPlans/fetchDetails",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/diet-plans/${id}`);
      return res.data.plan;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch plan details"
      );
    }
  }
);

// Update a diet plan
export const updateDietPlan = createAsyncThunk(
  "dietPlans/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/diet-plans/${id}`, data);
      return res.data.plan;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update diet plan"
      );
    }
  }
);

// Delete a diet plan
export const deleteDietPlan = createAsyncThunk(
  "dietPlans/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/diet-plans/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete diet plan"
      );
    }
  }
);

// Duplicate diet plan to other clients
export const duplicateDietPlan = createAsyncThunk(
  "dietPlans/duplicate",
  async ({ id, clientIds }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/diet-plans/${id}/duplicate`, {
        client_ids: clientIds,
      });
      return res.data.plans;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to duplicate diet plan"
      );
    }
  }
);

// Link diet plan to clients
export const linkDietPlanToClients = createAsyncThunk(
  "dietPlans/linkToClients",
  async ({ id, clientIds }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/diet-plans/${id}/link-clients`, {
        client_ids: clientIds,
      });
      return res.data.plan;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to link diet plan to clients"
      );
    }
  }
);

const dietPlanSlice = createSlice({
  name: "dietPlans",
  initialState: {
    list: [],
    current: null,
    generating: false,
    status: "idle", // idle, loading, succeeded, failed
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPlan: (state, action) => {
      state.current = action.payload;
    },
    clearCurrentPlan: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch diet plans
      .addCase(fetchDietPlans.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDietPlans.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchDietPlans.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create diet plan
      .addCase(createDietPlan.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createDietPlan.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list.push(action.payload);
        state.current = action.payload;
      })
      .addCase(createDietPlan.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Generate diet plan
      .addCase(generateDietPlan.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateDietPlan.fulfilled, (state, action) => {
        state.generating = false;
        state.list.push(action.payload);
        state.current = action.payload;
      })
      .addCase(generateDietPlan.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      })

      // Fetch plan details
      .addCase(fetchPlanDetails.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPlanDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchPlanDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update diet plan
      .addCase(updateDietPlan.fulfilled, (state, action) => {
        const index = state.list.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })

      // Delete diet plan
      .addCase(deleteDietPlan.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
        if (state.current?.id === action.payload) {
          state.current = null;
        }
      })

      // Duplicate diet plan
      .addCase(duplicateDietPlan.fulfilled, (state, action) => {
        state.list.push(...action.payload);
      })

      // Link diet plan to clients
      .addCase(linkDietPlanToClients.fulfilled, (state, action) => {
        const index = state.list.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentPlan, clearCurrentPlan } =
  dietPlanSlice.actions;
export default dietPlanSlice.reducer;
