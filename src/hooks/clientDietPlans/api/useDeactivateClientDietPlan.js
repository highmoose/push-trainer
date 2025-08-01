import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useDeactivateClientDietPlan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (clientId, planId = null) => {
    if (!clientId) {
      const errorMessage = "Client ID is required";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    setLoading(true);
    setError(null);

    try {
      const payload = planId ? { plan_id: planId } : {};
      const response = await axios.post(
        `/api/diet-plans/client/${clientId}/deactivate`,
        payload
      );

      setLoading(false);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Diet plan deactivated successfully",
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to deactivate diet plan";
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

export default useDeactivateClientDietPlan;
