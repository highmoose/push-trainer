"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { ClipboardCheck, Trash2 } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Card,
  CardBody,
} from "@heroui/react";

export default function CreateTaskModal({
  close,
  initialValues = {},
  mode = "create",
  tasksHookData,
}) {
  // Ensure we have task data and prevent any API calls
  if (!tasksHookData) {
    console.error("CreateTaskModal: tasksHookData is required");
    return null;
  }

  // Use only the hook data that was passed in - no additional API calls
  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    loading: tasksLoading,
    error: tasksError,
  } = tasksHookData;

  // If we're in edit mode, ensure the task exists in our data
  if (mode === "edit" && initialValues?.id) {
    const taskExists = tasks.find((t) => t.id === initialValues.id);
    if (!taskExists) {
      console.warn(
        "CreateTaskModal: Task not found in current data, closing modal"
      );
      close();
      return null;
    }
  }
  // Add loading state to prevent duplicate submissions
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    due_date: null,
    priority: "none",
    category: "general",
    status: "pending",
    reminder: false,
    reminderTime: "15min",
    duration: 45, // Default 45 minutes
  });
  // Initialize form with initial values if provided
  useEffect(() => {
    if (initialValues) {
      let formattedDateTime = "";

      if (initialValues.due_date) {
        const dueDate = new Date(initialValues.due_date);
        const year = dueDate.getFullYear();
        const month = String(dueDate.getMonth() + 1).padStart(2, "0");
        const day = String(dueDate.getDate()).padStart(2, "0");
        const hour = String(dueDate.getHours()).padStart(2, "0");
        const minute = String(dueDate.getMinutes()).padStart(2, "0");
        formattedDateTime = `${year}-${month}-${day}T${hour}:${minute}`;
      }
      setTaskForm({
        title: initialValues.title || "",
        description: initialValues.description || "",
        due_date: formattedDateTime,
        priority: initialValues.priority || "none",
        category: initialValues.category || "general",
        status: initialValues.status || "pending",
        reminder: initialValues.reminder || false,
        reminderTime: initialValues.reminderTime || "15min",
        duration: initialValues.duration || 45,
      });
    }
  }, [initialValues]);
  const handleTaskSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);

    try {
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
        duration: taskForm.duration,
        reminder: taskForm.reminder
          ? {
              enabled: true,
              time: taskForm.reminderTime,
            }
          : null,
      };

      if (mode === "edit" && initialValues?.id) {
        // Update existing task
        await updateTask(initialValues.id, payload);
      } else {
        // Create new task
        await createTask(payload);
      }
      close();
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskDelete = async () => {
    if (!initialValues?.id || mode !== "edit") return;

    setIsDeleting(true);
    try {
      await deleteTask(initialValues.id);
      setShowDeleteConfirm(false);
      close();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={true}
        onOpenChange={(isOpen) => !isOpen && close()}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          body: "p-6",
          header: "border-b border-zinc-800",
        }}
      >
        <ModalContent className="bg-zinc-950 border border-zinc-900">
          <ModalHeader className="bg-zinc-900">
            <div className="flex flex-col">
              <h2 className="text-white text-xl font-bold">
                {mode === "edit" ? "Edit Task" : "New Personal Task"}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                {mode === "edit"
                  ? "Update task details"
                  : "Create a personal task or to-do item"}
              </p>
            </div>
          </ModalHeader>

          <ModalBody className="bg-zinc-900">
            <div className="space-y-4">
              {/* Task Title */}
              <Input
                type="text"
                label="Task Title"
                placeholder="Enter task title..."
                value={taskForm.title}
                onValueChange={(value) =>
                  setTaskForm((prev) => ({ ...prev, title: value }))
                }
                isRequired
                classNames={{
                  input: "bg-zinc-800 text-white",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                  label: "text-zinc-300",
                }}
              />

              {/* Task Description */}
              <Textarea
                label="Description"
                placeholder="Add task description..."
                value={taskForm.description}
                onValueChange={(value) =>
                  setTaskForm((prev) => ({ ...prev, description: value }))
                }
                rows={3}
                classNames={{
                  input: "bg-zinc-800 text-white resize-none",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                  label: "text-zinc-300",
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="datetime-local"
                  label="Due Date"
                  value={taskForm.due_date || ""}
                  onValueChange={(value) =>
                    setTaskForm((prev) => ({ ...prev, due_date: value }))
                  }
                  classNames={{
                    input: "bg-zinc-800 text-white",
                    inputWrapper: "bg-zinc-800 border-zinc-700",
                    label: "text-zinc-300",
                  }}
                />

                <Select
                  label="Priority"
                  placeholder="Select priority"
                  selectedKeys={taskForm.priority ? [taskForm.priority] : []}
                  onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0];
                    setTaskForm((prev) => ({
                      ...prev,
                      priority: selectedValue || "none",
                    }));
                  }}
                  classNames={{
                    trigger: "bg-zinc-800 border-zinc-700",
                    value: "text-white",
                    label: "text-zinc-300",
                    listboxWrapper: "bg-zinc-800",
                    popoverContent: "bg-zinc-800",
                  }}
                >
                  <SelectItem key="none" className="text-white">
                    None
                  </SelectItem>
                  <SelectItem key="low" className="text-white">
                    Low
                  </SelectItem>
                  <SelectItem key="medium" className="text-white">
                    Medium
                  </SelectItem>
                  <SelectItem key="high" className="text-white">
                    High
                  </SelectItem>
                </Select>

                <Input
                  type="number"
                  label="Duration (minutes)"
                  placeholder="45"
                  min={15}
                  max={480}
                  step={15}
                  value={taskForm.duration.toString()}
                  onValueChange={(value) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      duration: parseInt(value) || 45,
                    }))
                  }
                  description="How long you expect this task to take (15min increments)"
                  classNames={{
                    input: "bg-zinc-800 text-white",
                    inputWrapper: "bg-zinc-800 border-zinc-700",
                    label: "text-zinc-300",
                    description: "text-zinc-500",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  placeholder="Select category"
                  selectedKeys={taskForm.category ? [taskForm.category] : []}
                  onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0];
                    setTaskForm((prev) => ({
                      ...prev,
                      category: selectedValue || "general",
                    }));
                  }}
                  classNames={{
                    trigger: "bg-zinc-800 border-zinc-700",
                    value: "text-white",
                    label: "text-zinc-300",
                    listboxWrapper: "bg-zinc-800",
                    popoverContent: "bg-zinc-800",
                  }}
                >
                  <SelectItem key="general" className="text-white">
                    General
                  </SelectItem>
                  <SelectItem key="client-related" className="text-white">
                    Client Related
                  </SelectItem>
                  <SelectItem key="equipment" className="text-white">
                    Equipment
                  </SelectItem>
                  <SelectItem key="administrative" className="text-white">
                    Administrative
                  </SelectItem>
                </Select>

                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={taskForm.status ? [taskForm.status] : []}
                  onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0];
                    setTaskForm((prev) => ({
                      ...prev,
                      status: selectedValue || "pending",
                    }));
                  }}
                  classNames={{
                    trigger: "bg-zinc-800 border-zinc-700",
                    value: "text-white",
                    label: "text-zinc-300",
                    listboxWrapper: "bg-zinc-800",
                    popoverContent: "bg-zinc-800",
                  }}
                >
                  <SelectItem key="pending" className="text-white">
                    Pending
                  </SelectItem>
                  <SelectItem key="completed" className="text-white">
                    Completed
                  </SelectItem>
                </Select>
              </div>

              {/* Reminder */}
              <Card className="bg-zinc-900 border border-zinc-800">
                <CardBody className="p-4">
                  <div className="space-y-3">
                    <Switch
                      isSelected={taskForm.reminder}
                      onValueChange={(checked) =>
                        setTaskForm((prev) => ({ ...prev, reminder: checked }))
                      }
                      classNames={{
                        base: "flex-row-reverse justify-between w-full max-w-none",
                        wrapper: "bg-zinc-700",
                        thumb: "bg-white",
                        label: "text-zinc-300",
                      }}
                    >
                      Set reminder for this task
                    </Switch>

                    {taskForm.reminder && (
                      <div className="ml-0 pt-2">
                        <Select
                          label="Reminder Time"
                          placeholder="Select reminder time"
                          selectedKeys={
                            taskForm.reminderTime ? [taskForm.reminderTime] : []
                          }
                          onSelectionChange={(keys) => {
                            const selectedValue = Array.from(keys)[0];
                            setTaskForm((prev) => ({
                              ...prev,
                              reminderTime: selectedValue || "15min",
                            }));
                          }}
                          className="max-w-48"
                          classNames={{
                            trigger: "bg-zinc-800 border-zinc-700",
                            value: "text-white",
                            label: "text-zinc-300",
                            listboxWrapper: "bg-zinc-800",
                            popoverContent: "bg-zinc-800",
                          }}
                        >
                          <SelectItem key="15min" className="text-white">
                            15 minutes before
                          </SelectItem>
                          <SelectItem key="30min" className="text-white">
                            30 minutes before
                          </SelectItem>
                          <SelectItem key="1hour" className="text-white">
                            1 hour before
                          </SelectItem>
                          <SelectItem key="1day" className="text-white">
                            1 day before
                          </SelectItem>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </ModalBody>

          <ModalFooter className="bg-zinc-900 border-t border-zinc-800">
            <div className="flex justify-between w-full">
              <div>
                {mode === "edit" && initialValues?.id && (
                  <Button
                    onPress={() => setShowDeleteConfirm(true)}
                    variant="ghost"
                    color="danger"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Task
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onPress={close}
                  variant="ghost"
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleTaskSubmit}
                  isDisabled={!taskForm.title.trim() || isSubmitting}
                  isLoading={isSubmitting}
                  color="primary"
                  className="bg-zinc-800 hover:bg-white hover:text-black text-white"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  {mode === "edit" ? "Update Task" : "Create Task"}
                </Button>
              </div>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleTaskDelete}
        title="Delete Task"
        message={`Are you sure you want to delete the task "${taskForm.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
