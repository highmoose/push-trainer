"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { X, Send, Calendar, Camera, Scale } from "lucide-react";
import { addMessage } from "@/store/slices/messagingSlice";
import axios from "@/lib/axios";
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
  CheckboxGroup,
  Checkbox,
  Card,
  CardBody,
} from "@heroui/react";

export default function CreateWeighInRequestModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  authUserId,
  onRequestCreated,
}) {
  const dispatch = useDispatch();
  const [requestData, setRequestData] = useState({
    title: "",
    description: "",
    requested_metrics: [],
    requested_photos: [],
    due_date: "",
    priority: "medium",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const availableMetrics = [
    { id: "weight", label: "Weight" },
    { id: "body_fat_percentage", label: "Body Fat %" },
    { id: "muscle_mass", label: "Muscle Mass" },
    { id: "hunger_level", label: "Hunger Level" },
    { id: "energy_level", label: "Energy Level" },
    { id: "sleep_hours", label: "Sleep Hours" },
    { id: "water_intake", label: "Water Intake" },
    { id: "stress_level", label: "Stress Level" },
    { id: "mood", label: "Mood" },
  ];

  const availablePhotos = [
    { id: "front", label: "Front View" },
    { id: "side", label: "Side View" },
    { id: "back", label: "Back View" },
    { id: "bicep_flex", label: "Bicep Flex" },
    { id: "ab_flex", label: "Ab Flex" },
    { id: "leg_flex", label: "Leg Flex" },
    { id: "progress_general", label: "General Progress" },
  ];

  const handleMetricToggle = (metricId) => {
    setRequestData((prev) => ({
      ...prev,
      requested_metrics: prev.requested_metrics.includes(metricId)
        ? prev.requested_metrics.filter((m) => m !== metricId)
        : [...prev.requested_metrics, metricId],
    }));
  };

  const handlePhotoToggle = (photoId) => {
    setRequestData((prev) => ({
      ...prev,
      requested_photos: prev.requested_photos.includes(photoId)
        ? prev.requested_photos.filter((p) => p !== photoId)
        : [...prev.requested_photos, photoId],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!requestData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (
      requestData.requested_metrics.length === 0 &&
      requestData.requested_photos.length === 0
    ) {
      newErrors.general =
        "Please select at least one metric or photo to request";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🚀 CreateWeighInRequestModal - handleSubmit called");
    console.log("🚀 Form data:", requestData);
    console.log("🚀 Client ID:", clientId);
    console.log("🚀 Auth User ID:", authUserId);

    if (!validateForm()) return;
    setLoading(true);

    const requestBody = {
      client_id: clientId,
      ...requestData,
    };

    console.log("Sending request body:", requestBody);
    try {
      const response = await axios.post("/api/weigh-in-requests", requestBody);
      const data = response.data;

      console.log("✅ API responded with:", data);
      if (data.success) {
        console.log("✅ Check-in request created successfully:", data.data);

        // Call the callback
        onRequestCreated?.(data.data);

        // Reset form
        setRequestData({
          title: "",
          description: "",
          requested_metrics: [],
          requested_photos: [],
          due_date: "",
          priority: "medium",
        });

        onClose();
      } else {
        setErrors({ general: data.message || "Failed to create request" });
      }
    } catch (error) {
      console.error("Error creating check-in request:", error);
      if (error.response?.data) {
        setErrors({ general: error.response.data.message || "Request failed" });
      } else {
        setErrors({ general: "Network error. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "p-6",
        header: "border-b border-zinc-800",
      }}
    >
      <ModalContent className="bg-zinc-950 border border-zinc-900">
        <ModalHeader className="bg-zinc-900">
          <div className="flex items-center gap-3">
            <Scale className="text-green-400" size={24} />
            <h2 className="text-white text-xl font-semibold">
              Create Check-in Request for {clientName}
            </h2>
          </div>
        </ModalHeader>

        <ModalBody className="bg-zinc-900">
          {/* Error Display */}
          {errors.general && (
            <Card className="bg-red-900/20 border border-red-500">
              <CardBody className="p-4">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </CardBody>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Request Title"
                placeholder="e.g., Weekly Check-in"
                value={requestData.title}
                onValueChange={(value) =>
                  setRequestData((prev) => ({ ...prev, title: value }))
                }
                isRequired
                isInvalid={!!errors.title}
                errorMessage={errors.title}
                classNames={{
                  input: "bg-zinc-800 text-white",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                  label: "text-zinc-300",
                }}
              />

              <Select
                label="Priority"
                placeholder="Select priority"
                selectedKeys={[requestData.priority]}
                onSelectionChange={(keys) => {
                  const selectedValue = Array.from(keys)[0];
                  setRequestData((prev) => ({
                    ...prev,
                    priority: selectedValue,
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
            </div>

            {/* Due Date */}
            <Input
              type="date"
              label="Due Date (Optional)"
              value={requestData.due_date}
              min={minDate}
              onValueChange={(value) =>
                setRequestData((prev) => ({ ...prev, due_date: value }))
              }
              startContent={<Calendar size={16} className="text-zinc-400" />}
              classNames={{
                input: "bg-zinc-800 text-white",
                inputWrapper: "bg-zinc-800 border-zinc-700",
                label: "text-zinc-300",
              }}
            />

            {/* Description */}
            <Textarea
              label="Description (Optional)"
              placeholder="Additional instructions or notes for the client..."
              value={requestData.description}
              onValueChange={(value) =>
                setRequestData((prev) => ({ ...prev, description: value }))
              }
              rows={3}
              classNames={{
                input: "bg-zinc-800 text-white resize-none",
                inputWrapper: "bg-zinc-800 border-zinc-700",
                label: "text-zinc-300",
              }}
            />

            {/* Requested Metrics */}
            <Card className="bg-zinc-900/50 border border-zinc-800">
              <CardBody className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Scale size={16} className="text-zinc-400" />
                  <label className="text-sm font-medium text-zinc-300">
                    Requested Metrics
                  </label>
                </div>

                <CheckboxGroup
                  value={requestData.requested_metrics}
                  onValueChange={(value) =>
                    setRequestData((prev) => ({
                      ...prev,
                      requested_metrics: value,
                    }))
                  }
                  classNames={{
                    wrapper: "grid grid-cols-2 md:grid-cols-3 gap-2",
                  }}
                >
                  {availableMetrics.map((metric) => (
                    <Checkbox
                      key={metric.id}
                      value={metric.id}
                      classNames={{
                        base: "flex items-center gap-2 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors w-full max-w-none",
                        wrapper: "after:bg-blue-500 after:border-blue-500",
                        label: "text-sm text-zinc-300",
                      }}
                    >
                      {metric.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </CardBody>
            </Card>

            {/* Requested Photos */}
            <Card className="bg-zinc-900/50 border border-zinc-800">
              <CardBody className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-zinc-400" />
                  <label className="text-sm font-medium text-zinc-300">
                    Requested Photos
                  </label>
                </div>

                <CheckboxGroup
                  value={requestData.requested_photos}
                  onValueChange={(value) =>
                    setRequestData((prev) => ({
                      ...prev,
                      requested_photos: value,
                    }))
                  }
                  classNames={{
                    wrapper: "grid grid-cols-2 md:grid-cols-3 gap-2",
                  }}
                >
                  {availablePhotos.map((photo) => (
                    <Checkbox
                      key={photo.id}
                      value={photo.id}
                      classNames={{
                        base: "flex items-center gap-2 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors w-full max-w-none",
                        wrapper: "after:bg-blue-500 after:border-blue-500",
                        label: "text-sm text-zinc-300",
                      }}
                    >
                      {photo.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </CardBody>
            </Card>
          </form>
        </ModalBody>

        <ModalFooter className="bg-zinc-900 border-t border-zinc-800">
          <Button
            onPress={onClose}
            variant="ghost"
            className="text-zinc-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            isLoading={loading}
            color="success"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Send size={16} />
            Send Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
