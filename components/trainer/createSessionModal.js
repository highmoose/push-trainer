"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  createSession,
  updateSession,
  cancelSession,
  fetchSessions,
} from "@/redux/slices/sessionSlice";
import { createTask } from "@/redux/slices/taskSlice";
import dayjs from "dayjs";
import { ClipboardCheck, Notebook, User } from "lucide-react";

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

  // Main tab states
  const [mainTab, setMainTab] = useState("session"); // "session" or "task"
  const [manualEntry, setManualEntry] = useState(false); // For manual client entry toggle
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

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    due_date: null,
    priority: "medium", // low, medium, high
    category: "general", // general, client-related, equipment, administrative
    status: "pending", // pending, in-progress, completed
    reminder: {
      enabled: false,
      time: "1hour", // 15min, 30min, 1hour, 1day
    },
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

  const handleTaskSubmit = async () => {
    // Format due_date for task
    let formattedDueDate = null;
    if (taskForm.due_date) {
      if (typeof taskForm.due_date === "string") {
        formattedDueDate = taskForm.due_date.replace("T", " ");
        if (formattedDueDate.split(":").length === 2) {
          formattedDueDate += ":00";
        }
      } else {
        const date = taskForm.due_date;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        const second = String(date.getSeconds()).padStart(2, "0");
        formattedDueDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      }
    }

    const payload = {
      title: taskForm.title,
      description: taskForm.description,
      due_date: formattedDueDate,
      priority: taskForm.priority,
      category: taskForm.category,
      status: taskForm.status,
      reminder: taskForm.reminder,
    };
    try {
      await dispatch(createTask(payload)).unwrap();
      console.log("Task created successfully:", payload);
      close();
    } catch (error) {
      console.error("Error saving task:", error);
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
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-white text-xl font-bold">
              {mode === "edit"
                ? "Edit Session"
                : mainTab === "session"
                ? "New Training Session"
                : "New Personal Task"}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              {mode === "edit"
                ? "Update session details"
                : mainTab === "session"
                ? "Schedule a new training session with a client"
                : "Create a personal task or to-do item"}
            </p>
          </div>
          <button
            onClick={close}
            className="text-zinc-400 hover:text-white p-2 rounded hover:bg-zinc-800 transition-colors"
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
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setMainTab("session")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              mainTab === "session"
                ? "text-blue-400 border-blue-400 bg-blue-500/10"
                : "text-zinc-400 border-transparent hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            <User className="w-5 h-5" />
            Client Session
          </button>
          <button
            onClick={() => setMainTab("task")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              mainTab === "task"
                ? "text-blue-400 border-blue-400 bg-blue-500/10"
                : "text-zinc-400 border-transparent hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            Personal Task
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Session Tab */}
          {mainTab === "session" && (
            <div className="space-y-6">
              {/* Client Selection Section */}
              <div className="bg-zinc-800/50 rounded p-4 border border-zinc-700">
                {" "}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Client Selection</h3>
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={manualEntry}
                      onChange={(e) => setManualEntry(e.target.checked)}
                      className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
                    />
                    Manual Entry
                  </label>
                </div>
                {/* No clients available message */}
                {!manualEntry && clientsStatus === "loading" && (
                  <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded">
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      Loading clients...
                    </div>
                  </div>
                )}
                {!manualEntry &&
                  clientsStatus === "succeeded" &&
                  clientsToUse.length === 0 && (
                    <div className="mb-4 p-3 bg-amber-900/20 border border-amber-700/50 rounded">
                      <div className="text-amber-400 text-sm font-medium mb-1">
                        No clients available
                      </div>
                      <div className="text-amber-300/80 text-xs">
                        You don't have any clients yet. Add clients in the
                        Clients tab or use Manual Entry to create a session with
                        client details.
                      </div>
                    </div>
                  )}
                {!manualEntry && clientsStatus === "failed" && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded">
                    <div className="text-red-400 text-sm font-medium mb-1">
                      Failed to load clients
                    </div>
                    <div className="text-red-300/80 text-xs">
                      There was an error loading your clients. Please try
                      refreshing or use Manual Entry.
                    </div>
                  </div>
                )}{" "}
                {!manualEntry ? (
                  <div className="space-y-3">
                    {/* Show selected client or search bar */}
                    {sessionForm.client_id &&
                    sessionForm.first_name &&
                    sessionForm.last_name ? (
                      /* Selected Client Display */
                      <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            {sessionForm.first_name.charAt(0)}
                            {sessionForm.last_name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {sessionForm.first_name} {sessionForm.last_name}
                            </div>
                            <div className="text-blue-300 text-sm">
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
                          className="p-1 rounded-full hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                          title="Remove selected client"
                        >
                          <svg
                            className="w-5 h-5"
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
                        </button>
                      </div>
                    ) : (
                      /* Search Bar */
                      <>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search clients..."
                            className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                          />
                          <svg
                            className="absolute right-3 top-3 w-5 h-5 text-zinc-400"
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
                          <div className="max-h-40 overflow-y-auto bg-zinc-800 rounded border border-zinc-700">
                            {clientsToUse.length === 0 ? (
                              <div className="p-3 text-zinc-400 text-center">
                                <div className="text-sm mb-2">
                                  No clients available
                                </div>
                                <div className="text-xs text-zinc-500">
                                  Add clients in the Clients tab first
                                </div>
                              </div>
                            ) : filteredClients.length > 0 ? (
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
                                  className="w-full text-left p-3 hover:bg-zinc-700 transition-colors border-b border-zinc-700 last:border-b-0"
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
                              <div className="p-3 text-zinc-400 text-center">
                                No clients match your search
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={sessionForm.first_name}
                        onChange={(e) =>
                          setSessionForm((prev) => ({
                            ...prev,
                            first_name: e.target.value,
                          }))
                        }
                        className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={sessionForm.last_name}
                        onChange={(e) =>
                          setSessionForm((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
                        }
                        className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Session Templates */}
              <div className="bg-zinc-800/50 rounded p-4 border border-zinc-700">
                <h3 className="text-white font-medium mb-4">Quick Templates</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {sessionTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className={`p-3 rounded border-2 transition-all text-left hover:border-blue-500 ${
                        sessionForm.session_type === template.type
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      <div className="text-white font-medium text-sm">
                        {template.name}
                      </div>
                      <div className="text-zinc-400 text-xs mt-1">
                        {template.duration}min • ${template.rate}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={sessionForm.scheduled_at || ""}
                    onChange={(e) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        scheduled_at: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={sessionForm.duration}
                    onChange={(e) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Location
                  </label>
                  <select
                    value={sessionForm.location}
                    onChange={(e) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Rate ($)
                  </label>
                  <input
                    type="number"
                    value={sessionForm.rate}
                    onChange={(e) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        rate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    min="0"
                    step="5"
                  />
                </div>
              </div>

              {/* Recurring Sessions */}
              <div className="bg-zinc-800/50 rounded p-4 border border-zinc-700">
                <label className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={sessionForm.recurring.enabled}
                    onChange={(e) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        recurring: {
                          ...prev.recurring,
                          enabled: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-white font-medium">
                    Create Recurring Sessions
                  </span>
                </label>

                {sessionForm.recurring.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Frequency
                      </label>
                      <select
                        value={sessionForm.recurring.frequency}
                        onChange={(e) =>
                          setSessionForm((prev) => ({
                            ...prev,
                            recurring: {
                              ...prev.recurring,
                              frequency: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Number of Sessions
                      </label>
                      <input
                        type="number"
                        value={sessionForm.recurring.count}
                        onChange={(e) =>
                          setSessionForm((prev) => ({
                            ...prev,
                            recurring: {
                              ...prev.recurring,
                              count: parseInt(e.target.value) || 1,
                            },
                          }))
                        }
                        className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        min="1"
                        max="52"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Session Notes
                </label>
                <textarea
                  value={sessionForm.notes}
                  onChange={(e) =>
                    setSessionForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  rows="3"
                  placeholder="Add session notes, goals, or special instructions..."
                />
              </div>

              {/* Conflicts Warning */}
              {conflicts.length > 0 && (
                <div className="bg-red-900/20 border border-red-700 rounded p-4">
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
                    This time slot overlaps with existing sessions. Please
                    choose a different time.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Task Tab */}
          {mainTab === "task" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  rows="3"
                  placeholder="Describe the task details..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={taskForm.due_date || ""}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        due_date: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Category
                  </label>
                  <select
                    value={taskForm.category}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="general">General</option>
                    <option value="client-related">Client Related</option>
                    <option value="equipment">Equipment</option>
                    <option value="administrative">Administrative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Reminder Settings */}
              <div className="bg-zinc-800/50 rounded p-4 border border-zinc-700">
                <label className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={taskForm.reminder.enabled}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        reminder: {
                          ...prev.reminder,
                          enabled: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-white font-medium">Set Reminder</span>
                </label>

                {taskForm.reminder.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Remind me
                    </label>
                    <select
                      value={taskForm.reminder.time}
                      onChange={(e) =>
                        setTaskForm((prev) => ({
                          ...prev,
                          reminder: { ...prev.reminder, time: e.target.value },
                        }))
                      }
                      className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="15min">15 minutes before</option>
                      <option value="30min">30 minutes before</option>
                      <option value="1hour">1 hour before</option>
                      <option value="1day">1 day before</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800 bg-zinc-900/50">
          <div>
            {mainTab === "session" && conflicts.length > 0 && (
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
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={close}
              className="px-6 py-2 text-zinc-400 hover:text-white font-medium rounded hover:bg-zinc-800 transition-all"
            >
              Cancel
            </button>
            {mainTab === "session" ? (
              <button
                onClick={handleSessionSubmit}
                disabled={
                  !sessionForm.first_name ||
                  !sessionForm.last_name ||
                  !sessionForm.scheduled_at
                }
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-medium rounded transition-all shadow-lg disabled:cursor-not-allowed"
              >
                {mode === "edit"
                  ? "Update Session"
                  : sessionForm.recurring.enabled
                  ? `Create ${sessionForm.recurring.count} Sessions`
                  : "Create Session"}
              </button>
            ) : (
              <button
                onClick={handleTaskSubmit}
                disabled={!taskForm.title}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-medium rounded transition-all shadow-lg disabled:cursor-not-allowed"
              >
                Create Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
