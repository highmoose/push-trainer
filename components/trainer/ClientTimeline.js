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
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import axios from "@/lib/axios";

const eventIcons = {
  metric_entry: Activity,
  photo_upload: Camera,
  session: Calendar,
  weigh_in_request: MessageSquare,
  milestone: Target,
  note: MessageSquare,
};

const eventColors = {
  metric_entry: "text-blue-400 bg-blue-400/20",
  photo_upload: "text-purple-400 bg-purple-400/20",
  session: "text-green-400 bg-green-400/20",
  weigh_in_request: "text-yellow-400 bg-yellow-400/20",
  milestone: "text-orange-400 bg-orange-400/20",
  note: "text-gray-400 bg-gray-400/20",
};

export default function ClientTimeline({
  clientId,
  client,
  isTrainerView = false,
}) {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    event_type: [],
    start_date: "",
    end_date: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const eventTypes = [
    { id: "metric_entry", label: "Metric Entries" },
    { id: "photo_upload", label: "Photo Uploads" },
    { id: "session", label: "Sessions" },
    { id: "weigh_in_request", label: "Check-in Requests" },
    { id: "milestone", label: "Milestones" },
    { id: "note", label: "Notes" },
  ];
  const currentClientId = clientId || client?.id;

  useEffect(() => {
    console.log(
      "ClientTimeline - clientId:",
      clientId,
      "client:",
      client,
      "currentClientId:",
      currentClientId
    );
    fetchTimelineData();
  }, [currentClientId, filters]);
  const fetchTimelineData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/client-timeline`);

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
      case "metric_entry":
      case "metrics_update":
        // Handle the new metrics_summary format
        if (data.metrics_summary) {
          const summaryEntries = Object.entries(data.metrics_summary);
          if (summaryEntries.length > 0) {
            return `📊 Metrics Updated: ${summaryEntries
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")}`;
          }
        }

        // Handle direct metrics data
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
        return `📸 ${data.photo_type || "Progress"} photo uploaded${
          data.pose_type ? ` (${data.pose_type})` : ""
        }`;

      case "session":
        return `🏋️ ${data.session_type || "Training"} session${
          data.duration ? ` - ${data.duration} min` : ""
        }`;

      case "weigh_in_request":
        return `⚖️ ${data.title || "Check-in request"}`;

      case "milestone":
        return `🎉 ${data.description || data.title || "Milestone achieved"}`;

      case "note":
        return `📝 ${data.content || event.description}`;

      default:
        return event.description || "Timeline event";
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
  return (
    <div className="bg-zinc-900 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-blue-400" size={24} />
          <h3 className="text-xl font-semibold text-white">
            {isTrainerView
              ? `${client?.name || "Client"}'s Timeline`
              : "Your Progress Timeline"}
          </h3>
        </div>

        <Button
          onPress={() => setShowFilters(!showFilters)}
          variant="flat"
          color="default"
          startContent={<Filter size={16} />}
          className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          Filters
        </Button>
      </div>

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
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
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
                <Chip
                  key={type.id}
                  onPress={() => handleEventTypeToggle(type.id)}
                  variant={
                    filters.event_type.includes(type.id) ? "solid" : "bordered"
                  }
                  color={
                    filters.event_type.includes(type.id) ? "primary" : "default"
                  }
                  className={`cursor-pointer transition-colors ${
                    filters.event_type.includes(type.id)
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                  }`}
                >
                  {type.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : timelineData.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No timeline events found</p>
            {Object.keys(filters).some((key) => filters[key].length > 0) && (
              <p className="text-sm mt-2">Try adjusting your filters</p>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-zinc-700" />

            {timelineData.map((event, index) => {
              const Icon = eventIcons[event.event_type] || Activity;
              const colorClasses =
                eventColors[event.event_type] || eventColors.note;

              return (
                <div
                  key={event.id}
                  className="relative flex items-start gap-4 pb-6"
                >
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${colorClasses}`}
                  >
                    <Icon size={16} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-zinc-800 rounded-lg p-4">
                      {" "}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {formatEventData(event)}
                          </p>
                          {event.description && event.event_type !== "note" && (
                            <p className="text-zinc-400 text-sm mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500 whitespace-nowrap">
                          {formatDate(event.occurred_at || event.created_at)}
                        </div>
                      </div>
                      {/* Additional details for specific event types */}
                      {(event.event_type === "metric_entry" ||
                        event.event_type === "metrics_update") &&
                        event.event_data?.notes && (
                          <div className="mt-2 p-2 bg-zinc-700 rounded text-sm text-zinc-300">
                            <strong>Notes:</strong> {event.event_data.notes}
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
