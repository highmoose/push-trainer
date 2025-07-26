import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useFetchDietPlans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/diet-plans", { params });
      setLoading(false);
      return {
        success: true,
        data: response.data.data || response.data,
        meta: response.data.meta || null,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch diet plans";
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

export default useFetchDietPlans;
