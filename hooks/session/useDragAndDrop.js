import { useState, useCallback, useRef, useEffect } from "react";
import dayjs from "dayjs";

/**
 * Custom hook for optimized drag and drop functionality in calendar components
 * Provides throttled drag operations, cached calculations, and clean state management
 */
export const useDragAndDrop = ({ 
  calendarRef, 
  weekDays, 
  onSessionUpdate,
  throttleMs = 16 // ~60fps
}) => {
  // Drag state
  const [draggedSession, setDraggedSession] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Performance optimizations
  const dragStateRef = useRef({ isDragging: false, isResizing: false });
  const throttleRef = useRef(null);
  const lastUpdateRef = useRef(null);
  
  // Cached calculations
  const layoutCache = useRef({
    timeColumnWidth: 50,
    headerHeight: 40,
    hourHeight: 60,
    dayColumnWidth: 0,
    calendarRect: null
  });

  // Update layout cache when calendar dimensions change
  const updateLayoutCache = useCallback(() => {
    if (!calendarRef?.current) return;
    
    const calendarRect = calendarRef.current.getBoundingClientRect();
    layoutCache.current = {
      ...layoutCache.current,
      dayColumnWidth: (calendarRect.width - layoutCache.current.timeColumnWidth) / 7,
      calendarRect
    };
  }, [calendarRef]);

  // Throttled drag calculation
  const calculateDragPosition = useCallback((e) => {
    if (!draggedSession || !calendarRef?.current || !weekDays) return null;

    const { calendarRect, timeColumnWidth, dayColumnWidth, headerHeight, hourHeight } = layoutCache.current;
    
    if (!calendarRect) return null;

    const x = e.clientX - calendarRect.left;
    const y = e.clientY - calendarRect.top;

    // Calculate day column
    const dayIndex = Math.max(0, Math.min(6, Math.floor((x - timeColumnWidth) / dayColumnWidth)));
    
    // Calculate time with snapping
    const adjustedY = Math.max(0, y - headerHeight - dragOffset.y);
    const hourIndex = Math.floor(adjustedY / hourHeight);
    const minuteInHour = adjustedY % hourHeight;
    const snappedMinute = Math.round(minuteInHour / 15) * 15;

    let actualHour = Math.max(0, Math.min(23, hourIndex));
    let actualMinute = snappedMinute;

    if (actualMinute >= 60) {
      actualMinute = 0;
      actualHour = Math.min(23, actualHour + 1);
    }

    // Calculate new times
    const targetDay = weekDays[dayIndex];
    const newStart = targetDay.hour(actualHour).minute(actualMinute).second(0);
    const duration = dayjs(draggedSession.end_time).diff(dayjs(draggedSession.start_time), "minute");
    const newEnd = newStart.add(duration, "minute");

    return {
      start_time: newStart.format("YYYY-MM-DDTHH:mm:ss"),
      end_time: newEnd.format("YYYY-MM-DDTHH:mm:ss"),
    };
  }, [draggedSession, dragOffset, weekDays, calendarRef]);

  // Start drag operation
  const startDrag = useCallback((e, session, action = "drag") => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    
    if (action === "drag") {
      setDraggedSession(session);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      dragStateRef.current.isDragging = true;
      
      // Update layout cache for this drag operation
      updateLayoutCache();
    }

    document.body.style.userSelect = "none";
    document.body.style.cursor = action === "drag" ? "grabbing" : "ns-resize";
  }, [updateLayoutCache]);

  // Throttled mouse move handler
  const handleMouseMove = useCallback((e) => {
    if (!dragStateRef.current.isDragging || !draggedSession) return;

    // Throttle updates for performance
    const now = Date.now();
    if (throttleRef.current && now - throttleRef.current < throttleMs) return;
    throttleRef.current = now;

    const newPosition = calculateDragPosition(e);
    if (!newPosition) return;

    // Only update if position actually changed
    const positionKey = `${newPosition.start_time}-${newPosition.end_time}`;
    if (lastUpdateRef.current === positionKey) return;
    lastUpdateRef.current = positionKey;

    setDraggedSession(prev => ({
      ...prev,
      ...newPosition
    }));
  }, [draggedSession, calculateDragPosition, throttleMs]);

  // End drag operation
  const endDrag = useCallback(() => {
    if (dragStateRef.current.isDragging && draggedSession && onSessionUpdate) {
      onSessionUpdate(draggedSession);
    }

    // Reset all drag state
    dragStateRef.current.isDragging = false;
    dragStateRef.current.isResizing = false;
    setDraggedSession(null);
    setDragOffset({ x: 0, y: 0 });
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    
    // Clear throttle refs
    throttleRef.current = null;
    lastUpdateRef.current = null;
  }, [draggedSession, onSessionUpdate]);

  // Set up global event listeners
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", endDrag);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", endDrag);
    };
  }, [handleMouseMove, endDrag]);

  // Update layout cache when window resizes
  useEffect(() => {
    const handleResize = () => updateLayoutCache();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateLayoutCache]);

  return {
    // State
    draggedSession,
    dragOffset,
    isDragging: dragStateRef.current.isDragging,
    isResizing: dragStateRef.current.isResizing,
    
    // Actions
    startDrag,
    endDrag,
    
    // Utilities
    updateLayoutCache,
  };
};

export default useDragAndDrop;
