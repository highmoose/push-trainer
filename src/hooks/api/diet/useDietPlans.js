import { useState, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
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

  // Helper to get client details for optimistic updates
  const getClientDetails = useCallback((clientId, clientsData = []) => {
    // Try to find client in provided data first
    const foundClient = clientsData.find((c) => c.id === clientId);
    if (foundClient) {
      return {
        id: foundClient.id,
        name:
          foundClient.name ||
          `${foundClient.first_name || ""} ${
            foundClient.last_name || ""
          }`.trim() ||
          `Client ${clientId}`,
        first_name: foundClient.first_name,
        last_name: foundClient.last_name,
        email: foundClient.email,
        assigned_at: new Date().toISOString(),
      };
    }

    // Fallback to placeholder
    return {
      id: clientId,
      name: `Client ${clientId}`,
      assigned_at: new Date().toISOString(),
      optimistic: true,
    };
  }, []);

  const assignPlanToClientsWithClientData = useCallback(
    async (planId, clientIds, clientsData = []) => {
      try {
        // Store previous state for rollback
        const previousPlans = dietPlans;

        // Optimistic update with better client data - use flushSync for immediate update
        flushSync(() => {
          setDietPlans((prev) => {
            const updatedPlans = prev.map((plan) => {
              if (plan.id === planId) {
                const currentAssigned = plan.assigned_clients || [];

                // Create optimistic client objects with real data
                const newClients = clientIds.map((id) =>
                  getClientDetails(id, clientsData)
                );

                // Merge without duplicates
                const existingIds = currentAssigned.map((c) => c.id);
                const uniqueNewClients = newClients.filter(
                  (c) => !existingIds.includes(c.id)
                );

                return {
                  ...plan,
                  assigning: true,
                  assigned_clients: [...currentAssigned, ...uniqueNewClients],
                  total_assignments:
                    (plan.total_assignments || 0) + uniqueNewClients.length,
                };
              }
              return plan;
            });
            setCacheItem("all_diet_plans", updatedPlans);
            return updatedPlans;
          });
        });

        // API call
        const response = await axios.post(
          `/api/diet-plans/${planId}/assign-clients`,
          { client_ids: clientIds }
        );

        const updatedPlan = response.data.plan;

        // Update with server response
        setDietPlans((prev) => {
          const finalPlans = prev.map((plan) =>
            plan.id === planId ? { ...updatedPlan, assigning: false } : plan
          );
          setCacheItem("all_diet_plans", finalPlans);
          return finalPlans;
        });

        return updatedPlan;
      } catch (err) {
        // Rollback on error
        setDietPlans(previousPlans);
        setCacheItem("all_diet_plans", previousPlans);
        setError(
          err.response?.data?.message || "Failed to assign plan to clients"
        );
        throw err;
      }
    },
    [dietPlans, getClientDetails]
  );

  const assignPlanToClients = useCallback(
    async (planId, clientIds) => {
      try {
        // Store previous state for rollback
        const previousPlans = dietPlans;

        // Optimistic update - use flushSync for immediate synchronous update
        flushSync(() => {
          setDietPlans((prev) => {
            const updatedPlans = prev.map((plan) => {
              if (plan.id === planId) {
                // Get current assigned clients or empty array
                const currentAssigned = plan.assigned_clients || [];

                // Create optimistic client objects for immediate UI feedback
                const newClients = clientIds.map((id) => ({
                  id,
                  name: `Client ${id}`, // Placeholder name
                  assigned_at: new Date().toISOString(),
                  optimistic: true, // Mark as optimistic update
                }));

                // Merge without duplicates
                const existingIds = currentAssigned.map((c) => c.id);
                const uniqueNewClients = newClients.filter(
                  (c) => !existingIds.includes(c.id)
                );

                return {
                  ...plan,
                  assigning: true,
                  assigned_clients: [...currentAssigned, ...uniqueNewClients],
                  total_assignments:
                    (plan.total_assignments || 0) + uniqueNewClients.length,
                };
              }
              return plan;
            });
            setCacheItem("all_diet_plans", updatedPlans);
            return updatedPlans;
          });
        });

        // API call to assign plan to multiple clients
        const response = await axios.post(
          `/api/diet-plans/${planId}/assign-clients`,
          {
            client_ids: clientIds,
          }
        );

        const updatedPlan = response.data.plan;

        // Update with server response - replace optimistic data with real data
        setDietPlans((prev) => {
          const finalPlans = prev.map((plan) =>
            plan.id === planId ? { ...updatedPlan, assigning: false } : plan
          );
          setCacheItem("all_diet_plans", finalPlans);
          return finalPlans;
        });

        return updatedPlan;
      } catch (err) {
        // Rollback on error
        setDietPlans(previousPlans);
        setCacheItem("all_diet_plans", previousPlans);
        setError(
          err.response?.data?.message || "Failed to assign plan to clients"
        );
        throw err;
      }
    },
    [dietPlans]
  );

  const assignPlanToClient = useCallback(
    async (planId, clientId) => {
      return assignPlanToClients(planId, [clientId]);
    },
    [assignPlanToClients]
  );

  const removeClientFromPlan = useCallback(
    async (planId, clientId) => {
      try {
        // Store previous state for rollback
        const previousPlans = dietPlans;

        // Optimistic update - use flushSync for immediate synchronous removal
        flushSync(() => {
          setDietPlans((prev) => {
            const updatedPlans = prev.map((plan) => {
              if (plan.id === planId) {
                const currentAssigned = plan.assigned_clients || [];
                const filteredClients = currentAssigned.filter(
                  (c) => c.id !== clientId
                );

                return {
                  ...plan,
                  removing: clientId, // Track which client is being removed
                  assigned_clients: filteredClients,
                  total_assignments: Math.max(
                    0,
                    (plan.total_assignments || 0) - 1
                  ),
                };
              }
              return plan;
            });
            setCacheItem("all_diet_plans", updatedPlans);
            return updatedPlans;
          });
        });

        // API call to remove client
        await axios.delete(`/api/diet-plans/${planId}/clients/${clientId}`);

        // Success - clear the removing flag
        setDietPlans((prev) => {
          const updatedPlans = prev.map((plan) =>
            plan.id === planId ? { ...plan, removing: null } : plan
          );
          setCacheItem("all_diet_plans", updatedPlans);
          return updatedPlans;
        });
      } catch (err) {
        // Rollback on error
        setDietPlans(previousPlans);
        setCacheItem("all_diet_plans", previousPlans);
        setError(
          err.response?.data?.message || "Failed to remove client from plan"
        );
        throw err;
      }
    },
    [dietPlans]
  );

  const getPlanClients = useCallback(async (planId, forceRefresh = false) => {
    const cacheKey = `plan_clients_${planId}`;

    // Check cache first unless forced refresh
    if (!forceRefresh) {
      const cachedClients = getCacheItem(cacheKey);
      if (cachedClients) {
        return cachedClients;
      }
    }

    try {
      const response = await axios.get(`/api/diet-plans/${planId}/clients`);
      const clients = response.data.clients;

      // Cache the clients data
      setCacheItem(cacheKey, clients);

      // Also update the plan in the main plans list with fresh assignment data
      setDietPlans((prev) => {
        const updatedPlans = prev.map((plan) => {
          if (plan.id === planId) {
            return {
              ...plan,
              assigned_clients: clients,
              total_assignments: clients.length,
            };
          }
          return plan;
        });
        setCacheItem("all_diet_plans", updatedPlans);
        return updatedPlans;
      });

      return clients;
    } catch (err) {
      console.error("Failed to fetch plan clients:", err);
      throw new Error("Failed to fetch plan clients");
    }
  }, []);

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

  const getClientDietPlans = useCallback(
    async (clientId, forceRefresh = false) => {
      const cacheKey = `client_diet_plans_${clientId}`;

      // Check cache first unless forced refresh
      if (!forceRefresh) {
        const cachedPlans = getCacheItem(cacheKey);
        if (cachedPlans) {
          return cachedPlans;
        }
      }

      try {
        const response = await axios.get(`/api/diet-plans/client/${clientId}`);
        const plans = response.data.plans || [];

        // Cache the plans data
        setCacheItem(cacheKey, plans);

        return plans;
      } catch (err) {
        console.error("Failed to fetch client diet plans:", err);
        throw new Error("Failed to fetch client diet plans");
      }
    },
    []
  );

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
    assignPlanToClients,
    assignPlanToClientsWithClientData, // New optimized version
    removeClientFromPlan,
    getPlanClients,
    getClientDietPlans, // New method to get diet plans for a client
    fetchPlanDetails,
    getClientDetails, // Helper function
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
