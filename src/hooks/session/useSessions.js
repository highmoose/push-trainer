import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";

// Global cache for sessions
const sessionsCache = new Map();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes (shorter for sessions due to time-sensitive nature)

// Cache management utilities
const isCacheValid = (cacheItem) => {
  return cacheItem && Date.now() - cacheItem.timestamp < CACHE_DURATION;
};

const setCacheItem = (key, data) => {
  sessionsCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

const getCacheItem = (key) => {
  const cacheItem = sessionsCache.get(key);
  return isCacheValid(cacheItem) ? cacheItem.data : null;
};

const clearSessionsCache = () => {
  sessionsCache.clear();
};

// Make cache clearing available globally
if (typeof window !== "undefined") {
  window.clearSessionsCache = clearSessionsCache;
}

export const useSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(
    async (includePast = false, forceRefresh = false) => {
      const cacheKey = `sessions_${includePast ? "with_past" : "current"}`;

      // Check cache first unless forced refresh
      if (!forceRefresh) {
        const cachedSessions = getCacheItem(cacheKey);
        if (cachedSessions) {
          setSessions(cachedSessions);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        console.log("useSessions: Fetching sessions...");
        const response = await axios.get("/api/sessions", {
          params: includePast ? { include_past: true } : {},
        });
        console.log("useSessions: Response received:", response.data);
        const sessionsData = response.data || [];
        setSessions(sessionsData);
        setCacheItem(cacheKey, sessionsData);
      } catch (err) {
        console.error("useSessions: Fetch error:", err);
        setError(err.response?.data?.message || "Failed to fetch sessions");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createSession = useCallback(async (sessionData) => {
    // Generate temporary ID for optimistic update
    const tempId = `temp_${Date.now()}`;
    const tempSession = { ...sessionData, id: tempId, pending: true };

    // Optimistic update
    setSessions((prev) => {
      const newSessions = [...prev, tempSession];
      // Update cache with optimistic data
      setCacheItem("sessions_current", newSessions);
      return newSessions;
    });

    try {
      const response = await axios.post("/api/sessions", sessionData);
      const newSession = response.data;

      // Replace temporary session with real data
      setSessions((prev) => {
        const updatedSessions = prev.map((session) =>
          session.id === tempId ? newSession : session
        );
        // Update cache with real data
        setCacheItem("sessions_current", updatedSessions);
        return updatedSessions;
      });

      return newSession;
    } catch (err) {
      // Remove temporary session on error
      setSessions((prev) => {
        const revertedSessions = prev.filter(
          (session) => session.id !== tempId
        );
        // Update cache by removing temporary session
        setCacheItem("sessions_current", revertedSessions);
        return revertedSessions;
      });
      setError(err.response?.data?.message || "Failed to create session");
      throw err;
    }
  }, []);
  const updateSessionTime = useCallback(
    async (sessionId, { start_time, end_time }) => {
      // Store previous state for rollback
      const previousSessions = sessions;

      // Calculate duration in minutes
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);
      const duration = Math.round((endTime - startTime) / (1000 * 60)); // Pass the time directly as received - backend will handle timezone conversion
      const updates = {
        start_time: start_time,
        end_time: end_time, // Include end_time for proper animation
        duration: duration,
      };

      console.log("updateSessionTime: Sending to backend:", updates); // Optimistic update - include both start and end times for smooth animation
      // Don't set pending status for time updates to avoid color changes
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                start_time: start_time,
                end_time: end_time,
                duration: duration,
              }
            : session
        )
      );

      try {
        const response = await axios.put(
          `/api/sessions/${sessionId}/time`,
          updates
        );
        const updatedSession = response.data;

        // Update with server response - only update if data actually changed
        setSessions((prev) =>
          prev.map((session) => {
            if (session.id === sessionId) {
              // Check if the response data is different from current state
              const hasChanges =
                session.start_time !== updatedSession.start_time ||
                session.end_time !== updatedSession.end_time ||
                session.duration !== updatedSession.duration;

              // Only update if there are actual changes to prevent unnecessary re-renders
              return hasChanges ? { ...updatedSession } : session;
            }
            return session;
          })
        );

        return updatedSession;
      } catch (err) {
        // Rollback on error
        setSessions(previousSessions);
        setError(
          err.response?.data?.message || "Failed to update session time"
        );
        throw err;
      }
    },
    [sessions]
  );

  const updateSessionTimeOptimistic = useCallback(
    (sessionId, { start_time, end_time }) => {
      // Calculate duration in minutes
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);
      const duration = Math.round((endTime - startTime) / (1000 * 60));

      // Immediate optimistic update without API call
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                start_time: start_time,
                end_time: end_time,
                duration: duration,
              }
            : session
        )
      );
    },
    []
  );

  const updateSession = useCallback(
    async (sessionId, updates) => {
      // Store previous state for rollback
      const previousSessions = sessions;

      // Optimistic update
      setSessions((prev) => {
        const updatedSessions = prev.map((session) =>
          session.id === sessionId
            ? { ...session, ...updates, pending: true }
            : session
        );
        // Clear cache to ensure fresh data on next fetch
        clearSessionsCache();
        return updatedSessions;
      });

      try {
        const response = await axios.put(`/api/sessions/${sessionId}`, updates);
        const updatedSession = response.data;

        // Update with server response
        setSessions((prev) => {
          const finalSessions = prev.map((session) =>
            session.id === sessionId
              ? { ...updatedSession, pending: false }
              : session
          );
          // Update cache with fresh data
          setCacheItem("sessions_current", finalSessions);
          return finalSessions;
        });

        return updatedSession;
      } catch (err) {
        // Rollback on error
        setSessions(previousSessions);
        setCacheItem("sessions_current", previousSessions);
        setError(err.response?.data?.message || "Failed to update session");
        throw err;
      }
    },
    [sessions]
  );

  const deleteSession = useCallback(
    async (sessionId) => {
      // Store previous state for rollback
      const previousSessions = sessions;

      // Optimistic update - mark as deleting
      setSessions((prev) => {
        const updatedSessions = prev.map((session) =>
          session.id === sessionId ? { ...session, deleting: true } : session
        );
        // Clear cache during deletion
        clearSessionsCache();
        return updatedSessions;
      });

      try {
        await axios.delete(`/api/sessions/${sessionId}`);

        // Remove session from list
        setSessions((prev) => {
          const filteredSessions = prev.filter(
            (session) => session.id !== sessionId
          );
          // Update cache with filtered data
          setCacheItem("sessions_current", filteredSessions);
          return filteredSessions;
        });
      } catch (err) {
        // Rollback on error
        setSessions(previousSessions);
        setCacheItem("sessions_current", previousSessions);
        setError(err.response?.data?.message || "Failed to delete session");
        throw err;
      }
    },
    [sessions]
  );

  const completeSession = useCallback(
    async (sessionId) => {
      return updateSession(sessionId, { status: "completed" });
    },
    [updateSession]
  );

  const cancelSession = useCallback(
    async (sessionId) => {
      return updateSession(sessionId, { status: "cancelled" });
    },
    [updateSession]
  );
  // Auto-fetch on mount with cache check
  useEffect(() => {
    // Try to load from cache first for immediate UI feedback
    const cachedSessions = getCacheItem("sessions_current");
    if (cachedSessions) {
      setSessions(cachedSessions);
    }

    // Always fetch fresh data, but cache will provide immediate feedback
    fetchSessions();
  }, [fetchSessions]);
  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    updateSessionTime,
    updateSessionTimeOptimistic,
    deleteSession,
    completeSession,
    cancelSession,
    // Cache management
    clearCache: clearSessionsCache,
    // Helper methods
    getSession: useCallback(
      (id) => sessions.find((s) => s.id === id),
      [sessions]
    ),
    getSessionsByClient: useCallback(
      (clientId) => sessions.filter((s) => s.client_id === clientId),
      [sessions]
    ),
    getUpcomingSessions: useCallback(() => {
      const now = new Date();
      return sessions.filter((s) => new Date(s.start_time) > now);
    }, [sessions]),
    getSessionCount: useCallback(() => sessions.length, [sessions]),
  };
};
