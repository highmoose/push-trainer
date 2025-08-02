import { useState, useCallback } from "react";
import api from "@/lib/axios";

const useCancelSession = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/api/sessions/${id}`, {
        status: "cancelled",
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
        "Failed to cancel session";
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

export default useCancelSession;
