"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import axios from "@/lib/axios";
import NotificationCenter from "./NotificationCenter";

export default function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get("/api/notifications/unread-count");
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const handleNotificationClose = () => {
    setShowNotifications(false);
    // Refresh count when closing
    fetchUnreadCount();
  };

  return (
    <>
      <button
        onClick={handleNotificationClick}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter
        isOpen={showNotifications}
        onClose={handleNotificationClose}
      />
    </>
  );
}
