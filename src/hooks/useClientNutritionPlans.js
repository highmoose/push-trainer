import { useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";

// Global cache for nutrition plans
const nutritionCache = new Map();
const activePlanCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Global refresh trigger to coordinate all hook instances
let globalRefreshTrigger = 0;
const refreshListeners = new Set();

const triggerGlobalRefresh = () => {
  globalRefreshTrigger++;
  refreshListeners.forEach((listener) => listener(globalRefreshTrigger));
};

// Cache management utilities
const getCacheKey = (clientId, type) => `${clientId}_${type}`;
const isCacheValid = (cacheItem) => {
  return cacheItem && Date.now() - cacheItem.timestamp < CACHE_DURATION;
};

const setCacheItem = (key, data) => {
  nutritionCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

const getCacheItem = (key) => {
  const cacheItem = nutritionCache.get(key);
  return isCacheValid(cacheItem) ? cacheItem.data : null;
};

const clearCache = (clientId) => {
  const plansKey = getCacheKey(clientId, "plans");
  const activeKey = getCacheKey(clientId, "active");
  nutritionCache.delete(plansKey);
  activePlanCache.delete(activeKey);
};

const clearAllClientNutritionCache = () => {
  nutritionCache.clear();
  activePlanCache.clear();
};

// Make cache clearing available globally
if (typeof window !== "undefined") {
  window.clearClientNutritionCache = clearAllClientNutritionCache;
}

export const useClientNutritionPlans = (clientId) => {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Fetch all plans for the client with caching
  const fetchPlans = useCallback(
    async (forceRefresh = false) => {
      if (!clientId) return;

      const cacheKey = getCacheKey(clientId, "plans");

      // Check cache first unless forced refresh
      if (!forceRefresh) {
        const cachedPlans = getCacheItem(cacheKey);
        if (cachedPlans) {
          setPlans(cachedPlans);
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/api/diet-plans/client/${clientId}`);
        if (response.data.success) {
          const plansData = response.data.data || [];
          setPlans(plansData);
          setCacheItem(cacheKey, plansData);
        } else {
          setPlans([]);
          setCacheItem(cacheKey, []);
        }
      } catch (err) {
        console.error("Error fetching client plans:", err);
        setError("Failed to load nutrition plans");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    },
    [clientId]
  );

  // Fetch the active plan for the client with caching
  const fetchActivePlan = useCallback(
    async (forceRefresh = false) => {
      if (!clientId) return;

      const cacheKey = getCacheKey(clientId, "active");

      // Check cache first unless forced refresh
      if (!forceRefresh) {
        const cachedActivePlan = getCacheItem(cacheKey);
        if (cachedActivePlan !== null) {
          setActivePlan(cachedActivePlan);
          return;
        }
      }

      try {
        const response = await axios.get(
          `/api/diet-plans/client/${clientId}/active`
        );
        if (response.data.success && response.data.data) {
          const activePlanData = response.data.data;
          setActivePlan(activePlanData);
          setCacheItem(cacheKey, activePlanData);
        } else {
          setActivePlan(null);
          setCacheItem(cacheKey, null);
        }
      } catch (err) {
        console.error("Error fetching active plan:", err);
        setActivePlan(null);
        setCacheItem(cacheKey, null);
      }
    },
    [clientId]
  );

  // Set a plan as active with optimistic updates
  const setAsActive = useCallback(
    async (planId) => {
      try {
        // Optimistic update - find the plan and set it as active immediately
        const targetPlan = plans.find((p) => p.id === planId);
        if (targetPlan) {
          setActivePlan(targetPlan);
          setCacheItem(getCacheKey(clientId, "active"), targetPlan);
        }

        const response = await axios.post(
          `/api/diet-plans/${planId}/activate`,
          {
            client_id: clientId,
          }
        );

        if (response.data.success) {
          // Update the active plan from the server response
          const updatedActivePlan = response.data.data || targetPlan;
          setActivePlan(updatedActivePlan);
          setCacheItem(getCacheKey(clientId, "active"), updatedActivePlan);

          // Update the specific plan in the plans list to reflect active status
          setPlans((prev) =>
            prev.map((p) =>
              p.id === planId
                ? { ...p, is_active: true }
                : { ...p, is_active: false }
            )
          );

          return { success: true };
        }
      } catch (err) {
        console.error("Error activating plan:", err);
        // Revert optimistic update on error
        await fetchActivePlan(true);
        return { success: false, error: "Failed to activate nutrition plan" };
      }
    },
    [plans, clientId, fetchPlans, fetchActivePlan]
  );

  // Deactivate the current active plan with optimistic updates
  const deactivatePlan = useCallback(async () => {
    try {
      // Optimistic update - immediately set active plan to null
      setActivePlan(null);
      setCacheItem(getCacheKey(clientId, "active"), null);

      const response = await axios.delete(
        `/api/diet-plans/client/${clientId}/deactivate`
      );

      if (response.data.success) {
        // Keep the optimistic update (active plan is null)
        // Update all plans in the list to remove active status
        setPlans((prev) => prev.map((p) => ({ ...p, is_active: false })));

        return { success: true };
      }
    } catch (err) {
      console.error("Error deactivating plan:", err);
      // Revert optimistic update on error
      await fetchActivePlan(true);
      return { success: false, error: "Failed to deactivate nutrition plan" };
    }
  }, [clientId, fetchPlans, fetchActivePlan]);

  // Refresh all data with cache invalidation
  const refresh = useCallback(async () => {
    if (!clientId) return;

    clearCache(clientId);
    setLoading(true);

    try {
      await Promise.all([fetchPlans(true), fetchActivePlan(true)]);
    } finally {
      setLoading(false);
    }
  }, [clientId, fetchPlans, fetchActivePlan]);

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
  }, [clientId, refresh]);

  // React to global refresh triggers
  useEffect(() => {
    if (refreshCounter > 0 && clientId && initialized) {
      refresh();
    }
  }, [refreshCounter, clientId, initialized, refresh]);

  // Reset initialization when clientId changes
  useEffect(() => {
    setInitialized(false);
  }, [clientId]);

  // Load data when clientId changes with cache check
  useEffect(() => {
    if (!clientId) {
      setPlans([]);
      setActivePlan(null);
      setInitialized(false);
      return;
    }

    // Prevent duplicate initialization
    if (initialized) return;

    const initializeData = async () => {
      // Try to load from cache first for immediate UI feedback
      const plansKey = getCacheKey(clientId, "plans");
      const activeKey = getCacheKey(clientId, "active");

      const cachedPlans = getCacheItem(plansKey);
      const cachedActiveItem = nutritionCache.get(activeKey);

      let hasData = false;

      if (cachedPlans) {
        setPlans(cachedPlans);
        hasData = true;
      }

      // Check if we have cached active plan data (even if it's null)
      if (cachedActiveItem && isCacheValid(cachedActiveItem)) {
        setActivePlan(cachedActiveItem.data);
        hasData = true;
      }

      // Only fetch fresh data if we don't have cached data
      if (!hasData) {
        setLoading(true);
        try {
          await Promise.all([fetchPlans(false), fetchActivePlan(false)]);
        } finally {
          setLoading(false);
        }
      }

      setInitialized(true);
    };

    initializeData();
  }, [clientId, initialized, fetchPlans, fetchActivePlan]);

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
