import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    high_priority: 0,
    due_today: 0,
    due_this_week: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all tasks with optional filters
  const fetchTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.overdue) params.overdue = "true";

      const response = await api.get("/api/tasks", { params });
      
      setTasks(response.data.tasks);
      return { success: true, data: response.data.tasks };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch tasks";
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch task statistics
  const fetchTaskStatistics = useCallback(async () => {
    try {
      const response = await api.get("/api/tasks/statistics");
      setStatistics(response.data.statistics);
      return { success: true, data: response.data.statistics };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch task statistics";
      setError(errorMessage);
      console.error('Error fetching task statistics:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Create task (optimistic)
  const createTask = useCallback(async (taskData) => {
    setError(null);
    
    // Create optimistic task with temporary ID
    const optimisticTask = {
      ...taskData,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistically add to state
    setTasks(prev => [...prev, optimisticTask]);
    setStatistics(prev => ({
      ...prev,
      total: prev.total + 1,
      pending: taskData.status === "pending" ? prev.pending + 1 : prev.pending,
      completed: taskData.status === "completed" ? prev.completed + 1 : prev.completed,
    }));

    try {
      const response = await api.post("/api/tasks", taskData);
      const createdTask = response.data.task;
      
      // Replace optimistic task with real one
      setTasks(prev => prev.map(task => 
        task.id === optimisticTask.id ? createdTask : task
      ));
      
      return { success: true, data: createdTask };
    } catch (err) {
      // Rollback optimistic updates
      setTasks(prev => prev.filter(task => task.id !== optimisticTask.id));
      setStatistics(prev => ({
        ...prev,
        total: prev.total - 1,
        pending: taskData.status === "pending" ? prev.pending - 1 : prev.pending,
        completed: taskData.status === "completed" ? prev.completed - 1 : prev.completed,
      }));
      
      const errorMessage = err.response?.data?.message || "Failed to create task";
      setError(errorMessage);
      console.error('Error creating task:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Update task (optimistic) - removed circular dependencies
  const updateTask = useCallback(async (id, updates) => {
    setError(null);
    
    // Use functional state updates to avoid dependencies
    let originalTask = null;
    let originalStats = null;
    
    setTasks(prev => {
      originalTask = prev.find(t => t.id === id);
      if (!originalTask) return prev;
      return prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      );
    });

    if (!originalTask) {
      setError("Task not found");
      return { success: false, message: "Task not found" };
    }

    // Update statistics if status changed
    if (updates.status && originalTask.status !== updates.status) {
      setStatistics(prev => {
        originalStats = prev;
        const newStats = { ...prev };
        
        // Decrement old status count
        if (originalTask.status === "pending") newStats.pending -= 1;
        if (originalTask.status === "completed") newStats.completed -= 1;
        
        // Increment new status count
        if (updates.status === "pending") newStats.pending += 1;
        if (updates.status === "completed") newStats.completed += 1;
        
        return newStats;
      });
    }

    try {
      const response = await api.put(`/api/tasks/${id}`, updates);
      const updatedTask = response.data.task;
      
      // Update with server response
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      
      return { success: true, data: updatedTask };
    } catch (err) {
      // Rollback optimistic updates
      setTasks(prev => prev.map(task => 
        task.id === id ? originalTask : task
      ));
      if (originalStats) {
        setStatistics(originalStats);
      }
      
      const errorMessage = err.response?.data?.message || "Failed to update task";
      setError(errorMessage);
      console.error('Error updating task:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Complete task (optimistic)
  const completeTask = useCallback(async (id) => {
    setError(null);
    
    let originalTask = null;
    
    // Optimistically update state
    setTasks(prev => {
      originalTask = prev.find(t => t.id === id);
      if (!originalTask) return prev;
      return prev.map(task => 
        task.id === id ? { ...task, status: "completed", completed_at: new Date().toISOString() } : task
      );
    });

    if (!originalTask) {
      setError("Task not found");
      return { success: false, message: "Task not found" };
    }

    // Update statistics
    setStatistics(prev => ({
      ...prev,
      completed: prev.completed + 1,
      pending: originalTask.status === "pending" ? prev.pending - 1 : prev.pending,
    }));

    try {
      const response = await api.patch(`/api/tasks/${id}/complete`);
      const completedTask = response.data.task;
      
      // Update with server response
      setTasks(prev => prev.map(task => 
        task.id === id ? completedTask : task
      ));
      
      return { success: true, data: completedTask };
    } catch (err) {
      // Rollback optimistic updates
      setTasks(prev => prev.map(task => 
        task.id === id ? originalTask : task
      ));
      setStatistics(prev => ({
        ...prev,
        completed: prev.completed - 1,
        pending: originalTask.status === "pending" ? prev.pending + 1 : prev.pending,
      }));
      
      const errorMessage = err.response?.data?.message || "Failed to complete task";
      setError(errorMessage);
      console.error('Error completing task:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Delete task (optimistic)
  const deleteTask = useCallback(async (id) => {
    setError(null);
    
    let originalTask = null;
    
    // Optimistically remove from state
    setTasks(prev => {
      originalTask = prev.find(t => t.id === id);
      if (!originalTask) return prev;
      return prev.filter(task => task.id !== id);
    });

    if (!originalTask) {
      setError("Task not found");
      return { success: false, message: "Task not found" };
    }

    // Update statistics
    setStatistics(prev => ({
      ...prev,
      total: prev.total - 1,
      pending: originalTask.status === "pending" ? prev.pending - 1 : prev.pending,
      completed: originalTask.status === "completed" ? prev.completed - 1 : prev.completed,
    }));

    try {
      await api.delete(`/api/tasks/${id}`);
      return { success: true };
    } catch (err) {
      // Rollback optimistic updates
      setTasks(prev => [...prev, originalTask]);
      setStatistics(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: originalTask.status === "pending" ? prev.pending + 1 : prev.pending,
        completed: originalTask.status === "completed" ? prev.completed + 1 : prev.completed,
      }));
      
      const errorMessage = err.response?.data?.message || "Failed to delete task";
      setError(errorMessage);
      console.error('Error deleting task:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Load tasks and statistics on mount
  useEffect(() => {
    fetchTasks();
    fetchTaskStatistics();
  }, [fetchTasks, fetchTaskStatistics]);

  return {
    // Data
    tasks,
    statistics,
    loading,
    error,
    
    // Actions
    fetchTasks,
    fetchTaskStatistics,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
  };
};

export default useTasks;
