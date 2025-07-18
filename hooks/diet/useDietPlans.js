import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";

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

  const fetchDietPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/diet-plans");
      setDietPlans(response.data.plans || []);
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
    setDietPlans((prev) => [...prev, tempPlan]);

    try {
      const response = await axios.post("/api/diet-plans", planData);
      const newPlan = response.data.plan;

      // Replace temporary plan with real data
      setDietPlans((prev) =>
        prev.map((plan) => (plan.id === tempId ? newPlan : plan))
      );

      return newPlan;
    } catch (err) {
      // Remove temporary plan on error
      setDietPlans((prev) => prev.filter((plan) => plan.id !== tempId));
      setError(err.response?.data?.message || "Failed to create diet plan");
      throw err;
    }
  }, []);

  const generateDietPlan = useCallback(
    async ({
      prompt,
      aiProvider = "openai",
      clientId = null,
      title,
      planType,
      mealsPerDay,
      mealComplexity,
      customCalories = null,
      additionalNotes = "",
      setAsActive = false,
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post("/api/diet-plans/generate", {
          prompt,
          aiProvider,
          clientId,
          title,
          planType,
          mealsPerDay,
          mealComplexity,
          customCalories,
          additionalNotes,
          setAsActive,
        });

        const generatedPlan = response.data.plan;

        // Add to diet plans list
        setDietPlans((prev) => [...prev, generatedPlan]);

        // If this plan was set as active, trigger global nutrition refresh
        if (setAsActive && clientId) {
          triggerGlobalNutritionRefresh();
        }

        return generatedPlan;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to generate diet plan");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateDietPlan = useCallback(
    async (planId, updates) => {
      // Store previous state for rollback
      const previousPlans = dietPlans;

      // Optimistic update
      setDietPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId ? { ...plan, ...updates, pending: true } : plan
        )
      );

      try {
        const response = await axios.put(`/api/diet-plans/${planId}`, updates);
        const updatedPlan = response.data.plan;

        // Update with server response
        setDietPlans((prev) =>
          prev.map((plan) =>
            plan.id === planId ? { ...updatedPlan, pending: false } : plan
          )
        );

        return updatedPlan;
      } catch (err) {
        // Rollback on error
        setDietPlans(previousPlans);
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
      setDietPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId ? { ...plan, deleting: true } : plan
        )
      );

      try {
        await axios.delete(`/api/diet-plans/${planId}`);

        // Remove plan from list
        setDietPlans((prev) => prev.filter((plan) => plan.id !== planId));
      } catch (err) {
        // Rollback on error
        setDietPlans(previousPlans);
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

  const fetchPlanDetails = useCallback(async (planId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/diet-plans/${planId}`);
      return response.data.plan;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch plan details");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
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
