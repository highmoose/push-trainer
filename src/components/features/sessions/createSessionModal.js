"use client";

import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { Clock, User, Trash2, CheckCircle } from "lucide-react";
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
  Card,
  CardBody,
  CardHeader,
  Switch,
  Spinner,
} from "@heroui/react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  convertFromServerTime,
  convertToServerTime,
  convertForCalendar,
  getUserTimezone,
} from "@/lib/timezone";

export default function CreateSessionModal({
  close,
  initialValues = {},
  mode = "create",
  clientsHookData,
  sessionsHookData,
}) {
  // Ensure we have all required data and prevent any API calls
  if (!clientsHookData) {
    console.error("CreateSessionModal: clientsHookData is required");
    return null;
  }

  if (!sessionsHookData) {
    console.error("CreateSessionModal: sessionsHookData is required");
    return null;
  }

  const { clients, loading: clientsLoading } = clientsHookData;
  const {
    sessions,
    createSession,
    updateSession,
    deleteSession,
    cancelSession,
    completeSession,
    loading: sessionsLoading,
    error: sessionsError,
  } = sessionsHookData;

  // If we're in edit mode, ensure the session exists in our data
  if (mode === "edit" && initialValues?.id) {
    const sessionExists = sessions.find((s) => s.id === initialValues.id);
    if (!sessionExists) {
      console.warn(
        "CreateSessionModal: Session not found in current data, closing modal"
      );
      close();
      return null;
    }
  }

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReinstateConfirm, setShowReinstateConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const clientSearchRef = useRef(null);

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

  // Initialize form with existing values
  useEffect(() => {
    if (initialValues?.start_time) {
      const userTimezone = getUserTimezone();
      const serverDateTime = convertFromServerTime(
        initialValues.start_time,
        userTimezone
      );
      const duration = initialValues.end_time
        ? (convertFromServerTime(
            initialValues.end_time,
            userTimezone
          ).valueOf() -
            serverDateTime.valueOf()) /
          60000
        : 60;

      const formattedDateTime = serverDateTime.format("YYYY-MM-DDTHH:mm");

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

  // Focus client search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (clientSearchRef.current && !manualEntry) {
        clientSearchRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [manualEntry]);

  // Handler functions
  const handleSessionSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let formattedScheduledAt = null;
      if (sessionForm.scheduled_at) {
        const userTimezone = getUserTimezone();
        formattedScheduledAt = convertToServerTime(
          sessionForm.scheduled_at,
          userTimezone
        );
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

      if (mode === "edit") {
        await updateSession(initialValues.id, payload);
      } else {
        await createSession(payload);
      }

      close();
    } catch (error) {
      console.error("Session submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSessionDelete = async () => {
    if (!initialValues?.id) return;
    setIsDeleting(true);

    try {
      await deleteSession(initialValues.id);
      setShowDeleteConfirm(false);
      close();
    } catch (error) {
      console.error("Delete session error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelSession = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelSession = async () => {
    if (!initialValues?.id) return;

    try {
      await cancelSession(initialValues.id);
      setShowCancelConfirm(false);
      close();
    } catch (error) {
      console.error("Cancel session error:", error);
    }
  };

  const handleReinstateSession = () => {
    setShowReinstateConfirm(true);
  };

  const confirmReinstateSession = async () => {
    if (!initialValues?.id) return;

    try {
      // Reinstate by updating status to scheduled
      await updateSession(initialValues.id, { status: "scheduled" });
      setShowReinstateConfirm(false);
      close();
    } catch (error) {
      console.error("Reinstate session error:", error);
    }
  };

  const handleMarkComplete = () => {
    setShowCompleteConfirm(true);
  };

  const confirmMarkComplete = async () => {
    if (!initialValues?.id) return;

    try {
      await completeSession(initialValues.id);
      setShowCompleteConfirm(false);
      close();
    } catch (error) {
      console.error("Complete session error:", error);
    }
  };

  return (
    <>
      <Modal
        isOpen={true}
        onClose={close}
        size="4xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/80 backdrop-blur-sm",
          base: "bg-zinc-950 border border-zinc-900",
          header: "border-b border-zinc-800",
          body: "py-6 px-8",
          footer: "border-t border-zinc-800",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div>
              <h2 className="text-white text-xl font-bold">
                {mode === "edit" ? "Edit Session" : "New Training Session"}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                {mode === "edit"
                  ? "Update session details"
                  : "Schedule a new training session with a client"}
              </p>
            </div>
          </ModalHeader>

          <ModalBody className="space-y-4">
            {/* Client Selection Section */}
            <Card className="bg-zinc-900 border border-zinc-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-sm font-medium text-zinc-300">
                    Client Selection
                  </h3>
                  <Switch
                    isSelected={manualEntry}
                    onValueChange={setManualEntry}
                    size="sm"
                    classNames={{
                      base: "flex-row-reverse",
                      wrapper: "bg-zinc-700",
                      thumb: "bg-white",
                    }}
                  >
                    <span className="text-sm text-zinc-400">Manual Entry</span>
                  </Switch>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {manualEntry ? (
                  /* Manual Entry Mode */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      placeholder="Enter first name"
                      value={sessionForm.first_name}
                      onChange={(e) =>
                        setSessionForm((prev) => ({
                          ...prev,
                          first_name: e.target.value,
                        }))
                      }
                      variant="bordered"
                      classNames={{
                        input: "text-white",
                        inputWrapper:
                          "bg-zinc-800 border-zinc-700 hover:border-zinc-600",
                      }}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Enter last name"
                      value={sessionForm.last_name}
                      onChange={(e) =>
                        setSessionForm((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                        }))
                      }
                      variant="bordered"
                      classNames={{
                        input: "text-white",
                        inputWrapper:
                          "bg-zinc-800 border-zinc-700 hover:border-zinc-600",
                      }}
                    />
                  </div>
                ) : (
                  /* Client Search Mode */
                  <div className="space-y-2">
                    {sessionForm.client_id &&
                    sessionForm.first_name &&
                    sessionForm.last_name ? (
                      /* Selected Client Display */
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {sessionForm.first_name} {sessionForm.last_name}
                            </div>
                            <div className="text-sm text-zinc-400">
                              Selected Client
                            </div>
                          </div>
                        </div>
                        <Button
                          onPress={() => {
                            setSessionForm((prev) => ({
                              ...prev,
                              client_id: "",
                              first_name: "",
                              last_name: "",
                            }));
                            setClientSearch("");
                          }}
                          isIconOnly
                          variant="light"
                          color="danger"
                          size="sm"
                          aria-label="Remove selected client"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      /* Search Bar */
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            ref={clientSearchRef}
                            type="text"
                            placeholder="Search clients..."
                            className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                          />
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
                        </div>
                        {clientSearch && (
                          <div className="max-h-40 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded">
                            {filteredClients.length > 0 ? (
                              filteredClients.map((client) => (
                                <Button
                                  key={client.id}
                                  onPress={() => {
                                    setSessionForm((prev) => ({
                                      ...prev,
                                      client_id: client.id,
                                      first_name: client.first_name,
                                      last_name: client.last_name,
                                    }));
                                    setClientSearch("");
                                  }}
                                  variant="light"
                                  className="w-full text-left p-2 hover:bg-zinc-900 transition-colors border-b border-zinc-800 last:border-b-0 h-auto justify-start"
                                >
                                  <div>
                                    <div className="text-white font-medium">
                                      {client.first_name} {client.last_name}
                                    </div>
                                    <div className="text-zinc-400 text-sm">
                                      {client.email}
                                    </div>
                                  </div>
                                </Button>
                              ))
                            ) : (
                              <div className="p-2 text-zinc-400 text-center">
                                No clients match your search
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Session Templates */}
            <Card className="bg-zinc-900 border border-zinc-800">
              <CardHeader className="pb-3">
                <h3 className="text-sm font-medium text-zinc-300">
                  Workout Selection
                </h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {sessionTemplates.map((template) => (
                    <Button
                      key={template.id}
                      onPress={() => applyTemplate(template)}
                      variant={
                        sessionForm.session_type === template.type
                          ? "solid"
                          : "bordered"
                      }
                      color={
                        sessionForm.session_type === template.type
                          ? "primary"
                          : "default"
                      }
                      className={`p-3 h-auto transition-all text-left justify-start ${
                        sessionForm.session_type === template.type
                          ? "border-blue-500 bg-zinc-800 text-white"
                          : "border-zinc-700 bg-zinc-900 text-white hover:border-white hover:bg-white hover:text-black"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {template.name}
                        </div>
                        <div className="text-xs mt-1 opacity-70">
                          {template.duration}min • ${template.rate}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Session Details */}
            <Card className="bg-zinc-900 border border-zinc-800">
              <CardHeader className="pb-3">
                <h3 className="text-sm font-medium text-zinc-300">
                  Session Details
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
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
                      className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
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
                          className="w-20 p-2 pl-8 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="15"
                          step="15"
                          placeholder="Custom"
                        />
                        <Clock className="absolute left-2 top-3 w-4 h-4 text-zinc-600" />
                      </div>
                      <p className="text-zinc-500">-</p>
                      <div className="flex gap-1 flex-wrap">
                        {[30, 45, 60, 75, 90].map((duration) => (
                          <Button
                            key={duration}
                            onPress={() =>
                              setSessionForm((prev) => ({
                                ...prev,
                                duration: duration,
                              }))
                            }
                            size="sm"
                            variant={
                              sessionForm.duration === duration
                                ? "solid"
                                : "bordered"
                            }
                            color={
                              sessionForm.duration === duration
                                ? "primary"
                                : "default"
                            }
                            className={`px-3 py-2 text-xs transition-all ${
                              sessionForm.duration === duration
                                ? "bg-white text-zinc-900"
                                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            }`}
                          >
                            {duration}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Location"
                    placeholder="Select location"
                    selectedKeys={
                      sessionForm.location ? [sessionForm.location] : []
                    }
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      setSessionForm((prev) => ({
                        ...prev,
                        location: selected || "",
                      }));
                    }}
                    variant="bordered"
                    classNames={{
                      trigger:
                        "bg-zinc-800 border-zinc-700 hover:border-zinc-600",
                      value: "text-white",
                      popoverContent: "bg-zinc-900 border-zinc-700",
                    }}
                  >
                    {locations.map((location) => (
                      <SelectItem
                        key={location}
                        value={location}
                        className="text-white"
                      >
                        {location}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    type="number"
                    label="Rate ($)"
                    placeholder="0.00"
                    value={sessionForm.rate.toString()}
                    onChange={(e) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        rate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    variant="bordered"
                    classNames={{
                      input: "text-white",
                      inputWrapper:
                        "bg-zinc-800 border-zinc-700 hover:border-zinc-600",
                    }}
                  />
                </div>

                <Textarea
                  label="Session Notes"
                  placeholder="Add notes about this session..."
                  value={sessionForm.notes}
                  onChange={(e) =>
                    setSessionForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  variant="bordered"
                  classNames={{
                    input: "text-white",
                    inputWrapper:
                      "bg-zinc-800 border-zinc-700 hover:border-zinc-600",
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    label="Equipment Needed"
                    placeholder="List any equipment needed..."
                    value={sessionForm.equipment_needed}
                    onChange={(e) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        equipment_needed: e.target.value,
                      }))
                    }
                    variant="bordered"
                    classNames={{
                      input: "text-white",
                      inputWrapper:
                        "bg-zinc-800 border-zinc-700 hover:border-zinc-600",
                    }}
                  />

                  <Textarea
                    label="Preparation Notes"
                    placeholder="Any preparation notes..."
                    value={sessionForm.preparation_notes}
                    onChange={(e) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        preparation_notes: e.target.value,
                      }))
                    }
                    variant="bordered"
                    classNames={{
                      input: "text-white",
                      inputWrapper:
                        "bg-zinc-800 border-zinc-700 hover:border-zinc-600",
                    }}
                  />
                </div>

                <Textarea
                  label="Session Goals"
                  placeholder="What are the goals for this session?"
                  value={sessionForm.goals}
                  onChange={(e) =>
                    setSessionForm((prev) => ({
                      ...prev,
                      goals: e.target.value,
                    }))
                  }
                  variant="bordered"
                  classNames={{
                    input: "text-white",
                    inputWrapper:
                      "bg-zinc-800 border-zinc-700 hover:border-zinc-600",
                  }}
                />

                {/* Conflicts Display */}
                {conflicts.length > 0 && (
                  <Card className="bg-red-900/20 border border-red-700">
                    <CardBody>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-red-400 font-medium">
                          Schedule Conflicts Detected
                        </span>
                      </div>
                      <div className="space-y-1">
                        {conflicts.map((conflict, index) => (
                          <div key={index} className="text-sm text-red-300">
                            •{" "}
                            {dayjs(conflict.start_time).format(
                              "MMM D, YYYY h:mm A"
                            )}{" "}
                            - {conflict.first_name} {conflict.last_name}
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </CardBody>
            </Card>
          </ModalBody>

          <ModalFooter>
            <div className="flex items-center justify-between w-full">
              <div>
                {mode === "edit" && initialValues?.id && (
                  <Button
                    onPress={() => setShowDeleteConfirm(true)}
                    color="danger"
                    variant="light"
                    startContent={<Trash2 className="w-4 h-4" />}
                  >
                    Delete Session
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {mode === "edit" ? (
                  sessionForm.status === "cancelled" ? (
                    // Show only close button for cancelled sessions
                    <Button onPress={close} variant="light">
                      Close
                    </Button>
                  ) : (
                    // Show cancel session button for active sessions
                    <Button
                      onPress={handleCancelSession}
                      color="danger"
                      variant="light"
                    >
                      Cancel Session
                    </Button>
                  )
                ) : (
                  <Button onPress={close} variant="light">
                    Cancel
                  </Button>
                )}

                {mode === "edit" && sessionForm.status === "cancelled" ? (
                  // Show reinstate button for cancelled sessions
                  <Button
                    onPress={handleReinstateSession}
                    color="success"
                    startContent={<User className="w-4 h-4" />}
                  >
                    Reinstate Session
                  </Button>
                ) : mode === "edit" && sessionForm.status === "scheduled" ? (
                  // Show both Mark Complete and Update buttons for scheduled sessions
                  <div className="flex gap-2">
                    <Button
                      onPress={handleMarkComplete}
                      color="primary"
                      variant="solid"
                      startContent={<CheckCircle className="w-4 h-4" />}
                    >
                      Mark Complete
                    </Button>
                    <Button
                      onPress={handleSessionSubmit}
                      color="primary"
                      isDisabled={
                        !sessionForm.first_name ||
                        !sessionForm.last_name ||
                        !sessionForm.scheduled_at ||
                        isSubmitting
                      }
                      isLoading={isSubmitting}
                      startContent={
                        !isSubmitting ? <User className="w-4 h-4" /> : null
                      }
                    >
                      {isSubmitting ? "Updating..." : "Update Session"}
                    </Button>
                  </div>
                ) : (
                  // Show normal create/update button for other sessions
                  <Button
                    onPress={handleSessionSubmit}
                    color="primary"
                    isDisabled={
                      !sessionForm.first_name ||
                      !sessionForm.last_name ||
                      !sessionForm.scheduled_at ||
                      isSubmitting
                    }
                    isLoading={isSubmitting}
                    startContent={
                      !isSubmitting ? <User className="w-4 h-4" /> : null
                    }
                  >
                    {isSubmitting
                      ? mode === "edit"
                        ? "Updating..."
                        : "Creating..."
                      : mode === "edit"
                      ? "Update Session"
                      : "Create Session"}
                  </Button>
                )}
              </div>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleSessionDelete}
        title="Delete Session"
        message={`Are you sure you want to delete this session with ${sessionForm.first_name} ${sessionForm.last_name}? This action cannot be undone.`}
        confirmText="Delete Session"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancelSession}
        title="Cancel Session"
        message={`Are you sure you want to cancel this session with ${sessionForm.first_name} ${sessionForm.last_name}? This will mark the session as cancelled.`}
        confirmText="Cancel Session"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={showReinstateConfirm}
        onClose={() => setShowReinstateConfirm(false)}
        onConfirm={confirmReinstateSession}
        title="Reinstate Session"
        message={`Are you sure you want to reinstate this session with ${sessionForm.first_name} ${sessionForm.last_name}? The session will be reactivated as scheduled with any updates you've made to the session details.`}
        confirmText="Reinstate Session"
        variant="success"
      />

      <ConfirmationModal
        isOpen={showCompleteConfirm}
        onClose={() => setShowCompleteConfirm(false)}
        onConfirm={confirmMarkComplete}
        title="Complete Session"
        message={`Are you sure you want to mark this session with ${sessionForm.first_name} ${sessionForm.last_name} as complete?`}
        confirmText="Mark as Complete"
        variant="success"
      />
    </>
  );
}
