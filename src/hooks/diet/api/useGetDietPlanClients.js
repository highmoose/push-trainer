import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useGetDietPlanClients = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (planId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/diet-plans/${planId}/clients`);
      setLoading(false);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to get diet plan clients";
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

export default useGetDietPlanClients;
