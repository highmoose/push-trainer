import { useState, useCallback, useRef, useEffect } from "react";
import dayjs from "dayjs";

/**
 * Optimized drag and drop hook with minimal re-renders
 */
export const useDragAndDrop = ({ calendarRef, weekDays, onSessionUpdate }) => {
  const [draggedSession, setDraggedSession] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Store the callback in a ref to avoid stale closures
  const onSessionUpdateRef = useRef(onSessionUpdate);

  // Update the ref when the callback changes
  useEffect(() => {
    onSessionUpdateRef.current = onSessionUpdate;
  }, [onSessionUpdate]);

  const stateRef = useRef({
    isDragging: false,
    lastUpdate: 0,
    weekDays: null,
    currentSession: null,
    dragOffset: { x: 0, y: 0 },
    layout: {
      timeColumnWidth: 50,
      headerHeight: 40,
      hourHeight: 60,
      dayColumnWidth: 0,
      rect: null,
    },
  });

  // Simplified start drag
  const startDrag = useCallback(
    (e, session) => {
      e.preventDefault();
      e.stopPropagation();

      // Validate session has required properties
      if (!session || !session.start_time || !session.end_time) {
        console.warn("Invalid session data for drag:", session);
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const offset = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      setDraggedSession(session);
      setDragOffset(offset);

      stateRef.current.isDragging = true;
      stateRef.current.weekDays = weekDays;
      stateRef.current.currentSession = { ...session }; // Create a copy
      stateRef.current.dragOffset = offset;

      // Update layout for current drag
      if (calendarRef?.current) {
        const calendarRect = calendarRef.current.getBoundingClientRect();
        stateRef.current.layout = {
          timeColumnWidth: 50,
          headerHeight: 40,
          hourHeight: 60,
          dayColumnWidth: (calendarRect.width - 50) / 7,
          rect: calendarRect,
        };
      }

      document.body.style.cssText = "user-select:none;cursor:grabbing";
    },
    [weekDays]
  );

  // Simplified end drag - most logic is in useEffect
  const endDrag = useCallback(() => {
    // The actual end logic is in the useEffect to avoid dependencies
  }, []);

  // Single effect for all event listeners - no dependencies to prevent re-runs
  useEffect(() => {
    const handleMove = (e) => {
      if (!stateRef.current.isDragging) return;

      const now = performance.now();
      if (now - stateRef.current.lastUpdate < 16) return; // 60fps throttle
      stateRef.current.lastUpdate = now;

      if (!stateRef.current.weekDays || !stateRef.current.currentSession)
        return;

      const {
        timeColumnWidth,
        dayColumnWidth,
        headerHeight,
        hourHeight,
        rect,
      } = stateRef.current.layout;
      if (!rect) return;

      const x = e.clientX - rect.left - timeColumnWidth;
      const y =
        e.clientY - rect.top - headerHeight - stateRef.current.dragOffset.y;

      const dayIndex = Math.max(0, Math.min(6, Math.floor(x / dayColumnWidth)));
      const totalMinutes = Math.max(
        0,
        Math.floor(y / hourHeight) * 60 + Math.round((y % hourHeight) / 15) * 15
      );

      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;

      if (hour > 23) return;

      const targetDay = stateRef.current.weekDays[dayIndex];
      const currentSession = stateRef.current.currentSession;

      // Ensure we have valid start and end times
      if (!currentSession.start_time || !currentSession.end_time) return;

      const newStart = targetDay.hour(hour).minute(minute).second(0);
      const duration = dayjs(currentSession.end_time).diff(
        dayjs(currentSession.start_time),
        "minute"
      );
      const newEnd = newStart.add(duration, "minute");

      const updatedSession = {
        ...currentSession,
        start_time: newStart.format("YYYY-MM-DDTHH:mm:ss"),
        end_time: newEnd.format("YYYY-MM-DDTHH:mm:ss"),
      };

      // Validate the session has an ID before updating
      if (!updatedSession.id) return;

      // Update both the React state and the ref
      stateRef.current.currentSession = updatedSession;
      setDraggedSession(updatedSession);
    };

    const handleEnd = () => {
      if (stateRef.current.isDragging && stateRef.current.currentSession) {
        // Use the session from the ref, which is always up to date
        const finalSession = stateRef.current.currentSession;

        // Add thorough validation before calling the update function
        if (
          finalSession &&
          typeof finalSession === "object" &&
          finalSession.start_time &&
          finalSession.end_time &&
          finalSession.id &&
          onSessionUpdateRef.current &&
          typeof onSessionUpdateRef.current === "function"
        ) {
          // Call the update function with the correct signature
          try {
            onSessionUpdateRef.current(finalSession.id, {
              start_time: finalSession.start_time,
              end_time: finalSession.end_time,
            });
          } catch (error) {
            console.error("Error in onSessionUpdate:", error);
          }
        }
      }

      // Reset all state
      stateRef.current.isDragging = false;
      stateRef.current.weekDays = null;
      stateRef.current.currentSession = null;
      stateRef.current.dragOffset = { x: 0, y: 0 };
      setDraggedSession(null);
      setDragOffset({ x: 0, y: 0 });
      document.body.style.cssText = "";
    };

    const handleResize = () => {
      if (!calendarRef?.current) return;
      const rect = calendarRef.current.getBoundingClientRect();
      stateRef.current.layout = {
        timeColumnWidth: 50,
        headerHeight: 40,
        hourHeight: 60,
        dayColumnWidth: (rect.width - 50) / 7,
        rect,
      };
    };

    document.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseup", handleEnd);
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array for one-time setup

  return {
    draggedSession,
    dragOffset,
    isDragging: stateRef.current.isDragging,
    startDrag,
    endDrag,
  };
};

export default useDragAndDrop;
