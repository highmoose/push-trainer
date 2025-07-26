import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import useFetchClients from "./clients/useFetchClients";
import useFetchDietPlans from "./diet/useFetchDietPlans";

/**
 * Hook for preloading all essential data after user login
 * This ensures all pages and modals load instantly with cached data
 * Uses the new single-action hook structure to properly cache data
 */
export const useDataPreloader = () => {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [preloadingStatus, setPreloadingStatus] = useState("");
  const [preloadError, setPreloadError] = useState(null);

  const user = useSelector((state) => state.auth.user);

  // Individual action hooks for preloading
  const fetchClients = useFetchClients();
  const fetchDietPlans = useFetchDietPlans();

  const preloadAllData = useCallback(async () => {
    if (!user) return;

    setIsPreloading(true);
    setPreloadingProgress(0);
    setPreloadError(null);

    try {
      const preloadTasks = [];
      let completedTasks = 0;
      const totalTasks = 2; // clients and diet plans

      const updateProgress = () => {
        completedTasks++;
        setPreloadingProgress((completedTasks / totalTasks) * 100);
      };

      // Task 1: Load clients data using the hook
      setPreloadingStatus("Loading clients...");
      preloadTasks.push(
        fetchClients
          .execute()
          .then((result) => {
            if (result.success) {
              console.log(
                "Clients preloaded:",
                result.data?.length || 0,
                "clients"
              );
            }
            updateProgress();
          })
          .catch((err) => {
            console.warn("Failed to preload clients:", err);
            updateProgress(); // Continue even if one fails
          })
      );

      // Task 2: Load diet plans using the hook
      setPreloadingStatus("Loading diet plans...");
      preloadTasks.push(
        fetchDietPlans
          .execute()
          .then((result) => {
            if (result.success) {
              console.log(
                "Diet plans preloaded:",
                result.data?.length || 0,
                "plans"
              );
            }
            updateProgress();
          })
          .catch((err) => {
            console.warn("Failed to preload diet plans:", err);
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
  }, [user, fetchClients, fetchDietPlans]);

  return {
    isPreloading,
    preloadingProgress,
    preloadingStatus,
    preloadError,
    preloadAllData,
  };
};
