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

// Import global refresh trigger for nutrition plans
const triggerGlobalNutritionRefresh = () => {
  // This will be connected to the global refresh system
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nutrition-plan-refresh"));
  }
};

export const useDietPlans = () => {
  const [dietPlans, setDietPlans] = useState([]);
  console.log("Initial Diet Plans:", dietPlans);
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
    // Generate temporary ID for optimistic update
    const tempId = `temp_${Date.now()}`;
    const tempPlan = { ...planData, id: tempId, pending: true };

    // Optimistic update
    setDietPlans((prev) => {
      const newPlans = [...prev, tempPlan];
      // Update cache with optimistic data
      setCacheItem("all_diet_plans", newPlans);
      return newPlans;
    });

    try {
      const response = await axios.post("/api/diet-plans", planData);
      const newPlan = response.data.plan;

      // Replace temporary plan with real data
      setDietPlans((prev) => {
        const updatedPlans = prev.map((plan) =>
          plan.id === tempId ? newPlan : plan
        );
        // Update cache with real data
        setCacheItem("all_diet_plans", updatedPlans);
        return updatedPlans;
      });

      return newPlan;
    } catch (err) {
      // Remove temporary plan on error
      setDietPlans((prev) => {
        const revertedPlans = prev.filter((plan) => plan.id !== tempId);
        // Update cache by removing temporary plan
        setCacheItem("all_diet_plans", revertedPlans);
        return revertedPlans;
      });
      setError(err.response?.data?.message || "Failed to create diet plan");
      throw err;
    }
  }, []);

  const generateDietPlan = useCallback(async (planData) => {
    // Extract values from the streamlined planData object
    const {
      title,
      client_id,
      prompt,
      client_metrics,
      set_as_active,
      plan_type,
      meals_per_day,
      meal_complexity,
      additional_notes,
    } = planData;

    // Create a temporary plan object for optimistic update
    const tempId = `temp_${Date.now()}`;
    const tempPlan = {
      id: tempId,
      title: title,
      plan_type: plan_type,
      meals_per_day: meals_per_day,
      meal_complexity: meal_complexity,
      description: additional_notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_generating: true, // Flag to show loading state
      client_id: client_id,
    };

    // Optimistically add the plan to the list
    setDietPlans((prev) => {
      const newPlans = [...prev, tempPlan];
      setCacheItem("all_diet_plans", newPlans);
      return newPlans;
    });

    setError(null);

    try {
      const apiPayload = {
        prompt,
        client_id,
        title,
        plan_type,
        meals_per_day,
        meal_complexity,
        additional_notes,
        set_as_active,
        client_metrics, // Send clientMetrics to API
      };

      console.log("Sending to API:", apiPayload);

      const response = await axios.post("/api/diet-plans/generate", apiPayload);

      const generatedPlan = response.data.plan;

      // Replace the temporary plan with the real plan data
      setDietPlans((prev) => {
        const newPlans = prev.map((plan) =>
          plan.id === tempId ? generatedPlan : plan
        );
        setCacheItem("all_diet_plans", newPlans);
        return newPlans;
      });

      // If this plan was set as active, trigger global nutrition refresh
      if (setAsActive && clientId) {
        triggerGlobalNutritionRefresh();
      }

      return generatedPlan;
    } catch (err) {
      console.error("Diet plan generation error:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);

      // Update the temporary plan to show error state instead of removing it
      setDietPlans((prev) => {
        const newPlans = prev.map((plan) =>
          plan.id === tempId
            ? {
                ...plan,
                is_generating: false,
                has_error: true,
                error_message:
                  err.response?.data?.message ||
                  "Something went wrong generating this plan. Please try again.",
              }
            : plan
        );
        setCacheItem("all_diet_plans", newPlans);
        return newPlans;
      });

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to generate diet plan";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

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
    generateDietPlan,
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
