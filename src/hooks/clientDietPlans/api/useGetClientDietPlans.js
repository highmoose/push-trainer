import { useState, useCallback } from "react";
import axios from "@/lib/axios";

const useGetClientDietPlans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (clientId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/diet-plans/client/${clientId}`);
      setLoading(false);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to get client diet plans";
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

// Standalone activate function for backwards compatibility
const activateDietPlan = async (clientId, planId) => {
  if (!clientId || !planId) {
    throw new Error("Client ID and Plan ID are required");
  }

  const response = await axios.post(
    `/api/diet-plans/client/${clientId}/activate`,
    {
      plan_id: planId,
    }
  );
  if (response.status !== 200) {
    throw new Error("Failed to activate diet plan");
  }
  // Return the updated diet plans
  if (!response.data || !response.data.data) {
    throw new Error("Unexpected response format");
  }

  // Return the updated diet plans
  return response.data.data || response.data;
};

// Standalone deactivate function for backwards compatibility
const deactivateDietPlan = async (clientId, planId = null) => {
  if (!clientId) {
    throw new Error("Client ID is required");
  }

  const payload = planId ? { plan_id: planId } : {};
  const response = await axios.post(
    `/api/diet-plans/client/${clientId}/deactivate`,
    payload
  );

  if (response.status !== 200) {
    throw new Error("Failed to deactivate diet plan");
  }

  if (!response.data || !response.data.data) {
    throw new Error("Unexpected response format");
  }

  return response.data.data || response.data;
};

export { useGetClientDietPlans, activateDietPlan, deactivateDietPlan };

export default useGetClientDietPlans;
