import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useClients } from "@/hooks/clients/useClients";
import { useDietPlans } from "@/hooks/diet/useDietPlans";
import { useSessions } from "@/hooks/session/useSessions";
import { useTasks } from "@/hooks/tasks/useTasks";

/**
 * Hook for preloading all essential data after user login
 * This ensures all pages and modals load instantly with cached data
 */
export const useDataPreloader = () => {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [preloadingStatus, setPreloadingStatus] = useState("");
  const [preloadError, setPreloadError] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const { fetchClients } = useClients();
  const { fetchDietPlans } = useDietPlans();
  const { fetchSessions } = useSessions();
  const { fetchTasks } = useTasks();

  const preloadAllData = useCallback(async () => {
    if (!user) return;

    setIsPreloading(true);
    setPreloadingProgress(0);
    setPreloadError(null);

    try {
      const preloadTasks = [];
      let completedTasks = 0;
      const totalTasks = 4;

      const updateProgress = () => {
        completedTasks++;
        setPreloadingProgress((completedTasks / totalTasks) * 100);
      };

      // Task 1: Load clients data
      setPreloadingStatus("Loading clients...");
      preloadTasks.push(
        fetchClients()
          .then(() => {
            updateProgress();
          })
          .catch((err) => {
            console.warn("Failed to preload clients:", err);
            updateProgress(); // Continue even if one fails
          })
      );

      // Task 2: Load diet plans
      setPreloadingStatus("Loading nutrition plans...");
      preloadTasks.push(
        fetchDietPlans()
          .then(() => {
            updateProgress();
          })
          .catch((err) => {
            console.warn("Failed to preload diet plans:", err);
            updateProgress();
          })
      );

      // Task 3: Load sessions
      setPreloadingStatus("Loading training sessions...");
      preloadTasks.push(
        fetchSessions()
          .then(() => {
            updateProgress();
          })
          .catch((err) => {
            console.warn("Failed to preload sessions:", err);
            updateProgress();
          })
      );

      // Task 4: Load tasks
      setPreloadingStatus("Loading tasks...");
      preloadTasks.push(
        fetchTasks()
          .then(() => {
            updateProgress();
          })
          .catch((err) => {
            console.warn("Failed to preload tasks:", err);
            updateProgress();
          })
      );

      // Execute all preload tasks
      await Promise.all(preloadTasks);

      setPreloadingStatus("Data loaded successfully!");

      // Small delay to show completion
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Data preloading failed:", error);
      setPreloadError(error.message || "Failed to load data");
    } finally {
      setIsPreloading(false);
    }
  }, [user, fetchClients, fetchDietPlans, fetchSessions, fetchTasks]);

  return {
    isPreloading,
    preloadingProgress,
    preloadingStatus,
    preloadError,
    preloadAllData,
  };
};
