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

  // Silent fetch for syncing - doesn't trigger loading states
  const silentFetchClientDietPlans = useCallback(
    async (targetClientId = null) => {
      const idToUse = targetClientId || clientId;

      if (!idToUse) {
        return { success: false, error: "Client ID is required" };
      }

      try {
        const response = await axios.get(`/api/diet-plans/client/${idToUse}`);
        const rawData = response.data;
        const plans = Array.isArray(rawData.data?.data)
          ? response.data.data.data
          : [];

        return {
          success: true,
          data: plans,
        };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to get client diet plans";

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
    async (planId, activationData = null) => {
      if (!clientId || !planId) {
        throw new Error("Client ID and Plan ID are required");
      }

      // Optimistic update - update UI immediately
      const previousPlans = [...clientPlans];
      const previousActivePlan = activePlan;

      try {
        // Optimistically update the state
        const updatedPlans = clientPlans.map((plan) => ({
          ...plan,
          is_active: plan.id === planId,
        }));

        setClientPlans(updatedPlans);
        const newActivePlan = updatedPlans.find((plan) => plan.id === planId);
        setActivePlan(newActivePlan);

        // Build request payload
        const payload = {
          plan_id: planId,
        };

        // Add activation data if provided
        if (activationData) {
          payload.activation_data = activationData;
        }

        // Make the API call
        const response = await axios.post(
          `/api/diet-plans/client/${clientId}/activate`,
          payload
        );

        // Sync with server data only if different (avoid unnecessary re-renders)
        const serverResult = await silentFetchClientDietPlans(clientId);
        if (serverResult.success) {
          const serverPlans = serverResult.data;
          // Only update if server data differs from our optimistic state
          const hasChanges = serverPlans.some((serverPlan, index) => {
            const optimisticPlan = updatedPlans[index];
            return (
              !optimisticPlan ||
              serverPlan.is_active !== optimisticPlan.is_active
            );
          });

          if (hasChanges) {
            setClientPlans(serverPlans);
            const serverActivePlan =
              serverPlans.find((plan) => plan.is_active) || null;
            setActivePlan(serverActivePlan);
          }
        }

        return response.data;
      } catch (error) {
        // Revert optimistic updates on error
        setClientPlans(previousPlans);
        setActivePlan(previousActivePlan);

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to activate diet plan";
        throw new Error(errorMessage);
      }
    },
    [clientId, clientPlans, activePlan, silentFetchClientDietPlans]
  );

  const deactivatePlan = useCallback(
    async (planId = null) => {
      if (!clientId) {
        throw new Error("Client ID is required");
      }

      // Optimistic update - update UI immediately
      const previousPlans = [...clientPlans];
      const previousActivePlan = activePlan;

      try {
        // Optimistically update the state
        let updatedPlans;
        if (planId) {
          // Deactivate specific plan
          updatedPlans = clientPlans.map((plan) =>
            plan.id === planId ? { ...plan, is_active: false } : plan
          );
        } else {
          // Deactivate all plans
          updatedPlans = clientPlans.map((plan) => ({
            ...plan,
            is_active: false,
          }));
        }

        setClientPlans(updatedPlans);

        // Update active plan state
        const newActivePlan =
          updatedPlans.find((plan) => plan.is_active) || null;
        setActivePlan(newActivePlan);

        // Make the API call
        const payload = planId ? { plan_id: planId } : {};
        const response = await axios.post(
          `/api/diet-plans/client/${clientId}/deactivate`,
          payload
        );

        // Sync with server data only if different (avoid unnecessary re-renders)
        const serverResult = await silentFetchClientDietPlans(clientId);
        if (serverResult.success) {
          const serverPlans = serverResult.data;
          // Only update if server data differs from our optimistic state
          const hasChanges = serverPlans.some((serverPlan, index) => {
            const optimisticPlan = updatedPlans[index];
            return (
              !optimisticPlan ||
              serverPlan.is_active !== optimisticPlan.is_active
            );
          });

          if (hasChanges) {
            setClientPlans(serverPlans);
            const serverActivePlan =
              serverPlans.find((plan) => plan.is_active) || null;
            setActivePlan(serverActivePlan);
          }
        }

        return response.data;
      } catch (error) {
        // Revert optimistic updates on error
        setClientPlans(previousPlans);
        setActivePlan(previousActivePlan);

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to deactivate diet plan";
        throw new Error(errorMessage);
      }
    },
    [clientId, clientPlans, activePlan, silentFetchClientDietPlans]
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
