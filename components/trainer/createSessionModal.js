"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  createSession,
  updateSession,
  cancelSession,
  fetchSessions,
} from "@/redux/slices/sessionSlice";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";

export default function CreateSessionModal({
  close,
  initialValues = {},
  mode = "create",
}) {
  const dispatch = useDispatch();
  const clients = useSelector((state) => state.clients.list || []);
  const sessions = useSelector((state) => state.sessions.list || []);
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

  const [activeTab, setActiveTab] = useState("details");
  const [clientSearch, setClientSearch] = useState("");
  const [showConflicts, setShowConflicts] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const [form, setForm] = useState({
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
      frequency: "weekly", // weekly, biweekly, monthly
      count: 4,
      end_date: null,
    },
    equipment_needed: "",
    preparation_notes: "",
    goals: "",
  });

  // Helper functions
  const filteredClients = clients.filter((client) =>
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
    setForm((prev) => ({
      ...prev,
      duration: template.duration,
      session_type: template.type,
      rate: template.rate,
      notes: `${template.name} session`,
    }));
    setActiveTab("details");
  };

  console.log("form", form);
  useEffect(() => {
    if (initialValues?.start_time) {
      const start = new Date(initialValues.start_time);
      const duration = initialValues.end_time
        ? (new Date(initialValues.end_time) - start) / 60000
        : 60;

      // Format the date for the datetime-local input without timezone conversion
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, "0");
      const day = String(start.getDate()).padStart(2, "0");
      const hour = String(start.getHours()).padStart(2, "0");
      const minute = String(start.getMinutes()).padStart(2, "0");
      const formattedDateTime = `${year}-${month}-${day}T${hour}:${minute}`;

      setForm({
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

      // Set client search if we have client data
      if (initialValues.first_name && initialValues.last_name) {
        setClientSearch(
          `${initialValues.first_name} ${initialValues.last_name}`
        );
      }
    }
  }, [initialValues]);
  const handleSubmit = async () => {
    // Format scheduled_at to match Laravel expectation (YYYY-MM-DD HH:mm:ss)
    let formattedScheduledAt = null;
    if (form.scheduled_at) {
      if (typeof form.scheduled_at === "string") {
        formattedScheduledAt = form.scheduled_at.replace("T", " ");
        if (formattedScheduledAt.split(":").length === 2) {
          formattedScheduledAt += ":00";
        }
      } else {
        const date = form.scheduled_at;
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
      client_id: form.client_id || null,
      first_name: form.first_name,
      last_name: form.last_name,
      scheduled_at: formattedScheduledAt,
      duration: parseInt(form.duration, 10),
      notes: form.notes,
      status: form.status,
      session_type: form.session_type,
      gym: form.location, // Backend expects 'gym' field
      rate: parseFloat(form.rate) || 0,
      equipment_needed: form.equipment_needed,
      preparation_notes: form.preparation_notes,
      goals: form.goals,
    };

    try {
      if (mode === "edit") {
        await dispatch(updateSession({ id: initialValues.id, data: payload }));
      } else {
        if (form.recurring.enabled) {
          // Handle recurring sessions
          const sessions = [];
          const startDate = dayjs(form.scheduled_at);

          for (let i = 0; i < form.recurring.count; i++) {
            let sessionDate = startDate;

            if (form.recurring.frequency === "weekly") {
              sessionDate = startDate.add(i * 7, "day");
            } else if (form.recurring.frequency === "biweekly") {
              sessionDate = startDate.add(i * 14, "day");
            } else if (form.recurring.frequency === "monthly") {
              sessionDate = startDate.add(i, "month");
            }

            const sessionPayload = {
              ...payload,
              scheduled_at: sessionDate.format("YYYY-MM-DD HH:mm:ss"),
            };

            sessions.push(dispatch(createSession(sessionPayload)));
          }

          await Promise.all(sessions);
        } else {
          await dispatch(createSession(payload));
        }
      }

      await dispatch(fetchSessions());
      close();
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  };
  const handleCancelSession = async () => {
    try {
      await dispatch(cancelSession(initialValues.id));
      await dispatch(fetchSessions());
      close();
    } catch (error) {
      console.error("Failed to cancel session:", error);
    }
  };

  const conflicts = detectConflicts(form.scheduled_at, form.duration);

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-white text-xl font-bold">
              {mode === "edit" ? "Edit Session" : "New Training Session"}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              {mode === "edit"
                ? "Update session details"
                : "Schedule a new training session"}
            </p>
          </div>
          <button
            onClick={close}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"
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

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          {[
            { id: "details", label: "Details", icon: "📋" },
            { id: "templates", label: "Templates", icon: "📄" },
            { id: "recurring", label: "Recurring", icon: "🔄" },
            { id: "advanced", label: "Advanced", icon: "⚙️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "text-blue-400 border-blue-400 bg-blue-500/10"
                  : "text-zinc-400 border-transparent hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Client Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Client Selection
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Search clients..."
                      className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                    />

                    {clientSearch && (
                      <div className="max-h-32 overflow-y-auto bg-zinc-800 rounded-lg border border-zinc-700">
                        {filteredClients.map((client) => (
                          <div
                            key={client.id}
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                client_id: client.id.toString(),
                                first_name: client.first_name,
                                last_name: client.last_name,
                              }));
                              setClientSearch(
                                `${client.first_name} ${client.last_name}`
                              );
                            }}
                            className="p-3 hover:bg-zinc-700 cursor-pointer text-zinc-300 hover:text-white transition-colors"
                          >
                            <div className="font-medium">
                              {client.first_name} {client.last_name}
                            </div>
                            <div className="text-xs text-zinc-400">
                              {client.email}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Manual Entry Option */}
                    <div className="border-t border-zinc-700 pt-3">
                      <div className="text-xs text-zinc-400 mb-2">
                        Or enter manually:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="First Name"
                          className="p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 text-sm"
                          value={form.first_name}
                          onChange={(e) =>
                            setForm({ ...form, first_name: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          className="p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 text-sm"
                          value={form.last_name}
                          onChange={(e) =>
                            setForm({ ...form, last_name: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Session Type & Rate
                  </label>
                  <div className="space-y-3">
                    <select
                      className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500"
                      value={form.session_type}
                      onChange={(e) =>
                        setForm({ ...form, session_type: e.target.value })
                      }
                    >
                      <option value="">Select Session Type</option>
                      <option value="strength">Strength Training</option>
                      <option value="cardio">Cardio Session</option>
                      <option value="hiit">HIIT Workout</option>
                      <option value="recovery">Recovery & Stretching</option>
                      <option value="assessment">Fitness Assessment</option>
                      <option value="consultation">Consultation</option>
                    </select>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Rate ($)"
                        className="flex-1 p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500"
                        value={form.rate || ""}
                        onChange={(e) =>
                          setForm({ ...form, rate: e.target.value })
                        }
                      />
                      <select
                        className="flex-1 p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500"
                        value={form.location}
                        onChange={(e) =>
                          setForm({ ...form, location: e.target.value })
                        }
                      >
                        <option value="">Select Location</option>
                        {locations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date/Time and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Date & Time
                  </label>
                  <DateTimePicker
                    className="w-full"
                    value={
                      form.scheduled_at
                        ? dayjs(form.scheduled_at).toDate()
                        : null
                    }
                    onChange={(date) =>
                      setForm({ ...form, scheduled_at: date })
                    }
                    valueFormat="MMM D, YYYY h:mm A"
                    placeholder="Select date and time"
                    styles={{
                      input: {
                        backgroundColor: "#27272a",
                        borderColor: "#3f3f46",
                        color: "#ffffff",
                        "&:focus": {
                          borderColor: "#3b82f6",
                        },
                      },
                    }}
                  />

                  {/* Conflict Warning */}
                  {conflicts.length > 0 && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-500 rounded text-red-400 text-xs">
                      ⚠️ Conflict detected with {conflicts.length} existing
                      session(s)
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Duration & Status
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Duration (min)"
                        className="flex-1 p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500"
                        value={form.duration || ""}
                        onChange={(e) =>
                          setForm({ ...form, duration: e.target.value })
                        }
                      />
                      <select
                        className="flex-1 p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500"
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Session Notes
                </label>
                <textarea
                  placeholder="Add notes about the session..."
                  className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all h-24 resize-none"
                  value={form.notes || ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              <div className="text-zinc-300 mb-4">
                <h3 className="font-medium mb-2">Quick Session Templates</h3>
                <p className="text-sm text-zinc-400">
                  Apply pre-configured session settings
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessionTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className={`p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer transition-all border-l-4 border-${template.color} group`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {template.name}
                      </h4>
                      <span className="text-xs bg-zinc-700 px-2 py-1 rounded text-zinc-300">
                        ${template.rate}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-400">
                      {template.duration} minutes • {template.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recurring Tab */}
          {activeTab === "recurring" && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.recurring.enabled}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recurring: {
                          ...form.recurring,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-zinc-300 font-medium">
                    Create Recurring Sessions
                  </span>
                </label>
              </div>

              {form.recurring.enabled && (
                <div className="space-y-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Frequency
                      </label>
                      <select
                        className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500"
                        value={form.recurring.frequency}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            recurring: {
                              ...form.recurring,
                              frequency: e.target.value,
                            },
                          })
                        }
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
                        min="1"
                        max="52"
                        className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500"
                        value={form.recurring.count}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            recurring: {
                              ...form.recurring,
                              count: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="text-sm text-zinc-400 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                    📅 This will create {form.recurring.count} sessions starting
                    from your selected date, repeating{" "}
                    {form.recurring.frequency}.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Equipment Needed
                  </label>
                  <textarea
                    placeholder="List any special equipment required..."
                    className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 h-24 resize-none"
                    value={form.equipment_needed || ""}
                    onChange={(e) =>
                      setForm({ ...form, equipment_needed: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Preparation Notes
                  </label>
                  <textarea
                    placeholder="Any preparation needed before the session..."
                    className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 h-24 resize-none"
                    value={form.preparation_notes || ""}
                    onChange={(e) =>
                      setForm({ ...form, preparation_notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Session Goals
                </label>
                <textarea
                  placeholder="What are the specific goals for this session..."
                  className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 h-24 resize-none"
                  value={form.goals || ""}
                  onChange={(e) => setForm({ ...form, goals: e.target.value })}
                />
              </div>

              {/* Show Conflicts Toggle */}
              <div className="border-t border-zinc-700 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showConflicts}
                    onChange={(e) => setShowConflicts(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-zinc-300">
                    Show scheduling conflicts
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-4">
            {mode === "edit" && (
              <button
                onClick={handleCancelSession}
                className="text-red-400 hover:text-red-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-900/20 transition-all"
              >
                Cancel Session
              </button>
            )}

            {conflicts.length > 0 && (
              <div className="text-yellow-400 text-xs flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {conflicts.length} conflict(s) detected
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={close}
              className="px-6 py-2 text-zinc-400 hover:text-white font-medium rounded-lg hover:bg-zinc-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !form.first_name || !form.last_name || !form.scheduled_at
              }
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-medium rounded-lg transition-all shadow-lg disabled:cursor-not-allowed"
            >
              {mode === "edit"
                ? "Update Session"
                : form.recurring.enabled
                ? `Create ${form.recurring.count} Sessions`
                : "Create Session"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
