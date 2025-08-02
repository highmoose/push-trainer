import { useState, useEffect, useCallback } from "react";
import {
  useFetchSessions,
  useCreateSession,
  useUpdateSession,
  useUpdateSessionTime,
  useCancelSession,
  useReinstateSession,
  useCompleteSession,
  useDeleteSession,
} from "./api";

const useSessions = () => {
  // API hooks
  const fetchSessionsApi = useFetchSessions();
  const createSessionApi = useCreateSession();
  const updateSessionApi = useUpdateSession();
  const updateSessionTimeApi = useUpdateSessionTime();
  const cancelSessionApi = useCancelSession();
  const reinstateSessionApi = useReinstateSession();
  const completeSessionApi = useCompleteSession();
  const deleteSessionApi = useDeleteSession();

  // State
  const [sessions, setSessions] = useState([]);

  // Fetch all sessions
  const fetchSessions = useCallback(async (includePast = false) => {
    const result = await fetchSessionsApi.execute(includePast);

    if (result.success) {
      setSessions(result.data);
    }

    return result;
  }, []); // Remove fetchSessionsApi from dependencies to prevent infinite loop

  // Create a new session
  const createSession = useCallback(
    async (sessionData) => {
      console.log("🆕 createSession called with data:", sessionData);

      const result = await createSessionApi.execute(sessionData);

      if (result.success) {
        const newSession = result.data;
        console.log("📥 Session creation response:", newSession);

        // Optimistically update state
        setSessions((prev) => [newSession, ...prev]);
        console.log("✅ Session created successfully");
      } else {
        console.error("❌ Error creating session:", result.error);
      }

      return result;
    },
    [] // Remove createSessionApi from dependencies to prevent infinite loop
  );

  // Update session (optimistic)
  const updateSession = useCallback(
    async (id, updates) => {
      // Store original session for rollback
      const originalSession = sessions.find((s) => s.id === id);
      if (!originalSession) {
        return { success: false, message: "Session not found" };
      }

      // Optimistically update state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, ...updates } : session
        )
      );

      const result = await updateSessionApi.execute(id, updates);

      if (result.success) {
        const updatedSession = result.data;

        // Update with server response
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? updatedSession : session))
        );
      } else {
        // Rollback optimistic update
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? originalSession : session))
        );
      }

      return result;
    },
    [sessions] // Keep sessions dependency but remove updateSessionApi
  );

  // Update session time (for drag and drop) - optimistic
  const updateSessionTime = useCallback(
    async (id, timeData) => {
      console.log("⏰ updateSessionTime called:", { id, timeData });

      // Store original session for rollback
      const originalSession = sessions.find((s) => s.id === id);
      if (!originalSession) {
        return { success: false, message: "Session not found" };
      }

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

      // Optimistically update state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, ...updates } : session
        )
      );

      console.log("📤 Making PUT request to update session time:", {
        id,
        updates,
      });

      const result = await updateSessionTimeApi.execute(id, timeData);

      if (result.success) {
        const updatedSession = result.data;
        console.log("📥 Session time update response:", updatedSession);

        // Update with server response
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? updatedSession : session))
        );

        console.log("✅ Session time updated successfully");
      } else {
        // Rollback optimistic update
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? originalSession : session))
        );

        console.error("❌ Error updating session time:", result.error);
      }

      return result;
    },
    [sessions] // Keep sessions dependency but remove updateSessionTimeApi
  );

  // Cancel session (optimistic)
  const cancelSession = useCallback(
    async (id) => {
      // Store original session for rollback
      const originalSession = sessions.find((s) => s.id === id);
      if (!originalSession) {
        return { success: false, message: "Session not found" };
      }

      // Optimistically update state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, status: "cancelled" } : session
        )
      );

      const result = await cancelSessionApi.execute(id);

      if (result.success) {
        const updatedSession = result.data;

        // Update with server response
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? updatedSession : session))
        );
      } else {
        // Rollback optimistic update
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? originalSession : session))
        );
      }

      return result;
    },
    [sessions] // Keep sessions dependency but remove cancelSessionApi
  );

  // Reinstate session (optimistic)
  const reinstateSession = useCallback(
    async (id) => {
      // Store original session for rollback
      const originalSession = sessions.find((s) => s.id === id);
      if (!originalSession) {
        return { success: false, message: "Session not found" };
      }

      // Optimistically update state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, status: "scheduled" } : session
        )
      );

      const result = await reinstateSessionApi.execute(id);

      if (result.success) {
        const updatedSession = result.data;

        // Update with server response
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? updatedSession : session))
        );
      } else {
        // Rollback optimistic update
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? originalSession : session))
        );
      }

      return result;
    },
    [sessions] // Keep sessions dependency but remove reinstateSessionApi
  );

  // Complete session (optimistic)
  const completeSession = useCallback(
    async (id) => {
      // Store original session for rollback
      const originalSession = sessions.find((s) => s.id === id);
      if (!originalSession) {
        return { success: false, message: "Session not found" };
      }

      // Optimistically update state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, status: "completed" } : session
        )
      );

      const result = await completeSessionApi.execute(id);

      if (result.success) {
        const updatedSession = result.data;

        // Update with server response
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? updatedSession : session))
        );
      } else {
        // Rollback optimistic update
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? originalSession : session))
        );
      }

      return result;
    },
    [sessions] // Keep sessions dependency but remove completeSessionApi
  );

  // Delete session
  const deleteSession = useCallback(
    async (id) => {
      const result = await deleteSessionApi.execute(id);

      if (result.success) {
        // Remove from state
        setSessions((prev) => prev.filter((session) => session.id !== id));
      }

      return result;
    },
    [] // Remove deleteSessionApi from dependencies to prevent infinite loop
  );

  // Optimistic update for external state management (drag/drop)
  const updateSessionTimeOptimistic = useCallback((id, startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.round((end - start) / (1000 * 60));

    setSessions((prev) =>
      prev.map((session) =>
        session.id === id
          ? {
              ...session,
              start_time: startTime,
              end_time: endTime,
              duration: duration,
            }
          : session
      )
    );
  }, []);

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading:
      fetchSessionsApi.loading ||
      createSessionApi.loading ||
      deleteSessionApi.loading,
    error:
      fetchSessionsApi.error ||
      createSessionApi.error ||
      updateSessionApi.error ||
      updateSessionTimeApi.error ||
      cancelSessionApi.error ||
      reinstateSessionApi.error ||
      completeSessionApi.error ||
      deleteSessionApi.error,
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
