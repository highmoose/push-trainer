import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useAssignDietPlanToClients = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (planId, clientIds) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `/api/diet-plans/${planId}/assign-clients`,
        {
          client_ids: clientIds,
        }
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
        "Failed to assign diet plan to clients";
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

export default useAssignDietPlanToClients;
