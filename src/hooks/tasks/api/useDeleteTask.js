import { useState, useCallback } from "react";
import api from "@/lib/axios";

const useDeleteTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/api/tasks/${id}`);
      setLoading(false);

      return {
        success: true,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete task";
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

export default useDeleteTask;
