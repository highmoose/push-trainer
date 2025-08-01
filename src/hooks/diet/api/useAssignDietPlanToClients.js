import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useAssignDietPlanToClients = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (requestData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `/api/diet-plans/${requestData.diet_plan_id}/assign`,
        {
          client_id: requestData.client_ids[0], // API expects single client_id
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
        "Failed to assign diet plan to client";
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
