import { useState, useCallback } from "react";
import api from "@/lib/axios";

const useUpdateSessionTime = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (id, timeData) => {
    setLoading(true);
    setError(null);

    try {
      // Extract start_time and end_time from timeData
      const { start_time, end_time } = timeData;

      // Calculate duration in minutes
      const start = new Date(start_time);
      const end = new Date(end_time);
      const duration = Math.round((end - start) / (1000 * 60));

      const response = await api.put(`/api/sessions/${id}`, {
        start_time,
        end_time,
        duration,
      });
      setLoading(false);

      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update session time";
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

export default useUpdateSessionTime;
