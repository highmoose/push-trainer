import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Supported timezones with friendly names
export const SUPPORTED_TIMEZONES = {
  "Europe/London": "UK (GMT/BST)",
  "America/New_York": "US Eastern (EST/EDT)",
  "America/Chicago": "US Central (CST/CDT)",
  "America/Denver": "US Mountain (MST/MDT)",
  "America/Los_Angeles": "US Pacific (PST/PDT)",
  UTC: "UTC",
};

// Get user's timezone from localStorage or default to UK
export const getUserTimezone = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userTimezone") || "Europe/London";
  }
  return "Europe/London";
};

// Set user's timezone in localStorage
export const setUserTimezone = (timezone) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("userTimezone", timezone);
  }
};

// Convert datetime from server (user's timezone) to local display
export const convertFromServerTime = (datetime, userTimezone = null) => {
  if (!datetime) return null;

  const tz = userTimezone || getUserTimezone();

  // Server sends time in user's timezone, so we parse it as such
  return dayjs.tz(datetime, tz);
};

// Convert datetime from local input to server format (user's timezone)
export const convertToServerTime = (datetime, userTimezone = null) => {
  if (!datetime) return null;

  const tz = userTimezone || getUserTimezone();

  // Convert to user's timezone and format for server
  return dayjs(datetime).tz(tz).format("YYYY-MM-DD HH:mm:ss");
};

// Convert datetime for calendar display (ensures consistent timezone)
export const convertForCalendar = (datetime, userTimezone = null) => {
  if (!datetime) return null;

  const tz = userTimezone || getUserTimezone();

  // Parse the datetime assuming it's in the user's timezone
  return dayjs.tz(datetime, tz).toDate();
};

// Format datetime for display with timezone info
export const formatWithTimezone = (
  datetime,
  format = "YYYY-MM-DD HH:mm",
  userTimezone = null
) => {
  if (!datetime) return "";

  const tz = userTimezone || getUserTimezone();
  const dt = dayjs.tz(datetime, tz);

  return `${dt.format(format)} (${tz.replace("_", " ")})`;
};

// Get timezone offset for display
export const getTimezoneOffset = (userTimezone = null) => {
  const tz = userTimezone || getUserTimezone();
  const now = dayjs().tz(tz);
  const offset = now.format("Z");

  return offset;
};

// Detect user's browser timezone
export const detectBrowserTimezone = () => {
  if (typeof window !== "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return "Europe/London";
};

// Check if a timezone is supported
export const isSupportedTimezone = (timezone) => {
  return Object.keys(SUPPORTED_TIMEZONES).includes(timezone);
};
