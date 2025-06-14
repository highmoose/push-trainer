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

  const [form, setForm] = useState({
    client_id: "",
    scheduled_at: null,
    duration: 60,
    notes: "",
    status: "",
  });

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
        scheduled_at: formattedDateTime, // Use local time format without timezone conversion
        duration,
        notes: initialValues.notes || "",
        status: initialValues.status || "scheduled",
      });
    }
  }, [initialValues]);
  const handleSubmit = async () => {
    // Format scheduled_at to match Laravel expectation (YYYY-MM-DD HH:mm:ss)
    let formattedScheduledAt = null;
    if (form.scheduled_at) {
      if (typeof form.scheduled_at === "string") {
        // If it's already a string, convert T to space and add seconds if needed
        formattedScheduledAt = form.scheduled_at.replace("T", " ");
        if (!formattedScheduledAt.includes(":")) {
          formattedScheduledAt += ":00";
        } else if (formattedScheduledAt.split(":").length === 2) {
          formattedScheduledAt += ":00";
        }
      } else {
        // If it's a Date object, format as local time
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

    console.log(
      "Modal - Submitting scheduled_at:",
      formattedScheduledAt,
      "from:",
      form.scheduled_at
    );

    const payload = {
      ...form,
      duration: parseInt(form.duration, 10),
      scheduled_at: formattedScheduledAt, // Send in Laravel-expected format
    };

    if (mode === "edit") {
      await dispatch(updateSession({ id: initialValues.id, data: payload }));
    } else {
      await dispatch(createSession(payload));
    }

    await dispatch(fetchSessions());
    close();
  };

  // converts the session to cancelled status

  // const handleCancelSession = async () => {
  //   if (mode === "edit" && initialValues.id) {
  //     await dispatch(cancelSession(initialValues.id));
  //     await dispatch(fetchSessions());
  //     close();
  //   }
  // };

  const handleCancelSession = async () => {
    await dispatch(cancelSession(initialValues.id));
    await dispatch(fetchSessions());
    close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-zinc-900 rounded w-[400px] p-8">
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

        <DateTimePicker
          className="mb-2 bg-zinc-800 rounded"
          style={{
            width: "100%",
            marginBottom: "0.5rem",
            borderRadius: "0.375rem",
            backgroundColor: "#1f2937",
            color: "#ffffff",
          }}
          value={form.scheduled_at ? dayjs(form.scheduled_at).toDate() : null}
          onChange={(date) =>
            setForm({
              ...form,
              scheduled_at: date,
            })
          }
          valueFormat="MMM D YYYY h:mma"
          placeholder="Pick date and time"
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
              Remove Session
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
