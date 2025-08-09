"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSessions from "@/src/hooks/sessions/useSessions";
import useTasks from "@/src/hooks/tasks/useTasks";
import { useClients } from "@/src/hooks/clients";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import CreateSessionModal from "@/src/components/features/sessions/createSessionModal";
import CreateTaskModal from "@/src/components/features/sessions/CreateTaskModal";
import CalendarContextMenu from "@/src/components/features/sessions/CalendarContextMenu";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "@/src/styles/react-big-calendar.css";
import { Circle, CircleCheck, Plus } from "lucide-react";
import { convertFromServerTime, getUserTimezone } from "@/lib/timezone";

// Configure dayjs to start week on Monday
dayjs.extend(weekday);
dayjs.extend(updateLocale);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  weekStart: 1, // Monday = 1, Sunday = 0
});

const views = ["day", "week", "month", "agenda"];
const hours = Array.from({ length: 25 }, (_, i) => i); // 0 (12 AM) to 24 (12 AM next day) - full 24 hours + midnight
const fifteenMinutes = Array.from({ length: 4 }, (_, i) => i * 15).map((m) =>
  m.toString().padStart(2, "0")
);

// Setup React Big Calendar with Day.js localizer
const localizer = dayjsLocalizer(dayjs);
const DnDCalendar = withDragAndDrop(Calendar);

