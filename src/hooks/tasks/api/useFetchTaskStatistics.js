import { useState, useCallback } from "react";
import api from "@/lib/axios";

const useFetchTaskStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/tasks/statistics");
      setLoading(false);

      return {
        success: true,
        data: response.data.statistics,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch task statistics";
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

export default useFetchTaskStatistics;
