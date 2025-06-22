"use client";

import { useState } from "react";
import { X, Plus, Save, Activity, TrendingUp } from "lucide-react";
import axios from "@/lib/axios";

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
      const percentage =
        (((value || field.min) - field.min) / (field.max - field.min)) * 100;

      return (
        <div className="space-y-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
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
            <div className="relative">
              <input
                type="range"
                min={field.min}
                max={field.max}
                value={value || field.min}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                className={`w-full h-3 rounded-lg appearance-none cursor-pointer slider ${
                  hasError ? "slider-error" : "slider-blue"
                }`}
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #374151 ${percentage}%, #374151 100%)`,
                }}
              />
              {/* Tick marks for each value 1-10 */}
              <div className="relative mt-2 mb-3">
                <div className="flex justify-between items-end px-2">
                  {[...Array(10)].map((_, index) => {
                    const tickValue = index + 1;
                    const isActive = (value || field.min) >= tickValue;
                    const isCurrent = (value || field.min) === tickValue;
                    return (
                      <div
                        key={tickValue}
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => handleInputChange(field.key, tickValue)}
                      >
                        <div
                          className={`w-1 rounded-full transition-all duration-200 ${
                            isCurrent
                              ? "h-4 bg-blue-300 shadow-md"
                              : isActive
                              ? "h-3 bg-blue-400"
                              : "h-2 bg-zinc-600 hover:bg-zinc-500"
                          }`}
                        />
                        {/* <span
                          className={`text-xs mt-1 font-mono transition-colors duration-200 ${
                            isCurrent
                              ? "text-blue-300 font-bold"
                              : isActive
                              ? "text-blue-400"
                              : "text-zinc-500"
                          }`}
                        >
                          {tickValue}
                        </span> */}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

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
        </div>
      );
    }

    // Regular number input
    return (
      <div className="space-y-3 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">{field.icon}</span>
          <label className="text-sm font-medium text-zinc-300">
            {field.label}{" "}
            {field.unit && (
              <span className="text-zinc-500">({field.unit})</span>
            )}
          </label>
        </div>
        <div className="relative">
          <input
            type={field.type}
            step={field.step}
            min={field.min}
            max={field.max}
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={`w-full p-3 rounded-lg bg-zinc-800 border text-white placeholder-zinc-400 focus:outline-none pr-12 transition-all duration-200 ${
              hasError
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
            placeholder={field.placeholder}
          />
          {field.unit && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 text-sm font-medium">
              {field.unit}
            </span>
          )}
        </div>
        {hasError && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <span>⚠️</span>
            {hasError}
          </p>
        )}
      </div>
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
    <>
      {" "}
      {/* Custom CSS for sliders */}
      <style jsx>{`
        .slider {
          background: #374151;
          border-radius: 6px;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          cursor: pointer;
          border: 3px solid #1e293b;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3),
            0 0 0 1px rgba(59, 130, 246, 0.2);
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          background: linear-gradient(135deg, #60a5fa, #2563eb);
          box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4),
            0 0 0 2px rgba(59, 130, 246, 0.3);
          transform: scale(1.1);
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          cursor: pointer;
          border: 3px solid #1e293b;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          background: linear-gradient(135deg, #60a5fa, #2563eb);
          box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
          transform: scale(1.1);
        }

        .slider-error::-webkit-slider-thumb {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3),
            0 0 0 1px rgba(239, 68, 68, 0.2);
        }

        .slider-error::-moz-range-thumb {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
        }

        .slider:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
      `}</style>
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 bg-opacity-50 backdrop-blur-sm z-50">
        <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 relative flex flex-col rounded-xl shadow-2xl shadow-black/50 gap-8 p-8 max-w-[900px] max-h-[90vh] w-full overflow-y-auto scrollbar-dark border border-zinc-800">
          {/* Close Icon */}
          <X
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer z-10 hover:bg-zinc-800 rounded-full p-1 transition-all duration-200"
            size={28}
          />
          {/* Heading */}
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Activity className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Add Metrics</h2>
              <p className="text-zinc-400 text-sm">for {clientName}</p>
            </div>
          </div>
          {/* Error Display */}
          {errors.general && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}
          {/* Success Display */}
          {success && (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
              <p className="text-green-400 text-sm">
                ✅ Metrics saved successfully!
              </p>
            </div>
          )}{" "}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Physical Metrics Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                <TrendingUp className="text-blue-400" size={20} />
                <h3 className="text-lg font-semibold text-white">
                  Physical Metrics
                </h3>
              </div>
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
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                <Activity className="text-green-400" size={20} />
                <h3 className="text-lg font-semibold text-white">
                  Wellness Metrics
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metricFields
                  .filter((field) => field.category === "Wellness")
                  .map((field) => (
                    <div key={field.key}>{renderInputField(field)}</div>
                  ))}
              </div>
            </div>
            {/* Notes */}
            <div className="space-y-3 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <label className="text-sm font-medium text-zinc-300">
                  Notes (Optional)
                </label>
              </div>
              <textarea
                value={metrics.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all duration-200"
                placeholder="Any additional notes about these metrics..."
              />
            </div>{" "}
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-blue-500/25"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Metrics
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
