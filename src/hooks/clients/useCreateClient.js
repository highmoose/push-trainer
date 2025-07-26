import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useCreateClient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (clientData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/trainer/clients", clientData);
      setLoading(false);
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create client";
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

export default useCreateClient;
