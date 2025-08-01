"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import axios from "@/lib/axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Spinner,
  Chip,
} from "@heroui/react";

const notificationIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  weigh_in_request: Bell,
  milestone: CheckCircle2,
};

const notificationColors = {
  info: "border-blue-500 bg-blue-500/10",
  success: "border-green-500 bg-green-500/10",
  warning: "border-yellow-500 bg-yellow-500/10",
  weigh_in_request: "border-purple-500 bg-purple-500/10",
  milestone: "border-orange-500 bg-orange-500/10",
};

export default function NotificationCenter({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/notifications");
      if (response.data.success) {
        setNotifications(response.data.data);
        updateUnreadCount();
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUnreadCount = async () => {
    try {
      const response = await axios.get("/api/notifications/unread-count");
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      updateUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch("/api/notifications/mark-all-read");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      updateUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    const timeString = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (diffInDays === 0) return `Today at ${timeString}`;
    if (diffInDays === 1) return `Yesterday at ${timeString}`;
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
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
        body: "p-0",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="text-blue-400" size={24} />
            <span className="text-xl font-semibold text-white">
              Notifications
            </span>
            {unreadCount > 0 && (
              <Chip
                color="primary"
                size="sm"
                variant="solid"
                className="text-white"
              >
                {unreadCount}
              </Chip>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="light"
              size="sm"
              onPress={markAllAsRead}
              className="text-blue-400 hover:text-blue-300"
            >
              Mark all read
            </Button>
          )}
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" color="primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <Bell size={48} className="mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm mt-2">You'll see new notifications here</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-700">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Info;
                const colorClass =
                  notificationColors[notification.type] ||
                  notificationColors.info;
                const isUnread = !notification.read_at;

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-zinc-800/50 transition-colors ${
                      isUnread ? "bg-zinc-800/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full border ${colorClass}`}
                      >
                        <Icon size={16} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4
                              className={`font-medium ${
                                isUnread ? "text-white" : "text-zinc-300"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <p className="text-zinc-400 text-sm mt-1">
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 whitespace-nowrap">
                              {formatDate(notification.created_at)}
                            </span>

                            {isUnread && (
                              <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onPress={() => markAsRead(notification.id)}
                                className="text-blue-400 hover:text-blue-300 min-w-unit-6 w-unit-6 h-unit-6"
                                title="Mark as read"
                                aria-label="Mark notification as read"
                              >
                                <Check size={16} />
                              </Button>
                            )}

                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              onPress={() =>
                                deleteNotification(notification.id)
                              }
                              className="text-zinc-500 hover:text-red-400 min-w-unit-6 w-unit-6 h-unit-6"
                              title="Delete notification"
                              aria-label="Delete notification"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </div>

                        {/* Special handling for weigh-in requests */}
                        {notification.type === "weigh_in_request" &&
                          notification.data && (
                            <div className="mt-2 text-xs text-zinc-500">
                              <span>
                                Requested:{" "}
                                {notification.data.requested_metrics?.join(
                                  ", "
                                )}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
