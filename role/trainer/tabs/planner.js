"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import CreateSessionModal from "@/components/trainer/createSessionModal";
import {
  updateSession,
  updateSessionTime,
  updateSessionTimeOptimistic,
  revertSessionTimeUpdate,
} from "@/redux/slices/sessionSlice";
import "@/components/trainer/calendarStyles.css";

const views = ["day", "week", "month", "year"];
const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM
const fifteenMinutes = Array.from({ length: 4 }, (_, i) => i * 15).map((m) =>
  m.toString().padStart(2, "0")
);

export default function TrainerCalendarPage() {
  const dispatch = useDispatch();
  const calendarRef = useRef(null);
  const hoverLineRef = useRef(null);
  const { list: sessions = [] } = useSelector((state) => state.sessions);
  const { list: clients = [], status } = useSelector((state) => state.clients); // Add some test sessions for debugging
  // Fix timezone issue: create times in local timezone without UTC conversion
  const now = dayjs();
  const testSessions = [
    {
      id: "test1",
      start_time: now
        .startOf("day")
        .hour(9)
        .minute(30)
        .second(0)
        .format("YYYY-MM-DDTHH:mm:ss"),
      end_time: now
        .startOf("day")
        .hour(10)
        .minute(30)
        .second(0)
        .format("YYYY-MM-DDTHH:mm:ss"),
      status: "scheduled",
      first_name: "John",
      last_name: "Doe",
      gym: "Test Gym",
      notes: "Test session - should show at 9:30 AM",
    },
    {
      id: "test2",
      start_time: now
        .startOf("day")
        .hour(14)
        .minute(0)
        .second(0)
        .format("YYYY-MM-DDTHH:mm:ss"),
      end_time: now
        .startOf("day")
        .hour(15)
        .minute(0)
        .second(0)
        .format("YYYY-MM-DDTHH:mm:ss"),
      status: "pending",
      first_name: "Jane",
      last_name: "Smith",
      gym: "Test Gym 2",
      notes: "Another test - should show at 2:00 PM",
    },
  ];

  // Debug timezone
  console.log("Timezone test:");
  console.log("Current time:", now.format("YYYY-MM-DD HH:mm:ss"));
  console.log(
    "Test 1 expected: 9:30 AM, created as:",
    testSessions[0].start_time
  );
  console.log(
    "Test 2 expected: 2:00 PM, created as:",
    testSessions[1].start_time
  );

  // Use test sessions if no real sessions exist
  const displaySessions = sessions.length > 0 ? sessions : testSessions;
  console.log("clients", clients);
  console.log("sessions", sessions);
  console.log("displaySessions", displaySessions);
  console.log("sessions count:", sessions.length);
  console.log("displaySessions count:", displaySessions.length);
  // Debug session times
  displaySessions.forEach((s, i) => {
    const start = dayjs(s.start_time);
    const end = dayjs(s.end_time);
    console.log(`Session ${i}:`, {
      raw_start: s.start_time,
      raw_end: s.end_time,
      parsed_start: start.format("YYYY-MM-DD HH:mm"),
      parsed_end: end.format("YYYY-MM-DD HH:mm"),
      start_hour: start.hour(),
      status: s.status,
    });
  });

  const [selectedSession, setSelectedSession] = useState(null);
  console.log("selectedSession", selectedSession);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [currentView, setCurrentView] = useState("week");

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
  const [dragCurrentColumn, setDragCurrentColumn] = useState(null); // Enhanced useEffect for dragging with cross-day support
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

      setDragCurrentColumn(newColumnIndex);

      // Calculate which hour and minute we're in based on the grid
      // Each hour block is 60px tall, header is approximately 40px
      const headerHeight = 40;
      const hourHeight = 60;
      const adjustedY = Math.max(0, y - headerHeight);

      // Calculate hour (0-15 for 6 AM to 10 PM)
      const hourIndex = Math.floor(adjustedY / hourHeight);
      const minuteInHour = adjustedY % hourHeight;

      // Snap to 15-minute intervals
      const snappedMinute = Math.round(minuteInHour / 15) * 15;

      // Calculate actual hour (6 AM = hour 6)
      const actualHour = Math.max(6, 6 + hourIndex);
      const actualMinute = Math.min(59, snappedMinute);

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
      const newEnd = newStart.add(duration, "minute"); // Validate the new times are reasonable (between 6 AM and 10 PM)
      if (newStart.hour() >= 6 && newEnd.hour() <= 22) {
        setDraggingSession({
          ...draggingSession, // Preserve all existing session data
          start_time: newStart.format("YYYY-MM-DDTHH:mm:ss"),
          end_time: newEnd.format("YYYY-MM-DDTHH:mm:ss"),
        });
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragCurrentColumn(null);
      setDragStartColumn(null);

      // Remove global drag state
      document.body.classList.remove("dragging", "no-select"); // Update session time via Redux
      if (draggingSession && draggingSession.id) {
        // Only dispatch to Redux if it's a real session (not a test session)
        if (!String(draggingSession.id).startsWith("test")) {
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
            console.error(
              "Dragging session missing time data:",
              draggingSession
            );
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
        } else {
          // Handle test session updates locally (for now just log)
          console.log("Test session updated:", {
            id: draggingSession.id,
            start_time: draggingSession.start_time,
            end_time: draggingSession.end_time,
          });
        }
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
      const y = e.clientY - calendarRect.top;

      // Calculate which hour and minute we're in based on the grid
      // Each hour block is 60px tall, header is approximately 40px
      const headerHeight = 40;
      const hourHeight = 60;
      const adjustedY = Math.max(0, y - headerHeight);

      // Calculate hour (0-15 for 6 AM to 10 PM)
      const hourIndex = Math.floor(adjustedY / hourHeight);
      const minuteInHour = adjustedY % hourHeight;

      // Snap to 15-minute intervals
      const snappedMinute = Math.round(minuteInHour / 15) * 15;

      // Calculate actual hour (6 AM = hour 6)
      const actualHour = Math.max(6, Math.min(21, 6 + hourIndex)); // Clamp between 6 AM and 9 PM
      const actualMinute = Math.min(59, snappedMinute);

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
      document.body.classList.remove("resizing", "no-select");

      // Update session time via Redux
      if (resizingSession && resizingSession.id) {
        // Only dispatch to Redux if it's a real session (not a test session)
        if (!String(resizingSession.id).startsWith("test")) {
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
        } else {
          // Handle test session updates locally (for now just log)
          console.log("Test session updated:", {
            id: resizingSession.id,
            start_time: resizingSession.start_time,
            end_time: resizingSession.end_time,
          });
        }
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
                    {/* Invisible 15-minute hover zones */}
                    {[0, 15, 30, 45].map((minutes, idx) => {
                      const top = (minutes / 60) * 60; // 15, 30, 45
                      const clickedTime = day
                        .hour(hour)
                        .minute(minutes)
                        .second(0);

                      return (
                        <div
                          key={`hover-${idx}`}
                          className="absolute inset-x-0 h-[15px] z-0"
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
                          onClick={() => {
                            // Prevent click when dragging or resizing
                            if (isDragging || isResizing) return;
                            setSelectedSession({
                              start_time: clickedTime.format(
                                "YYYY-MM-DDTHH:mm:ss"
                              ),
                              end_time: clickedTime
                                .add(30, "minute")
                                .format("YYYY-MM-DDTHH:mm:ss"),
                              status: "scheduled",
                              notes: "",
                              gym: "",
                              first_name: "",
                              last_name: "",
                            });
                            setCreateModalOpen(true);
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
                          (sessionStartMinute / 60) * 60; // Convert to pixels (1 minute = 1 pixel)

                        // Height calculation: total duration in minutes
                        const totalDurationMinutes = end.diff(start, "minute");
                        const sessionHeight = Math.max(
                          15,
                          totalDurationMinutes
                        ); // Minimum 15px height

                        console.log(
                          `[${s.first_name} ${
                            s.last_name
                          }] Starting at ${sessionStartHour}:${sessionStartMinute
                            .toString()
                            .padStart(
                              2,
                              "0"
                            )}, Duration: ${totalDurationMinutes}min, Height: ${sessionHeight}px, Position: ${sessionTopPosition}px`
                        );
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
                                  ? 50
                                  : 10,
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
        <div className="min-h-full overflow-y-auto calendar-scroll scrollbar-dark">
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
      {" "}
      <div className="w-64 p-4 border-r border-zinc-800 bg-zinc-800 flex flex-col h-full">
        {/* Quick Actions */}
        <div className="mb-6">
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded mb-2 font-bold transition-colors"
            onClick={() => setCreateModalOpen(true)}
          >
            + New Session
          </button>
          <button
            className="w-full bg-transparent hover:bg-zinc-700 border border-zinc-600 text-zinc-300 px-3 py-2 rounded font-medium transition-colors"
            onClick={() => setCurrentDate(dayjs())}
          >
            Go to Today
          </button>
        </div>

        {/* Session Statistics */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">
            This Week
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-900 p-3 rounded">
              <div className="text-lg font-bold text-green-400">
                {
                  displaySessions.filter(
                    (s) =>
                      s.status === "scheduled" &&
                      dayjs(s.start_time).isAfter(
                        currentDate.startOf("week")
                      ) &&
                      dayjs(s.start_time).isBefore(currentDate.endOf("week"))
                  ).length
                }
              </div>
              <div className="text-xs text-zinc-500">Scheduled</div>
            </div>
            <div className="bg-zinc-900 p-3 rounded">
              <div className="text-lg font-bold text-yellow-400">
                {
                  displaySessions.filter(
                    (s) =>
                      s.status === "pending" &&
                      dayjs(s.start_time).isAfter(
                        currentDate.startOf("week")
                      ) &&
                      dayjs(s.start_time).isBefore(currentDate.endOf("week"))
                  ).length
                }
              </div>
              <div className="text-xs text-zinc-500">Pending</div>
            </div>
            <div className="bg-zinc-900 p-3 rounded">
              <div className="text-lg font-bold text-blue-400">
                {
                  displaySessions.filter(
                    (s) =>
                      s.status === "completed" &&
                      dayjs(s.start_time).isAfter(
                        currentDate.startOf("week")
                      ) &&
                      dayjs(s.start_time).isBefore(currentDate.endOf("week"))
                  ).length
                }
              </div>
              <div className="text-xs text-zinc-500">Completed</div>
            </div>
            <div className="bg-zinc-900 p-3 rounded">
              <div className="text-lg font-bold text-red-400">
                {
                  displaySessions.filter(
                    (s) =>
                      s.status === "cancelled" &&
                      dayjs(s.start_time).isAfter(
                        currentDate.startOf("week")
                      ) &&
                      dayjs(s.start_time).isBefore(currentDate.endOf("week"))
                  ).length
                }
              </div>
              <div className="text-xs text-zinc-500">Cancelled</div>
            </div>
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">
            Quick Navigation
          </h3>
          <div className="bg-zinc-900 p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
                className="text-zinc-400 hover:text-white text-xs"
              >
                ←
              </button>
              <div className="text-sm font-medium text-white">
                {currentDate.format("MMM YYYY")}
              </div>
              <button
                onClick={() => setCurrentDate(currentDate.add(1, "month"))}
                className="text-zinc-400 hover:text-white text-xs"
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                <div
                  key={idx}
                  className="text-center text-zinc-500 font-medium py-1"
                >
                  {day}
                </div>
              ))}
              {Array.from(
                { length: currentDate.startOf("month").day() },
                (_, i) => (
                  <div key={`empty-${i}`} className="h-6"></div>
                )
              )}
              {Array.from({ length: currentDate.daysInMonth() }, (_, i) => {
                const day = currentDate.startOf("month").add(i, "day");
                const hasSession = displaySessions.some(
                  (session) =>
                    dayjs(session.start_time).format("YYYY-MM-DD") ===
                    day.format("YYYY-MM-DD")
                );
                const isToday = day.isSame(dayjs(), "day");
                const isSelected = day.isSame(
                  currentDate.startOf("week"),
                  "week"
                );

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentDate(day)}
                    className={`h-6 text-xs rounded flex items-center justify-center relative ${
                      isToday
                        ? "bg-blue-600 text-white font-bold"
                        : isSelected
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {day.date()}
                    {hasSession && (
                      <div className="absolute bottom-0 right-0 w-1 h-1 bg-green-400 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Session Filters */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">
            Show/Hide
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={showSheduled}
                onChange={(e) => setShowScheduled(e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-700 text-green-600 focus:ring-green-500 focus:ring-offset-zinc-800"
              />
              <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
              Scheduled (
              {displaySessions.filter((s) => s.status === "scheduled").length})
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={showPending}
                onChange={(e) => setShowPending(e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-700 text-yellow-600 focus:ring-yellow-500 focus:ring-offset-zinc-800"
              />
              <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
              Pending (
              {displaySessions.filter((s) => s.status === "pending").length})
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-800"
              />
              <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
              Completed (
              {displaySessions.filter((s) => s.status === "completed").length})
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={showCancelled}
                onChange={(e) => setShowCancelled(e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-700 text-red-600 focus:ring-red-500 focus:ring-offset-zinc-800"
              />
              <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
              Cancelled (
              {displaySessions.filter((s) => s.status === "cancelled").length})
            </label>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex-1 overflow-hidden">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">
            Upcoming Sessions
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {displaySessions
              .filter((session) => dayjs(session.start_time).isAfter(dayjs()))
              .sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time)))
              .slice(0, 5)
              .map((session, idx) => (
                <div
                  key={`upcoming-${session.id}-${idx}`}
                  className="bg-zinc-900 p-2 rounded text-xs cursor-pointer hover:bg-zinc-700 transition-colors"
                  onClick={() => {
                    setCurrentDate(dayjs(session.start_time));
                    setSelectedSession(session);
                    setEditModalOpen(true);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        session.status === "scheduled"
                          ? "bg-green-500"
                          : session.status === "pending"
                          ? "bg-yellow-500"
                          : session.status === "completed"
                          ? "bg-blue-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <div className="font-medium text-white">
                      {session.first_name} {session.last_name}
                    </div>
                  </div>
                  <div className="text-zinc-400">
                    {dayjs(session.start_time).format("MMM D, h:mm A")}
                  </div>
                  <div className="text-zinc-500">
                    {session.gym || "No gym specified"}
                  </div>
                </div>
              ))}
            {displaySessions.filter((session) =>
              dayjs(session.start_time).isAfter(dayjs())
            ).length === 0 && (
              <div className="text-zinc-500 text-xs text-center py-4">
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
      </div>
      {createModalOpen && (
        <CreateSessionModal
          mode="create"
          close={() => setCreateModalOpen(false)}
          initialValues={selectedSession || {}} // <-- fallback to empty object
        />
      )}
      {editModalOpen && selectedSession && (
        <CreateSessionModal
          mode="edit"
          close={() => setEditModalOpen(false)}
          initialValues={selectedSession}
        />
      )}
    </div>
  );
}