export default function Sessions() {
  const calendarRef = useRef(null);
  const calendarContainerRef = useRef(null);
  const hoverLineRef = useRef(null);
  const userTimezone = getUserTimezone();

  // Explicitly use useSessions hook for all session-related operations
  const sessionsHookData = useSessions();
  const {
    sessions,
    fetchSessions,
    updateSessionTime,
    updateSessionTimeOptimistic,
  } = sessionsHookData;

  // Explicitly use useClients hook for client data
  const clientsHookData = useClients();
  const { clients } = clientsHookData;

  // Explicitly use useTasks hook for all task-related operations
  const tasksHookData = useTasks();
  const { tasks, updateTask: updateTaskHook } = tasksHookData;

  // Ensure we're using the correct updateTask function from useTasks hook
  const updateTask = updateTaskHook;

  // Process sessions with timezone-aware datetime conversion
  const processedSessions = (sessions || []).map((session) => ({
    ...session,
    start_time_local: convertFromServerTime(session.start_time, userTimezone),
    end_time_local: convertFromServerTime(session.end_time, userTimezone),
    // Keep original for server communication
    start_time_original: session.start_time,
    end_time_original: session.end_time,
  })); // Debug: Log session and task changes

  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
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

  const [showScheduled, setShowScheduled] = useState(true);
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
  // Task drag/resize states (same as sessions)
  const [draggingTask, setDraggingTask] = useState(null);
  const [resizingTask, setResizingTask] = useState(null);
  const [isDraggingTask, setIsDraggingTask] = useState(false);
  const [isResizingTask, setIsResizingTask] = useState(false);
  // Task completion toggle state
  const [updatingTasks, setUpdatingTasks] = useState(new Set());
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
  // Use processed sessions for display - now includes optimistic updates
  const displaySessions = processedSessions;

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
    if (isDragging || isResizing || isDraggingTask || isResizingTask) return;

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
  const handleTaskModalClose = () => {
    setCreateTaskModalOpen(false);
    // Note: useTasks hook will automatically refresh tasks
  };

  const handleEditTaskModalClose = () => {
    setEditTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskCompletionToggle = async (task, event) => {
    event.stopPropagation();
    event.preventDefault();

    if (updatingTasks.has(task.id)) {
      return;
    }

    // Add task to updating set immediately
    setUpdatingTasks((prev) => new Set(prev).add(task.id));

    // Determine new status
    const newStatus = task.status === "completed" ? "pending" : "completed";

    try {
      // Use updateTask directly for consistent behavior with modal
      await updateTask(task.id, { status: newStatus });
    } catch (error) {
      console.error("Failed to toggle task completion:", error);
      // Hook already handles revert on error
    } finally {
      // Remove task from updating set with a minimal delay to prevent rapid re-clicks
      setTimeout(() => {
        setUpdatingTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(task.id);
          return newSet;
        });
      }, 50);
    }
  };
  const closeContextMenu = () => {
    setContextMenuOpen(false);
    setContextMenuData(null);
    setSelectedTimeSlot(null); // Clear selection when context menu closes
  };

  // Helper function to calculate weekly stats
  const calculateWeeklyStats = () => {
    const weekStart = dayjs.tz(currentDate.startOf("week"), userTimezone);
    const weekEnd = dayjs.tz(currentDate.endOf("week"), userTimezone);
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

  // Map sessions/tasks to React Big Calendar events while honoring filters
  const calendarEvents = useMemo(() => {
    const sessionEvents = (processedSessions || [])
      .filter((s) => {
        if (s.status === "scheduled" && !showScheduled) return false;
        if (s.status === "pending" && !showPending) return false;
        if (s.status === "completed" && !showCompleted) return false;
        if (s.status === "cancelled" && !showCancelled) return false;
        return true;
      })
      .map((session) => ({
        id: `session-${session.id}`,
        title: `${session.client?.first_name || ""} ${
          session.client?.last_name || "Client"
        }`,
        start: session.start_time_local
          ? session.start_time_local.toDate()
          : new Date(session.start_time),
        end: session.end_time_local
          ? session.end_time_local.toDate()
          : new Date(session.end_time),
        resource: { type: "session", data: session },
        allDay: false,
      }));

    const taskEvents = (tasks || [])
      .filter((task) => {
        if (!task.due_date) return false;
        if (task.status === "completed" && !showCompleted) return false;
        if (task.status === "pending" && !showPending) return false;
        if (task.status === "cancelled" && !showCancelled) return false;
        return true;
      })
      .map((task) => {
        const end = dayjs(task.due_date);
        const duration = task.duration || 45;
        const start = end.subtract(duration, "minute");
        return {
          id: `task-${task.id}`,
          title: task.title,
          start: start.toDate(),
          end: end.toDate(),
          resource: { type: "task", data: task },
          allDay: false,
        };
      });

    return [...sessionEvents, ...taskEvents];
  }, [
    processedSessions,
    tasks,
    showScheduled,
    showPending,
    showCompleted,
    showCancelled,
  ]);

  // Style events to match existing look (white sessions, grey tasks)
  const eventPropGetter = useCallback((event) => {
    const { resource } = event;
    const style = {
      borderRadius: 6,
      opacity: 1,
      border: 0,
      display: "block",
      fontSize: 12,
      padding: "6px 8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      // Remove any transition to eliminate perceived drag start delay
      transition: "none",
      willChange: "transform, top, left, height",
      cursor: "grab",
    };

    if (resource.type === "session") {
      const s = resource.data;
      if (s.status === "scheduled") {
        style.background = "#e5e5e5"; // zinc-200
        style.color = "#000";
      } else if (s.status === "requested") {
        style.background = "#09090b";
        style.color = "#fff";
        style.border = "2px solid #a1a1aa";
        style.backgroundImage =
          "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(161,161,170,0.1) 5px, rgba(161,161,170,0.1) 10px)";
      } else if (s.status === "completed") {
        style.background = "#041c00";
        style.color = "#fff";
        style.border = "2px solid #4ade80";
      } else if (s.status === "cancelled") {
        style.background = "#1c0000";
        style.color = "#fff";
        style.border = "2px solid #ef4444";
      } else {
        style.background = "#e5e5e5";
        style.color = "#000";
      }
    } else if (resource.type === "task") {
      const t = resource.data;
      style.background = "#27272a"; // zinc-800
      style.color = "#f4f4f5";
      style.borderLeft = "3px solid #60a5fa"; // blue-400
      if (t.priority === "high") style.borderLeft = "3px solid #f87171";
      if (t.priority === "medium") style.borderLeft = "3px solid #fb923c";
      if (t.priority === "low") style.borderLeft = "3px solid #facc15";
    }

    return { style };
  }, []);

  // Custom event renderers for richer content
  const EventComponent = useCallback(
    ({ event }) => {
      const { resource } = event;
      if (resource.type === "session") {
        const s = resource.data;
        return (
          <div className="relative h-full w-full">
            <div className="font-semibold truncate text-xs">
              {s.client?.first_name} {s.client?.last_name || "Client"}
            </div>
            {s.gym && (
              <div className="text-xs opacity-80 truncate">{s.gym}</div>
            )}
            {s.notes && (
              <div className="text-xs opacity-80 truncate">{s.notes}</div>
            )}
            <div className="text-xs font-medium mt-1">
              {dayjs(event.start).format("HH:mm")} -{" "}
              {dayjs(event.end).format("HH:mm")}
            </div>
          </div>
        );
      }
      if (resource.type === "task") {
        const t = resource.data;
        return (
          <div className="relative h-full w-full">
            <div className="font-semibold truncate flex items-center gap-1 text-xs">
              <button
                className={`flex-shrink-0 transition-transform ${
                  updatingTasks.has(t.id)
                    ? "cursor-wait pointer-events-none"
                    : "cursor-pointer hover:scale-110"
                }`}
                onClick={(e) => handleTaskCompletionToggle(t, e)}
                disabled={updatingTasks.has(t.id)}
                title={
                  updatingTasks.has(t.id)
                    ? "Updating..."
                    : t.status === "completed"
                    ? "Mark as pending"
                    : "Mark as completed"
                }
              >
                {t.status === "completed" ? (
                  <CircleCheck
                    className="w-3 h-3"
                    style={{ color: "#4ade80" }}
                  />
                ) : (
                  <Circle className="w-3 h-3" style={{ color: "#a1a1aa" }} />
                )}
              </button>
              <span className="truncate">{t.title}</span>
            </div>
            <div className="text-xs opacity-80 truncate">
              {t.category?.replace("-", " ")} • {t.priority.toUpperCase()}
            </div>
            {t.description && (
              <div className="text-xs opacity-80 truncate">{t.description}</div>
            )}
            <div className="text-xs font-medium mt-1">
              {dayjs(event.start).format("HH:mm")} -{" "}
              {dayjs(event.end).format("HH:mm")} ({t.duration || 45}min)
            </div>
          </div>
        );
      }
      return null;
    },
    [updatingTasks]
  );

  // Select event -> open modals
  const handleSelectEvent = useCallback((event) => {
    const { resource } = event;
    if (resource.type === "session") {
      setSelectedSession(resource.data);
      setEditModalOpen(true);
    } else if (resource.type === "task") {
      setSelectedTask(resource.data);
      setEditTaskModalOpen(true);
    }
  }, []);

  // Track mouse position for context menu placement (use ref to avoid re-renders)
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => {
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  // Slot select -> open context menu near cursor (read from ref)
  const handleSelectSlot = useCallback(({ start, end, action }) => {
    if (action !== "click") return;
    const startTime = dayjs(start);
    const endTime = dayjs(end);
    setContextMenuData({
      start_time: startTime.format("YYYY-MM-DDTHH:mm:ss"),
      end_time: endTime.format("YYYY-MM-DDTHH:mm:ss"),
      timeSlotKey: `${startTime.format(
        "YYYY-MM-DD"
      )}-${startTime.hour()}-${startTime.minute()}`,
    });
    setSelectedTimeSlot(
      `${startTime.format(
        "YYYY-MM-DD"
      )}-${startTime.hour()}-${startTime.minute()}`
    );
    setContextMenuPosition(lastMousePosRef.current);
    setContextMenuOpen(true);
  }, []);

  // Drag/drop + resize handlers -> call existing hooks
  const handleEventDrop = useCallback(
    async ({ event, start, end }) => {
      const { resource } = event;
      if (resource.type === "session") {
        const session = resource.data;
        const newStart = dayjs(start).format("YYYY-MM-DDTHH:mm:ss");
        const newEnd = dayjs(end).format("YYYY-MM-DDTHH:mm:ss");
        // Optimistic update first
        updateSessionTimeOptimistic(session.id, {
          start_time: newStart,
          end_time: newEnd,
        });
        try {
          await updateSessionTime(session.id, {
            start_time: newStart,
            end_time: newEnd,
          });
        } catch (e) {
          console.error("Failed to update session:", e);
        }
      } else if (resource.type === "task") {
        const task = resource.data;
        const newDue = dayjs(end).format("YYYY-MM-DDTHH:mm:ss");
        const newDuration = dayjs(end).diff(dayjs(start), "minute");
        try {
          await updateTask(task.id, {
            due_date: newDue,
            duration: newDuration,
          });
        } catch (e) {
          console.error("Failed to update task:", e);
        }
      }
    },
    [updateSessionTime, updateSessionTimeOptimistic, updateTask]
  );

  const handleEventResize = useCallback(
    async ({ event, start, end }) => {
      const { resource } = event;
      if (resource.type === "session") {
        const session = resource.data;
        const newStart = dayjs(start).format("YYYY-MM-DDTHH:mm:ss");
        const newEnd = dayjs(end).format("YYYY-MM-DDTHH:mm:ss");
        updateSessionTimeOptimistic(session.id, {
          start_time: newStart,
          end_time: newEnd,
        });
        try {
          await updateSessionTime(session.id, {
            start_time: newStart,
            end_time: newEnd,
          });
        } catch (e) {
          console.error("Failed to update session:", e);
        }
      } else if (resource.type === "task") {
        const task = resource.data;
        const newDue = dayjs(end).format("YYYY-MM-DDTHH:mm:ss");
        const newDuration = dayjs(end).diff(dayjs(start), "minute");
        try {
          await updateTask(task.id, {
            due_date: newDue,
            duration: newDuration,
          });
        } catch (e) {
          console.error("Failed to update task:", e);
        }
      }
    },
    [updateSessionTime, updateSessionTimeOptimistic, updateTask]
  );

  // Scroll to start of workday (7 AM) on initial load
  useEffect(() => {
    if (calendarContainerRef.current) {
      // Each hour is 60px tall, header is 40px
      // 7 AM is hour index 7, so scroll to 7 * 60 = 420px
      const scrollToPosition = 7 * 60; // 7 AM position
      calendarContainerRef.current.scrollTop = scrollToPosition;
    }
  }, []);
  const renderWeekGridWithTimes = () => {
    const days = [...Array(7)].map((_, i) =>
      dayjs.tz(currentDate.startOf("week"), userTimezone).add(i, "day")
    );

    return (
      <div ref={calendarRef} className="relative h-full">
        {" "}
        <div
          ref={hoverLineRef}
          className="absolute right-0 border-t border-dashed border-zinc-500 z-40 pointer-events-none"
          style={{ left: "50px", display: "none" }} // hidden by default
        />
        {hoveredLine !== null && (
          <div
            className="absolute right-0 border-t border-dashed border-zinc-500 z-40 pointer-events-none"
            style={{ top: hoveredLine, left: "50px" }}
          />
        )}{" "}
        <div
          className="grid pb-16"
          style={{
            gridTemplateColumns: "50px repeat(7, minmax(0, 1fr))",
            minHeight: `${25 * 60 + 40}px`, // 25 hours * 60px per hour + header space
          }}
        >
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
              <div
                className="text-end text-zinc-500 -mt-3 px-2 py-1 bg-zinc-900/50"
                style={{ fontSize: "11px" }}
              >
                {hour === 24
                  ? "12 AM"
                  : dayjs().hour(hour).minute(0).format("h A")}
              </div>
              {days.map((day, i) => {
                return (
                  <div
                    key={`cell-${day.toString()}-${hour}`}
                    className="time-grid-cell relative border-b border-l border-zinc-800/60 bg-zinc-900/50"
                    style={{ height: "60px" }}
                  >
                    {" "}
                    {/* Invisible 15-minute hover zones */}
                    {[0, 15, 30, 45].map((minutes, idx) => {
                      const top = (minutes / 60) * 60; // 15, 30, 45
                      let clickedTime;

                      // Handle hour 24 (midnight) - convert to next day at hour 0
                      if (hour === 24) {
                        clickedTime = day
                          .add(1, "day")
                          .hour(0)
                          .minute(minutes)
                          .second(0);
                      } else {
                        clickedTime = day.hour(hour).minute(minutes).second(0);
                      }

                      // Create unique key for this time slot
                      const timeSlotKey = `${clickedTime.format(
                        "YYYY-MM-DD"
                      )}-${clickedTime.hour()}-${clickedTime.minute()}`;
                      const isSelected = selectedTimeSlot === timeSlotKey;

                      return (
                        <div
                          key={`hover-${idx}`}
                          className={`absolute inset-x-0 z-0 transition-all duration-200 ${
                            isSelected
                              ? "bg-white/5 border border-zinc-100 border-dashed rounded-sm"
                              : "hover:bg-zinc-700/30"
                          }`}
                          style={{ top, height: "15px" }}
                          onMouseEnter={(e) => {
                            // Don't show hover line when dragging or resizing
                            if (
                              isDragging ||
                              isResizing ||
                              isDraggingTask ||
                              isResizingTask
                            )
                              return;

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
                    {/* Existing sessions - Only render in starting hour to avoid duplicates */}{" "}
                    {displaySessions
                      .filter((s) => {
                        // Show sessions in their current day (includes optimistic updates)
                        return s.start_time_local?.isSame(day, "day");
                      })
                      .filter((s) => {
                        // Only show session in its starting hour block to avoid duplicates
                        const sessionStart =
                          s.start_time_local || dayjs(s.start_time);
                        const sessionHour = sessionStart.hour();

                        // Only render in the hour block where the session starts
                        return sessionHour === hour;
                      })
                      .filter((s) => {
                        if (s.status === "scheduled" && !showScheduled)
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
                        // Use session data directly (includes optimistic updates)
                        let start, end;
                        if (isResizing && s.id === resizingSession?.id) {
                          start = dayjs(resizingSession.start_time);
                          end = dayjs(resizingSession.end_time);
                        } else {
                          start = s.start_time_local || dayjs(s.start_time);
                          end = s.end_time_local || dayjs(s.end_time);
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
                              s.status === "requested" &&
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
                                console.log(
                                  "🎯 SESSION DRAG STARTED:",
                                  s.id,
                                  s.title
                                );
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
                                {s.client.first_name +
                                  " " +
                                  s.client.last_name || "Client"}
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
                      })}{" "}
                    {/* Render Tasks - Only render in the correct hour block */}
                    {tasks
                      .filter((task) => {
                        if (!task.due_date) return false;
                        // For dragging tasks, show them in the column they're being dragged to
                        if (isDraggingTask && task.id === draggingTask?.id) {
                          return dayjs(draggingTask.due_date).isSame(
                            day,
                            "day"
                          );
                        }
                        // For normal tasks, show them in their original day
                        return dayjs(task.due_date).isSame(day, "day");
                      })
                      .filter((task) => {
                        // Only show task in its starting hour block to avoid duplicates
                        const taskToCheck =
                          isResizingTask && task.id === resizingTask?.id
                            ? resizingTask
                            : isDraggingTask && task.id === draggingTask?.id
                            ? draggingTask
                            : task;
                        const taskDateTime = dayjs(taskToCheck.due_date);
                        const taskDuration = taskToCheck.duration || 45;
                        const taskStartTime = taskDateTime.subtract(
                          taskDuration,
                          "minute"
                        );
                        const taskStartHour = taskStartTime.hour();

                        // Only render in the hour block where the task starts
                        return taskStartHour === hour;
                      })
                      .filter((task) => {
                        // Apply status filters (map task statuses to session filter logic)
                        if (task.status === "completed" && !showCompleted)
                          return false;
                        if (task.status === "pending" && !showPending)
                          return false;
                        // Tasks don't have cancelled status typically, but if they do:
                        if (task.status === "cancelled" && !showCancelled)
                          return false;
                        return true;
                      })
                      .map((task, taskIndex) => {
                        // Use resizing task data if this task is being resized
                        let taskDateTime;
                        if (isResizingTask && task.id === resizingTask?.id) {
                          taskDateTime = dayjs(resizingTask.due_date);
                        } else if (
                          isDraggingTask &&
                          task.id === draggingTask?.id
                        ) {
                          taskDateTime = dayjs(draggingTask.due_date);
                        } else {
                          taskDateTime = dayjs(task.due_date);
                        } // Calculate task start time (due_date - duration)
                        const taskDuration =
                          isResizingTask && task.id === resizingTask?.id
                            ? resizingTask.duration
                            : isDraggingTask && task.id === draggingTask?.id
                            ? draggingTask.duration || task.duration || 45
                            : task.duration || 45;

                        const taskStartTime = taskDateTime.subtract(
                          taskDuration,
                          "minute"
                        );
                        const taskStartMinute = taskStartTime.minute();
                        const taskTopPosition = (taskStartMinute / 60) * 60;
                        // Calculate task height based on duration during resize, priority, or default
                        let taskHeight;
                        if (isResizingTask && task.id === resizingTask?.id) {
                          // Use the resizing task's duration for height
                          taskHeight = Math.max(
                            30,
                            resizingTask.duration || 45
                          );
                        } else {
                          // Use task's stored duration or calculate based on priority
                          const baseDuration =
                            task.duration ||
                            (task.priority === "high"
                              ? 60
                              : task.priority === "medium"
                              ? 45
                              : 30); // minutes
                          taskHeight = Math.max(30, baseDuration); // Minimum 30px height
                        }

                        return (
                          <div
                            key={`task-${task.id}`}
                            className={`calendar-task absolute mx-1 text-xs p-2 rounded shadow cursor-grab z-10 group bg-zinc-800 hover:bg-zinc-700 text-gray-100 border-l-2 border-l-blue-400 ${
                              isDraggingTask && task.id === draggingTask?.id
                                ? "dragging"
                                : ""
                            } ${
                              isResizingTask && task.id === resizingTask?.id
                                ? "resizing"
                                : ""
                            } ${
                              task.priority === "high"
                                ? "border-red-400"
                                : task.priority === "medium"
                                ? "border-orange-400"
                                : task.priority === "low"
                                ? "border-yellow-400"
                                : "border-gray-500" // none priority - mid grey
                            }`}
                            style={{
                              top: `${taskTopPosition}px`,
                              height: `${taskHeight}px`,
                              zIndex:
                                (isDraggingTask &&
                                  task.id === draggingTask?.id) ||
                                (isResizingTask && task.id === resizingTask?.id)
                                  ? 60
                                  : 45,
                              opacity:
                                (isDraggingTask &&
                                  task.id === draggingTask?.id) ||
                                (isResizingTask && task.id === resizingTask?.id)
                                  ? 0.9
                                  : 1,
                            }}
                            onClick={(e) => {
                              // Prevent click when dragging or resizing
                              if (
                                isDragging ||
                                isResizing ||
                                isDraggingTask ||
                                isResizingTask
                              )
                                return;
                              e.stopPropagation();
                              setSelectedTask(task);
                              setEditTaskModalOpen(true);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              const taskRect =
                                e.currentTarget.getBoundingClientRect();
                              const calendarRect =
                                calendarRef.current.getBoundingClientRect();

                              // Check if clicking on resize handles
                              const clickY = e.clientY - taskRect.top;
                              const isTopResize = clickY <= 8;
                              const isBottomResize =
                                clickY >= taskRect.height - 8;

                              if (isTopResize || isBottomResize) {
                                // Start resizing (for tasks we'll just update due_date time)
                                console.log("🔧 Starting task resize", {
                                  task: task.id,
                                  type: isTopResize ? "top" : "bottom",
                                });
                                setResizingTask(task);
                                setIsResizingTask(true);
                                setResizeType(isTopResize ? "top" : "bottom");
                              } else {
                                // Start dragging
                                const clickOffset = e.clientY - taskRect.top;
                                const currentColumn = days.findIndex((day) =>
                                  dayjs(task.due_date).isSame(day, "day")
                                );

                                // Calculate the current position of the task relative to the calendar
                                const taskTopInCalendar =
                                  taskRect.top - calendarRect.top;

                                setDraggingTask(task);
                                setDragOffsetY(clickOffset);
                                setDragPositionY(taskTopInCalendar);
                                setIsDraggingTask(true);
                                setDragStartColumn(currentColumn);
                                setDragCurrentColumn(currentColumn);
                              }
                            }}
                          >
                            {/* Top resize handle */}
                            <div className="resize-handle top" />
                            {/* Bottom resize handle */}
                            <div className="resize-handle bottom" />{" "}
                            <div className="relative z-20">
                              {" "}
                              <div className="font-semibold truncate flex items-center gap-1">
                                {" "}
                                <button
                                  className={`pointer-events-auto flex-shrink-0 transition-transform ${
                                    updatingTasks.has(task.id)
                                      ? "cursor-wait pointer-events-none"
                                      : "cursor-pointer hover:scale-110"
                                  }`}
                                  onClick={(e) => {
                                    if (!updatingTasks.has(task.id)) {
                                      handleTaskCompletionToggle(task, e);
                                    }
                                  }}
                                  disabled={updatingTasks.has(task.id)}
                                  title={
                                    updatingTasks.has(task.id)
                                      ? "Updating..."
                                      : task.status === "completed"
                                      ? "Mark as pending"
                                      : "Mark as completed"
                                  }
                                >
                                  {" "}
                                  {task.status === "completed" ? (
                                    <CircleCheck
                                      key={`${task.id}-completed`}
                                      className="w-4 h-4 task-toggle-icon"
                                      style={{ color: "#4ade80" }}
                                    />
                                  ) : (
                                    <Circle
                                      key={`${task.id}-pending`}
                                      className="w-4 h-4 task-toggle-icon hover:!text-zinc-300"
                                      style={{ color: "#a1a1aa" }}
                                    />
                                  )}
                                </button>
                                <span className="pointer-events-none">
                                  {task.title}
                                </span>
                              </div>{" "}
                              <p className="text-xs opacity-80 truncate pointer-events-none">
                                {task.category?.replace("-", " ")} •{" "}
                                {task.priority.toUpperCase()}
                              </p>
                              {task.description && (
                                <p className="text-xs opacity-80 truncate pointer-events-none">
                                  {task.description}
                                </p>
                              )}{" "}
                              <div className="text-xs font-medium mt-1 pointer-events-none">
                                {isResizingTask && task.id === resizingTask?.id
                                  ? `${dayjs(resizingTask.due_date)
                                      .subtract(
                                        resizingTask.duration || 45,
                                        "minute"
                                      )
                                      .format("HH:mm")} - ${dayjs(
                                      resizingTask.due_date
                                    ).format("HH:mm")} (${
                                      resizingTask.duration || 45
                                    }min)`
                                  : isDraggingTask &&
                                    task.id === draggingTask?.id
                                  ? `${dayjs(draggingTask.due_date)
                                      .subtract(
                                        draggingTask.duration ||
                                          task.duration ||
                                          45,
                                        "minute"
                                      )
                                      .format("HH:mm")} - ${dayjs(
                                      draggingTask.due_date
                                    ).format("HH:mm")} (${
                                      draggingTask.duration ||
                                      task.duration ||
                                      45
                                    }min)`
                                  : `${taskStartTime.format(
                                      "HH:mm"
                                    )} - ${taskDateTime.format("HH:mm")} (${
                                      task.duration || 45
                                    }min)`}
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
          className="h-full overflow-y-auto calendar-scroll scrollbar-dark"
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

  // Fetch sessions (including past) on mount to populate the calendar
  useEffect(() => {
    fetchSessions?.(true).catch((e) =>
      console.error("fetchSessions failed", e)
    );
  }, []);

  // Memoized constants for React Big Calendar to avoid prop churn and re-renders
  const rbcMinTime = useMemo(() => new Date(2024, 0, 1, 0, 0), []);
  const rbcMaxTime = useMemo(() => new Date(2024, 0, 1, 23, 59), []);
  const rbcScrollToTime = useMemo(() => new Date(2024, 0, 1, 7, 0), []);
  const rbcViews = useMemo(() => ["day", "week", "month", "agenda"], []);
  const rbcFormats = useMemo(
    () => ({
      timeGutterFormat: (date) => dayjs(date).format("HH:mm"),
      eventTimeRangeFormat: ({ start, end }) =>
        `${dayjs(start).format("HH:mm")} - ${dayjs(end).format("HH:mm")}`,
      dayHeaderFormat: (date) => dayjs(date).format("ddd D MMM"),
    }),
    []
  );
  const rbcComponents = useMemo(
    () => ({ event: EventComponent }),
    [EventComponent]
  );
  const rbcAgendaLength = useMemo(() => 7, []); // 7-day agenda

  return (
    <div className="w-full h-full mt-28 flex bg-zinc-900 text-white overflow-hidden rounded">
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
        {/* Session Overview */}
        <div className="p-4 border-b border-zinc-800/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">
              Sessions Overview
            </h3>
            <div className="text-xs text-zinc-500">
              {" "}
              {dayjs
                .tz(currentDate.startOf("week"), userTimezone)
                .format("MMM D")}{" "}
              -{" "}
              {dayjs
                .tz(currentDate.endOf("week"), userTimezone)
                .format("MMM D")}
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
                </div>{" "}
                <div className="bg-zinc-900/50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-zinc-300">
                    £{parseFloat(stats.revenue).toFixed(2)}
                  </div>
                  <div className="text-xs text-zinc-500">Revenue</div>
                </div>
              </div>
            );
          })()}{" "}
        </div>
        {/* Task Overview */}
        {/* <div className="p-4 border-b border-zinc-800/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">Task Overview</h3>
            <div className="text-xs text-zinc-500">{tasks.length} total</div>
          </div>          {(() => {
            const weekStart = dayjs.tz(currentDate.startOf("week"), userTimezone);
            const weekEnd = dayjs.tz(currentDate.endOf("week"), userTimezone);
            const weekTasks = tasks.filter((task) => {
              if (!task.due_date) return false;
              const taskDate = dayjs(task.due_date);
              return taskDate.isAfter(weekStart) && taskDate.isBefore(weekEnd);
            });            const pendingTasks = tasks.filter(
              (t) => t.status === "pending"
            ).length;
            const completedTasks = tasks.filter(
              (t) => t.status === "completed"
            ).length;
            const highPriorityTasks = tasks.filter(
              (t) => t.priority === "high"
            ).length;

            return (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900/50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-zinc-300">
                    {weekTasks.length}
                  </div>
                  <div className="text-xs text-zinc-500">This Week</div>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-zinc-300">
                    {pendingTasks}
                  </div>
                  <div className="text-xs text-zinc-500">Pending</div>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-zinc-300">
                    {inProgressTasks}
                  </div>
                  <div className="text-xs text-zinc-500">In Progress</div>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-zinc-300">
                    {highPriorityTasks}
                  </div>
                  <div className="text-xs text-zinc-500">High Priority</div>
                </div>
              </div>
            );
          })()}
        </div> */}
        {/* Status Filters */}
        <div className="p-4 border-b border-zinc-800/30">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">
            Status Filters
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showScheduled}
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
                Pending/Active
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
        </div>{" "}
        {/* Upcoming Sessions & Tasks */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">
              Upcoming Items
            </h3>
            <button
              onClick={() => setCurrentDate(dayjs())}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Today
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-dark pr-2 min-h-0">
            {/* Upcoming Sessions */}
            {displaySessions
              .filter((session) => dayjs(session.start_time).isAfter(dayjs()))
              .sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time)))
              .slice(0, 5)
              .map((session, idx) => (
                <div
                  key={`upcoming-session-${session.id}-${idx}`}
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
                      👥 {session.client.first_name} {session.client.last_name}
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

            {/* Upcoming Tasks */}
            {tasks
              .filter((task) => {
                if (!task.due_date) return false;
                return dayjs(task.due_date).isAfter(dayjs());
              })
              .sort((a, b) => dayjs(a.due_date).diff(dayjs(b.due_date)))
              .slice(0, 5)
              .map((task, idx) => (
                <div
                  key={`upcoming-task-${task.id}-${idx}`}
                  className="p-3 rounded-lg cursor-pointer transition-all duration-200 bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800/50 hover:border-zinc-700/50 border-l-4 border-l-blue-400"
                  onClick={() => {
                    if (task.due_date) {
                      setCurrentDate(dayjs(task.due_date));
                    }
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        task.status === "completed"
                          ? "bg-green-400"
                          : task.priority === "high"
                          ? "bg-red-400"
                          : task.priority === "medium"
                          ? "bg-yellow-400"
                          : "bg-gray-400"
                      }`}
                    />
                    <div className="font-medium text-white text-sm flex-1">
                      📋 {task.title}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 mb-1">
                    {dayjs(task.due_date).format("MMM D, h:mm A")}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {task.priority.toUpperCase()} •{" "}
                    {task.category.replace("-", " ").toUpperCase()}
                  </div>
                </div>
              ))}

            {displaySessions.filter((session) =>
              dayjs(session.start_time).isAfter(dayjs())
            ).length === 0 &&
              tasks.filter(
                (task) => task.due_date && dayjs(task.due_date).isAfter(dayjs())
              ).length === 0 && (
                <div className="text-zinc-500 text-sm text-center py-8">
                  No upcoming items
                </div>
              )}
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col h-full">
        {/* Header bar (does not shrink) */}
        <div className="px-4 py-4 border-b border-zinc-800 flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold">
              {currentDate.format("MMMM YYYY")}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold">
            {/* Segmented view switcher */}
            <div className="inline-flex rounded-md overflow-hidden border border-zinc-700">
              {["day", "week", "month", "agenda"].map((v) => (
                <button
                  key={v}
                  onClick={() => setCurrentView(v)}
                  className={`px-3 py-1 text-xs uppercase tracking-wide ${
                    currentView === v
                      ? "bg-zinc-200 text-black"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  } ${v !== "agenda" ? "border-r border-zinc-700" : ""}`}
                >
                  {v}
                </button>
              ))}
            </div>
            {/* Navigation */}
            {(() => {
              const navUnit =
                currentView === "month"
                  ? "month"
                  : currentView === "agenda"
                  ? "week"
                  : currentView;
              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentDate(currentDate.subtract(1, navUnit))
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
                    onClick={() => setCurrentDate(currentDate.add(1, navUnit))}
                    className="bg-zinc-800 px-4 py-1 rounded"
                  >
                    Next →
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Calendar grid replaced with React Big Calendar */}
        <div className="flex-1 min-h-0 p-4">
          <div className="h-full bg-zinc-900 rounded-lg overflow-hidden rbc-theme-blue">
            <DnDCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              view={
                currentView === "week" ||
                currentView === "day" ||
                currentView === "month" ||
                currentView === "agenda"
                  ? currentView
                  : "week"
              }
              onView={(v) => setCurrentView(v)}
              date={currentDate.toDate()}
              onNavigate={(date) => setCurrentDate(dayjs(date))}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              selectable="ignoreEvents"
              resizable
              step={15}
              timeslots={4}
              min={rbcMinTime}
              max={rbcMaxTime}
              components={rbcComponents}
              eventPropGetter={eventPropGetter}
              formats={rbcFormats}
              dayLayoutAlgorithm="no-overlap"
              showMultiDayTimes
              scrollToTime={rbcScrollToTime}
              popup={false}
              dragRevertDuration={0}
              resizeTimeout={0}
              views={rbcViews}
              toolbar={false}
              tooltipAccessor={null}
              longPressThreshold={5}
              length={rbcAgendaLength}
            />
          </div>
        </div>
      </div>
      {createModalOpen && (
        <CreateSessionModal
          mode="create"
          close={() => setCreateModalOpen(false)}
          initialValues={selectedSession || {}} // <-- fallback to empty object
          clientsHookData={clientsHookData}
          sessionsHookData={sessionsHookData}
        />
      )}{" "}
      {createTaskModalOpen && (
        <CreateTaskModal
          mode="create"
          close={handleTaskModalClose}
          initialValues={selectedSession || {}}
          tasksHookData={tasksHookData}
        />
      )}{" "}
      {editModalOpen && selectedSession && (
        <CreateSessionModal
          mode="edit"
          close={() => setEditModalOpen(false)}
          initialValues={selectedSession}
          clientsHookData={clientsHookData}
          sessionsHookData={sessionsHookData}
        />
      )}{" "}
      {editTaskModalOpen && selectedTask && (
        <CreateTaskModal
          mode="edit"
          close={handleEditTaskModalClose}
          initialValues={selectedTask}
          tasksHookData={tasksHookData}
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
