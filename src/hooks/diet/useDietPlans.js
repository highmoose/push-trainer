import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import useFetchDietPlans from "./api/useFetchDietPlans";
import useUpdateDietPlan from "./api/useUpdateDietPlan";
import useDeleteDietPlan from "./api/useDeleteDietPlan";
import useGetDietPlanDetails from "./api/useGetDietPlanDetails";
import useGenerateDietPlan from "./api/useGenerateDietPlan";
import useAssignDietPlanToClients from "./api/useAssignDietPlanToClients";
import useGetClientDietPlans from "../clientDietPlans/api/useGetClientDietPlans";
import useUnassignDietPlanFromClient from "./api/useUnassignDietPlanFromClient";
import { addToast } from "@heroui/toast";

// Global cache for diet plans with optimistic updates
const dietPlansCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Global refresh trigger
let globalRefreshTrigger = 0;
const refreshListeners = new Set();

// Global fetch state to prevent concurrent fetches
let isGloballyFetching = false;

// Global data listeners for syncing across hook instances
const dataListeners = new Set();

const triggerGlobalRefresh = () => {
  globalRefreshTrigger++;
  refreshListeners.forEach((listener) => listener(globalRefreshTrigger));
};

const triggerGlobalDataSync = (data) => {
  dataListeners.forEach((listener) => listener(data));
};

