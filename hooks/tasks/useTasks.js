import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";

// Global cache for tasks
const tasksCache = new Map();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// Cache management utilities
const isCacheValid = (cacheItem) => {
  return cacheItem && Date.now() - cacheItem.timestamp < CACHE_DURATION;
};

const setCacheItem = (key, data) => {
  tasksCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

const getCacheItem = (key) => {
  const cacheItem = tasksCache.get(key);
  return isCacheValid(cacheItem) ? cacheItem.data : null;
};

const clearTasksCache = () => {
  tasksCache.clear();
};

// Make cache clearing available globally
if (typeof window !== "undefined") {
  window.clearTasksCache = clearTasksCache;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (filters = {}, forceRefresh = false) => {
    const cacheKey = `tasks_${JSON.stringify(filters)}`;

    // Check cache first unless forced refresh
    if (!forceRefresh) {
      const cachedTasks = getCacheItem(cacheKey);
      if (cachedTasks) {
        setTasks(cachedTasks);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      console.log("useTasks: Fetching tasks...");
      const params = new URLSearchParams();

      // Add optional filters
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.category) params.append("category", filters.category);
      if (filters.overdue) params.append("overdue", "true");

      const response = await axios.get("/api/tasks", { params });
      console.log("useTasks: Response received:", response.data);
      const tasksData = response.data.tasks || [];
      setTasks(tasksData);
      setCacheItem(cacheKey, tasksData);
    } catch (err) {
      console.error("useTasks: Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    // Generate temporary ID for optimistic update
    const tempId = `temp_${Date.now()}`;
    const tempTask = { ...taskData, id: tempId, pending: true };

    // Optimistic update
    setTasks((prev) => {
      const newTasks = [...prev, tempTask];
      // Clear cache to ensure fresh data
      clearTasksCache();
      return newTasks;
    });

    try {
      const response = await axios.post("/api/tasks", taskData);
      const newTask = response.data.task;

      // Replace temporary task with real data
      setTasks((prev) => {
        const updatedTasks = prev.map((task) =>
          task.id === tempId ? newTask : task
        );
        // Update cache with real data
        setCacheItem("tasks_{}", updatedTasks);
        return updatedTasks;
      });

      return newTask;
    } catch (err) {
      // Remove temporary task on error
      setTasks((prev) => {
        const revertedTasks = prev.filter((task) => task.id !== tempId);
        // Update cache by removing temporary task
        setCacheItem("tasks_{}", revertedTasks);
        return revertedTasks;
      });
      setError(err.response?.data?.message || "Failed to create task");
      throw err;
    }
  }, []);

  const updateTask = useCallback(
    async (taskId, updates) => {
      // Store previous state for rollback
      const previousTasks = tasks;

      // Optimistic update
      setTasks((prev) => {
        const updatedTasks = prev.map((task) =>
          task.id === taskId ? { ...task, ...updates, pending: true } : task
        );
        // Clear cache to ensure fresh data
        clearTasksCache();
        return updatedTasks;
      });

      try {
        const response = await axios.put(`/api/tasks/${taskId}`, updates);
        const updatedTask = response.data.task;

        // Update with server response
        setTasks((prev) => {
          const finalTasks = prev.map((task) =>
            task.id === taskId ? { ...updatedTask, pending: false } : task
          );
          // Update cache with fresh data
          setCacheItem("tasks_{}", finalTasks);
          return finalTasks;
        });

        return updatedTask;
      } catch (err) {
        // Rollback on error
        setTasks(previousTasks);
        setCacheItem("tasks_{}", previousTasks);
        setError(err.response?.data?.message || "Failed to update task");
        throw err;
      }
    },
    [tasks]
  );

  const deleteTask = useCallback(
    async (taskId) => {
      // Store previous state for rollback
      const previousTasks = tasks;

      // Optimistic update - mark as deleting
      setTasks((prev) => {
        const updatedTasks = prev.map((task) =>
          task.id === taskId ? { ...task, deleting: true } : task
        );
        // Clear cache during deletion
        clearTasksCache();
        return updatedTasks;
      });

      try {
        await axios.delete(`/api/tasks/${taskId}`);

        // Remove task from list
        setTasks((prev) => {
          const filteredTasks = prev.filter((task) => task.id !== taskId);
          // Update cache with filtered data
          setCacheItem("tasks_{}", filteredTasks);
          return filteredTasks;
        });
      } catch (err) {
        // Rollback on error
        setTasks(previousTasks);
        setCacheItem("tasks_{}", previousTasks);
        setError(err.response?.data?.message || "Failed to delete task");
        throw err;
      }
    },
    [tasks]
  );

  const completeTask = useCallback(
    async (taskId) => {
      return updateTask(taskId, { status: "completed" });
    },
    [updateTask]
  );

  const markOverdue = useCallback(
    async (taskId) => {
      return updateTask(taskId, { status: "overdue" });
    },
    [updateTask]
  );

  const assignTask = useCallback(
    async (taskId, assigneeId) => {
      return updateTask(taskId, { assignee_id: assigneeId });
    },
    [updateTask]
  );
  // Auto-fetch on mount with cache check
  useEffect(() => {
    // Try to load from cache first for immediate UI feedback
    const cachedTasks = getCacheItem("tasks_{}");
    if (cachedTasks) {
      setTasks(cachedTasks);
    }

    // Always fetch fresh data, but cache will provide immediate feedback
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    markOverdue,
    assignTask,
    // Cache management
    clearCache: clearTasksCache,
    // Helper methods
    getTask: useCallback((id) => tasks.find((t) => t.id === id), [tasks]),
    getTasksByStatus: useCallback(
      (status) => tasks.filter((t) => t.status === status),
      [tasks]
    ),
    getOverdueTasks: useCallback(
      () => tasks.filter((t) => t.status === "overdue"),
      [tasks]
    ),
    getTaskCount: useCallback(() => tasks.length, [tasks]),
  };
};
