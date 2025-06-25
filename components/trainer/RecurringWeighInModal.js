"use client";

import { useState, useEffect } from "react";
import { Clock, Save, X, Calendar, RotateCcw } from "lucide-react";
import axios from "@/lib/axios";

const frequencies = [
  { value: "weekly", label: "Weekly" },
  { value: "bi-weekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

const daysOfWeek = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

const availableMetrics = [
  { key: "weight", label: "Weight" },
  { key: "body_fat_percentage", label: "Body Fat %" },
  { key: "muscle_mass", label: "Muscle Mass" },
  { key: "waist_circumference", label: "Waist" },
  { key: "chest_circumference", label: "Chest" },
  { key: "arm_circumference", label: "Arms" },
  { key: "thigh_circumference", label: "Thighs" },
  { key: "energy_level", label: "Energy Level" },
  { key: "sleep_hours", label: "Sleep Hours" },
  { key: "water_intake", label: "Water Intake" },
];

export default function RecurringWeighInModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  existingSettings,
}) {
  const [settings, setSettings] = useState({
    enabled: false,
    frequency: "weekly",
    day_of_week: 1,
    day_of_month: 1,
    time: "09:00",
    metrics: ["weight"],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (existingSettings) {
      setSettings({ ...settings, ...existingSettings });
    }
  }, [existingSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`/api/trainer/clients/${clientId}`, {
        recurring_check_in: settings,
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving recurring settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMetricToggle = (metricKey) => {
    setSettings((prev) => ({
      ...prev,
      metrics: prev.metrics.includes(metricKey)
        ? prev.metrics.filter((m) => m !== metricKey)
        : [...prev.metrics, metricKey],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <RotateCcw className="text-purple-400" size={24} />{" "}
            <h2 className="text-xl font-semibold text-white">
              Recurring Check-ins for {clientName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 m-6 rounded-lg">
            ✓ Recurring check-in settings saved successfully!
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enabled"
                checked={settings.enabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    enabled: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-purple-500 bg-zinc-800 border-zinc-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="enabled" className="text-white font-medium">
                Enable recurring check-in requests
              </label>
            </div>

            {settings.enabled && (
              <>
                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={settings.frequency}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        frequency: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-600 text-white focus:border-purple-500 focus:outline-none"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day Selection */}
                {(settings.frequency === "weekly" ||
                  settings.frequency === "bi-weekly") && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Day of Week
                    </label>
                    <select
                      value={settings.day_of_week}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          day_of_week: parseInt(e.target.value),
                        }))
                      }
                      className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-600 text-white focus:border-purple-500 focus:outline-none"
                    >
                      {daysOfWeek.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {settings.frequency === "monthly" && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Day of Month
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={settings.day_of_month}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          day_of_month: parseInt(e.target.value),
                        }))
                      }
                      className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-600 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Send Time
                  </label>
                  <input
                    type="time"
                    value={settings.time}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-600 text-white focus:border-purple-500 focus:outline-none"
                  />{" "}
                  <p className="text-xs text-zinc-400 mt-1">
                    Time when the check-in request will be sent
                  </p>
                </div>

                {/* Metrics Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">
                    Metrics to Request
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableMetrics.map((metric) => (
                      <label
                        key={metric.key}
                        className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800 border border-zinc-600 hover:border-zinc-500 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={settings.metrics.includes(metric.key)}
                          onChange={() => handleMetricToggle(metric.key)}
                          className="w-4 h-4 text-purple-500 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-zinc-300 text-sm">
                          {metric.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={
                  loading || !settings.enabled || settings.metrics.length === 0
                }
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Settings
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
