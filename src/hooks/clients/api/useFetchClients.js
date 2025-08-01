import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useFetchClients = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/trainer/clients");
      setLoading(false);

      // Ensure data is always an array
      const clientsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data && Array.isArray(response.data.data)
        ? response.data.data
        : [];

      return {
        success: true,
        data: clientsData,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch clients";
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

export default useFetchClients;
