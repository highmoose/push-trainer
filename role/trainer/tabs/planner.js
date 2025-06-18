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
import {
  fetchTasks,
  updateTask,
  updateTaskOptimistic,
  revertTaskUpdate,
  markTaskCompleted,
  markTaskCompletedOptimistic,
  revertMarkTaskCompleted,
} from "@/redux/slices/taskSlice";
import "@/components/trainer/calendarStyles.css";
import {
  Circle,
  CircleCheck,
  Clipboard,
  ClipboardCheck,
  Plus,
} from "lucide-react";

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
  const { list: tasks = [], statistics } = useSelector((state) => state.tasks);
  // Use real sessions from Redux store
  const displaySessions = sessions;
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
    // Refresh tasks after modal closes to show newly created tasks
    dispatch(fetchTasks());
  };

  const handleEditTaskModalClose = () => {
    setEditTaskModalOpen(false);
    setSelectedTask(null);
    // Refresh tasks after modal closes to show updated tasks
    dispatch(fetchTasks());
  };
  const handleTaskCompletionToggle = async (task, event) => {
    // Prevent event from bubbling up to parent elements
    event.stopPropagation();
    event.preventDefault();

    // Prevent multiple clicks on the same task
    if (updatingTasks.has(task.id)) {
      return;
    }

    // Add task to updating set immediately
    setUpdatingTasks((prev) => new Set(prev).add(task.id));

    // Store original task for potential revert
    const originalTask = { ...task };
    const newStatus = task.status === "completed" ? "pending" : "completed";

    try {
      // Single optimistic update based on current status
      dispatch(
        updateTaskOptimistic({
          id: task.id,
          updates: { status: newStatus },
        })
      );

      // Make API call but don't let it update the state automatically
      if (newStatus === "completed") {
        await dispatch(markTaskCompleted(task.id));
      } else {
        await dispatch(
          updateTask({
            id: task.id,
            data: { status: "pending" },
          })
        );
      }

      // Success - keep the optimistic update
    } catch (error) {
      console.error("Failed to update task status:", error);

      // Revert the optimistic update on error
      dispatch(
        revertTaskUpdate({
          id: task.id,
          originalTask,
        })
      );
    } finally {      // Remove task from updating set with a minimal delay to prevent rapid re-clicks
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

  // Fetch tasks when component mounts
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

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
  // Enhanced useEffect for dragging with cross-day support (sessions and tasks)
  useEffect(() => {
    if (!isDragging && !isDraggingTask) return;

    // Add global drag state
    document.body.classList.add("dragging", "no-select");
    const handleMouseMove = (e) => {
      if (!calendarRef.current || (!draggingSession && !draggingTask)) return;

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
          : isDragging
          ? dayjs(draggingSession.start_time)
          : dayjs(draggingTask.due_date);

      // Handle session dragging
      if (isDragging && draggingSession) {
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

        setDraggingSession({
          ...draggingSession, // Preserve all existing session data
          start_time: newStart.format("YYYY-MM-DDTHH:mm:ss"),
          end_time: newEnd.format("YYYY-MM-DDTHH:mm:ss"),
        });
      } // Handle task dragging
      if (isDraggingTask && draggingTask) {
        const newStartTime = targetDay
          .startOf("day")
          .hour(actualHour)
          .minute(actualMinute)
          .second(0);
        const duration = draggingTask.duration || 45; // Get task duration
        const newDueDate = newStartTime.add(duration, "minute"); // due_date = start + duration

        setDraggingTask({
          ...draggingTask, // Preserve all existing task data including duration
          due_date: newDueDate.format("YYYY-MM-DDTHH:mm:ss"),
        });
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsDraggingTask(false);
      setDragCurrentColumn(null);
      setDragStartColumn(null);

      // Remove global drag state
      document.body.classList.remove("dragging", "no-select");

      // Update session time via Redux
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
      } // Update task time via Redux
      if (draggingTask && draggingTask.id) {
        // Store original task for potential revert
        const originalTask = tasks.find((t) => t.id === draggingTask.id);

        if (!originalTask) {
          console.error("Original task not found for revert:", draggingTask.id);
          setDraggingTask(null);
          return;
        }

        if (!draggingTask.due_date) {
          console.error("Dragging task missing due_date:", draggingTask);
          setDraggingTask(null);
          return;
        }

        // 1. Immediate optimistic update
        dispatch(
          updateTaskOptimistic({
            id: draggingTask.id,
            updates: {
              due_date: draggingTask.due_date,
              duration: draggingTask.duration,
            },
          })
        );
        // 2. API call in background
        dispatch(
          updateTask({
            id: draggingTask.id,
            data: {
              ...draggingTask,
              due_date: draggingTask.due_date,
              duration: draggingTask.duration, // Include duration
            },
          })
        ).catch((error) => {
          console.error("Failed to update task, reverting:", error);
          // Revert optimistic update on API failure
          if (originalTask) {
            dispatch(
              revertTaskUpdate({
                id: draggingTask.id,
                originalTask,
              })
            );
          }
        });
      }
      setDraggingSession(null);
      setDraggingTask(null);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDragging(false);
        setIsDraggingTask(false);
        setDragCurrentColumn(null);
        setDragStartColumn(null);
        document.body.classList.remove("dragging", "no-select");
        setDraggingSession(null);
        setDraggingTask(null);
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
  }, [
    isDragging,
    isDraggingTask,
    draggingSession,
    draggingTask,
    dragOffsetY,
    currentDate,
  ]);
  // New useEffect for resizing (sessions and tasks)
  useEffect(() => {
    if (!isResizing && !isResizingTask) return;

    // Add global resize state
    document.body.classList.add("resizing", "no-select");
    const handleMouseMove = (e) => {
      if (!calendarRef.current || (!resizingSession && !resizingTask)) return;

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
      const actualMinute = snappedMinute; // Handle session resizing
      if (isResizing && resizingSession) {
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
      } // Handle task resizing - treat due_date as end time, duration defines the start
      if (isResizingTask && resizingTask) {
        const taskDueDate = dayjs(resizingTask.due_date);
        const currentDuration = resizingTask.duration || 45;
        const taskStartTime = taskDueDate.subtract(currentDuration, "minute");
        const baseDay = taskDueDate.startOf("day");

        let newDueDate = taskDueDate;
        let newDuration = currentDuration;

        if (resizeType === "top") {
          // Resize from top (move start time earlier/later, keep due_date same)
          const newStartTime = baseDay
            .hour(actualHour)
            .minute(actualMinute)
            .second(0);
          newDuration = Math.max(15, taskDueDate.diff(newStartTime, "minute")); // Minimum 15 minutes
          // due_date stays the same, duration changes
        } else if (resizeType === "bottom") {
          // Resize from bottom (move due_date earlier/later, keep start time same)
          newDueDate = baseDay.hour(actualHour).minute(actualMinute).second(0);
          newDuration = Math.max(15, newDueDate.diff(taskStartTime, "minute")); // Minimum 15 minutes
          // If new due_date is before start time, adjust start time
          if (newDueDate.isBefore(taskStartTime.add(15, "minute"))) {
            newDueDate = taskStartTime.add(15, "minute");
            newDuration = 15;
          }
        }

        setResizingTask({
          ...resizingTask,
          due_date: newDueDate.format("YYYY-MM-DDTHH:mm:ss"),
          duration: newDuration,
        });
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      setIsResizingTask(false);
      setResizeType(null); // Remove global resize state
      document.body.classList.remove("resizing", "no-select");

      // Update session time via Redux
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
      } // Update task time via Redux
      if (resizingTask && resizingTask.id) {
        // Store original task for potential revert
        const originalTask = tasks.find((t) => t.id === resizingTask.id);

        if (!originalTask) {
          console.error("Original task not found for revert:", resizingTask.id);
          setResizingTask(null);
          return;
        }

        if (!resizingTask.due_date) {
          console.error("Resizing task missing due_date:", resizingTask);
          setResizingTask(null);
          return;
        }

        // 1. Immediate optimistic update
        dispatch(
          updateTaskOptimistic({
            id: resizingTask.id,
            updates: {
              due_date: resizingTask.due_date,
              duration: resizingTask.duration,
            },
          })
        );
        // 2. API call in background
        dispatch(
          updateTask({
            id: resizingTask.id,
            data: {
              ...resizingTask,
              due_date: resizingTask.due_date,
              duration: resizingTask.duration, // Include duration in the update
            },
          })
        ).catch((error) => {
          console.error("Failed to update task, reverting:", error);
          // Revert optimistic update on API failure
          if (originalTask) {
            dispatch(
              revertTaskUpdate({
                id: resizingTask.id,
                originalTask,
              })
            );
          }
        });
      }

      setResizingSession(null);
      setResizingTask(null);
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
  }, [isResizing, isResizingTask, resizingSession, resizingTask, resizeType]);
  // Scroll to middle of day (8 AM) on initial load
  useEffect(() => {
    if (calendarContainerRef.current) {
      // Each hour is 60px tall, header is 40px
      // 8 AM is hour index 8, so scroll to 8 * 60 = 480px
      const scrollToPosition = 8 * 60; // 8 AM position
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
        )}{" "}
        {/* Cross-day drag indicator */}
        {(isDragging || isDraggingTask) &&
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
                            className={`calendar-task absolute mx-1 text-xs p-2 rounded shadow cursor-grab z-10 group border-l-[2.3px] bg-zinc-800 hover:bg-zinc-700 text-gray-100 ${
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
                                {" "}                                <button
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
        {/* Session Overview */}
        <div className="p-4 border-b border-zinc-800/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">
              Sessions Overview
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
          })()}{" "}
        </div>
        {/* Task Overview */}
        {/* <div className="p-4 border-b border-zinc-800/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">Task Overview</h3>
            <div className="text-xs text-zinc-500">{tasks.length} total</div>
          </div>

          {(() => {
            const weekStart = currentDate.startOf("week");
            const weekEnd = currentDate.endOf("week");
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
          <div className="text-xs text-zinc-500 mt-2">
            Applies to both sessions and tasks
          </div>
        </div>{" "}        {/* Upcoming Sessions & Tasks */}
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
                      👥 {session.first_name} {session.last_name}
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
      )}{" "}
      {createTaskModalOpen && (
        <CreateTaskModal
          mode="create"
          close={handleTaskModalClose}
          initialValues={selectedSession || {}}
        />
      )}{" "}
      {editModalOpen && selectedSession && (
        <CreateSessionModal
          mode="edit"
          close={() => setEditModalOpen(false)}
          initialValues={selectedSession}
        />
      )}{" "}
      {editTaskModalOpen && selectedTask && (
        <CreateTaskModal
          mode="edit"
          close={handleEditTaskModalClose}
          initialValues={selectedTask}
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
