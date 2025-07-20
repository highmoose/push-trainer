"use client";

import { useState, useEffect } from "react";
import { Clock, Save, RotateCcw } from "lucide-react";
import axios from "@/lib/axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Checkbox,
  Spinner,
} from "@heroui/react";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "bg-zinc-900 border border-zinc-700",
        header: "border-b border-zinc-700",
        body: "py-6",
        footer: "border-t border-zinc-700",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <RotateCcw className="text-purple-400" size={24} />
          <span className="text-xl font-semibold text-white">
            Recurring Check-ins for {clientName}
          </span>
        </ModalHeader>

        <ModalBody>
          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-lg mb-4">
              ✓ Recurring check-in settings saved successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enable/Disable */}
            <Checkbox
              isSelected={settings.enabled}
              onValueChange={(checked) =>
                setSettings((prev) => ({ ...prev, enabled: checked }))
              }
              classNames={{
                base: "max-w-full",
                label: "text-white font-medium",
                wrapper: "before:border-zinc-600 after:bg-purple-500",
              }}
            >
              Enable recurring check-in requests
            </Checkbox>

            {settings.enabled && (
              <>
                {/* Frequency */}
                <Select
                  label="Frequency"
                  selectedKeys={[settings.frequency]}
                  onSelectionChange={(keys) => {
                    const frequency = Array.from(keys)[0];
                    if (frequency) {
                      setSettings((prev) => ({ ...prev, frequency }));
                    }
                  }}
                  classNames={{
                    label: "text-zinc-300 font-medium",
                    trigger:
                      "bg-zinc-800 border-zinc-600 hover:border-purple-500",
                    value: "text-white",
                    listbox: "bg-zinc-800",
                    popoverContent: "bg-zinc-800 border-zinc-600",
                  }}
                >
                  {frequencies.map((freq) => (
                    <SelectItem
                      key={freq.value}
                      value={freq.value}
                      className="text-white"
                    >
                      {freq.label}
                    </SelectItem>
                  ))}
                </Select>

                {/* Day Selection */}
                {(settings.frequency === "weekly" ||
                  settings.frequency === "bi-weekly") && (
                  <Select
                    label="Day of Week"
                    selectedKeys={[settings.day_of_week.toString()]}
                    onSelectionChange={(keys) => {
                      const day = Array.from(keys)[0];
                      if (day) {
                        setSettings((prev) => ({
                          ...prev,
                          day_of_week: parseInt(day),
                        }));
                      }
                    }}
                    classNames={{
                      label: "text-zinc-300 font-medium",
                      trigger:
                        "bg-zinc-800 border-zinc-600 hover:border-purple-500",
                      value: "text-white",
                      listbox: "bg-zinc-800",
                      popoverContent: "bg-zinc-800 border-zinc-600",
                    }}
                  >
                    {daysOfWeek.map((day) => (
                      <SelectItem
                        key={day.value.toString()}
                        value={day.value.toString()}
                        className="text-white"
                      >
                        {day.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}

                {settings.frequency === "monthly" && (
                  <Input
                    type="number"
                    label="Day of Month"
                    min={1}
                    max={31}
                    value={settings.day_of_month.toString()}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        day_of_month: parseInt(e.target.value),
                      }))
                    }
                    classNames={{
                      label: "text-zinc-300 font-medium",
                      inputWrapper:
                        "bg-zinc-800 border-zinc-600 hover:border-purple-500",
                      input: "text-white",
                    }}
                  />
                )}

                {/* Time Selection */}
                <Input
                  type="time"
                  label={
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Send Time
                    </span>
                  }
                  value={settings.time}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, time: e.target.value }))
                  }
                  description="Time when the check-in request will be sent"
                  classNames={{
                    label: "text-zinc-300 font-medium",
                    inputWrapper:
                      "bg-zinc-800 border-zinc-600 hover:border-purple-500",
                    input: "text-white",
                    description: "text-zinc-400",
                  }}
                />

                {/* Metrics Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">
                    Metrics to Request
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableMetrics.map((metric) => (
                      <Checkbox
                        key={metric.key}
                        isSelected={settings.metrics.includes(metric.key)}
                        onValueChange={() => handleMetricToggle(metric.key)}
                        classNames={{
                          base: "max-w-full p-2 rounded-lg bg-zinc-800 border border-zinc-600 hover:border-zinc-500",
                          label: "text-zinc-300 text-sm",
                          wrapper: "before:border-zinc-600 after:bg-purple-500",
                        }}
                      >
                        {metric.label}
                      </Checkbox>
                    ))}
                  </div>
                </div>
              </>
            )}
          </form>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
            className="text-zinc-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            color="secondary"
            onPress={handleSubmit}
            isDisabled={
              loading || !settings.enabled || settings.metrics.length === 0
            }
            isLoading={loading}
            startContent={!loading && <Save size={16} />}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Save Settings
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
