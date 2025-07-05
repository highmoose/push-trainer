import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@lib/axios";

// Fetch all tasks for the trainer
export const fetchTasks = createAsyncThunk(
  "tasks/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Add optional filters
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.category) params.append("category", filters.category);
      if (filters.overdue) params.append("overdue", "true");

      const res = await api.get("/api/tasks", { params });
      return res.data.tasks;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch tasks"
      );
    }
  }
);

// Create a new task
export const createTask = createAsyncThunk(
  "tasks/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/tasks", payload);
      return res.data.task;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create task"
      );
    }
  }
);

// Update a task
export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/tasks/${id}`, data);
      return res.data.task;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update task"
      );
    }
  }
);

// Delete a task
export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete task"
      );
    }
  }
);

// Mark task as completed
export const markTaskCompleted = createAsyncThunk(
  "tasks/markCompleted",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/api/tasks/${id}/complete`);
      return res.data.task;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark task as completed"
      );
    }
  }
);

// Get task statistics
export const fetchTaskStatistics = createAsyncThunk(
  "tasks/fetchStatistics",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/tasks/statistics");
      return res.data.statistics;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch task statistics"
      );
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    list: [],
    statistics: {
      total: 0,
      pending: 0,
      completed: 0,
      overdue: 0,
      high_priority: 0,
      due_today: 0,
      due_this_week: 0,
    },
    status: "idle", // idle, loading, succeeded, failed
    error: null,
    statisticsStatus: "idle",
    statisticsError: null,
  },
  reducers: {
    // Clear error messages
    clearError: (state) => {
      state.error = null;
      state.statisticsError = null;
    }, // Reset tasks state
    resetTasks: (state) => {
      state.list = [];
      state.status = "idle";
      state.error = null;
    }, // Optimistic task update
    updateTaskOptimistic: (state, action) => {
      const { id, updates } = action.payload;
      const taskIndex = state.list.findIndex((t) => t.id === id);
      if (taskIndex !== -1) {
        const oldTask = state.list[taskIndex];
        const newTask = {
          ...oldTask,
          ...updates,
        };

        state.list[taskIndex] = newTask;

        // Update statistics if status changed
        if (updates.status && oldTask.status !== updates.status) {
          state.statistics[oldTask.status] = Math.max(
            0,
            state.statistics[oldTask.status] - 1
          );
          state.statistics[updates.status] =
            (state.statistics[updates.status] || 0) + 1;
        }
      }
    }, // Revert optimistic update
    revertTaskUpdate: (state, action) => {
      const { id, originalTask } = action.payload;
      const taskIndex = state.list.findIndex((t) => t.id === id);
      if (taskIndex !== -1 && originalTask) {
        const currentTask = state.list[taskIndex];

        // Revert statistics if status was changed
        if (currentTask.status !== originalTask.status) {
          state.statistics[currentTask.status] = Math.max(
            0,
            state.statistics[currentTask.status] - 1
          );
          state.statistics[originalTask.status] =
            (state.statistics[originalTask.status] || 0) + 1;
        }

        state.list[taskIndex] = originalTask;
      }
    },
    // Optimistic mark task as completed
    markTaskCompletedOptimistic: (state, action) => {
      const { id } = action.payload;
      const taskIndex = state.list.findIndex((t) => t.id === id);
      if (taskIndex !== -1) {
        const oldStatus = state.list[taskIndex].status;
        state.list[taskIndex].status = "completed";

        // Update statistics optimistically
        if (oldStatus !== "completed") {
          state.statistics[oldStatus] = Math.max(
            0,
            state.statistics[oldStatus] - 1
          );
          state.statistics.completed += 1;
        }
      }
    },
    // Revert optimistic mark as completed
    revertMarkTaskCompleted: (state, action) => {
      const { id, originalTask, originalStats } = action.payload;
      const taskIndex = state.list.findIndex((t) => t.id === id);
      if (taskIndex !== -1 && originalTask) {
        state.list[taskIndex] = originalTask;
      }
      if (originalStats) {
        state.statistics = originalStats;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create task
      .addCase(createTask.pending, (state) => {
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.list.push(action.payload);
        // Update statistics counters
        state.statistics.total += 1;
        state.statistics.pending += 1;
        if (action.payload.priority === "high") {
          state.statistics.high_priority += 1;
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload;
      }) // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        // For status updates (like completion toggle), don't automatically update state
        // Let optimistic updates handle the UI to prevent double-toggle
        const index = state.list.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          const oldTask = state.list[index];

          // Only update if this is NOT a status change (to avoid double toggle)
          if (oldTask.status === action.payload.status) {
            // Same status - this is likely a different field update, safe to apply
            state.list[index] = action.payload;
          } else {
            // Status change - skip to prevent double toggle
            console.log(
              "updateTask.fulfilled - skipping status change to prevent double toggle"
            );
          }
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        const taskIndex = state.list.findIndex((t) => t.id === action.payload);
        if (taskIndex !== -1) {
          const task = state.list[taskIndex];
          state.list = state.list.filter((t) => t.id !== action.payload);

          // Update statistics
          state.statistics.total = Math.max(0, state.statistics.total - 1);
          state.statistics[task.status] = Math.max(
            0,
            state.statistics[task.status] - 1
          );
          if (task.priority === "high") {
            state.statistics.high_priority = Math.max(
              0,
              state.statistics.high_priority - 1
            );
          }
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      }) // Mark task completed
      .addCase(markTaskCompleted.fulfilled, (state, action) => {
        // Don't automatically update state - let optimistic updates handle the UI
        // This prevents the double-toggle issue completely
        console.log(
          "markTaskCompleted.fulfilled - skipping state update to prevent double toggle"
        );
      })
      .addCase(markTaskCompleted.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch statistics
      .addCase(fetchTaskStatistics.pending, (state) => {
        state.statisticsStatus = "loading";
        state.statisticsError = null;
      })
      .addCase(fetchTaskStatistics.fulfilled, (state, action) => {
        state.statisticsStatus = "succeeded";
        state.statistics = action.payload;
      })
      .addCase(fetchTaskStatistics.rejected, (state, action) => {
        state.statisticsStatus = "failed";
        state.statisticsError = action.payload;
      });
  },
});

export const {
  clearError,
  resetTasks,
  updateTaskOptimistic,
  revertTaskUpdate,
  markTaskCompletedOptimistic,
  revertMarkTaskCompleted,
} = taskSlice.actions;
export default taskSlice.reducer;