const useDietPlans = () => {
  // State management
  const [dietPlans, setDietPlans] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [generatingPlans, setGeneratingPlans] = useState([]); // Track generating plans separately
  const fetchDietPlansRef = useRef(); // Ref to avoid stale closure issues
  const getClientDietPlansRef = useRef(); // Ref for getClientDietPlans to avoid stale closure

  // Individual action hooks
  const fetchAction = useFetchDietPlans();
  const updateAction = useUpdateDietPlan();
  const deleteAction = useDeleteDietPlan();
  const detailsAction = useGetDietPlanDetails();
  const generateAction = useGenerateDietPlan();
  const assignAction = useAssignDietPlanToClients();
  const unassignAction = useUnassignDietPlanFromClient();
  const getClientDietPlansAction = useGetClientDietPlans();

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
      const cacheKey = getCacheKey();
      const cached = dietPlansCache.get(cacheKey);

      if (!forceRefresh && isCacheValid(cached)) {
        const data = Array.isArray(cached.data) ? cached.data : [];
        setDietPlans(data);
        return { success: true, data };
      }

      // Prevent concurrent fetches from multiple hook instances
      if (isGloballyFetching && !forceRefresh) {
        console.log("Fetch already in progress, will receive data via sync...");
        return { success: true, data: dietPlans };
      }

      isGloballyFetching = true;
      setLoading(true);
      const result = await fetchAction.execute();

      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : [];
        setDietPlans(data);
        setCacheItem(data);
        setError(null);

        // Sync data to all hook instances
        triggerGlobalDataSync(data);
      } else {
        setError(result.error);
      }

      setLoading(false);
      isGloballyFetching = false;
      return result;
    },
    [fetchAction]
  );

  // Keep ref updated
  fetchDietPlansRef.current = fetchDietPlans;

  // Note: createDietPlan removed - use generateDietPlanWithPlaceholder instead

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
        setDietPlans((prev) => {
          const updatedPlans = prev.map((plan) =>
            plan.id === planId ? result.data : plan
          );
          // Update cache with the current data
          setCacheItem(updatedPlans);
          return updatedPlans;
        });
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
      setDietPlans((prev) => {
        const filteredPlans = prev.filter((plan) => plan.id !== planId);
        // Update cache with the filtered data
        setCacheItem(filteredPlans);
        return filteredPlans;
      });

      const result = await deleteAction.execute(planId);

      if (!result.success) {
        // Revert optimistic update only if deletion failed
        setDietPlans(originalPlans);
        setCacheItem(originalPlans);
      }
      // No need to triggerGlobalRefresh() for successful deletes since
      // the optimistic update already handled the UI change

      return result;
    },
    [deleteAction, dietPlans]
  );

  // Generate diet plan with placeholder
  const generateDietPlanWithPlaceholder = useCallback(
    async (clientId, preferences) => {
      // Create optimistic placeholder

      console.log(
        "Generating diet plan with placeholder for client:",
        clientId,
        "with preferences:",
        preferences
      );
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

      setDietPlans((prev) => {
        const newList = [placeholderPlan, ...prev];
        // Update cache with placeholder immediately for consistent state
        setCacheItem(newList);
        return newList;
      });

      try {
        const result = await generateAction.execute(clientId, preferences);

        if (result.success) {
          // Replace placeholder with real data directly in dietPlans
          setDietPlans((prev) => {
            const newPlans = prev.map((plan) =>
              plan.id === placeholderPlan.id ? result.data : plan
            );
            // Update cache with final data
            setCacheItem(newPlans);
            addToast({
              title: "Success",
              description: "Diet plan generation complete",
            });
            return newPlans;
          });
        } else {
          // Replace placeholder with error state
          const errorPlan = {
            ...placeholderPlan,
            is_generating: false,
            has_error: true,
            title: preferences.title || "Failed to Generate Plan",
          };
          setDietPlans((prev) => {
            const updatedPlans = prev.map((plan) =>
              plan.id === placeholderPlan.id ? errorPlan : plan
            );
            // Update cache with error state
            setCacheItem(updatedPlans);
            return updatedPlans;
          });
        }

        return result;
      } catch (error) {
        // Replace placeholder with error state
        const errorPlan = {
          ...placeholderPlan,
          is_generating: false,
          has_error: true,
          title: preferences.title || "Failed to Generate Plan",
        };
        setDietPlans((prev) => {
          const updatedPlans = prev.map((plan) =>
            plan.id === placeholderPlan.id ? errorPlan : plan
          );
          // Update cache with error state
          setCacheItem(updatedPlans);
          return updatedPlans;
        });

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

  // Assign plan to clients
  const assignPlanToClient = useCallback(
    async (planId, clientIds) => {
      const originalPlans = [...dietPlans];

      // Optimistic update
      setDietPlans((prev) => {
        const updatedPlans = prev.map((plan) => {
          if (plan.id === planId) {
            const assignedClients = plan.assigned_clients || [];
            // Handle both single client ID and array of client IDs
            const newClientIds = Array.isArray(clientIds)
              ? clientIds
              : [clientIds];

            // For optimistic update, we need client names too
            // This will be properly updated when the API returns real data
            const newAssignedClients = newClientIds.map((clientId) => ({
              id: clientId,
              name: "Loading...", // Placeholder until API returns real data
            }));

            return {
              ...plan,
              assigned_clients: [...assignedClients, ...newAssignedClients],
            };
          }
          return plan;
        });
        // Update cache with optimistic data
        setCacheItem(updatedPlans);
        return updatedPlans;
      });

      // Prepare data for API
      const requestData = {
        diet_plan_id: planId,
        client_ids: Array.isArray(clientIds) ? clientIds : [clientIds],
      };

      const result = await assignAction.execute(requestData);

      if (result.success) {
        // Refresh data to get the updated assigned_clients with proper names
        await fetchDietPlansRef.current(true);
      } else {
        // Revert optimistic update
        setDietPlans(originalPlans);
        setCacheItem(originalPlans);
      }

      return result;
    },
    [assignAction, dietPlans]
  );

  // Unassign plan from client
  const unassignPlanFromClient = useCallback(
    async (planId, clientId) => {
      const originalPlans = [...dietPlans];

      // Optimistic update - remove client from assigned_clients
      setDietPlans((prev) => {
        const updatedPlans = prev.map((plan) => {
          if (plan.id === planId) {
            const assignedClients = plan.assigned_clients || [];
            const filteredClients = assignedClients.filter(
              (client) => client.id !== clientId
            );

            return {
              ...plan,
              assigned_clients: filteredClients,
            };
          }
          return plan;
        });
        // Update cache with optimistic data
        setCacheItem(updatedPlans);
        return updatedPlans;
      });

      // Prepare data for API
      const requestData = {
        diet_plan_id: planId,
        client_id: clientId,
      };

      const result = await unassignAction.execute(requestData);

      if (result.success) {
        await fetchDietPlansRef.current(true);
        addToast({
          title: "Success",
          description: "Client unassigned from diet plan successfully",
        });
      } else {
        // Revert optimistic update
        setDietPlans(originalPlans);
        setCacheItem(originalPlans);
        addToast({
          title: "Error",
          description:
            result.error || "Failed to unassign client from diet plan",
          variant: "error",
        });
      }

      return result;
    },
    [unassignAction, dietPlans]
  );

  // Get client diet plans - stable function using ref
  const getClientDietPlans = useCallback(
    async (clientId) => {
      if (!clientId) {
        return { success: false, error: "Client ID is required" };
      }
      return await getClientDietPlansAction.execute(clientId);
    },
    [] // Empty dependency array for stability
  );

  // Keep ref updated
  getClientDietPlansRef.current = getClientDietPlans;

  // Global refresh listener
  useEffect(() => {
    const handleRefresh = (trigger) => {
      setRefreshTrigger(trigger);
    };

    refreshListeners.add(handleRefresh);
    return () => refreshListeners.delete(handleRefresh);
  }, []);

  // Global data sync listener
  useEffect(() => {
    const handleDataSync = (data) => {
      setDietPlans(data);
    };

    dataListeners.add(handleDataSync);
    return () => dataListeners.delete(handleDataSync);
  }, []);

  // Refresh data when global trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchDietPlansRef.current(true);
    }
  }, [refreshTrigger]); // Remove fetchDietPlans dependency to prevent re-runs

  // Initial load - only run once on mount, and only if we don't have cached data
  useEffect(() => {
    const cached = dietPlansCache.get(getCacheKey());
    if (!cached || !isCacheValid(cached)) {
      fetchDietPlansRef.current();
    }
  }, []); // Use ref to avoid dependency issues

  return {
    dietPlans,
    loading: loading || fetchAction.loading || updateAction.loading,
    // Exclude deleteAction.loading since we use optimistic updates for deletes
    error:
      error || fetchAction.error || updateAction.error || deleteAction.error,
    generateDietPlanWithPlaceholder,
    updateDietPlan,
    deleteDietPlan,
    fetchDietPlans,
    fetchPlanDetails,
    assignPlanToClient,
    unassignPlanFromClient,
    getClientDietPlans,
  };
};

export default useDietPlans;
