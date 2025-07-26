import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import useFetchDietPlans from "./useFetchDietPlans";
import useUpdateDietPlan from "./useUpdateDietPlan";
import useDeleteDietPlan from "./useDeleteDietPlan";
import useGetDietPlanDetails from "./useGetDietPlanDetails";
import useGenerateDietPlan from "./useGenerateDietPlan";

// Global cache for diet plans with optimistic updates
const dietPlansCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Global refresh trigger
let globalRefreshTrigger = 0;
const refreshListeners = new Set();

const triggerGlobalRefresh = () => {
  globalRefreshTrigger++;
  refreshListeners.forEach((listener) => listener(globalRefreshTrigger));
};

const useDietPlans = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [generatingPlans, setGeneratingPlans] = useState([]); // Track generating plans separately
  const fetchDietPlansRef = useRef(); // Ref to avoid stale closure issues

  // Individual action hooks
  const fetchAction = useFetchDietPlans();
  const updateAction = useUpdateDietPlan();
  const deleteAction = useDeleteDietPlan();
  const detailsAction = useGetDietPlanDetails();
  const generateAction = useGenerateDietPlan();

  // Cache management
  const getCacheKey = () => "diet_plans";
  const isCacheValid = (cacheItem) => {
    return cacheItem && Date.now() - cacheItem.timestamp < CACHE_DURATION;
  };

  const setCacheItem = (data) => {
    dietPlansCache.set(getCacheKey(), {
      data: Array.isArray(data) ? data : [],
      timestamp: Date.now(),
    });
  };

  // Initialize from cache on mount
  useEffect(() => {
    const cached = dietPlansCache.get(getCacheKey());
    if (isCacheValid(cached)) {
      setDietPlans(cached.data);
    }
  }, []);

  // Fetch diet plans
  const fetchDietPlans = useCallback(
    async (forceRefresh = false) => {
      console.log("🌐 fetchDietPlans called, forceRefresh:", forceRefresh);

      const cacheKey = getCacheKey();
      const cached = dietPlansCache.get(cacheKey);

      if (!forceRefresh && isCacheValid(cached)) {
        const data = Array.isArray(cached.data) ? cached.data : [];
        console.log("📦 Using cached data:", data.length, "plans");
        setDietPlans(data);
        return { success: true, data };
      }

      console.log("🔄 Fetching fresh data from API...");
      setLoading(true);
      const result = await fetchAction.execute();

      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : [];
        console.log("✅ Fresh data received:", data.length, "plans");
        setDietPlans(data);
        setCacheItem(data);
        setError(null);
      } else {
        console.log("❌ Failed to fetch data:", result.error);
        setError(result.error);
      }

      setLoading(false);
      return result;
    },
    [fetchAction]
  );

  // Keep ref updated
  fetchDietPlansRef.current = fetchDietPlans;

  // Create diet plan with optimistic update
  const createDietPlan = useCallback(
    async (planData) => {
      const optimisticPlan = {
        id: `temp_${Date.now()}`,
        ...planData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistic update
      setDietPlans((prev) => [optimisticPlan, ...prev]);
      setCacheItem([optimisticPlan, ...dietPlans]);

      const result = await createAction.execute(planData);

      if (result.success) {
        // Replace optimistic with real data
        setDietPlans((prev) =>
          prev.map((plan) =>
            plan.id === optimisticPlan.id ? result.data : plan
          )
        );
        setCacheItem(
          dietPlans.map((plan) =>
            plan.id === optimisticPlan.id ? result.data : plan
          )
        );
        triggerGlobalRefresh();
      } else {
        // Revert optimistic update
        setDietPlans((prev) =>
          prev.filter((plan) => plan.id !== optimisticPlan.id)
        );
        setCacheItem(dietPlans.filter((plan) => plan.id !== optimisticPlan.id));
      }

      return result;
    },
    [createAction, dietPlans]
  );

  // Update diet plan with optimistic update
  const updateDietPlan = useCallback(
    async (planId, updates) => {
      // Optimistic update
      const originalPlans = [...dietPlans];
      setDietPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId ? { ...plan, ...updates } : plan
        )
      );

      const result = await updateAction.execute(planId, updates);

      if (result.success) {
        setDietPlans((prev) =>
          prev.map((plan) => (plan.id === planId ? result.data : plan))
        );
        setCacheItem(
          dietPlans.map((plan) => (plan.id === planId ? result.data : plan))
        );
        triggerGlobalRefresh();
      } else {
        // Revert optimistic update
        setDietPlans(originalPlans);
        setCacheItem(originalPlans);
      }

      return result;
    },
    [updateAction, dietPlans]
  );

  // Delete diet plan with optimistic update
  const deleteDietPlan = useCallback(
    async (planId) => {
      // Optimistic update
      const originalPlans = [...dietPlans];
      setDietPlans((prev) => prev.filter((plan) => plan.id !== planId));
      setCacheItem(dietPlans.filter((plan) => plan.id !== planId));

      const result = await deleteAction.execute(planId);

      if (result.success) {
        triggerGlobalRefresh();
      } else {
        // Revert optimistic update
        setDietPlans(originalPlans);
        setCacheItem(originalPlans);
      }

      return result;
    },
    [deleteAction, dietPlans]
  );

  // Generate diet plan
  const generateDietPlan = useCallback(
    async (clientId, preferences) => {
      return generateAction.execute(clientId, preferences);
    },
    [generateAction]
  );

  // Generate diet plan with placeholder
  const generateDietPlanWithPlaceholder = useCallback(
    async (clientId, preferences) => {
      console.log("🚀 Starting generation with placeholder");

      // Create optimistic placeholder
      const placeholderPlan = {
        id: `generating_${Date.now()}`,
        title: preferences.title || "Generating Plan...",
        client_id: clientId,
        client_name: preferences.client_name || "",
        plan_type: preferences.plan_type || "",
        meals_per_day: preferences.meals_per_day || 4,
        meal_complexity: preferences.meal_complexity || "moderate",
        total_calories: preferences.total_calories || 0,
        is_generating: true,
        has_error: false,
        generated_by_ai: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("📝 Adding placeholder directly to dietPlans");
      // Add placeholder directly to diet plans list
      setDietPlans((prev) => {
        const newList = [placeholderPlan, ...prev];
        console.log(
          "✅ DietPlans updated with placeholder, count:",
          newList.length
        );
        // Don't update cache with placeholder
        return newList;
      });

      try {
        console.log("🔄 Calling generation API...");
        // Call the actual generation API
        const result = await generateAction.execute(clientId, preferences);

        console.log("📥 API result:", result.success ? "SUCCESS" : "FAILED");

        if (result.success) {
          console.log(
            "🎉 Generation successful, replacing placeholder with real data:",
            result.data
          );

          // Replace placeholder with real data directly in dietPlans
          setDietPlans((prev) => {
            const newPlans = prev.map((plan) =>
              plan.id === placeholderPlan.id ? result.data : plan
            );
            console.log(
              "� Replaced placeholder with real plan, total count:",
              newPlans.length
            );
            console.log(
              "📋 Real plan data:",
              result.data.title,
              "ID:",
              result.data.id
            );
            // Update cache with final data
            setCacheItem(newPlans);
            return newPlans;
          });

          console.log("✅ Plan replacement completed successfully");
        } else {
          console.log(
            "❌ Generation failed, updating placeholder to error state"
          );
          // Replace placeholder with error state
          const errorPlan = {
            ...placeholderPlan,
            is_generating: false,
            has_error: true,
            title: preferences.title || "Failed to Generate Plan",
          };
          setDietPlans((prev) =>
            prev.map((plan) =>
              plan.id === placeholderPlan.id ? errorPlan : plan
            )
          );
        }

        return result;
      } catch (error) {
        console.log("💥 Exception during generation:", error.message);
        // Replace placeholder with error state
        const errorPlan = {
          ...placeholderPlan,
          is_generating: false,
          has_error: true,
          title: preferences.title || "Failed to Generate Plan",
        };
        setDietPlans((prev) =>
          prev.map((plan) =>
            plan.id === placeholderPlan.id ? errorPlan : plan
          )
        );

        return {
          success: false,
          error: error.message || "Failed to generate diet plan",
        };
      }
    },
    [generateAction]
  );

  // Fetch plan details
  const fetchPlanDetails = useCallback(
    async (planId) => {
      return detailsAction.execute(planId);
    },
    [detailsAction]
  );

  // Global refresh listener
  useEffect(() => {
    const handleRefresh = (trigger) => {
      setRefreshTrigger(trigger);
    };

    refreshListeners.add(handleRefresh);
    return () => refreshListeners.delete(handleRefresh);
  }, []);

  // Refresh data when global trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("🔄 Global refresh triggered, calling fetchDietPlans(true)");
      fetchDietPlansRef.current(true);
    }
  }, [refreshTrigger]); // Remove fetchDietPlans dependency to prevent re-runs

  // Initial load - only run once on mount, and only if we don't have cached data
  useEffect(() => {
    const cached = dietPlansCache.get(getCacheKey());
    if (!cached || !isCacheValid(cached)) {
      fetchDietPlans();
    }
  }, []); // Remove fetchDietPlans dependency to prevent re-runs

  return {
    dietPlans,
    loading:
      loading ||
      fetchAction.loading ||
      createAction.loading ||
      updateAction.loading ||
      deleteAction.loading,
    error:
      error ||
      fetchAction.error ||
      createAction.error ||
      updateAction.error ||
      deleteAction.error,
    generateDietPlan,
    generateDietPlanWithPlaceholder,
    createDietPlan,
    createDietPlanWithPlaceholder,
    updateDietPlan,
    deleteDietPlan,
    fetchDietPlans,
    fetchPlanDetails,
  };
};

export default useDietPlans;
