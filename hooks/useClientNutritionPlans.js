import { useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";

// Global refresh trigger to coordinate all hook instances
let globalRefreshTrigger = 0;
const refreshListeners = new Set();

const triggerGlobalRefresh = () => {
  globalRefreshTrigger++;
  refreshListeners.forEach((listener) => listener(globalRefreshTrigger));
};

export const useClientNutritionPlans = (clientId) => {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Fetch all plans for the client
  const fetchPlans = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/diet-plans/client/${clientId}`);
      if (response.data.success) {
        setPlans(response.data.data);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error("Error fetching client plans:", err);
      setError("Failed to load nutrition plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the active plan for the client
  const fetchActivePlan = async () => {
    if (!clientId) return;

    try {
      const response = await axios.get(
        `/api/diet-plans/client/${clientId}/active`
      );
      if (response.data.success && response.data.data) {
        setActivePlan(response.data.data);
      } else {
        setActivePlan(null);
      }
    } catch (err) {
      console.error("Error fetching active plan:", err);
      setActivePlan(null);
    }
  };

  // Set a plan as active
  const setAsActive = async (planId) => {
    try {
      const response = await axios.post(`/api/diet-plans/${planId}/activate`, {
        client_id: clientId,
      });

      if (response.data.success) {
        // Refresh both plans and active plan locally
        await Promise.all([fetchPlans(), fetchActivePlan()]);

        // Trigger global refresh for all hook instances
        triggerGlobalRefresh();

        return { success: true };
      }
    } catch (err) {
      console.error("Error activating plan:", err);
      return { success: false, error: "Failed to activate nutrition plan" };
    }
  };

  // Deactivate the current active plan
  const deactivatePlan = async () => {
    try {
      const response = await axios.delete(
        `/api/diet-plans/client/${clientId}/deactivate`
      );

      if (response.data.success) {
        setActivePlan(null);
        await fetchPlans(); // Refresh plans to update any status changes

        // Trigger global refresh for all hook instances
        triggerGlobalRefresh();

        return { success: true };
      }
    } catch (err) {
      console.error("Error deactivating plan:", err);
      return { success: false, error: "Failed to deactivate nutrition plan" };
    }
  };

  // Refresh all data
  const refresh = async () => {
    await Promise.all([fetchPlans(), fetchActivePlan()]);
  };

  // Listen for global refresh triggers
  useEffect(() => {
    const handleGlobalRefresh = (trigger) => {
      setRefreshCounter(trigger);
    };

    const handleCustomEvent = () => {
      if (clientId) {
        refresh();
      }
    };

    refreshListeners.add(handleGlobalRefresh);

    // Listen for custom nutrition refresh events
    if (typeof window !== "undefined") {
      window.addEventListener("nutrition-plan-refresh", handleCustomEvent);
    }

    return () => {
      refreshListeners.delete(handleGlobalRefresh);
      if (typeof window !== "undefined") {
        window.removeEventListener("nutrition-plan-refresh", handleCustomEvent);
      }
    };
  }, [clientId]);

  // React to global refresh triggers
  useEffect(() => {
    if (refreshCounter > 0 && clientId) {
      refresh();
    }
  }, [refreshCounter, clientId]);

  // Load data when clientId changes
  useEffect(() => {
    if (clientId) {
      fetchPlans();
      fetchActivePlan();
    } else {
      setPlans([]);
      setActivePlan(null);
    }
  }, [clientId]);

  return {
    plans,
    activePlan,
    loading,
    error,
    setAsActive,
    deactivatePlan,
    refresh,
    fetchPlans,
    fetchActivePlan,
  };
};

export default useClientNutritionPlans;
