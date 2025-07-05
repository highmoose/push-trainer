"use client";

import { useState, useEffect } from "react";
import { X, Upload, Save, Camera, Scale, CheckCircle } from "lucide-react";
import {
  Home,
  MessageSquare,
  Calendar,
  Users,
  Dumbbell,
  UserPlus,
  Utensils,
} from "lucide-react";
import axios from "@/lib/axios";

export default function WeighInRequestResponseModal({
  isOpen,
  onClose,
  request,
  onCompleted,
  authUserId, // Add this prop to get the authenticated user ID
}) {
  const [metrics, setMetrics] = useState({});
  const [photos, setPhotos] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingPhotos, setUploadingPhotos] = useState({});

  const metricLabels = {
    weight: "Weight (kg)",
    body_fat_percentage: "Body Fat %",
    muscle_mass: "Muscle Mass (kg)",
    hunger_level: "Hunger Level (1-10)",
    energy_level: "Energy Level (1-10)",
    sleep_hours: "Sleep Hours",
    water_intake: "Water Intake (L)",
    stress_level: "Stress Level (1-10)",
    mood: "Mood (1-10)",
  };

  const photoLabels = {
    front: "Front View",
    side: "Side View",
    back: "Back View",
    bicep_flex: "Bicep Flex",
    ab_flex: "Ab Flex",
    leg_flex: "Leg Flex",
    progress_general: "General Progress",
  };

  useEffect(() => {
    // Initialize metrics with empty values for requested metrics
    const initialMetrics = {};
    (request.requested_metrics || []).forEach((metric) => {
      initialMetrics[metric] = "";
    });
    setMetrics(initialMetrics);
  }, [request]);

  const handleMetricChange = (metric, value) => {
    setMetrics((prev) => ({ ...prev, [metric]: value }));
    if (errors[metric]) {
      setErrors((prev) => ({ ...prev, [metric]: null }));
    }
  };

  const handlePhotoUpload = async (photoType, file) => {
    if (!file) return;

    setUploadingPhotos((prev) => ({ ...prev, [photoType]: true }));

    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("client_id", request.client_id);
      formData.append("photo_type", "progress");
      formData.append("pose_type", photoType);
      formData.append("weigh_in_request_id", request.id);
      const response = await axios.post("/api/client-photos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      if (data.success) {
        setPhotos((prev) => ({ ...prev, [photoType]: data.data }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [photoType]: data.message || "Upload failed",
        }));
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      setErrors((prev) => ({ ...prev, [photoType]: "Upload failed" }));
    } finally {
      setUploadingPhotos((prev) => ({ ...prev, [photoType]: false }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Check if all requested metrics are filled
    (request.requested_metrics || []).forEach((metric) => {
      if (!metrics[metric] || metrics[metric] === "") {
        newErrors[metric] = "This metric is required";
      }
    });

    // Check if all requested photos are uploaded
    (request.requested_photos || []).forEach((photoType) => {
      if (!photos[photoType]) {
        newErrors[photoType] = "This photo is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Submit metrics if any were requested
      if (request.requested_metrics && request.requested_metrics.length > 0) {
        const response = await axios.post("/api/client-metrics", {
          client_id: request.client_id,
          weigh_in_request_id: request.id,
          ...Object.fromEntries(
            Object.entries(metrics).filter(([key, value]) => value !== "")
          ),
        });

        const metricsData = response.data;
        if (!metricsData.success) {
          setErrors({
            general: metricsData.message || "Failed to save metrics",
          });
          setLoading(false);
          return;
        }
      }

      // Mark the request as completed using direct API call
      const completeResponse = await axios.patch(
        `/api/weigh-in-requests/${request.id}/complete`
      );

      if (completeResponse.data.success) {
        console.log(`✅ Check-in request ${request.id} completed successfully`);
        onCompleted?.(completeResponse.data);
        onClose();
      } else {
        setErrors({
          general:
            completeResponse.data.message || "Failed to complete request",
        });
      }
    } catch (error) {
      console.error("Error completing check-in request:", error);
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };
  const isRequestCompleted = request.status === "completed";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 bg-opacity-50 backdrop-blur-xs z-50">
      <div className="bg-zinc-950 relative flex flex-col rounded-xl shadow-2xl shadow-white/10 gap-6 p-8 max-w-[800px] max-h-[90vh] w-full overflow-y-auto scrollbar-dark">
        {" "}
        {/* Close Icon */}
        <X
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer z-10"
          size={22}
        />
        {/* Heading */}
        <div className="flex items-center gap-3">
          {isRequestCompleted ? (
            <CheckCircle className="text-green-400" size={24} />
          ) : (
            <Scale className="text-blue-400" size={24} />
          )}
          <div>
            <h2 className="text-white text-xl font-semibold">
              {request.title}
            </h2>
            {isRequestCompleted && (
              <p className="text-green-400 text-sm">✅ Completed</p>
            )}
          </div>
        </div>
        {/* Description */}
        {request.description && (
          <div className="bg-zinc-800 rounded-lg p-4">
            <p className="text-zinc-300">{request.description}</p>
          </div>
        )}
        {/* Due Date */}
        {request.due_date && (
          <div className="text-sm text-zinc-400">
            Due:{" "}
            {new Date(request.due_date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}
        {!isRequestCompleted && (
          <>
            {/* Error Display */}
            {errors.general && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Requested Metrics */}
              {request.requested_metrics &&
                request.requested_metrics.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Scale size={20} />
                      Requested Metrics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {request.requested_metrics.map((metric) => (
                        <div key={metric} className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">
                            {metricLabels[metric] || metric} *
                          </label>
                          <input
                            type="number"
                            step={
                              metric.includes("level") ||
                              metric.includes("mood")
                                ? "1"
                                : "0.1"
                            }
                            min={
                              metric.includes("level") ||
                              metric.includes("mood")
                                ? 1
                                : 0
                            }
                            max={
                              metric.includes("level") ||
                              metric.includes("mood")
                                ? 10
                                : undefined
                            }
                            value={metrics[metric] || ""}
                            onChange={(e) =>
                              handleMetricChange(metric, e.target.value)
                            }
                            className={`w-full p-3 rounded-lg bg-zinc-800 border text-white placeholder-zinc-400 focus:outline-none ${
                              errors[metric]
                                ? "border-red-500"
                                : "border-zinc-700 focus:border-blue-500"
                            }`}
                            placeholder={`Enter ${
                              metricLabels[metric]?.toLowerCase() || metric
                            }`}
                          />
                          {errors[metric] && (
                            <p className="text-red-400 text-xs">
                              {errors[metric]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {/* Requested Photos */}
              {request.requested_photos &&
                request.requested_photos.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Camera size={20} />
                      Requested Photos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {request.requested_photos.map((photoType) => (
                        <div key={photoType} className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">
                            {photoLabels[photoType] || photoType} *
                          </label>
                          <div
                            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                              errors[photoType]
                                ? "border-red-500 bg-red-900/10"
                                : photos[photoType]
                                ? "border-green-500 bg-green-900/10"
                                : "border-zinc-600 hover:border-zinc-500"
                            }`}
                          >
                            {photos[photoType] ? (
                              <div className="text-green-400 flex items-center justify-center gap-2">
                                <CheckCircle size={20} />
                                Photo uploaded successfully
                              </div>
                            ) : (
                              <div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handlePhotoUpload(
                                      photoType,
                                      e.target.files[0]
                                    )
                                  }
                                  className="hidden"
                                  id={`photo-${photoType}`}
                                  disabled={uploadingPhotos[photoType]}
                                />
                                <label
                                  htmlFor={`photo-${photoType}`}
                                  className="cursor-pointer flex flex-col items-center gap-2"
                                >
                                  {uploadingPhotos[photoType] ? (
                                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Upload
                                      className="text-zinc-400"
                                      size={24}
                                    />
                                  )}
                                  <span className="text-sm text-zinc-400">
                                    {uploadingPhotos[photoType]
                                      ? "Uploading..."
                                      : "Click to upload photo"}
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>
                          {errors[photoType] && (
                            <p className="text-red-400 text-xs">
                              {errors[photoType]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {/* Action Buttons */}{" "}
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
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Submit Response
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
        {isRequestCompleted && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
            <p className="text-green-400">
              ✅ This check-in request has been completed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
