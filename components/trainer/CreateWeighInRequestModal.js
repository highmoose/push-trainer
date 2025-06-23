"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { X, Send, Calendar, Camera, Scale } from "lucide-react";
import { addMessage } from "@/redux/slices/messagingSlice";
import axios from "@/lib/axios";

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
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 bg-opacity-50 backdrop-blur-xs z-50">
      <div className="bg-zinc-950 relative flex flex-col rounded-xl shadow-2xl shadow-white/10 gap-6 p-8 max-w-[900px] max-h-[90vh] w-full overflow-y-auto scrollbar-dark">
        {" "}
        {/* Close Icon */}
        <X
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer z-10"
          size={22}
        />
        {/* Heading */}
        <div className="flex items-center gap-3">
          <Scale className="text-green-400" size={24} />
          <h2 className="text-white text-xl font-semibold">
            Create Check-in Request for {clientName}
          </h2>
        </div>
        {/* Error Display */}
        {errors.general && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 text-sm">{errors.general}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Request Title *
              </label>
              <input
                type="text"
                value={requestData.title}
                onChange={(e) =>
                  setRequestData((prev) => ({ ...prev, title: e.target.value }))
                }
                className={`w-full p-3 rounded-lg bg-zinc-800 border text-white placeholder-zinc-400 focus:outline-none ${
                  errors.title
                    ? "border-red-500"
                    : "border-zinc-700 focus:border-blue-500"
                }`}
                placeholder="e.g., Weekly Check-in"
              />
              {errors.title && (
                <p className="text-red-400 text-xs">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Priority
              </label>
              <select
                value={requestData.priority}
                onChange={(e) =>
                  setRequestData((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
                className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Calendar size={16} />
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={requestData.due_date}
              min={minDate}
              onChange={(e) =>
                setRequestData((prev) => ({
                  ...prev,
                  due_date: e.target.value,
                }))
              }
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Description (Optional)
            </label>
            <textarea
              value={requestData.description}
              onChange={(e) =>
                setRequestData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Additional instructions or notes for the client..."
            />
          </div>

          {/* Requested Metrics */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Scale size={16} />
              Requested Metrics
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableMetrics.map((metric) => (
                <label
                  key={metric.id}
                  className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800 cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={requestData.requested_metrics.includes(metric.id)}
                    onChange={() => handleMetricToggle(metric.id)}
                    className="rounded border-zinc-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-zinc-300">{metric.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Requested Photos */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Camera size={16} />
              Requested Photos
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availablePhotos.map((photo) => (
                <label
                  key={photo.id}
                  className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800 cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={requestData.requested_photos.includes(photo.id)}
                    onChange={() => handlePhotoToggle(photo.id)}
                    className="rounded border-zinc-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-zinc-300">{photo.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
