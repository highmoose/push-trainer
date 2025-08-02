import { useState, useCallback } from "react";
import api from "@/lib/axios";

const useCreateTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/tasks", taskData);
      setLoading(false);

      return {
        success: true,
        data: response.data.task,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create task";
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

export default useCreateTask;
