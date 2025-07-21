import { useState, useEffect } from "react";
import { Select, SelectItem, Button } from "@heroui/react";
import {
  SUPPORTED_TIMEZONES,
  getUserTimezone,
  setUserTimezone,
  detectBrowserTimezone,
} from "@/lib/timezone";

export default function TimezoneSelector({ onTimezoneChange }) {
  const [selectedTimezone, setSelectedTimezone] = useState(getUserTimezone());
  const [browserTimezone, setBrowserTimezone] = useState("");

  useEffect(() => {
    setBrowserTimezone(detectBrowserTimezone());
  }, []);

  const handleTimezoneChange = (newTimezone) => {
    setSelectedTimezone(newTimezone);
    setUserTimezone(newTimezone);

    if (onTimezoneChange) {
      onTimezoneChange(newTimezone);
    }

    // Optionally reload the page to refresh all datetime displays
    // window.location.reload();
  };

  return (
    <div className="space-y-4">
      <div>
        <Select
          label="Timezone"
          aria-label="Select timezone"
          selectedKeys={[selectedTimezone]}
          onSelectionChange={(keys) => {
            const newTimezone = Array.from(keys)[0];
            if (newTimezone) {
              handleTimezoneChange(newTimezone);
            }
          }}
          classNames={{
            base: "max-w-full",
            label: "text-zinc-300 font-medium",
            trigger: "bg-zinc-800 border-zinc-700 hover:border-zinc-600",
            value: "text-white",
            listbox: "bg-zinc-800",
            popoverContent: "bg-zinc-800 border-zinc-700",
          }}
        >
          {Object.entries(SUPPORTED_TIMEZONES).map(([timezone, label]) => (
            <SelectItem
              key={timezone}
              value={timezone}
              textValue={label}
              className="text-white"
            >
              {label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {browserTimezone && browserTimezone !== selectedTimezone && (
        <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-md">
          <p className="text-sm text-blue-300">
            Your browser timezone is detected as:{" "}
            <strong>{browserTimezone}</strong>
          </p>
          <Button
            variant="light"
            size="sm"
            onPress={() => handleTimezoneChange(browserTimezone)}
            className="mt-2 text-blue-400 hover:text-blue-300 underline h-auto p-0"
          >
            Use browser timezone
          </Button>
        </div>
      )}

      <div className="text-xs text-zinc-500">
        <p>Current selection: {SUPPORTED_TIMEZONES[selectedTimezone]}</p>
        <p>All session times will be displayed in this timezone.</p>
      </div>
    </div>
  );
}
