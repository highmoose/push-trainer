"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, CheckCircle } from "lucide-react";
import { DatePicker, Select, SelectItem, Input, Checkbox } from "@heroui/react";
import { parseDate, today, getLocalTimeZone } from "@internationalized/date";

const DietPlanActivationModal = ({
  isOpen,
  onClose,
  onConfirm,
  planTitle,
  loading = false,
}) => {
  // State for duration selection
  const [durationType, setDurationType] = useState("indefinite"); // 'indefinite' or 'duration'
  const [customDateRange, setCustomDateRange] = useState(false);

  // Duration settings
  const [startDate, setStartDate] = useState(today(getLocalTimeZone()));
  const [durationValue, setDurationValue] = useState(1);
  const [durationUnit, setDurationUnit] = useState("week");

  // Custom date range
  const [customStartDate, setCustomStartDate] = useState(
    today(getLocalTimeZone())
  );
  const [customEndDate, setCustomEndDate] = useState(
    today(getLocalTimeZone()).add({ days: 7 })
  );

  const durationOptions = [
    { key: "day", label: "Day(s)" },
    { key: "week", label: "Week(s)" },
    { key: "month", label: "Month(s)" },
    { key: "year", label: "Year(s)" },
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDurationType("indefinite");
      setCustomDateRange(false);
      setStartDate(today(getLocalTimeZone()));
      setDurationValue(1);
      setDurationUnit("week");
      setCustomStartDate(today(getLocalTimeZone()));
      setCustomEndDate(today(getLocalTimeZone()).add({ days: 7 }));
    }
  }, [isOpen]);

  const handleConfirm = () => {
    let activationData = {
      durationType,
    };

    if (durationType === "indefinite") {
      // Indefinite activation - start today, no end date
      activationData.startDate = today(getLocalTimeZone()).toString();
      activationData.endDate = null;
    } else {
      // Duration-based activation
      if (customDateRange) {
        // Custom start and end dates
        activationData.startDate = customStartDate.toString();
        activationData.endDate = customEndDate.toString();
      } else {
        // Calculated duration
        const start = startDate;
        let end;

        switch (durationUnit) {
          case "day":
            end = start.add({ days: durationValue });
            break;
          case "week":
            end = start.add({ weeks: durationValue });
            break;
          case "month":
            end = start.add({ months: durationValue });
            break;
          case "year":
            end = start.add({ years: durationValue });
            break;
          default:
            end = start.add({ weeks: durationValue });
        }

        activationData.startDate = start.toString();
        activationData.endDate = end.toString();
      }
    }

    onConfirm(activationData);
  };

  const isFormValid = () => {
    if (durationType === "indefinite") return true;

    if (customDateRange) {
      return (
        customStartDate &&
        customEndDate &&
        customEndDate.compare(customStartDate) > 0
      );
    }

    return startDate && durationValue > 0;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      <div
        className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md border border-zinc-700/50 relative"
        style={{ zIndex: 10000 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-400/10 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Activate Diet Plan
              </h2>
              <p className="text-sm text-zinc-400 mt-1 truncate">{planTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200 disabled:opacity-50"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Duration Type Selection */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-white">
              Activation Duration
            </h3>

            <div className="space-y-3">
              {/* Indefinite Option */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="durationType"
                  value="indefinite"
                  checked={durationType === "indefinite"}
                  onChange={(e) => setDurationType(e.target.value)}
                  className="w-4 h-4 text-orange-500 bg-zinc-800 border-zinc-600 focus:ring-orange-500 focus:ring-2"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">Indefinite</div>
                  <div className="text-sm text-zinc-400">
                    Plan remains active until manually deactivated
                  </div>
                </div>
              </label>

              {/* Set Duration Option */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="durationType"
                  value="duration"
                  checked={durationType === "duration"}
                  onChange={(e) => setDurationType(e.target.value)}
                  className="w-4 h-4 text-orange-500 bg-zinc-800 border-zinc-600 focus:ring-orange-500 focus:ring-2"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">Set Duration</div>
                  <div className="text-sm text-zinc-400">
                    Plan will automatically deactivate after specified period
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Duration Settings */}
          {durationType === "duration" && (
            <div className="space-y-4 border-t border-zinc-700/30 pt-4">
              {/* Custom Date Range Toggle */}
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={customDateRange}
                  onValueChange={setCustomDateRange}
                  size="sm"
                  classNames={{
                    base: "inline-flex max-w-none",
                    wrapper: "before:border-zinc-600 after:bg-orange-500",
                  }}
                />
                <label className="text-sm text-zinc-300 cursor-pointer">
                  Specify start & end date
                </label>
              </div>

              {customDateRange ? (
                /* Custom Date Range */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Start Date
                      </label>
                      <DatePicker
                        value={customStartDate}
                        onChange={setCustomStartDate}
                        minValue={today(getLocalTimeZone())}
                        granularity="day"
                        placement="bottom-start"
                        shouldFlip={true}
                        classNames={{
                          base: "w-full",
                          inputWrapper:
                            "border-zinc-600 bg-zinc-800/50 data-[hover=true]:border-zinc-500",
                          input: "text-zinc-200",
                          popoverContent: "bg-zinc-800 border-zinc-600",
                        }}
                        popoverProps={{
                          style: { zIndex: 10001 },
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        End Date
                      </label>
                      <DatePicker
                        value={customEndDate}
                        onChange={setCustomEndDate}
                        minValue={
                          customStartDate?.add({ days: 1 }) ||
                          today(getLocalTimeZone()).add({ days: 1 })
                        }
                        granularity="day"
                        placement="bottom-start"
                        shouldFlip={true}
                        classNames={{
                          base: "w-full",
                          inputWrapper:
                            "border-zinc-600 bg-zinc-800/50 data-[hover=true]:border-zinc-500",
                          input: "text-zinc-200",
                          popoverContent: "bg-zinc-800 border-zinc-600",
                        }}
                        popoverProps={{
                          style: { zIndex: 10001 },
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Duration Calculator */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Start Date
                    </label>
                    <DatePicker
                      value={startDate}
                      onChange={setStartDate}
                      minValue={today(getLocalTimeZone())}
                      granularity="day"
                      placement="bottom-start"
                      shouldFlip={true}
                      classNames={{
                        base: "w-full",
                        inputWrapper:
                          "border-zinc-600 bg-zinc-800/50 data-[hover=true]:border-zinc-500",
                        input: "text-zinc-200",
                        popoverContent: "bg-zinc-800 border-zinc-600",
                      }}
                      popoverProps={{
                        style: { zIndex: 10001 },
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Duration
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={durationValue.toString()}
                        onChange={(e) =>
                          setDurationValue(parseInt(e.target.value) || 1)
                        }
                        className="flex-1"
                        classNames={{
                          inputWrapper:
                            "border-zinc-600 bg-zinc-800/50 data-[hover=true]:border-zinc-500",
                          input: "text-zinc-200",
                        }}
                      />
                      <Select
                        selectedKeys={new Set([durationUnit])}
                        onSelectionChange={(keys) =>
                          setDurationUnit(Array.from(keys)[0])
                        }
                        className="w-32"
                        placement="bottom-start"
                        shouldFlip={true}
                        classNames={{
                          trigger:
                            "border-zinc-600 bg-zinc-800/50 data-[hover=true]:border-zinc-500",
                          value: "text-zinc-200",
                          popoverContent: "bg-zinc-800 border-zinc-600",
                        }}
                        popoverProps={{
                          style: { zIndex: 10001 },
                        }}
                      >
                        {durationOptions.map((option) => (
                          <SelectItem
                            key={option.key}
                            value={option.key}
                            textValue={option.label}
                            classNames={{
                              base: "data-[hover=true]:bg-zinc-700 data-[selected=true]:bg-zinc-700",
                              title: "text-zinc-200",
                            }}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-700/30">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !isFormValid()}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Activating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Activate Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DietPlanActivationModal;
