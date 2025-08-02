import { useState, useCallback } from "react";
import api from "@/lib/axios";

const useCreateSession = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (sessionData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/sessions", sessionData);
      setLoading(false);

      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create session";
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

export default useCreateSession;
