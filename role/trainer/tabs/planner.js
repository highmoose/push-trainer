"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import updateLocale from "dayjs/plugin/updateLocale";
import CreateSessionModal from "@/components/trainer/createSessionModal";
import CreateTaskModal from "@/components/trainer/CreateTaskModal";
import CalendarContextMenu from "@/components/trainer/CalendarContextMenu";
import {
  updateSession,
  updateSessionTime,
  updateSessionTimeOptimistic,
  revertSessionTimeUpdate,
} from "@/redux/slices/sessionSlice";
import "@/components/trainer/calendarStyles.css";
import { Plus } from "lucide-react";

// Configure dayjs to start week on Monday
dayjs.extend(weekday);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  weekStart: 1, // Monday = 1, Sunday = 0
});

const views = ["day", "week", "month", "year"];
const hours = Array.from({ length: 24 }, (_, i) => i); // 0 (12 AM) to 23 (11 PM) - full 24 hours
const fifteenMinutes = Array.from({ length: 4 }, (_, i) => i * 15).map((m) =>
  m.toString().padStart(2, "0")
);

export default function TrainerCalendarPage() {
  const dispatch = useDispatch();
  const calendarRef = useRef(null);
  const calendarContainerRef = useRef(null);
  const hoverLineRef = useRef(null);
  const { list: sessions = [] } = useSelector((state) => state.sessions);
  const { list: clients = [], status } = useSelector((state) => state.clients);
  // Use real sessions from Redux store
  const displaySessions = sessions;

  const [selectedSession, setSelectedSession] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [currentView, setCurrentView] = useState("week");
  // Context menu states
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuData, setContextMenuData] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const [hoveredLine, setHoveredLine] = useState(null);

  const [showSheduled, setShowScheduled] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showCancelled, setShowCancelled] = useState(true);
  const [draggingSession, setDraggingSession] = useState(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [dragPositionY, setDragPositionY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState(null); // 'top' or 'bottom'
  const [resizingSession, setResizingSession] = useState(null);
  const [dragStartColumn, setDragStartColumn] = useState(null);
  const [dragCurrentColumn, setDragCurrentColumn] = useState(null);
  // Session Templates
  const [sessionTemplates] = useState([
    {
      id: 1,
      name: "Strength Training",
      duration: 60,
      color: "red-500",
      type: "strength",
    },
    {
      id: 2,
      name: "Cardio Session",
      duration: 45,
      color: "orange-500",
      type: "cardio",
    },
    {
      id: 3,
      name: "HIIT Workout",
      duration: 30,
      color: "yellow-500",
      type: "hiit",
    },
    {
      id: 4,
      name: "Flexibility & Recovery",
      duration: 45,
      color: "green-500",
      type: "recovery",
    },
    {
      id: 5,
      name: "Personal Assessment",
      duration: 90,
      color: "blue-500",
      type: "assessment",
    },
    {
      id: 6,
      name: "Nutrition Consultation",
      duration: 60,
      color: "purple-500",
      type: "consultation",
    },
  ]);
  // Helper function to create session from template
  const createFromTemplate = (template) => {
    const now = dayjs();
    const startTime = now.hour(9).minute(0).second(0); // Default to 9 AM
    const endTime = startTime.add(template.duration, "minute");

    setSelectedSession({
      start_time: startTime.format("YYYY-MM-DDTHH:mm:ss"),
      end_time: endTime.format("YYYY-MM-DDTHH:mm:ss"),
      status: "scheduled",
      session_type: template.type,
      notes: `${template.name} session`,
      gym: "",
      first_name: "",
      last_name: "",
      rate: 0,
    });
    setCreateModalOpen(true);
  }; // Context menu handlers
  const handleCalendarClick = (clickedTime, event) => {
    // Prevent click when dragging or resizing
    if (isDragging || isResizing) return;

    const timeSlotRect = event.currentTarget.getBoundingClientRect();

    // Create a unique key for the selected time slot
    const timeSlotKey = `${clickedTime.format(
      "YYYY-MM-DD"
    )}-${clickedTime.hour()}-${clickedTime.minute()}`;

    // Store the clicked time data
    setContextMenuData({
      start_time: clickedTime.format("YYYY-MM-DDTHH:mm:ss"),
      end_time: clickedTime.add(30, "minute").format("YYYY-MM-DDTHH:mm:ss"),
      timeSlotKey: timeSlotKey,
    }); // Set selected time slot for highlighting
    setSelectedTimeSlot(timeSlotKey);

    // Position context menu to the left of the time slot section with arrow pointing to it
    const contextMenuX = timeSlotRect.left - 208; // Position menu so arrow points to the time slot
    const contextMenuY = timeSlotRect.top + timeSlotRect.height / 2 - 50; // Center vertically on the time slot

    setContextMenuPosition({ x: contextMenuX, y: contextMenuY });
    setContextMenuOpen(true);
  };
  const handleCreateSession = () => {
    if (contextMenuData) {
      setSelectedSession({
        ...contextMenuData,
        status: "scheduled",
        notes: "",
        gym: "",
        first_name: "",
        last_name: "",
      });
      setCreateModalOpen(true);
    }
    closeContextMenu(); // This will also clear the selected time slot
  };

  const handleCreateTask = () => {
    if (contextMenuData) {
      setSelectedSession({
        due_date: contextMenuData.start_time,
      });
      setCreateTaskModalOpen(true);
    }
    closeContextMenu(); // This will also clear the selected time slot
  };
  const closeContextMenu = () => {
    setContextMenuOpen(false);
    setContextMenuData(null);
    setSelectedTimeSlot(null); // Clear selection when context menu closes
  };

  // Helper function to calculate weekly stats
  const calculateWeeklyStats = () => {
    const weekStart = currentDate.startOf("week");
    const weekEnd = currentDate.endOf("week");
    const weekSessions = displaySessions.filter((s) => {
      const sessionDate = dayjs(s.start_time);
      return sessionDate.isAfter(weekStart) && sessionDate.isBefore(weekEnd);
    });

    return {
      totalSessions: weekSessions.length,
      totalHours: weekSessions.reduce((acc, s) => {
        return acc + dayjs(s.end_time).diff(dayjs(s.start_time), "hour", true);
      }, 0),
      clients: new Set(
        weekSessions.map((s) => `${s.first_name} ${s.last_name}`)
      ).size,
      revenue: weekSessions.reduce((acc, s) => acc + (s.rate || 0), 0),
    };
  };

  // Enhanced useEffect for dragging with cross-day support
  useEffect(() => {
    if (!isDragging) return;

    // Add global drag state
    document.body.classList.add("dragging", "no-select");
    const handleMouseMove = (e) => {
      if (!calendarRef.current || !draggingSession) return;

      const calendarRect = calendarRef.current.getBoundingClientRect();
      const x = e.clientX - calendarRect.left;
      const y = e.clientY - calendarRect.top - dragOffsetY; // Determine which column (day) we're over
      const timeColumnWidth = 50;
      const dayColumnWidth = (calendarRect.width - timeColumnWidth) / 7;

      let newColumnIndex = -1;
      if (x > timeColumnWidth) {
        newColumnIndex = Math.floor((x - timeColumnWidth) / dayColumnWidth);
        newColumnIndex = Math.max(0, Math.min(6, newColumnIndex)); // Clamp to valid range
      }

      setDragCurrentColumn(newColumnIndex); // Calculate which hour and minute we're in based on the grid
      // Each hour block is 60px tall, header is approximately 40px
      const headerHeight = 40;
      const hourHeight = 60;
      const adjustedY = Math.max(0, y - headerHeight);

      // Calculate hour (0-23 for full 24 hours)
      const hourIndex = Math.floor(adjustedY / hourHeight);
      const minuteInHour = adjustedY % hourHeight;

      // Snap to 15-minute intervals
      let snappedMinute = Math.round(minuteInHour / 15) * 15;
      let actualHour = Math.max(0, hourIndex);

      // Handle rollover when snapped minute is 60
      if (snappedMinute >= 60) {
        snappedMinute = 0;
        actualHour += 1;
      }

      // Ensure we don't go beyond valid hours (0-23)
      actualHour = Math.min(23, actualHour);
      const actualMinute = snappedMinute;

      // Calculate new date and time
      const days = [...Array(7)].map((_, i) =>
        currentDate.startOf("week").add(i, "day")
      );

      const targetDay =
        newColumnIndex >= 0
          ? days[newColumnIndex]
          : dayjs(draggingSession.start_time);
      const newStart = targetDay
        .startOf("day")
        .hour(actualHour)
        .minute(actualMinute)
        .second(0);
      const duration = dayjs(draggingSession.end_time).diff(
        dayjs(draggingSession.start_time),
        "minute"
      );
      const newEnd = newStart.add(duration, "minute");

      // Always allow the update since we support full 24 hours
      setDraggingSession({
        ...draggingSession, // Preserve all existing session data
        start_time: newStart.format("YYYY-MM-DDTHH:mm:ss"),
        end_time: newEnd.format("YYYY-MM-DDTHH:mm:ss"),
      });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragCurrentColumn(null);
      setDragStartColumn(null);

      // Remove global drag state
      document.body.classList.remove("dragging", "no-select"); // Update session time via Redux
      if (draggingSession && draggingSession.id) {
        // Store original session for potential revert
        const originalSession = sessions.find(
          (s) => s.id === draggingSession.id
        );

        if (!originalSession) {
          console.error(
            "Original session not found for revert:",
            draggingSession.id
          );
          setDraggingSession(null);
          return;
        }

        // Validate dragging session has required data
        if (!draggingSession.start_time || !draggingSession.end_time) {
          console.error("Dragging session missing time data:", draggingSession);
          setDraggingSession(null);
          return;
        }

        // 1. Immediate optimistic update
        dispatch(
          updateSessionTimeOptimistic({
            id: draggingSession.id,
            start_time: draggingSession.start_time,
            end_time: draggingSession.end_time,
          })
        );

        // 2. API call in background
        dispatch(
          updateSessionTime({
            id: draggingSession.id,
            start_time: draggingSession.start_time,
            end_time: draggingSession.end_time,
          })
        ).catch((error) => {
          console.error("Failed to update session, reverting:", error);
          // Revert optimistic update on API failure
          if (originalSession) {
            dispatch(
              revertSessionTimeUpdate({
                id: draggingSession.id,
                originalSession,
              })
            );
          }
        });
      }

      setDraggingSession(null);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDragging(false);
        setDragCurrentColumn(null);
        setDragStartColumn(null);
        document.body.classList.remove("dragging", "no-select");
        setDraggingSession(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("dragging", "no-select");
    };
  }, [isDragging, draggingSession, dragOffsetY, currentDate]);

  // New useEffect for resizing
  useEffect(() => {
    if (!isResizing) return;

    // Add global resize state
    document.body.classList.add("resizing", "no-select");
    const handleMouseMove = (e) => {
      if (!calendarRef.current || !resizingSession) return;

      const calendarRect = calendarRef.current.getBoundingClientRect();
      const y = e.clientY - calendarRect.top; // Calculate which hour and minute we're in based on the grid
      // Each hour block is 60px tall, header is approximately 40px
      const headerHeight = 40;
      const hourHeight = 60;
      const adjustedY = Math.max(0, y - headerHeight);

      // Calculate hour (0-23 for full 24 hours)
      const hourIndex = Math.floor(adjustedY / hourHeight);
      const minuteInHour = adjustedY % hourHeight;

      // Snap to 15-minute intervals
      let snappedMinute = Math.round(minuteInHour / 15) * 15;
      let actualHour = Math.max(0, hourIndex);

      // Handle rollover when snapped minute is 60
      if (snappedMinute >= 60) {
        snappedMinute = 0;
        actualHour += 1;
      }

      // Ensure we don't go beyond valid hours (0-23)
      actualHour = Math.min(23, actualHour);
      const actualMinute = snappedMinute;

      const start = dayjs(resizingSession.start_time);
      const end = dayjs(resizingSession.end_time);
      const baseDay = start.startOf("day");

      let newStart = start;
      let newEnd = end;

      if (resizeType === "top") {
        // Resize from top (change start time)
        newStart = baseDay.hour(actualHour).minute(actualMinute).second(0);
        // Ensure minimum 15-minute duration
        if (newStart.isAfter(end.subtract(15, "minute"))) {
          newStart = end.subtract(15, "minute");
        }
      } else if (resizeType === "bottom") {
        // Resize from bottom (change end time)
        newEnd = baseDay.hour(actualHour).minute(actualMinute).second(0);
        // Ensure minimum 15-minute duration
        if (newEnd.isBefore(start.add(15, "minute"))) {
          newEnd = start.add(15, "minute");
        }
      }
      setResizingSession({
        ...resizingSession,
        start_time: newStart.format("YYYY-MM-DDTHH:mm:ss"),
        end_time: newEnd.format("YYYY-MM-DDTHH:mm:ss"),
      });
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeType(null); // Remove global resize state
      document.body.classList.remove("resizing", "no-select"); // Update session time via Redux
      if (resizingSession && resizingSession.id) {
        // Store original session for potential revert
        const originalSession = sessions.find(
          (s) => s.id === resizingSession.id
        );

        // 1. Immediate optimistic update
        dispatch(
          updateSessionTimeOptimistic({
            id: resizingSession.id,
            start_time: resizingSession.start_time,
            end_time: resizingSession.end_time,
          })
        );

        // 2. API call in background
        dispatch(
          updateSessionTime({
            id: resizingSession.id,
            start_time: resizingSession.start_time,
            end_time: resizingSession.end_time,
          })
        ).catch((error) => {
          console.error("Failed to update session, reverting:", error);
          // Revert optimistic update on API failure
          if (originalSession) {
            dispatch(
              revertSessionTimeUpdate({
                id: resizingSession.id,
                originalSession,
              })
            );
          }
        });
      }

      setResizingSession(null);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsResizing(false);
        setResizeType(null);
        document.body.classList.remove("resizing", "no-select");
        setResizingSession(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("resizing", "no-select");
    };
  }, [isResizing, resizingSession, resizeType]);

  // Scroll to middle of day (6 AM) on initial load
  useEffect(() => {
    if (calendarContainerRef.current) {
      // Each hour is 60px tall, header is 40px
      // 6 AM is hour index 6, so scroll to 6 * 60 = 360px
      const scrollToPosition = 6 * 60; // 6 AM position
      calendarContainerRef.current.scrollTop = scrollToPosition;
    }
  }, []);

  const renderWeekGridWithTimes = () => {
    const days = [...Array(7)].map((_, i) =>
      currentDate.startOf("week").add(i, "day")
    );

    return (
      <div ref={calendarRef} className="relative h-0 ">
        {" "}
        <div
          ref={hoverLineRef}
          className="absolute left-[50px] right-0 border-t border-dashed border-zinc-500 z-40 pointer-events-none "
          style={{ display: "none" }} // hidden by default
        />
        {hoveredLine !== null && (
          <div
            className="absolute left-[50px] right-0 border-t border-dashed border-zinc-500 z-40 pointer-events-none"
            style={{ top: hoveredLine }}
          />
        )}
        {/* Cross-day drag indicator */}
        {isDragging &&
          dragCurrentColumn !== null &&
          dragCurrentColumn !== dragStartColumn && (
            <div
              className="absolute top-0 bottom-0 bg-blue-500/20 border-2 border-blue-500 border-dashed z-30 pointer-events-none"
              style={{
                left: `${
                  50 +
                  dragCurrentColumn *
                    ((100 -
                      (50 /
                        calendarRef.current?.getBoundingClientRect().width) *
                        100 || 50) /
                      7)
                }%`,
                width: `${
                  (100 -
                    (50 / calendarRef.current?.getBoundingClientRect().width) *
                      100 || 50) / 7
                }%`,
              }}
            />
          )}
        <div className="grid grid-cols-[50px_repeat(7,minmax(0,1fr))] pb-4 ">
          {/* Header row */}
          <div className="text-xs text-zinc-400 p-2 "></div>
          {days.map((day, idx) => (
            <div
              key={idx}
              className="text-center text-xs font-semibold text-white p-2 sticky top-0 z-20 border-b border-zinc-800 bg-zinc-900/50"
            >
              {day.format("ddd D MMM")}
            </div>
          ))}

          {/* Hour rows */}
          {hours.map((hour) => (
            <div key={`hour-row-${hour}`} className="contents">
              {" "}
              {/* Time label column */}
              <div className="text-[11px] text-end text-zinc-500 -mt-3 px-2 py-1 bg-zinc-900/50">
                {dayjs().hour(hour).minute(0).format("h A")}
              </div>
              {days.map((day, i) => {
                return (
                  <div
                    key={`cell-${day.toString()}-${hour}`}
                    className="time-grid-cell relative border-b border-l border-zinc-800/60 h-[60px] bg-zinc-900/50"
                  >
                    {" "}
                    {/* Invisible 15-minute hover zones */}
                    {[0, 15, 30, 45].map((minutes, idx) => {
                      const top = (minutes / 60) * 60; // 15, 30, 45
                      const clickedTime = day
                        .hour(hour)
                        .minute(minutes)
                        .second(0);

                      // Create unique key for this time slot
                      const timeSlotKey = `${clickedTime.format(
                        "YYYY-MM-DD"
                      )}-${clickedTime.hour()}-${clickedTime.minute()}`;
                      const isSelected = selectedTimeSlot === timeSlotKey;

                      return (
                        <div
                          key={`hover-${idx}`}
                          className={`absolute inset-x-0 h-[15px] z-0 transition-all duration-200 ${
                            isSelected
                              ? "bg-white/5 border border-zinc-100 border-dashed rounded-sm"
                              : "hover:bg-zinc-700/30"
                          }`}
                          style={{ top }}
                          onMouseEnter={(e) => {
                            // Don't show hover line when dragging or resizing
                            if (isDragging || isResizing) return;

                            const lineTop =
                              e.currentTarget.getBoundingClientRect().top -
                              calendarRef.current.getBoundingClientRect().top;

                            const el = hoverLineRef.current;
                            if (el) {
                              el.style.top = `${lineTop}px`;
                              el.style.display = "block";
                              el.classList.add("hover-line");
                            }
                          }}
                          onMouseLeave={() => {
                            if (hoverLineRef.current) {
                              hoverLineRef.current.style.display = "none";
                              hoverLineRef.current.classList.remove(
                                "hover-line"
                              );
                            }
                          }}
                          onClick={(event) => {
                            handleCalendarClick(clickedTime, event);
                          }}
                        />
                      );
                    })}{" "}
                    {/* Existing sessions - Only render in starting hour to avoid duplicates */}
                    {displaySessions
                      .filter((s) => {
                        // For dragging sessions, show them in the column they're being dragged to
                        if (isDragging && s.id === draggingSession?.id) {
                          return dayjs(draggingSession.start_time).isSame(
                            day,
                            "day"
                          );
                        }
                        // For normal sessions, show them in their original day
                        return dayjs(s.start_time).isSame(day, "day");
                      })
                      .filter((s) => {
                        // Only show session in its starting hour block to avoid duplicates
                        const sessionToCheck =
                          isResizing && s.id === resizingSession?.id
                            ? resizingSession
                            : isDragging && s.id === draggingSession?.id
                            ? draggingSession
                            : s;
                        const sessionStart = dayjs(sessionToCheck.start_time);
                        const sessionHour = sessionStart.hour();

                        // Only render in the hour block where the session starts
                        return sessionHour === hour;
                      })
                      .filter((s) => {
                        if (s.status === "scheduled" && !showSheduled)
                          return false;
                        if (s.status === "pending" && !showPending)
                          return false;
                        if (s.status === "completed" && !showCompleted)
                          return false;
                        if (s.status === "cancelled" && !showCancelled)
                          return false;
                        return true;
                      })
                      .map((s, j) => {
                        // Use resizing session data if this session is being resized
                        let start, end;
                        if (isResizing && s.id === resizingSession?.id) {
                          start = dayjs(resizingSession.start_time);
                          end = dayjs(resizingSession.end_time);
                        } else if (isDragging && s.id === draggingSession?.id) {
                          // Debug: check for undefined data during dragging
                          if (
                            !draggingSession.first_name ||
                            !draggingSession.last_name
                          ) {
                            console.warn(
                              "Dragging session missing client data:",
                              draggingSession
                            );
                          }
                          start = dayjs(draggingSession.start_time);
                          end = dayjs(draggingSession.end_time);
                        } else {
                          start = dayjs(s.start_time);
                          end = dayjs(s.end_time);
                        }

                        // Calculate position and height for sessions that may span multiple hours
                        const sessionStartHour = start.hour();
                        const sessionStartMinute = start.minute();
                        const sessionEndHour = end.hour();
                        const sessionEndMinute = end.minute();

                        // Position is based on minutes from start of the starting hour
                        const sessionTopPosition =
                          (sessionStartMinute / 60) * 60; // Convert to pixels (1 minute = 1 pixel)                        // Height calculation: total duration in minutes
                        const totalDurationMinutes = end.diff(start, "minute");
                        const sessionHeight = Math.max(
                          15,
                          totalDurationMinutes
                        ); // Minimum 15px height

                        return (
                          <div
                            key={j}
                            className={`calendar-session absolute mx-1 text-xs p-2 rounded shadow cursor-grab z-10 group ${
                              isDragging && s.id === draggingSession?.id
                                ? "dragging"
                                : ""
                            } ${
                              isResizing && s.id === resizingSession?.id
                                ? "resizing"
                                : ""
                            } ${
                              s.status === "scheduled" &&
                              "bg-zinc-200 hover:bg-zinc-100 text-black"
                            } ${
                              s.status === "pending" &&
                              "bg-zinc-950 hover:bg-zinc-900 text-white border-2 border-zinc-400 diagonal-stripes overflow-hiddens"
                            } ${
                              s.status === "completed" &&
                              "bg-[#041c00] hover:bg-[#042900] text-white border-2 border-green-400 inset-0"
                            } ${
                              s.status === "cancelled" &&
                              "bg-[#1c0000] hover:bg-[#290000] text-white border-2 border-red-400 inset-0"
                            }`}
                            style={{
                              top: `${sessionTopPosition}px`,
                              height: `${sessionHeight}px`,
                              zIndex:
                                (isDragging && s.id === draggingSession?.id) ||
                                (isResizing && s.id === resizingSession?.id)
                                  ? 60
                                  : 45,
                              opacity:
                                (isDragging && s.id === draggingSession?.id) ||
                                (isResizing && s.id === resizingSession?.id)
                                  ? 0.9
                                  : 1,
                            }}
                            onClick={(e) => {
                              // Prevent click when dragging or resizing
                              if (isDragging || isResizing) return;
                              setSelectedSession(s);
                              setEditModalOpen(true);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              const sessionRect =
                                e.currentTarget.getBoundingClientRect();
                              const calendarRect =
                                calendarRef.current.getBoundingClientRect();

                              // Check if clicking on resize handles
                              const clickY = e.clientY - sessionRect.top;
                              const isTopResize = clickY <= 8;
                              const isBottomResize =
                                clickY >= sessionRect.height - 8;

                              if (isTopResize || isBottomResize) {
                                // Start resizing
                                setResizingSession(s);
                                setIsResizing(true);
                                setResizeType(isTopResize ? "top" : "bottom");
                              } else {
                                // Start dragging
                                const clickOffset = e.clientY - sessionRect.top;
                                const currentColumn = days.findIndex((day) =>
                                  dayjs(s.start_time).isSame(day, "day")
                                );

                                // Calculate the current position of the session relative to the calendar
                                const sessionTopInCalendar =
                                  sessionRect.top - calendarRect.top;

                                setDraggingSession(s);
                                setDragOffsetY(clickOffset);
                                setDragPositionY(sessionTopInCalendar);
                                setIsDragging(true);
                                setDragStartColumn(currentColumn);
                                setDragCurrentColumn(currentColumn);
                              }
                            }}
                          >
                            {/* Top resize handle */}
                            <div className="resize-handle top" />
                            {/* Bottom resize handle */}
                            <div className="resize-handle bottom" />{" "}
                            <div className="relative z-20 pointer-events-none">
                              <div className="font-semibold truncate ">
                                {s.first_name + " " + s.last_name || "Client"}
                              </div>
                              <p className="text-xs opacity-80">{s.gym}</p>
                              <p className="text-xs opacity-80">
                                {s.notes}
                              </p>{" "}
                              <div className="text-xs font-medium mt-1">
                                {isResizing && s.id === resizingSession?.id
                                  ? `${dayjs(resizingSession.start_time).format(
                                      "HH:mm"
                                    )} - ${dayjs(
                                      resizingSession.end_time
                                    ).format("HH:mm")}`
                                  : isDragging && s.id === draggingSession?.id
                                  ? `${dayjs(draggingSession.start_time).format(
                                      "HH:mm"
                                    )} - ${dayjs(
                                      draggingSession.end_time
                                    ).format("HH:mm")}`
                                  : `${start.format("HH:mm")} - ${end.format(
                                      "HH:mm"
                                    )}`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderGrid = () => {
    if (currentView === "week")
      return (
        <div
          ref={calendarContainerRef}
          className="min-h-full overflow-y-auto calendar-scroll scrollbar-dark"
          onClick={(e) => {
            // Clear selection if clicking on calendar container but not on a time slot
            if (e.target === e.currentTarget) {
              setSelectedTimeSlot(null);
              setContextMenuOpen(false);
            }
          }}
        >
          {renderWeekGridWithTimes()}
        </div>
      );
    return (
      <div className="text-center text-zinc-400">
        Only week view is styled for now
      </div>
    );
  };
  return (
    <div className="w-full h-full flex bg-zinc-900 text-white overflow-hidden rounded">
      {/* Professional Trainer Sidebar */}
      <div className="w-80 bg-zinc-950/50 border-r border-zinc-800/50 flex flex-col h-full">
        <div className="flex flex-col w-full">
          {" "}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="cursor-pointer flex items-center justify-center gap-2 p-2 border border-zinc-700 hover:bg-zinc-900 hover:border-white text-white rounded mx-4 mt-4"
          >
            <Plus size={18} />
            <p className="font-semibold">Create Session</p>
          </button>
          <button
            onClick={() => setCreateTaskModalOpen(true)}
            className="cursor-pointer flex items-center justify-center gap-2 p-2 bg-zinc-800 hover:bg-zinc-900 border-zinc-400 text-white rounded mx-4 mt-3 mb-2"
          >
            <Plus size={18} />
            <p className="font-semibold">Create Task</p>
          </button>
        </div>
        {/* Session Templates */}
        {/* <div className="p-4 border-b border-zinc-800/30">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">
            Session Templates
          </h3>{" "}
          <div className="space-y-2">
            {sessionTemplates.slice(0, 3).map((template) => (
              <div
                key={template.id}
                className={`flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 hover:bg-zinc-900/50 cursor-pointer group transition-all border-l-4 border-${template.color}`}
                onClick={() => createFromTemplate(template)}
              >
                <div>
                  <div className="text-sm font-medium text-zinc-300">
                    {template.name}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {template.duration}min • {template.type}
                  </div>
                </div>
                <div className="text-xs text-zinc-500 group-hover:text-zinc-300">
                  +
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Weekly Overview */}
        <div className="p-4 border-b border-zinc-800/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">
              Weekly Overview
            </h3>
            <div className="text-xs text-zinc-500">
              {currentDate.startOf("week").format("MMM D")} -{" "}
              {currentDate.endOf("week").format("MMM D")}
            </div>
          </div>

          {(() => {
            const stats = calculateWeeklyStats();
            return (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900/50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-zinc-300">
                    {stats.totalSessions}
                  </div>
                  <div className="text-xs text-zinc-500">Sessions</div>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-zinc-300">
                    {stats.totalHours.toFixed(1)}h
                  </div>
                  <div className="text-xs text-zinc-500">Training Hours</div>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-zinc-300">
                    {stats.clients}
                  </div>
                  <div className="text-xs text-zinc-500">Active Clients</div>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-zinc-300">
                    £{stats.revenue}
                  </div>
                  <div className="text-xs text-zinc-500">Revenue</div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Status Filters */}
        <div className="p-4 border-b border-zinc-800/30">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">
            Status Filters
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showSheduled}
                onChange={(e) => setShowScheduled(e.target.checked)}
                className="transparent-checkbox"
              />
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300">
                Scheduled
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showPending}
                onChange={(e) => setShowPending(e.target.checked)}
                className="transparent-checkbox"
              />
              <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300">
                Pending
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="transparent-checkbox"
              />
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300">
                Completed
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showCancelled}
                onChange={(e) => setShowCancelled(e.target.checked)}
                className="transparent-checkbox"
              />
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300">
                Cancelled
              </span>
            </label>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">
              Upcoming Sessions
            </h3>
            <button
              onClick={() => setCurrentDate(dayjs())}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Today
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-full">
            {displaySessions
              .filter((session) => dayjs(session.start_time).isAfter(dayjs()))
              .sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time)))
              .slice(0, 10)
              .map((session, idx) => (
                <div
                  key={`upcoming-${session.id}-${idx}`}
                  className="p-3 rounded-lg cursor-pointer transition-all duration-200 bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800/50 hover:border-zinc-700/50"
                  onClick={() => {
                    setCurrentDate(dayjs(session.start_time));
                    setSelectedSession(session);
                    setEditModalOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        session.status === "scheduled"
                          ? "bg-white"
                          : session.status === "pending"
                          ? "bg-yellow-500"
                          : session.status === "completed"
                          ? "bg-green-400"
                          : "bg-red-400"
                      }`}
                    />
                    <div className="font-medium text-white text-sm flex-1">
                      {session.first_name} {session.last_name}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 mb-1">
                    {dayjs(session.start_time).format("MMM D, h:mm A")} -{" "}
                    {dayjs(session.end_time).format("h:mm A")}
                  </div>
                  {session.gym && (
                    <div className="text-xs text-zinc-500">{session.gym}</div>
                  )}
                </div>
              ))}
            {displaySessions.filter((session) =>
              dayjs(session.start_time).isAfter(dayjs())
            ).length === 0 && (
              <div className="text-zinc-500 text-sm text-center py-8">
                No upcoming sessions
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col h-full overflow-hidden">
        {/* Header bar (does not shrink) */}
        <div className="px-4 py-4 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">
              {currentDate.format("MMMM YYYY")}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <select
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value)}
              className="bg-zinc-800 px-2 py-1 rounded text-sm"
            >
              {views.map((view) => (
                <option key={view} value={view}>
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                setCurrentDate(currentDate.subtract(1, currentView))
              }
              className="bg-zinc-800 px-4 py-1 rounded"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentDate(dayjs())}
              className="bg-zinc-800 px-4 py-1 rounded"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(currentDate.add(1, currentView))}
              className="bg-zinc-800 px-4 py-1 rounded"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Calendar grid (scrolls) */}
        <div className="flex-1 h-0  b-4">{renderGrid()}</div>
      </div>{" "}
      {createModalOpen && (
        <CreateSessionModal
          mode="create"
          close={() => setCreateModalOpen(false)}
          initialValues={selectedSession || {}} // <-- fallback to empty object
        />
      )}
      {createTaskModalOpen && (
        <CreateTaskModal
          mode="create"
          close={() => setCreateTaskModalOpen(false)}
          initialValues={selectedSession || {}}
        />
      )}
      {editModalOpen && selectedSession && (
        <CreateSessionModal
          mode="edit"
          close={() => setEditModalOpen(false)}
          initialValues={selectedSession}
        />
      )}
      {/* Context Menu */}
      <CalendarContextMenu
        isOpen={contextMenuOpen}
        position={contextMenuPosition}
        onClose={closeContextMenu}
        onCreateSession={handleCreateSession}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}
