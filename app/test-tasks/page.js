// Test component to verify task creation functionality
"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTask, fetchTasks } from "@/redux/slices/taskSlice";
import { login } from "@/redux/slices/authSlice";

export default function TaskTestPage() {
  const dispatch = useDispatch();
  const { list: tasks, status, error } = useSelector((state) => state.tasks);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [testResult, setTestResult] = useState("");

  const handleLogin = async () => {
    try {
      setTestResult("Logging in...");
      await dispatch(
        login({
          email: "trainer1@example.com",
          password: "password123",
        })
      ).unwrap();
      setTestResult("Login successful!");
    } catch (error) {
      setTestResult(`Login failed: ${error}`);
    }
  };

  const handleCreateTask = async () => {
    try {
      setTestResult("Creating task...");
      const taskData = {
        title: "Frontend Test Task",
        description: "Testing task creation from frontend",
        due_date: "2025-06-17 15:00:00",
        priority: "high",
        category: "general",
        status: "pending",
        reminder: {
          enabled: true,
          time: "15min",
        },
      };

      await dispatch(createTask(taskData)).unwrap();
      setTestResult("Task created successfully!");

      // Fetch updated tasks
      await dispatch(fetchTasks());
    } catch (error) {
      setTestResult(`Task creation failed: ${error}`);
    }
  };

  const handleFetchTasks = async () => {
    try {
      setTestResult("Fetching tasks...");
      await dispatch(fetchTasks()).unwrap();
      setTestResult(`Fetched ${tasks.length} tasks`);
    } catch (error) {
      setTestResult(`Fetch failed: ${error}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Task API Test Page</h1>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
        <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
        {user && (
          <p>
            User: {user.first_name} {user.last_name} ({user.email})
          </p>
        )}
      </div>

      <div className="mb-6 space-x-4">
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isAuthenticated}
        >
          Login as Test Trainer
        </button>

        <button
          onClick={handleCreateTask}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={!isAuthenticated}
        >
          Create Test Task
        </button>

        <button
          onClick={handleFetchTasks}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          disabled={!isAuthenticated}
        >
          Fetch Tasks
        </button>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Test Result</h2>
        <p className={error ? "text-red-600" : "text-green-600"}>
          {testResult || "No tests run yet"}
        </p>
        {error && <p className="text-red-600 mt-2">Error: {error}</p>}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Tasks ({tasks.length})</h2>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="p-3 border rounded">
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-gray-600">{task.description}</p>
              <div className="text-xs text-gray-500 mt-1">
                Priority: {task.priority} | Status: {task.status} | Due:{" "}
                {task.due_date}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>Task Status: {status}</p>
        <p>Server URLs:</p>
        <p>- Laravel API: http://127.0.0.1:8001</p>
        <p>- Next.js Frontend: http://localhost:3003</p>
      </div>
    </div>
  );
}
