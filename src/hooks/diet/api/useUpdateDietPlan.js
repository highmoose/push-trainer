import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useUpdateDietPlan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (planId, updates) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`/api/diet-plans/${planId}`, updates);
      setLoading(false);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update diet plan";
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

export default useUpdateDietPlan;
