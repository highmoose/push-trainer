import { useState, useCallback } from "react";
import api from "@/lib/axios";

const useFetchTasks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.overdue) params.overdue = "true";

      const response = await api.get("/api/tasks", { params });
      setLoading(false);

      return {
        success: true,
        data: response.data.tasks,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch tasks";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  return {
    execute,
    loading,
    error,
  };
};

export default useFetchTasks;
