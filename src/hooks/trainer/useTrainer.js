import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";

export const useTrainer = () => {
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClientTrainer = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("fetchClientTrainer: Starting API call...");
      const response = await axios.get("/api/client/trainer");
      console.log("fetchClientTrainer: Success", response.data);
      setTrainer(response.data.trainer);
    } catch (err) {
      console.error("fetchClientTrainer: Error", err.response || err);
      setError(err.response?.data?.message || "Failed to fetch trainer");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchClientTrainer();
  }, [fetchClientTrainer]);

  return {
    trainer,
    loading,
    error,
    fetchClientTrainer,
    clearError,
    // Helper methods
    hasTrainer: useCallback(() => !!trainer, [trainer]),
  };
};
