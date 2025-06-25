import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";

export const useSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchSessions = useCallback(async (includePast = false) => {
    setLoading(true);
    setError(null);

    try {
      console.log("useSessions: Fetching sessions...");
      const response = await axios.get("/api/sessions", {
        params: includePast ? { include_past: true } : {},
      });
      console.log("useSessions: Response received:", response.data);
      setSessions(response.data || []);
    } catch (err) {
      console.error("useSessions: Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (sessionData) => {
    // Generate temporary ID for optimistic update
    const tempId = `temp_${Date.now()}`;
    const tempSession = { ...sessionData, id: tempId, pending: true };

    // Optimistic update
    setSessions((prev) => [...prev, tempSession]);

    try {
      const response = await axios.post("/api/sessions", sessionData);
      const newSession = response.data;

      // Replace temporary session with real data
      setSessions((prev) =>
        prev.map((session) => (session.id === tempId ? newSession : session))
      );

      return newSession;
    } catch (err) {
      // Remove temporary session on error
      setSessions((prev) => prev.filter((session) => session.id !== tempId));
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
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, ...updates, pending: true }
            : session
        )
      );

      try {
        const response = await axios.put(`/api/sessions/${sessionId}`, updates);
        const updatedSession = response.data;

        // Update with server response
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId
              ? { ...updatedSession, pending: false }
              : session
          )
        );

        return updatedSession;
      } catch (err) {
        // Rollback on error
        setSessions(previousSessions);
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
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, deleting: true } : session
        )
      );

      try {
        await axios.delete(`/api/sessions/${sessionId}`);

        // Remove session from list
        setSessions((prev) =>
          prev.filter((session) => session.id !== sessionId)
        );
      } catch (err) {
        // Rollback on error
        setSessions(previousSessions);
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
  // Auto-fetch on mount - only once
  useEffect(() => {
    fetchSessions();
  }, []); // Empty dependency array to run only once on mount
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
