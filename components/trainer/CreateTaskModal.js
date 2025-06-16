"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createTask } from "@/redux/slices/taskSlice";
import dayjs from "dayjs";
import { ClipboardCheck } from "lucide-react";

export default function CreateTaskModal({
  close,
  initialValues = {},
  mode = "create",
}) {
  const dispatch = useDispatch();

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    due_date: null,
    priority: "medium",
    category: "general",
    status: "pending",
    reminder: false,
  });

  // Initialize form with initial values if provided
  useEffect(() => {
    if (initialValues?.due_date) {
      const dueDate = new Date(initialValues.due_date);
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, "0");
      const day = String(dueDate.getDate()).padStart(2, "0");
      const hour = String(dueDate.getHours()).padStart(2, "0");
      const minute = String(dueDate.getMinutes()).padStart(2, "0");
      const formattedDateTime = `${year}-${month}-${day}T${hour}:${minute}`;

      setTaskForm({
        title: initialValues.title || "",
        description: initialValues.description || "",
        due_date: formattedDateTime,
        priority: initialValues.priority || "medium",
        category: initialValues.category || "general",
        status: initialValues.status || "pending",
        reminder: initialValues.reminder || false,
      });
    }
  }, [initialValues]);

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
      close();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-950 border border-zinc-900 rounded  max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {" "}
        {/* Header */}
        <div className="flex bg-zinc-900 items-center justify-between p-4 px-8 border-b border-zinc-800">
          <div>
            <h2 className="text-white text-xl font-bold">
              {mode === "edit" ? "Edit Task" : "New Personal Task"}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              {mode === "edit"
                ? "Update task details"
                : "Create a personal task or to-do item"}
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
          </button>
        </div>{" "}
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 px-8 bg-zinc-900">
          <div className="space-y-4">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Task Title *
              </label>{" "}
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter task title..."
                className="w-full p-2 rounded text-white bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>
            {/* Task Description */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Description
              </label>{" "}
              <textarea
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Add task description..."
                rows={3}
                className="w-full p-2 rounded bg-zinc-800 text-white bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>{" "}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Due Date
                </label>{" "}
                <input
                  type="datetime-local"
                  value={taskForm.due_date || ""}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      due_date: e.target.value,
                    }))
                  }
                  className="w-full p-2 rounded bg-zinc-800 text-white bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
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
                  className="w-full p-2 rounded bg-zinc-800/50 text-white  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
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
                  className="w-full p-2 rounded bg-zinc-800/50 text-white  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="general">General</option>
                  <option value="client-related">Client Related</option>
                  <option value="equipment">Equipment</option>
                  <option value="administrative">Administrative</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
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
                  className="w-full p-2 rounded bg-zinc-800/50 text-white  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>{" "}
            {/* Reminder */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="reminder"
                checked={taskForm.reminder}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    reminder: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 bg-zinc-800/50 border-zinc-800/30 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="reminder" className="text-sm text-zinc-300">
                Set reminder for this task
              </label>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex justify-end gap-3 pb-6 pt-4 px-8 border-t border-zinc-800/30 bg-zinc-900 ">
          <button
            onClick={close}
            className="px-6 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTaskSubmit}
            disabled={!taskForm.title.trim()}
            className="px-6 py-2 bg-zinc-800/50 hover:bg-white hover:text-black disabled:bg-zinc-700 disabled:text-zinc-400 text-white  hover:border-white rounded transition-colors flex items-center gap-2"
          >
            <ClipboardCheck className="w-4 h-4" />
            {mode === "edit" ? "Update Task" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
