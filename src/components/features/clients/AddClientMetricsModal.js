"use client";

import { useState } from "react";
import { X, Plus, Save, Activity, TrendingUp } from "lucide-react";
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
  Card,
  CardBody,
  Slider,
  Divider,
} from "@heroui/react";

export default function AddClientMetricsModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  onMetricsAdded,
}) {
  const [metrics, setMetrics] = useState({
    weight: "",
    body_fat_percentage: "",
    muscle_mass: "",
    hunger_level: "",
    energy_level: "",
    sleep_hours: "",
    water_intake: "",
    stress_level: "",
    mood_level: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const metricFields = [
    {
      key: "weight",
      label: "Weight",
      type: "number",
      step: "0.1",
      unit: "kg",
      inputType: "number",
      placeholder: "Enter weight in kg",
      icon: "⚖️",
      category: "Physical",
    },
    {
      key: "body_fat_percentage",
      label: "Body Fat",
      type: "number",
      step: "0.1",
      unit: "%",
      inputType: "number",
      placeholder: "Enter body fat %",
      icon: "📊",
      category: "Physical",
    },
    {
      key: "muscle_mass",
      label: "Muscle Mass",
      type: "number",
      step: "0.1",
      unit: "kg",
      inputType: "number",
      placeholder: "Enter muscle mass in kg",
      icon: "💪",
      category: "Physical",
    },
    {
      key: "hunger_level",
      label: "Hunger Level",
      type: "range",
      min: 1,
      max: 10,
      inputType: "slider",
      unit: "",
      scaleLabels: ["Very Low", "Low", "Moderate", "High", "Very High"],
      icon: "🍽️",
      category: "Wellness",
    },
    {
      key: "energy_level",
      label: "Energy Level",
      type: "range",
      min: 1,
      max: 10,
      inputType: "slider",
      unit: "",
      scaleLabels: ["Exhausted", "Low", "Moderate", "High", "Energized"],
      icon: "⚡",
      category: "Wellness",
    },
    {
      key: "sleep_hours",
      label: "Sleep Hours",
      type: "number",
      step: "0.5",
      unit: "hours",
      inputType: "number",
      placeholder: "Hours of sleep",
      icon: "😴",
      category: "Wellness",
    },
    {
      key: "water_intake",
      label: "Water Intake",
      type: "number",
      step: "0.1",
      unit: "L",
      inputType: "number",
      placeholder: "Liters of water",
      icon: "💧",
      category: "Wellness",
    },
    {
      key: "stress_level",
      label: "Stress Level",
      type: "range",
      min: 1,
      max: 10,
      inputType: "slider",
      unit: "",
      scaleLabels: ["Very Low", "Low", "Moderate", "High", "Very High"],
      icon: "😰",
      category: "Wellness",
    },
    {
      key: "mood_level",
      label: "Mood",
      type: "range",
      min: 1,
      max: 10,
      inputType: "slider",
      unit: "",
      scaleLabels: ["Very Poor", "Poor", "Fair", "Good", "Excellent"],
      icon: "😊",
      category: "Wellness",
    },
  ];
  const handleInputChange = (key, value) => {
    setMetrics((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };
  // Component for rendering different input types
  const renderInputField = (field) => {
    const value = metrics[field.key];
    const hasError = errors[field.key];

    if (field.inputType === "slider") {
      return (
        <Card className="bg-zinc-900/50 border border-zinc-800">
          <CardBody className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{field.icon}</span>
                <label className="text-sm font-medium text-zinc-300">
                  {field.label}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-400">
                  {value || field.min}
                </span>
                <span className="text-xs text-zinc-500">/ {field.max}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Slider
                size="md"
                step={1}
                minValue={field.min}
                maxValue={field.max}
                value={Number(value) || field.min}
                onChange={(val) => handleInputChange(field.key, val.toString())}
                className="w-full"
                classNames={{
                  base: "max-w-none",
                  track: "bg-zinc-700",
                  filler: "bg-blue-500",
                  thumb: "bg-blue-500 border-2 border-zinc-900 shadow-lg",
                }}
              />

              {field.scaleLabels && (
                <div className="flex justify-between text-xs text-zinc-400 px-1">
                  <span className="text-left">{field.scaleLabels[0]}</span>
                  <span className="text-center">{field.scaleLabels[2]}</span>
                  <span className="text-right">{field.scaleLabels[4]}</span>
                </div>
              )}
            </div>

            {hasError && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <span>⚠️</span>
                {hasError}
              </p>
            )}
          </CardBody>
        </Card>
      );
    }

    // Regular number input
    return (
      <Card className="bg-zinc-900/50 border border-zinc-800">
        <CardBody className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{field.icon}</span>
            <label className="text-sm font-medium text-zinc-300">
              {field.label}{" "}
              {field.unit && (
                <span className="text-zinc-500">({field.unit})</span>
              )}
            </label>
          </div>

          <Input
            type={field.type}
            step={field.step}
            min={field.min}
            max={field.max}
            value={value}
            onValueChange={(val) => handleInputChange(field.key, val)}
            placeholder={field.placeholder}
            endContent={
              field.unit && (
                <span className="text-zinc-400 text-sm font-medium">
                  {field.unit}
                </span>
              )
            }
            isInvalid={!!hasError}
            errorMessage={hasError}
            classNames={{
              input: "bg-zinc-800 text-white",
              inputWrapper: hasError
                ? "bg-zinc-800 border-red-500 focus-within:border-red-500"
                : "bg-zinc-800 border-zinc-700 focus-within:border-blue-500",
            }}
          />
        </CardBody>
      </Card>
    );
  };

  const validateForm = () => {
    const newErrors = {};

    // At least one metric should be filled
    const hasAnyMetric = Object.entries(metrics).some(
      ([key, value]) => key !== "notes" && value !== ""
    );

    if (!hasAnyMetric) {
      newErrors.general = "Please enter at least one metric";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Filter out empty metrics
      const metricsToSend = Object.fromEntries(
        Object.entries(metrics).filter(([key, value]) => value !== "")
      );

      const response = await axios.post("/api/client-metrics", {
        client_id: clientId,
        ...metricsToSend,
      });
      const data = response.data;
      if (data.success) {
        setSuccess(true);
        setErrors({});

        // Reset form
        setMetrics({
          weight: "",
          body_fat_percentage: "",
          muscle_mass: "",
          hunger_level: "",
          energy_level: "",
          sleep_hours: "",
          water_intake: "",
          stress_level: "",
          mood_level: "",
          notes: "",
        });

        onMetricsAdded?.(data.data);

        // Close modal after a short delay to show success message
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        setErrors({ general: data.message || "Failed to save metrics" });
      }
    } catch (error) {
      console.error("Error saving metrics:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.details && typeof errorData.details === "object") {
          // Handle validation errors
          const validationErrors = {};
          Object.keys(errorData.details).forEach((field) => {
            const fieldErrors = errorData.details[field];
            if (Array.isArray(fieldErrors)) {
              validationErrors[field] = fieldErrors.join(", ");
            } else {
              validationErrors[field] = fieldErrors;
            }
          });
          validationErrors.general = errorData.error || "Validation failed";
          setErrors(validationErrors);
        } else {
          setErrors({
            general: errorData.message || errorData.error || "Request failed",
          });
        }
      } else {
        setErrors({ general: "Network error. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="5xl"
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
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Activity className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Add Metrics</h2>
              <p className="text-zinc-400 text-sm">for {clientName}</p>
            </div>
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

          {/* Success Display */}
          {success && (
            <Card className="bg-green-900/20 border border-green-500">
              <CardBody className="p-4">
                <p className="text-green-400 text-sm">
                  ✅ Metrics saved successfully!
                </p>
              </CardBody>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Physical Metrics Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <TrendingUp className="text-blue-400" size={20} />
                <h3 className="text-lg font-semibold text-white">
                  Physical Metrics
                </h3>
              </div>
              <Divider className="bg-zinc-800" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metricFields
                  .filter((field) => field.category === "Physical")
                  .map((field) => (
                    <div key={field.key}>{renderInputField(field)}</div>
                  ))}
              </div>
            </div>

            {/* Wellness Metrics Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <Activity className="text-green-400" size={20} />
                <h3 className="text-lg font-semibold text-white">
                  Wellness Metrics
                </h3>
              </div>
              <Divider className="bg-zinc-800" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metricFields
                  .filter((field) => field.category === "Wellness")
                  .map((field) => (
                    <div key={field.key}>{renderInputField(field)}</div>
                  ))}
              </div>
            </div>

            {/* Notes */}
            <Card className="bg-zinc-900/50 border border-zinc-800">
              <CardBody className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <label className="text-sm font-medium text-zinc-300">
                    Notes (Optional)
                  </label>
                </div>
                <Textarea
                  value={metrics.notes}
                  onValueChange={(value) => handleInputChange("notes", value)}
                  rows={3}
                  placeholder="Any additional notes about these metrics..."
                  classNames={{
                    input: "bg-zinc-800 text-white resize-none",
                    inputWrapper: "bg-zinc-800 border-zinc-700",
                  }}
                />
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
            color="primary"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/25"
          >
            <Save size={16} />
            Save Metrics
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
