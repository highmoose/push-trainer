import { useState, useCallback } from "react";
import api from "@/lib/axios";

const useUpdateTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/api/tasks/${id}`, updates);
      setLoading(false);

      return {
        success: true,
        data: response.data.task,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update task";
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

export default useUpdateTask;
