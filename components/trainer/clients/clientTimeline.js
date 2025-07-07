import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Activity,
  Camera,
  Calendar,
  MessageSquare,
  Target,
  Dumbbell,
  Utensils,
  Scale,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import axios from "@/lib/axios";

const eventIcons = {
  metric_entry: Activity,
  metrics_update: Activity,
  photo_upload: Camera,
  session: Calendar,
  weigh_in_request: MessageSquare,
  milestone: Target,
  workout: Dumbbell,
  nutrition: Utensils,
  check_in: Scale,
  note: MessageSquare,
};

const eventColors = {
  metric_entry: "bg-blue-500",
  metrics_update: "bg-zinc-700",
  photo_upload: "bg-purple-500",
  session: "bg-green-500",
  weigh_in_request: "bg-yellow-500",
  milestone: "bg-orange-500",
  workout: "bg-emerald-500",
  nutrition: "bg-orange-600",
  check_in: "bg-blue-600",
  note: "bg-gray-500",
};

export default function ClientTimeline({ selectedClient }) {
  const [expandTimeline, setExpandTimeline] = useState(false);
  const [showTodayLabel, setShowTodayLabel] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);
  const timelineRef = useRef(null);

  console.log("Timeline Data:", timelineData);

  // Handle timeline expansion with delayed text fade-in
  useEffect(() => {
    if (expandTimeline) {
      // Delay showing the today label until after timeline expansion
      const timer = setTimeout(() => {
        setShowTodayLabel(true);
      }, 200); // Match the timeline expansion duration
      return () => clearTimeout(timer);
    } else {
      // Hide immediately when collapsing
      setShowTodayLabel(false);
    }
  }, [expandTimeline]);

  // Fetch actual timeline data
  useEffect(() => {
    if (selectedClient?.id) {
      fetchTimelineData();
    }
  }, [selectedClient]);

  const fetchTimelineData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/client-timeline`, {
        params: { client_id: selectedClient.id },
      });

      const data = response.data;
      if (data.success) {
        setTimelineData(data.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching timeline:", error);
      setTimelineData([]); // Use empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Generate timeline days with actual data
  const generateTimelineDays = () => {
    const days = [];
    const today = new Date();

    // If no timeline data yet, show a minimal range around today
    if (!timelineData.length) {
      // Add 2 future days
      for (let i = 2; i > 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push({
          date: date,
          isToday: false,
          isFuture: true,
          events: [],
        });
      }

      // Add today
      days.push({
        date: new Date(today),
        isToday: true,
        isFuture: false,
        events: [],
      });

      // Add 7 past days
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        days.push({
          date: date,
          isToday: false,
          isFuture: false,
          events: [],
        });
      }

      return days;
    }

    // Get all unique dates from timeline data
    const eventDates = new Set();
    timelineData.forEach((event) => {
      const eventDate = new Date(event.occurred_at || event.created_at);
      const dateStr = eventDate.toISOString().split("T")[0];
      eventDates.add(dateStr);
    });

    // Convert to array and sort (most recent first)
    const sortedEventDates = Array.from(eventDates).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    // Find the date range
    const todayStr = today.toISOString().split("T")[0];
    let earliestDate = new Date(today);
    let latestDate = new Date(today);

    if (sortedEventDates.length > 0) {
      earliestDate = new Date(sortedEventDates[sortedEventDates.length - 1]);
      latestDate = new Date(sortedEventDates[0]);

      // Ensure we include today even if there are no events today
      if (latestDate < today) {
        latestDate = new Date(today);
      }
    }

    // Add a few buffer days before the earliest event and after latest
    earliestDate.setDate(earliestDate.getDate() - 3);
    latestDate.setDate(latestDate.getDate() + 3);

    // Generate all days in the range
    const currentDate = new Date(latestDate);
    while (currentDate >= earliestDate) {
      const isToday = currentDate.toISOString().split("T")[0] === todayStr;
      const isFuture = currentDate > today;

      days.push({
        date: new Date(currentDate),
        isToday: isToday,
        isFuture: isFuture,
        events: getEventsForDate(currentDate),
      });

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return days;
  };

  // Get actual events for a specific date
  const getEventsForDate = (date) => {
    if (!timelineData.length) return [];

    const dateStr = date.toISOString().split("T")[0];

    return timelineData.filter((event) => {
      const eventDate = new Date(event.occurred_at || event.created_at);
      const eventDateStr = eventDate.toISOString().split("T")[0];
      return eventDateStr === dateStr;
    });
  };

  const timelineDays = useMemo(() => {
    return generateTimelineDays();
  }, [timelineData]);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatEventData = (event) => {
    const data = event.event_data || {};

    switch (event.event_type) {
      case "metric_entry":
      case "metrics_update":
        if (data.metrics_summary) {
          const summaryEntries = Object.entries(data.metrics_summary);
          if (summaryEntries.length > 0) {
            return summaryEntries
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ");
          }
        }
        return "Metrics updated";

      case "photo_upload":
        return `${data.photo_type || "Progress"} photo${
          data.pose_type ? ` (${data.pose_type})` : ""
        }`;

      case "session":
        return `${data.session_type || "Training"} session${
          data.duration ? ` - ${data.duration}min` : ""
        }`;

      case "weigh_in_request":
        return data.title || "Check-in request";

      case "milestone":
        return data.description || data.title || "Milestone achieved";

      case "note":
        return data.content || event.description;

      default:
        return event.description || "Activity";
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (!expandTimeline) return;
    setIsDragging(true);
    setDragStart(e.clientY);
    setDragStartOffset(scrollOffset);
    e.preventDefault();
  };

  // Add global mouse event listeners
  useEffect(() => {
    const handleMouseMoveGlobal = (e) => {
      if (!isDragging || !expandTimeline) return;

      const deltaY = e.clientY - dragStart;
      const newOffset = dragStartOffset - deltaY; // Reversed: subtract deltaY to make drag feel natural
      const maxOffset = Math.max(0, timelineDays.length * 50 - 400);

      setScrollOffset(Math.max(-240, Math.min(maxOffset, newOffset)));
    };

    const handleMouseUpGlobal = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMoveGlobal);
      document.addEventListener("mouseup", handleMouseUpGlobal);

      return () => {
        document.removeEventListener("mousemove", handleMouseMoveGlobal);
        document.removeEventListener("mouseup", handleMouseUpGlobal);
      };
    }
  }, [
    isDragging,
    expandTimeline,
    dragStart,
    dragStartOffset,
    timelineDays.length,
  ]);

  const getDaySquareColor = (day) => {
    if (day.isToday) {
      return "bg-blue-500 border-blue-400";
    }

    if (day.events.length > 0) {
      const primaryEvent = day.events[0];
      const color = eventColors[primaryEvent.event_type] || "bg-zinc-600";
      return `${color} border-zinc-500`;
    }

    return day.isFuture
      ? "bg-zinc-700 border-zinc-600"
      : "bg-zinc-800 border-zinc-700";
  };

  return (
    <div
      onMouseEnter={() => setExpandTimeline(true)}
      onMouseLeave={() => setExpandTimeline(false)}
      className={`bg-zinc-900/50 h-full transition-all duration-700 relative overflow-hidden ${
        expandTimeline ? "w-1/3" : "w-[100px]"
      }`}
    >
      {/* Timeline Content */}
      <div
        ref={timelineRef}
        className={`p-3 h-full overflow-hidden ${
          expandTimeline ? "cursor-grab" : ""
        } ${isDragging ? "cursor-grabbing" : ""}`}
        style={{ transform: `translateY(${-scrollOffset}px)` }}
        onMouseDown={handleMouseDown}
      >
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-4 h-4  border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-1">
            {timelineDays.map((day, index) => {
              const squareColor = getDaySquareColor(day);

              return (
                <div
                  key={index}
                  className="h-8 transition-all duration-700 relative"
                >
                  {/* Expandable square/rectangle design */}
                  <div className="flex items-center justify-center h-full">
                    {day.events.length > 0 ? (
                      <div
                        className={`${
                          expandTimeline ? "w-full" : "w-6"
                        } h-6  ${squareColor} transition-all duration-700 flex rounded items-center ${
                          expandTimeline
                            ? "justify-between px-3"
                            : "justify-center"
                        }`}
                      >
                        {day.isToday && !expandTimeline && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                        {expandTimeline && (
                          <div
                            className={`flex items-center gap-2 transition-opacity duration-1000 ${
                              showTodayLabel ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            {day.isToday && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            )}
                            <span
                              className={`font-medium text-xs transition-opacity duration-1000 ${
                                showTodayLabel ? "opacity-100" : "opacity-0"
                              } ${
                                day.isToday
                                  ? "text-white"
                                  : day.isFuture
                                  ? "text-zinc-200"
                                  : "text-zinc-100"
                              }`}
                            >
                              {formatDate(day.date)}
                            </span>
                            {day.isToday && (
                              <span
                                className={`text-xs text-white font-semibold transition-opacity duration-1000 ${
                                  showTodayLabel ? "opacity-100" : "opacity-0"
                                }`}
                              >
                                TODAY
                              </span>
                            )}
                          </div>
                        )}
                        {expandTimeline && (
                          <span
                            className={`text-xs text-zinc-100 transition-opacity duration-1000 ${
                              showTodayLabel ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            {day.events.length} event
                            {day.events.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    ) : (
                      /* Empty days - keep as circles always */
                      <div className="w-6 h-6 flex items-center justify-center">
                        <div className="w-1 h-1 bg-zinc-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today indicator line - always pinned to today's position */}
      {(() => {
        const todayIndex = timelineDays.findIndex((day) => day.isToday);
        if (todayIndex === -1) return null;

        // Calculate position: header height (61px) + padding (12px) + (index * 36px for each day including gap) - current scroll offset
        const topPosition = 61 + 12 + todayIndex * 36 + 16 - scrollOffset; // +16 to center on the square

        return (
          <>
            {/* Today label when expanded */}
            {expandTimeline && (
              <div
                className={`absolute left-6 text-xs text-zinc-600 font-medium transition-opacity duration-1000 ${
                  showTodayLabel ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  top: `${topPosition - 18}px`,
                }}
              >
                Today
              </div>
            )}
            {/* Today line */}
            <div
              className={`absolute h-[2px] bg-zinc-600 opacity-50 transition-width duration-700 ${
                expandTimeline
                  ? "left-6 right-6"
                  : "left-1/2 transform -translate-x-1/2 w-10"
              }`}
              style={{ top: `${topPosition}px` }}
            ></div>
          </>
        );
      })()}
    </div>
  );
}
