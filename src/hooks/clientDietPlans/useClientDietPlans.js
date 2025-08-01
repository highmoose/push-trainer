import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";

/**
 * Hook for managing a client's diet plans with internal state management
 */
const useClientDietPlans = (clientId = null) => {
  // State management
  const [clientPlans, setClientPlans] = useState([]);
  console.log("clientPlans 335266", clientPlans);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePlan, setActivePlan] = useState(null);

  const fetchClientDietPlans = useCallback(
    async (targetClientId = null) => {
      const idToUse = targetClientId || clientId;

      if (!idToUse) {
        setError("Client ID is required");
        return { success: false, error: "Client ID is required" };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/diet-plans/client/${idToUse}`);
        const rawData = response.data;
        console.log("Fetched client diet plans:", rawData);
        const plans = Array.isArray(rawData.data?.data)
          ? response.data.data.data
          : [];
        console.log("Parsed client diet plans:", plans);

        setClientPlans(plans);

        // Find and set the active plan
        const active = plans.find((plan) => plan.is_active) || null;
        setActivePlan(active);

        setLoading(false);
        return {
          success: true,
          data: plans,
        };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to get client diet plans";

        setError(errorMessage);
        setClientPlans([]);
        setActivePlan(null);
        setLoading(false);

        return {
          success: false,
          error: errorMessage,
          data: [],
        };
      }
    },
    [clientId]
  );

  // Auto-fetch when clientId changes
  useEffect(() => {
    if (clientId) {
      fetchClientDietPlans(clientId);
    }
  }, [clientId, fetchClientDietPlans]);

  const activatePlan = useCallback(
    async (planId) => {
      if (!clientId || !planId) {
        throw new Error("Client ID and Plan ID are required");
      }

      try {
        const response = await axios.post(
          `/api/diet-plans/client/${clientId}/activate`,
          {
            plan_id: planId,
          }
        );

        // Refresh the client plans after activation
        await fetchClientDietPlans(clientId);

        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to activate diet plan";
        throw new Error(errorMessage);
      }
    },
    [clientId, fetchClientDietPlans]
  );

  const deactivatePlan = useCallback(
    async (planId = null) => {
      if (!clientId) {
        throw new Error("Client ID is required");
      }

      try {
        const payload = planId ? { plan_id: planId } : {};
        const response = await axios.post(
          `/api/diet-plans/client/${clientId}/deactivate`,
          payload
        );

        // Refresh the client plans after deactivation
        await fetchClientDietPlans(clientId);

        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to deactivate diet plan";
        throw new Error(errorMessage);
      }
    },
    [clientId, fetchClientDietPlans]
  );

  const refetch = useCallback(() => {
    if (clientId) {
      return fetchClientDietPlans(clientId);
    }
  }, [clientId, fetchClientDietPlans]);

  return {
    // State
    clientPlans,
    activePlan,
    loading,
    error,

    // Actions
    fetchClientDietPlans,
    activatePlan,
    deactivatePlan,
    refetch,
  };
};

export default useClientDietPlans;
