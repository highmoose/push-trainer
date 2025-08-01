import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useActivateClientDietPlan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (clientId, planId) => {
    if (!clientId || !planId) {
      const errorMessage = "Client ID and Plan ID are required";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `/api/diet-plans/client/${clientId}/activate`,
        {
          plan_id: planId,
        }
      );

      setLoading(false);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Diet plan activated successfully",
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to activate diet plan";
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

export default useActivateClientDietPlan;
