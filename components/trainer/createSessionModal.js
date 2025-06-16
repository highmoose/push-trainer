"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  createSession,
  updateSession,
  cancelSession,
  fetchSessions,
} from "@/redux/slices/sessionSlice";
import dayjs from "dayjs";
import { User } from "lucide-react";

export default function CreateSessionModal({
  close,
  initialValues = {},
  mode = "create",
}) {
  const dispatch = useDispatch();
  const clients = useSelector((state) => state.clients.list || []);
  const clientsStatus = useSelector((state) => state.clients.status);
  const sessions = useSelector((state) => state.sessions.list || []);
  // Use real client data from Redux store
  const clientsToUse = clients;

  // Session Templates
  const sessionTemplates = [
    {
      id: 1,
      name: "Strength Training",
      duration: 60,
      color: "red-500",
      type: "strength",
      rate: 80,
    },
    {
      id: 2,
      name: "Cardio Session",
      duration: 45,
      color: "orange-500",
      type: "cardio",
      rate: 65,
    },
    {
      id: 3,
      name: "HIIT Workout",
      duration: 30,
      color: "yellow-500",
      type: "hiit",
      rate: 75,
    },
    {
      id: 4,
      name: "Flexibility & Recovery",
      duration: 45,
      color: "green-500",
      type: "recovery",
      rate: 60,
    },
    {
      id: 5,
      name: "Personal Assessment",
      duration: 90,
      color: "blue-500",
      type: "assessment",
      rate: 100,
    },
    {
      id: 6,
      name: "Nutrition Consultation",
      duration: 60,
      color: "purple-500",
      type: "consultation",
      rate: 70,
    },
  ];

  const locations = [
    "Main Gym Floor",
    "Studio A",
    "Studio B",
    "Outdoor Area",
    "Client's Home",
    "Online Session",
  ];

  const [manualEntry, setManualEntry] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [showConflicts, setShowConflicts] = useState(false);

  // Session form state
  const [sessionForm, setSessionForm] = useState({
    client_id: "",
    first_name: "",
    last_name: "",
    scheduled_at: null,
    duration: 60,
    notes: "",
    status: "scheduled",
    session_type: "",
    location: "",
    rate: 0,
    recurring: {
      enabled: false,
      frequency: "weekly",
      count: 4,
      end_date: null,
    },
    equipment_needed: "",
    preparation_notes: "",
    goals: "",
  });

  // Helper functions for sessions
  const filteredClients = clientsToUse.filter((client) =>
    `${client.first_name} ${client.last_name}`
      .toLowerCase()
      .includes(clientSearch.toLowerCase())
  );

  const detectConflicts = (dateTime, duration) => {
    if (!dateTime) return [];

    const sessionStart = dayjs(dateTime);
    const sessionEnd = sessionStart.add(duration, "minute");

    return sessions.filter((session) => {
      if (mode === "edit" && session.id === initialValues.id) return false;

      const existingStart = dayjs(session.start_time);
      const existingEnd = dayjs(session.end_time);

      return (
        sessionStart.isBefore(existingEnd) && sessionEnd.isAfter(existingStart)
      );
    });
  };

  const applyTemplate = (template) => {
    setSessionForm((prev) => ({
      ...prev,
      duration: template.duration,
      session_type: template.type,
      rate: template.rate,
      notes: `${template.name} session`,
    }));
  };

  const conflicts = detectConflicts(
    sessionForm.scheduled_at,
    sessionForm.duration
  );

  useEffect(() => {
    if (initialValues?.start_time) {
      const start = new Date(initialValues.start_time);
      const duration = initialValues.end_time
        ? (new Date(initialValues.end_time) - start) / 60000
        : 60;

      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, "0");
      const day = String(start.getDate()).padStart(2, "0");
      const hour = String(start.getHours()).padStart(2, "0");
      const minute = String(start.getMinutes()).padStart(2, "0");
      const formattedDateTime = `${year}-${month}-${day}T${hour}:${minute}`;

      setSessionForm({
        client_id: initialValues.client_id?.toString() || "",
        first_name: initialValues.first_name || "",
        last_name: initialValues.last_name || "",
        scheduled_at: formattedDateTime,
        duration,
        notes: initialValues.notes || "",
        status: initialValues.status || "scheduled",
        session_type: initialValues.session_type || "",
        location: initialValues.gym || "",
        rate: initialValues.rate || 0,
        equipment_needed: initialValues.equipment_needed || "",
        preparation_notes: initialValues.preparation_notes || "",
        goals: initialValues.goals || "",
        recurring: {
          enabled: false,
          frequency: "weekly",
          count: 4,
          end_date: null,
        },
      });

      if (initialValues.first_name && initialValues.last_name) {
        setClientSearch(
          `${initialValues.first_name} ${initialValues.last_name}`
        );
      }
    }
  }, [initialValues]);

  const handleSessionSubmit = async () => {
    let formattedScheduledAt = null;
    if (sessionForm.scheduled_at) {
      if (typeof sessionForm.scheduled_at === "string") {
        formattedScheduledAt = sessionForm.scheduled_at.replace("T", " ");
        if (formattedScheduledAt.split(":").length === 2) {
          formattedScheduledAt += ":00";
        }
      } else {
        const date = sessionForm.scheduled_at;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        const second = String(date.getSeconds()).padStart(2, "0");
        formattedScheduledAt = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      }
    }

    const payload = {
      client_id: sessionForm.client_id || null,
      first_name: sessionForm.first_name,
      last_name: sessionForm.last_name,
      scheduled_at: formattedScheduledAt,
      duration: parseInt(sessionForm.duration, 10),
      notes: sessionForm.notes,
      status: sessionForm.status,
      session_type: sessionForm.session_type,
      location: sessionForm.location,
      rate: parseFloat(sessionForm.rate) || 0,
      equipment_needed: sessionForm.equipment_needed,
      preparation_notes: sessionForm.preparation_notes,
      goals: sessionForm.goals,
    };

    try {
      if (mode === "edit") {
        await dispatch(updateSession({ id: initialValues.id, ...payload }));
      } else {
        if (sessionForm.recurring.enabled) {
          // Handle recurring sessions
          const sessions = [];
          const startDate = dayjs(formattedScheduledAt);

          for (let i = 0; i < sessionForm.recurring.count; i++) {
            let sessionDate = startDate;
            if (sessionForm.recurring.frequency === "weekly") {
              sessionDate = startDate.add(i, "week");
            } else if (sessionForm.recurring.frequency === "biweekly") {
              sessionDate = startDate.add(i * 2, "week");
            } else if (sessionForm.recurring.frequency === "monthly") {
              sessionDate = startDate.add(i, "month");
            }

            sessions.push({
              ...payload,
              scheduled_at: sessionDate.format("YYYY-MM-DD HH:mm:ss"),
            });
          }

          for (const session of sessions) {
            await dispatch(createSession(session));
          }
        } else {
          await dispatch(createSession(payload));
        }
      }
      close();
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  const handleCancelSession = async () => {
    if (initialValues?.id) {
      try {
        await dispatch(cancelSession(initialValues.id));
        close();
      } catch (error) {
        console.error("Error cancelling session:", error);
      }
    }
  };
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-950 border border-zinc-900 rounded max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {" "}
        {/* Header */}
        <div className="flex bg-zinc-900 items-center justify-between p-4 px-8 border-b border-zinc-800">
          <div>
            <h2 className="text-white text-xl font-bold">
              {mode === "edit" ? "Edit Session" : "New Training Session"}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              {mode === "edit"
                ? "Update session details"
                : "Schedule a new training session with a client"}
            </p>
          </div>{" "}
          <button
            onClick={close}
            className="text-zinc-400 hover:text-white p-2 rounded hover:bg-zinc-900 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>{" "}
        </div>{" "}
        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-dark p-4 px-8 bg-zinc-900">
          <div className="space-y-4">
            {" "}
            {/* Client Selection Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-zinc-300">
                  Client Selection
                </h3>
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    checked={manualEntry}
                    onChange={(e) => setManualEntry(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                  />
                  Manual Entry
                </label>
              </div>
              {/* Loading/Error States */}{" "}
              {!manualEntry && clientsStatus === "loading" && (
                <div className="mb-3 p-2 bg-zinc-900 border border-zinc-800 rounded">
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    Loading clients...
                  </div>
                </div>
              )}{" "}
              {!manualEntry &&
                clientsStatus === "succeeded" &&
                clientsToUse.length === 0 && (
                  <div className="mb-3 p-2 bg-zinc-900 border border-zinc-800 rounded">
                    <div className="text-amber-400 text-sm font-medium mb-1">
                      No clients available
                    </div>
                    <div className="text-amber-300/80 text-xs">
                      You don't have any clients yet. Add clients in the Clients
                      tab or use Manual Entry.
                    </div>
                  </div>
                )}{" "}
              {!manualEntry && clientsStatus === "failed" && (
                <div className="mb-3 p-2 bg-zinc-900 border border-zinc-800 rounded">
                  <div className="text-red-400 text-sm font-medium mb-1">
                    Failed to load clients
                  </div>
                  <div className="text-red-300/80 text-xs">
                    There was an error loading your clients. Please try
                    refreshing or use Manual Entry.
                  </div>
                </div>
              )}
              {/* Client Selection UI */}
              {!manualEntry ? (
                <div className="space-y-3">
                  {sessionForm.client_id &&
                  sessionForm.first_name &&
                  sessionForm.last_name /* Selected Client Display */ ? (
                    <div className="flex items-center justify-between p-2 bg-zinc-900 border border-zinc-800 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {sessionForm.first_name.charAt(0)}
                          {sessionForm.last_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {sessionForm.first_name} {sessionForm.last_name}
                          </div>
                          <div className="text-zinc-400 text-sm">
                            Selected Client
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSessionForm((prev) => ({
                            ...prev,
                            client_id: "",
                            first_name: "",
                            last_name: "",
                          }));
                          setClientSearch("");
                        }}
                        className="p-1 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    /* Search Bar */
                    <>
                      <div className="relative">
                        {" "}
                        <input
                          type="text"
                          placeholder="Search clients..."
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                        />{" "}
                        <svg
                          className="absolute right-2 top-2 w-5 h-5 text-zinc-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>{" "}
                      {clientSearch && (
                        <div className="max-h-40 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded">
                          {filteredClients.length > 0 ? (
                            filteredClients.map((client) => (
                              <button
                                key={client.id}
                                onClick={() => {
                                  setSessionForm((prev) => ({
                                    ...prev,
                                    client_id: client.id,
                                    first_name: client.first_name,
                                    last_name: client.last_name,
                                  }));
                                  setClientSearch("");
                                }}
                                className="w-full text-left p-2 hover:bg-zinc-900 transition-colors border-b border-zinc-800 last:border-b-0"
                              >
                                <div className="text-white font-medium">
                                  {client.first_name} {client.last_name}
                                </div>
                                <div className="text-zinc-400 text-sm">
                                  {client.email}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-2 text-zinc-400 text-center">
                              No clients match your search
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* Manual Entry */ <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      First Name *
                    </label>{" "}
                    <input
                      type="text"
                      value={sessionForm.first_name}
                      onChange={(e) =>
                        setSessionForm((prev) => ({
                          ...prev,
                          first_name: e.target.value,
                        }))
                      }
                      className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Last Name *
                    </label>{" "}
                    <input
                      type="text"
                      value={sessionForm.last_name}
                      onChange={(e) =>
                        setSessionForm((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                        }))
                      }
                      className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              )}
            </div>{" "}
            {/* Session Templates */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">
                Workout Selection
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {sessionTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className={`p-2 rounded border-2 transition-all text-left hover:bg-white hover:text-black group ${
                      sessionForm.session_type === template.type
                        ? "border-blue-500 bg-zinc-900 text-white"
                        : "border-zinc-800 bg-zinc-900 text-white hover:border-white"
                    }`}
                  >
                    <div className="font-medium text-sm group-hover:text-black">
                      {template.name}
                    </div>
                    <div className="text-zinc-400 group-hover:text-zinc-600 text-xs mt-1">
                      {template.duration}min • ${template.rate}
                    </div>
                  </button>
                ))}
              </div>
            </div>{" "}
            {/* Session Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Date & Time *
                </label>{" "}
                <input
                  type="datetime-local"
                  value={sessionForm.scheduled_at || ""}
                  onChange={(e) =>
                    setSessionForm((prev) => ({
                      ...prev,
                      scheduled_at: e.target.value,
                    }))
                  }
                  className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>{" "}
              <div className="">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-zinc-300">
                    Duration (minutes)
                  </label>
                  <div className="text-xs text-zinc-400">Presets</div>
                </div>
                <div className="flex justify-between items-center w-full">
                  <div className="relative">
                    <input
                      type="number"
                      value={sessionForm.duration}
                      onChange={(e) =>
                        setSessionForm((prev) => ({
                          ...prev,
                          duration: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-20 overflow-hidden p-2 pl-8 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-center"
                      min="15"
                      step="15"
                      placeholder="Custom"
                    />
                    <svg
                      className="absolute left-2 top-2.5 w-4 h-4 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                  </div>
                  <p className="text-zinc-500">-</p>
                  <div className="flex">
                    <div className="flex gap-1 flex-wrap">
                      {[30, 45, 60, 75, 90].map((duration) => (
                        <button
                          key={duration}
                          type="button"
                          onClick={() =>
                            setSessionForm((prev) => ({
                              ...prev,
                              duration: duration,
                            }))
                          }
                          className={`px-3 py-2 text-xs rounded transition-all ${
                            sessionForm.duration === duration
                              ? "bg-white text-zinc-900"
                              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          }`}
                        >
                          {duration}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Location
                </label>{" "}
                <select
                  value={sessionForm.location}
                  onChange={(e) =>
                    setSessionForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="">Select location</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Rate ($)
                </label>{" "}
                <input
                  type="number"
                  value={sessionForm.rate}
                  onChange={(e) =>
                    setSessionForm((prev) => ({
                      ...prev,
                      rate: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  min="0"
                  step="5"
                />
              </div>
            </div>{" "}
            {/* Session Notes */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Session Notes
              </label>{" "}
              <textarea
                value={sessionForm.notes}
                onChange={(e) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                rows="3"
                placeholder="Add session notes, goals, or special instructions..."
              />
            </div>{" "}
            {/* Conflicts Warning */}
            {conflicts.length > 0 && (
              <div className="bg-zinc-900 border border-red-700 rounded p-3">
                <div className="flex items-center gap-2 text-red-400">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5z" />
                  </svg>
                  {conflicts.length} scheduling conflict(s) detected
                </div>
                <div className="mt-2 text-sm text-red-300">
                  This time slot overlaps with existing sessions. Please choose
                  a different time.
                </div>
              </div>
            )}
          </div>{" "}
        </div>{" "}
        {/* Footer */}
        <div className="flex items-center justify-between pb-6 pt-4 px-8 border-t border-zinc-800 bg-zinc-900">
          <div>
            {conflicts.length > 0 && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5z" />
                </svg>
                {conflicts.length} conflict(s) detected
              </div>
            )}
          </div>{" "}
          <div className="flex items-center gap-3">
            {" "}
            <button
              onClick={close}
              className="px-6 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSessionSubmit}
              disabled={
                !sessionForm.first_name ||
                !sessionForm.last_name ||
                !sessionForm.scheduled_at
              }
              className="px-6 py-2 bg-zinc-800 hover:bg-white hover:text-black disabled:bg-zinc-700 disabled:text-zinc-400 text-white hover:border-white rounded transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {mode === "edit" ? "Update Session" : "Create Session"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
