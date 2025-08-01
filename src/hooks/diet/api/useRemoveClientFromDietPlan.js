import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useRemoveClientFromDietPlan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (planId, clientId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.delete(
        `/api/diet-plans/${planId}/clients/${clientId}`
      );
      setLoading(false);
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to remove client from diet plan";
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

export default useRemoveClientFromDietPlan;
