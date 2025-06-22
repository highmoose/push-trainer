"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Camera,
  Calendar,
  MessageSquare,
  Target,
  TrendingUp,
  Filter,
  Scale,
} from "lucide-react";
import axios from "@/lib/axios";
import WeighInRequestResponseModal from "./WeighInRequestResponseModal";

const eventIcons = {
  metrics_update: Activity,
  metric_entry: Activity, // Keep for backward compatibility
  photo_upload: Camera,
  session: Calendar,
  weigh_in_request: MessageSquare,
  milestone: Target,
  note: MessageSquare,
};

const eventColors = {
  metrics_update: "text-blue-400 bg-blue-400/20",
  metric_entry: "text-blue-400 bg-blue-400/20", // Keep for backward compatibility
  photo_upload: "text-purple-400 bg-purple-400/20",
  session: "text-green-400 bg-green-400/20",
  weigh_in_request: "text-yellow-400 bg-yellow-400/20",
  milestone: "text-orange-400 bg-orange-400/20",
  note: "text-gray-400 bg-gray-400/20",
};

export default function ClientProgressTimeline() {
  const [timelineData, setTimelineData] = useState([]);
  const [weighInRequests, setWeighInRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filters, setFilters] = useState({
    event_type: [],
    start_date: "",
    end_date: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const eventTypes = [
    { id: "metrics_update", label: "My Metrics" },
    { id: "metric_entry", label: "My Metrics (Legacy)" }, // Keep for backward compatibility
    { id: "photo_upload", label: "Progress Photos" },
    { id: "session", label: "Training Sessions" },
    { id: "weigh_in_request", label: "Weigh-in Requests" },
    { id: "milestone", label: "Milestones" },
    { id: "note", label: "Notes" },
  ];

  useEffect(() => {
    fetchTimelineData();
    fetchWeighInRequests();
  }, [filters]);
  const fetchTimelineData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.event_type.length > 0) {
        filters.event_type.forEach((type) =>
          params.append("event_type[]", type)
        );
      }
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);

      const response = await axios.get(`/api/client-timeline?${params}`);

      const data = response.data;
      if (data.success) {
        setTimelineData(data.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching timeline:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchWeighInRequests = async () => {
    try {
      const response = await axios.get("/api/weigh-in-requests");

      const data = response.data;
      if (data.success) {
        setWeighInRequests(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching weigh-in requests:", error);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleEventTypeToggle = (eventType) => {
    setFilters((prev) => ({
      ...prev,
      event_type: prev.event_type.includes(eventType)
        ? prev.event_type.filter((t) => t !== eventType)
        : [...prev.event_type, eventType],
    }));
  };
  const formatEventData = (event) => {
    const data = event.event_data || {};

    switch (event.event_type) {
      case "metrics_update":
      case "metric_entry":
        // Handle the new metrics_summary format
        if (data.metrics_summary) {
          const summaryEntries = Object.entries(data.metrics_summary);
          if (summaryEntries.length > 0) {
            return `📊 Metrics Updated: ${summaryEntries
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")}`;
          }
        }

        // Handle direct metrics data with proper formatting
        const metrics = Object.entries(data)
          .filter(
            ([key, value]) =>
              key !== "notes" &&
              key !== "trainer_notes" &&
              value !== null &&
              value !== ""
          )
          .map(([key, value]) => {
            const label = key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());
            let formattedValue = value;

            // Add units where appropriate
            if (key === "weight") formattedValue = `${value} kg`;
            else if (key === "body_fat_percentage")
              formattedValue = `${value}%`;
            else if (key === "muscle_mass") formattedValue = `${value} kg`;
            else if (key.includes("circumference"))
              formattedValue = `${value} cm`;
            else if (key === "sleep_hours") formattedValue = `${value} hrs`;
            else if (key === "water_intake") formattedValue = `${value} L`;
            else if (key.includes("level")) formattedValue = `${value}/10`;
            else if (key === "steps_daily") formattedValue = `${value} steps`;

            return `${label}: ${formattedValue}`;
          });
        return metrics.length > 0
          ? `📊 ${metrics.join(", ")}`
          : "📊 New body metrics and progress data recorded";

      case "photo_upload":
        return `📸 Progress photo uploaded${
          data.pose_type ? ` (${data.pose_type})` : ""
        }`;

      case "session":
        return `🏋️ Training session${
          data.duration ? ` - ${data.duration} min` : ""
        }`;

      case "weigh_in_request":
        return `⚖️ ${data.title || "Weigh-in request received"}`;

      case "milestone":
        return `🎉 ${data.description || data.title || "Milestone achieved"}`;

      case "note":
        return `📝 ${data.content || event.description}`;

      default:
        return event.description || "Progress update";
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    const timeString = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (diffInDays === 0) return `Today at ${timeString}`;
    if (diffInDays === 1) return `Yesterday at ${timeString}`;
    if (diffInDays < 7) return `${diffInDays} days ago at ${timeString}`;

    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      }) + ` at ${timeString}`
    );
  };

  const pendingRequests = weighInRequests.filter(
    (req) => req.status === "pending"
  );

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-blue-400" size={32} />
            <h1 className="text-3xl font-bold text-white">
              My Progress Timeline
            </h1>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Pending Weigh-in Requests Alert */}
        {pendingRequests.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Scale className="text-yellow-400" size={20} />
              <h3 className="text-yellow-400 font-medium">
                Pending Weigh-in Requests ({pendingRequests.length})
              </h3>
            </div>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between bg-zinc-800 rounded-lg p-3"
                >
                  <div>
                    <p className="text-white font-medium">{request.title}</p>
                    {request.due_date && (
                      <p className="text-zinc-400 text-sm">
                        Due: {new Date(request.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Respond
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-zinc-800 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) =>
                    handleFilterChange("start_date", e.target.value)
                  }
                  className="w-full p-2 rounded bg-zinc-700 border border-zinc-600 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) =>
                    handleFilterChange("end_date", e.target.value)
                  }
                  className="w-full p-2 rounded bg-zinc-700 border border-zinc-600 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Event Types
              </label>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleEventTypeToggle(type.id)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      filters.event_type.includes(type.id)
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-zinc-800 rounded-xl p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : timelineData.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <Calendar size={64} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">
                No progress events yet
              </h3>
              <p>
                Your journey starts here! Complete some activities to see your
                timeline.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-zinc-600" />

              {timelineData.map((event, index) => {
                const Icon = eventIcons[event.event_type] || Activity;
                const colorClasses =
                  eventColors[event.event_type] || eventColors.note;

                return (
                  <div
                    key={event.id}
                    className="relative flex items-start gap-4 pb-8 last:pb-0"
                  >
                    {/* Icon */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${colorClasses}`}
                    >
                      <Icon size={16} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-zinc-700 rounded-lg p-4">
                        {" "}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {formatEventData(event)}
                            </p>
                            {event.description &&
                              event.event_type !== "note" && (
                                <p className="text-zinc-400 text-sm mt-1">
                                  {event.description}
                                </p>
                              )}
                          </div>
                          <div className="text-xs text-zinc-400 whitespace-nowrap">
                            {formatDate(
                              event.occurred_at ||
                                event.event_date ||
                                event.created_at
                            )}
                          </div>
                        </div>
                        {/* Additional details for specific event types */}
                        {(event.event_type === "metric_entry" ||
                          event.event_type === "metrics_update") &&
                          event.event_data?.notes && (
                            <div className="mt-3 p-2 bg-zinc-600 rounded text-sm text-zinc-300">
                              <strong>My Notes:</strong>{" "}
                              {event.event_data.notes}
                            </div>
                          )}
                        {(event.event_type === "metric_entry" ||
                          event.event_type === "metrics_update") &&
                          event.event_data?.trainer_notes && (
                            <div className="mt-2 p-2 bg-blue-900/30 rounded text-sm text-blue-300 border border-blue-800">
                              <strong>Trainer Notes:</strong>{" "}
                              {event.event_data.trainer_notes}
                            </div>
                          )}
                        {event.event_type === "milestone" && (
                          <div className="mt-2 text-orange-400 text-sm">
                            🎉 Congratulations on this achievement!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weigh-in Request Response Modal */}
        {selectedRequest && (
          <WeighInRequestResponseModal
            close={() => setSelectedRequest(null)}
            request={selectedRequest}
            onCompleted={() => {
              setSelectedRequest(null);
              fetchWeighInRequests();
              fetchTimelineData();
            }}
          />
        )}
      </div>
    </div>
  );
}
