import { useState, useEffect, useCallback } from "react";
import useFetchSessions from "./api/useFetchSessions";
import useCreateSession from "./api/useCreateSession";
import useUpdateSession from "./api/useUpdateSession";
import useUpdateSessionTime from "./api/useUpdateSessionTime";
import useCancelSession from "./api/useCancelSession";
import useReinstateSession from "./api/useReinstateSession";
import useCompleteSession from "./api/useCompleteSession";
import useDeleteSession from "./api/useDeleteSession";

const useSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Individual action hooks
  const fetchAction = useFetchSessions();
  const createAction = useCreateSession();
  const updateAction = useUpdateSession();
  const updateTimeAction = useUpdateSessionTime();
  const cancelAction = useCancelSession();
  const reinstateAction = useReinstateSession();
  const completeAction = useCompleteSession();
  const deleteAction = useDeleteSession();

  // Fetch all sessions with optional filters
  const fetchSessions = useCallback(
    async (includePast = false) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAction.execute(includePast);

        if (result.success) {
          // The API returns the sessions array directly, not wrapped in a sessions property
          const sessionsData = Array.isArray(result.data) ? result.data : [];
          setSessions(sessionsData);
          return { success: true, data: sessionsData };
        } else {
          setError(result.error);
          setSessions([]);
          return { success: false, message: result.error };
        }
      } catch (err) {
        const errorMessage = "Failed to fetch sessions";
        setError(errorMessage);
        console.error("Error fetching sessions:", err);
        setSessions([]);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [fetchAction]
  );

  // Create session (optimistic)
  const createSession = useCallback(
    async (sessionData) => {
      setError(null);

      // Create optimistic session with temporary ID
      const optimisticSession = {
        ...sessionData,
        id: `temp-${Date.now()}`,
        status: sessionData.status || "scheduled",
        duration: sessionData.duration || 60,
        rate: sessionData.rate || 0.0,
        session_type: sessionData.session_type || "general",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistically add to state
      setSessions((prev) => [optimisticSession, ...prev]);

      try {
        const result = await createAction.execute(sessionData);

        if (result.success) {
          // Replace optimistic session with real one
          setSessions((prev) =>
            prev.map((session) =>
              session.id === optimisticSession.id ? result.data : session
            )
          );
          return { success: true, data: result.data };
        } else {
          // Rollback optimistic updates
          setSessions((prev) =>
            prev.filter((session) => session.id !== optimisticSession.id)
          );
          setError(result.error);
          return { success: false, message: result.error };
        }
      } catch (err) {
        // Rollback optimistic updates
        setSessions((prev) =>
          prev.filter((session) => session.id !== optimisticSession.id)
        );

        const errorMessage = "Failed to create session";
        setError(errorMessage);
        console.error("Error creating session:", err);
        return { success: false, message: errorMessage };
      }
    },
    [createAction]
  );

  // Update session (optimistic)
  const updateSession = useCallback(
    async (id, updates) => {
      setError(null);

      // Store original session for potential rollback
      let originalSession = null;
      setSessions((prev) => {
        originalSession = prev.find((s) => s.id === id);
        return prev.map((session) =>
          session.id === id ? { ...session, ...updates } : session
        );
      });

      if (!originalSession) {
        setError("Session not found");
        return { success: false, message: "Session not found" };
      }

      try {
        const result = await updateAction.execute(id, updates);

        if (result.success) {
          // Update with server response
          setSessions((prev) =>
            prev.map((session) => (session.id === id ? result.data : session))
          );
          return { success: true, data: result.data };
        } else {
          // Rollback optimistic update
          setSessions((prev) =>
            prev.map((session) =>
              session.id === id ? originalSession : session
            )
          );
          setError(result.error);
          return { success: false, message: result.error };
        }
      } catch (err) {
        // Rollback optimistic update
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? originalSession : session))
        );

        const errorMessage = "Failed to update session";
        setError(errorMessage);
        console.error("Error updating session:", err);
        return { success: false, message: errorMessage };
      }
    },
    [updateAction]
  );

  // Update session time (for drag and drop) - optimistic
  const updateSessionTime = useCallback(
    async (id, timeData) => {
      setError(null);

      // Extract start_time and end_time from timeData
      const { start_time, end_time } = timeData;

      // Calculate duration in minutes
      const start = new Date(start_time);
      const end = new Date(end_time);
      const duration = Math.round((end - start) / (1000 * 60));

      const updates = {
        start_time,
        end_time,
        duration,
      };

      // Store original session for potential rollback
      let originalSession = null;

      // Use a promise to properly handle the async state update
      const updateResult = await new Promise((resolve) => {
        setSessions((prev) => {
          originalSession = prev.find((s) => s.id === id);

          if (!originalSession) {
            resolve({ found: false });
            return prev; // Return unchanged if session not found
          }

          const updatedSessions = prev.map((session) =>
            session.id === id ? { ...session, ...updates } : session
          );
          resolve({ found: true, originalSession });
          return updatedSessions;
        });
      });

      // Check the result of the state update
      if (!updateResult.found) {
        setError("Session not found");
        return { success: false, message: "Session not found" };
      }

      // Use the originalSession from the promise result
      originalSession = updateResult.originalSession;

      try {
        const result = await updateTimeAction.execute(id, timeData);

        if (result.success) {
          // Update with server response
          setSessions((prev) =>
            prev.map((session) => (session.id === id ? result.data : session))
          );
          return { success: true, data: result.data };
        } else {
          // Rollback optimistic update
          setSessions((prev) =>
            prev.map((session) =>
              session.id === id ? originalSession : session
            )
          );
          setError(result.error);
          return { success: false, message: result.error };
        }
      } catch (err) {
        // Rollback optimistic update
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? originalSession : session))
        );

        const errorMessage = "Failed to update session time";
        setError(errorMessage);
        console.error("Error updating session time:", err);
        return { success: false, message: errorMessage };
      }
    },
    [updateTimeAction]
  );

  // Update session status (cancel, reinstate, complete)
  const updateSessionStatus = useCallback(
    async (id, status) => {
      setError(null);

      // Store original session for potential rollback
      let originalSession = null;
      setSessions((prev) => {
        originalSession = prev.find((s) => s.id === id);
        return prev.map((session) =>
          session.id === id ? { ...session, status } : session
        );
      });

      if (!originalSession) {
        setError("Session not found");
        return { success: false, message: "Session not found" };
      }

      try {
        let result;
        if (status === "cancelled") {
          result = await cancelAction.execute(id);
        } else if (status === "scheduled") {
          result = await reinstateAction.execute(id);
        } else if (status === "completed") {
          result = await completeAction.execute(id);
        } else {
          throw new Error(`Unknown status: ${status}`);
        }

        if (result.success) {
          // Update with server response
          setSessions((prev) =>
            prev.map((session) => (session.id === id ? result.data : session))
          );
          return { success: true, data: result.data };
        } else {
          // Rollback optimistic update
          setSessions((prev) =>
            prev.map((session) =>
              session.id === id ? originalSession : session
            )
          );
          setError(result.error);
          return { success: false, message: result.error };
        }
      } catch (err) {
        // Rollback optimistic update
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? originalSession : session))
        );

        const errorMessage = "Failed to update session status";
        setError(errorMessage);
        console.error("Error updating session status:", err);
        return { success: false, message: errorMessage };
      }
    },
    [cancelAction, reinstateAction, completeAction]
  );

  // Convenience methods for status updates
  const cancelSession = useCallback(
    (id) => updateSessionStatus(id, "cancelled"),
    [updateSessionStatus]
  );
  const reinstateSession = useCallback(
    (id) => updateSessionStatus(id, "scheduled"),
    [updateSessionStatus]
  );
  const completeSession = useCallback(
    (id) => updateSessionStatus(id, "completed"),
    [updateSessionStatus]
  );

  // Delete session (optimistic)
  const deleteSession = useCallback(
    async (id) => {
      setError(null);

      let originalSession = null;

      // Optimistically remove from state
      setSessions((prev) => {
        originalSession = prev.find((s) => s.id === id);
        if (!originalSession) return prev;
        return prev.filter((session) => session.id !== id);
      });

      if (!originalSession) {
        setError("Session not found");
        return { success: false, message: "Session not found" };
      }

      try {
        const result = await deleteAction.execute(id);

        if (result.success) {
          return { success: true };
        } else {
          // Rollback optimistic updates
          setSessions((prev) => [...prev, originalSession]);
          setError(result.error);
          return { success: false, message: result.error };
        }
      } catch (err) {
        // Rollback optimistic updates
        setSessions((prev) => [...prev, originalSession]);

        const errorMessage = "Failed to delete session";
        setError(errorMessage);
        console.error("Error deleting session:", err);
        return { success: false, message: errorMessage };
      }
    },
    [deleteAction]
  );

  // Optimistic update for external state management (drag/drop)
  const updateSessionTimeOptimistic = useCallback((id, timeData) => {
    const { start_time, end_time } = timeData;
    const start = new Date(start_time);
    const end = new Date(end_time);
    const duration = Math.round((end - start) / (1000 * 60));

    setSessions((prev) =>
      prev.map((session) =>
        session.id === id
          ? {
              ...session,
              start_time,
              end_time,
              duration,
            }
          : session
      )
    );
  }, []);

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []); // Empty dependency array - only run once on mount

  return {
    // Data
    sessions,
    loading,
    error,

    // Actions
    fetchSessions,
    createSession,
    updateSession,
    updateSessionTime,
    updateSessionTimeOptimistic,
    cancelSession,
    reinstateSession,
    completeSession,
    deleteSession,
  };
};

export default useSessions;
