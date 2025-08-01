import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useGetClient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (clientId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/trainer/clients/${clientId}`);
      setLoading(false);
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to get client";
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

export default useGetClient;
