import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";

export const useWorkoutPlans = () => {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkoutPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/workout-plans");
      setWorkoutPlans(response.data.plans || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch workout plans");
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkoutPlan = useCallback(async (planData) => {
    // Generate temporary ID for optimistic update
    const tempId = `temp_${Date.now()}`;
    const tempPlan = { ...planData, id: tempId, pending: true };

    // Optimistic update
    setWorkoutPlans((prev) => [...prev, tempPlan]);

    try {
      const response = await axios.post("/api/workout-plans", planData);
      const newPlan = response.data.plan;

      // Replace temporary plan with real data
      setWorkoutPlans((prev) =>
        prev.map((plan) => (plan.id === tempId ? newPlan : plan))
      );

      return newPlan;
    } catch (err) {
      // Remove temporary plan on error
      setWorkoutPlans((prev) => prev.filter((plan) => plan.id !== tempId));
      setError(err.response?.data?.message || "Failed to create workout plan");
      throw err;
    }
  }, []);

  const generateWorkoutPlan = useCallback(
    async ({
      prompt,
      aiProvider = "openai",
      clientId = null,
      title,
      workoutType,
      fitnessLevel,
      equipmentLevel,
      durationWeeks,
      sessionsPerWeek,
      sessionDuration,
      goals = "",
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post("/api/workout-plans/generate", {
          prompt,
          ai_provider: aiProvider,
          client_id: clientId,
          title,
          workout_type: workoutType,
          fitness_level: fitnessLevel,
          equipment_level: equipmentLevel,
          duration_weeks: durationWeeks,
          sessions_per_week: sessionsPerWeek,
          session_duration: sessionDuration,
          goals,
        });

        const generatedPlan = response.data.plan;

        // Add to workout plans list
        setWorkoutPlans((prev) => [...prev, generatedPlan]);

        return generatedPlan;
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to generate workout plan"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateWorkoutPlan = useCallback(
    async (planId, updates) => {
      // Store previous state for rollback
      const previousPlans = workoutPlans;

      // Optimistic update
      setWorkoutPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId ? { ...plan, ...updates, pending: true } : plan
        )
      );

      try {
        const response = await axios.put(
          `/api/workout-plans/${planId}`,
          updates
        );
        const updatedPlan = response.data.plan;

        // Update with server response
        setWorkoutPlans((prev) =>
          prev.map((plan) =>
            plan.id === planId ? { ...updatedPlan, pending: false } : plan
          )
        );

        return updatedPlan;
      } catch (err) {
        // Rollback on error
        setWorkoutPlans(previousPlans);
        setError(
          err.response?.data?.message || "Failed to update workout plan"
        );
        throw err;
      }
    },
    [workoutPlans]
  );

  const deleteWorkoutPlan = useCallback(
    async (planId) => {
      // Store previous state for rollback
      const previousPlans = workoutPlans;

      // Optimistic update - mark as deleting
      setWorkoutPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId ? { ...plan, deleting: true } : plan
        )
      );

      try {
        await axios.delete(`/api/workout-plans/${planId}`);

        // Remove plan from list
        setWorkoutPlans((prev) => prev.filter((plan) => plan.id !== planId));
      } catch (err) {
        // Rollback on error
        setWorkoutPlans(previousPlans);
        setError(
          err.response?.data?.message || "Failed to delete workout plan"
        );
        throw err;
      }
    },
    [workoutPlans]
  );

  const assignPlanToClient = useCallback(
    async (planId, clientId) => {
      return updateWorkoutPlan(planId, { client_id: clientId });
    },
    [updateWorkoutPlan]
  );

  const duplicateWorkoutPlan = useCallback(
    async (planId, newTitle, clientId = null) => {
      try {
        const response = await axios.post(
          `/api/workout-plans/${planId}/duplicate`,
          {
            title: newTitle,
            client_id: clientId,
          }
        );

        const duplicatedPlan = response.data.plan;
        setWorkoutPlans((prev) => [...prev, duplicatedPlan]);

        return duplicatedPlan;
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to duplicate workout plan"
        );
        throw err;
      }
    },
    []
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchWorkoutPlans();
  }, [fetchWorkoutPlans]);

  return {
    workoutPlans,
    loading,
    error,
    fetchWorkoutPlans,
    createWorkoutPlan,
    generateWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
    assignPlanToClient,
    duplicateWorkoutPlan,
    // Helper methods
    getWorkoutPlan: useCallback(
      (id) => workoutPlans.find((p) => p.id === id),
      [workoutPlans]
    ),
    getPlansByClient: useCallback(
      (clientId) => workoutPlans.filter((p) => p.client_id === clientId),
      [workoutPlans]
    ),
    getPlanCount: useCallback(() => workoutPlans.length, [workoutPlans]),
  };
};
