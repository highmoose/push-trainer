import { useState, useEffect } from "react";
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
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Timezone
        </label>
        <select
          value={selectedTimezone}
          onChange={(e) => handleTimezoneChange(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(SUPPORTED_TIMEZONES).map(([timezone, label]) => (
            <option key={timezone} value={timezone}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {browserTimezone && browserTimezone !== selectedTimezone && (
        <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-md">
          <p className="text-sm text-blue-300">
            Your browser timezone is detected as:{" "}
            <strong>{browserTimezone}</strong>
          </p>
          <button
            onClick={() => handleTimezoneChange(browserTimezone)}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
          >
            Use browser timezone
          </button>
        </div>
      )}

      <div className="text-xs text-zinc-500">
        <p>Current selection: {SUPPORTED_TIMEZONES[selectedTimezone]}</p>
        <p>All session times will be displayed in this timezone.</p>
      </div>
    </div>
  );
}
