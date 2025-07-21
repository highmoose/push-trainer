import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";

// Global cache for diet plans
const dietPlansCache = new Map();
const planDetailsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache management utilities
const isCacheValid = (cacheItem) => {
  return cacheItem && Date.now() - cacheItem.timestamp < CACHE_DURATION;
};

const setCacheItem = (key, data) => {
  dietPlansCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

const getCacheItem = (key) => {
  const cacheItem = dietPlansCache.get(key);
  return isCacheValid(cacheItem) ? cacheItem.data : null;
};

const clearAllCache = () => {
  dietPlansCache.clear();
  planDetailsCache.clear();
};

// Make cache clearing available globally
if (typeof window !== "undefined") {
  window.clearDietPlansCache = clearAllCache;
}

export const useDietPlans = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDietPlans = useCallback(async (forceRefresh = false) => {
    const CACHE_KEY = "all_diet_plans";

    // Check cache first unless forced refresh
    if (!forceRefresh) {
      const cachedPlans = getCacheItem(CACHE_KEY);
      if (cachedPlans) {
        setDietPlans(cachedPlans);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/diet-plans");
      const plansData = response.data.plans || [];
      setDietPlans(plansData);
      setCacheItem(CACHE_KEY, plansData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch diet plans");
    } finally {
      setLoading(false);
    }
  }, []);

  const createDietPlan = useCallback(async (planData) => {
    try {
      const response = await axios.post("/api/diet-plans", planData);
      const newPlan = response.data.plan;

      // Always fetch the latest cached or state plans to ensure freshness
      const currentPlans = getCacheItem("all_diet_plans") || [];
      const updatedPlans = [...currentPlans, newPlan];

      setDietPlans(updatedPlans); // <- this avoids function form + ensures fresh reference
      setCacheItem("all_diet_plans", updatedPlans);

      return newPlan;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create diet plan");
      throw err;
    }
  }, []);

  // Add a generating placeholder to the diet plans list
  const addGeneratingPlaceholder = useCallback((planData) => {
    const placeholderId = `temp-${Date.now()}`;
    const placeholder = {
      id: placeholderId,
      title: planData.title || "New Diet Plan",
      client_name: planData.client_name || "",
      client_id: planData.client_id || null,
      is_generating: true,
      has_error: false,
      total_calories: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      plan_type: planData.plan_type || "",
      meals_per_day: planData.meals_per_day || 0,
      meal_complexity: planData.meal_complexity || "",
      description: planData.description || "",
      generated_by_ai: true,
      is_active: false,
    };

    setDietPlans((prevPlans) => {
      const updatedPlans = [placeholder, ...prevPlans];
      setCacheItem("all_diet_plans", updatedPlans);
      return updatedPlans;
    });

    return placeholderId;
  }, []);

  // Replace the generating placeholder with the actual plan
  const replacePlaceholderWithPlan = useCallback((placeholderId, newPlan) => {
    setDietPlans((prevPlans) => {
      const updatedPlans = prevPlans.map((plan) =>
        plan.id === placeholderId ? newPlan : plan
      );
      setCacheItem("all_diet_plans", updatedPlans);
      return updatedPlans;
    });
  }, []);

  // Remove the placeholder if there's an error
  const removePlaceholder = useCallback((placeholderId) => {
    setDietPlans((prevPlans) => {
      const updatedPlans = prevPlans.filter(
        (plan) => plan.id !== placeholderId
      );
      setCacheItem("all_diet_plans", updatedPlans);
      return updatedPlans;
    });
  }, []);

  // Enhanced createDietPlan that supports placeholders
  const createDietPlanWithPlaceholder = useCallback(
    async (planData) => {
      // Add the placeholder first
      const placeholderId = addGeneratingPlaceholder(planData);

      try {
        const response = await axios.post("/api/diet-plans", planData);
        const newPlan = response.data.plan;

        // Replace placeholder with actual plan
        replacePlaceholderWithPlan(placeholderId, newPlan);

        return newPlan;
      } catch (err) {
        // Remove the placeholder on error
        removePlaceholder(placeholderId);
        setError(err.response?.data?.message || "Failed to create diet plan");
        throw err;
      }
    },
    [addGeneratingPlaceholder, replacePlaceholderWithPlan, removePlaceholder]
  );

  const updateDietPlan = useCallback(
    async (planId, updates) => {
      // Store previous state for rollback
      const previousPlans = dietPlans;

      // Optimistic update
      setDietPlans((prev) => {
        const updatedPlans = prev.map((plan) =>
          plan.id === planId ? { ...plan, ...updates, pending: true } : plan
        );
        setCacheItem("all_diet_plans", updatedPlans);
        return updatedPlans;
      });

      try {
        const response = await axios.put(`/api/diet-plans/${planId}`, updates);
        const updatedPlan = response.data.plan;

        // Update with server response
        setDietPlans((prev) => {
          const finalPlans = prev.map((plan) =>
            plan.id === planId ? { ...updatedPlan, pending: false } : plan
          );
          setCacheItem("all_diet_plans", finalPlans);
          return finalPlans;
        });

        // Clear plan details cache for this plan
        planDetailsCache.delete(planId.toString());

        return updatedPlan;
      } catch (err) {
        // Rollback on error
        setDietPlans(previousPlans);
        setCacheItem("all_diet_plans", previousPlans);
        setError(err.response?.data?.message || "Failed to update diet plan");
        throw err;
      }
    },
    [dietPlans]
  );

  const deleteDietPlan = useCallback(
    async (planId) => {
      // Store previous state for rollback
      const previousPlans = dietPlans;

      // Optimistic update - mark as deleting
      setDietPlans((prev) => {
        const updatedPlans = prev.map((plan) =>
          plan.id === planId ? { ...plan, deleting: true } : plan
        );
        setCacheItem("all_diet_plans", updatedPlans);
        return updatedPlans;
      });

      try {
        await axios.delete(`/api/diet-plans/${planId}`);

        // Remove plan from list
        setDietPlans((prev) => {
          const filteredPlans = prev.filter((plan) => plan.id !== planId);
          setCacheItem("all_diet_plans", filteredPlans);
          return filteredPlans;
        });

        // Clear plan details cache for this plan
        planDetailsCache.delete(planId.toString());
      } catch (err) {
        // Rollback on error
        setDietPlans(previousPlans);
        setCacheItem("all_diet_plans", previousPlans);
        setError(err.response?.data?.message || "Failed to delete diet plan");
        throw err;
      }
    },
    [dietPlans]
  );

  const assignPlanToClient = useCallback(
    async (planId, clientId) => {
      return updateDietPlan(planId, { client_id: clientId });
    },
    [updateDietPlan]
  );

  const fetchPlanDetails = useCallback(async (planId, forceRefresh = false) => {
    const cacheKey = planId.toString();

    // Check cache first unless forced refresh
    if (!forceRefresh) {
      const cachedDetails = planDetailsCache.get(cacheKey);
      if (cachedDetails && isCacheValid(cachedDetails)) {
        return cachedDetails.data;
      }
    }

    // Don't set the global loading state for plan details
    // This prevents the nutrition plan list from refreshing
    try {
      const response = await axios.get(`/api/diet-plans/${planId}`);
      const planDetails = response.data.plan;

      // Cache the plan details
      planDetailsCache.set(cacheKey, {
        data: planDetails,
        timestamp: Date.now(),
      });

      return planDetails;
    } catch (err) {
      // Don't set global error state either
      console.error("Failed to fetch plan details:", err);
      throw new Error(
        err.response?.data?.message || "Failed to fetch plan details"
      );
    }
  }, []);

  // Auto-fetch on mount with cache check
  useEffect(() => {
    // Try to load from cache first for immediate UI feedback
    const cachedPlans = getCacheItem("all_diet_plans");
    if (cachedPlans) {
      setDietPlans(cachedPlans);
    }

    // Always fetch fresh data, but cache will provide immediate feedback
    fetchDietPlans();
  }, [fetchDietPlans]);

  return {
    dietPlans,
    loading,
    error,
    fetchDietPlans,
    createDietPlan,
    createDietPlanWithPlaceholder,
    updateDietPlan,
    deleteDietPlan,
    assignPlanToClient,
    fetchPlanDetails,
    // Cache management
    clearCache: clearAllCache,
    // Helper methods
    getDietPlan: useCallback(
      (id) => dietPlans.find((p) => p.id === id),
      [dietPlans]
    ),
    getPlansByClient: useCallback(
      (clientId) => dietPlans.filter((p) => p.client_id === clientId),
      [dietPlans]
    ),
    getPlanCount: useCallback(() => dietPlans.length, [dietPlans]),
  };
};
