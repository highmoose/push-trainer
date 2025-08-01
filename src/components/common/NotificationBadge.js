"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import axios from "@/lib/axios";
import NotificationCenter from "./NotificationCenter";
import { Badge, Button } from "@heroui/react";

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
      <Badge
        content={unreadCount > 9 ? "9+" : unreadCount}
        color="danger"
        isInvisible={unreadCount === 0}
        shape="circle"
        size="sm"
      >
        <Button
          isIconOnly
          variant="light"
          onPress={handleNotificationClick}
          className="text-zinc-400 hover:text-white"
          title="Notifications"
          aria-label="Open notifications"
        >
          <Bell size={20} />
        </Button>
      </Badge>

      <NotificationCenter
        isOpen={showNotifications}
        onClose={handleNotificationClose}
      />
    </>
  );
}
