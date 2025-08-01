import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useGenerateDietPlan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (clientId, preferences = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/diet-plans/generate", {
        client_id: clientId,
        ...preferences,
      });
      setLoading(false);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to generate diet plan";
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

export default useGenerateDietPlan;
