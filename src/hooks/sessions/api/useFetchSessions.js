import { useState, useCallback } from "react";
import api from "@/lib/axios";

const useFetchSessions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (includePast = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = includePast ? { include_past: true } : {};
      const response = await api.get("/api/sessions", { params });
      setLoading(false);

      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch sessions";
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

export default useFetchSessions;
