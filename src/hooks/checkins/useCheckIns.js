import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";
import { useSelector } from "react-redux";

export const useCheckIns = () => {
  const user = useSelector((state) => state.auth.user);
  const [checkIns, setCheckIns] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchCheckIns = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.client_id) params.append("client_id", filters.client_id);

      const response = await axios.get(`/api/check-ins?${params.toString()}`);
      setCheckIns(response.data.check_ins.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch check-ins");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/check-ins/schedules");
      setSchedules(response.data.schedules || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    try {
      const response = await axios.get("/api/check-ins/pending-count");
      setPendingCount(response.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch pending count:", err);
    }
  }, []);

  const createCheckIn = useCallback(
    async (checkInData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post("/api/check-ins", checkInData);

        // Add to local state
        setCheckIns((prev) => [response.data.check_in, ...prev]);

        // Update pending count
        fetchPendingCount();

        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to create check-in");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPendingCount]
  );

  const updateCheckIn = useCallback(async (checkInId, updates) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`/api/check-ins/${checkInId}`, updates);

      // Update local state
      setCheckIns((prev) =>
        prev.map((checkIn) =>
          checkIn.id === checkInId ? response.data.check_in : checkIn
        )
      );

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update check-in");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCheckIn = useCallback(
    async (checkInId) => {
      setLoading(true);
      setError(null);

      try {
        await axios.delete(`/api/check-ins/${checkInId}`);

        // Remove from local state
        setCheckIns((prev) =>
          prev.filter((checkIn) => checkIn.id !== checkInId)
        );

        // Update pending count
        fetchPendingCount();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete check-in");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPendingCount]
  );

  const createSchedule = useCallback(
    async (scheduleData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          "/api/check-ins/schedules",
          scheduleData
        );

        // Refresh schedules
        await fetchSchedules();

        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to create schedule");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchSchedules]
  );

  const deactivateSchedule = useCallback(async (scheduleId) => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`/api/check-ins/schedules/${scheduleId}`);

      // Remove from local state
      setSchedules((prev) =>
        prev.filter((schedule) => schedule.id !== scheduleId)
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate schedule");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "trainer") {
      fetchCheckIns();
      fetchSchedules();
      fetchPendingCount();
    }
  }, [user, fetchCheckIns, fetchSchedules, fetchPendingCount]);

  return {
    checkIns,
    schedules,
    loading,
    error,
    pendingCount,
    fetchCheckIns,
    fetchSchedules,
    fetchPendingCount,
    createCheckIn,
    updateCheckIn,
    deleteCheckIn,
    createSchedule,
    deactivateSchedule,
  };
};
