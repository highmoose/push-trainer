import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchTasks = useCallback(async (filters = {}) => {
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
      setTasks(response.data.tasks || []);
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
    setTasks((prev) => [...prev, tempTask]);

    try {
      const response = await axios.post("/api/tasks", taskData);
      const newTask = response.data.task;

      // Replace temporary task with real data
      setTasks((prev) =>
        prev.map((task) => (task.id === tempId ? newTask : task))
      );

      return newTask;
    } catch (err) {
      // Remove temporary task on error
      setTasks((prev) => prev.filter((task) => task.id !== tempId));
      setError(err.response?.data?.message || "Failed to create task");
      throw err;
    }
  }, []);

  const updateTask = useCallback(
    async (taskId, updates) => {
      // Store previous state for rollback
      const previousTasks = tasks;

      // Optimistic update
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, ...updates, pending: true } : task
        )
      );

      try {
        const response = await axios.put(`/api/tasks/${taskId}`, updates);
        const updatedTask = response.data.task;

        // Update with server response
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...updatedTask, pending: false } : task
          )
        );

        return updatedTask;
      } catch (err) {
        // Rollback on error
        setTasks(previousTasks);
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
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, deleting: true } : task
        )
      );

      try {
        await axios.delete(`/api/tasks/${taskId}`);

        // Remove task from list
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
      } catch (err) {
        // Rollback on error
        setTasks(previousTasks);
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
  // Auto-fetch on mount - only once
  useEffect(() => {
    fetchTasks();
  }, []); // Empty dependency array to run only once on mount

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
