"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  createSession,
  updateSession,
  cancelSession,
  fetchSessions,
} from "@/redux/slices/sessionSlice";

export default function CreateSessionModal({
  close,
  initialValues = {},
  mode = "create",
}) {
  const dispatch = useDispatch();
  const clients = useSelector((state) => state.clients.list || []);

  const [form, setForm] = useState({
    client_id: "",
    scheduled_at: "",
    duration: 60,
    notes: "",
    status: "",
  });

  console.log("form", form);

  useEffect(() => {
    if (mode === "edit" && initialValues.start_time && initialValues.end_time) {
      const start = initialValues.start_time.slice(0, 16);
      const duration =
        (new Date(initialValues.end_time) -
          new Date(initialValues.start_time)) /
        60000;

      setForm({
        client_id: initialValues.client_id?.toString() || "",
        scheduled_at: start,
        duration,
        notes: initialValues.notes || "",
        status: initialValues.status || "",
      });
    }
  }, [mode, initialValues]);

  const handleSubmit = async () => {
    if (mode === "edit") {
      await dispatch(
        updateSession({
          id: initialValues.id,
          data: {
            ...form,
            duration: parseInt(form.duration, 10), // <-- Fix here
          },
        })
      );
    } else {
      await dispatch(createSession(form));
    }
    await dispatch(fetchSessions()); // refresh view
    close();
  };

  const handleCancelSession = async () => {
    await dispatch(cancelSession(initialValues.id));
    await dispatch(fetchSessions());
    close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-zinc-900 p-6 rounded w-[400px]">
        <h2 className="text-white text-lg font-bold mb-4">
          {mode === "edit" ? "Edit Session" : "Schedule Session"}
        </h2>

        <select
          className="w-full p-2 mb-2 rounded bg-zinc-800 text-white"
          value={form.client_id}
          onChange={(e) => setForm({ ...form, client_id: e.target.value })}
        >
          <option value="">Select Client</option>
          {clients.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.first_name} {c.last_name}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          className="w-full p-2 mb-2 rounded bg-zinc-800 text-white"
          value={form.scheduled_at || ""}
          onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
        />

        <input
          type="number"
          placeholder="Duration (min)"
          className="w-full p-2 mb-2 rounded bg-zinc-800 text-white"
          value={form.duration || ""}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
        />

        <select
          className="w-full p-2 mb-2 rounded bg-zinc-800 text-white"
          value={form.status || ""}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="">Select Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="pending">Request</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <textarea
          placeholder="Notes"
          className="w-full p-2 mb-2 rounded bg-zinc-800 text-white"
          value={form.notes || ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div className="flex justify-between mt-4">
          {mode === "edit" && (
            <button
              onClick={handleCancelSession}
              className="text-red-400 hover:text-red-500 text-sm"
            >
              Cancel Session
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={close} className="text-white">
              Close
            </button>
            <button
              onClick={handleSubmit}
              className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded"
            >
              {mode === "edit" ? "Save Changes" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
