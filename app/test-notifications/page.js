"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle, Clock, Scale, X } from "lucide-react";
import axios from "@/lib/axios";

export default function TestNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Mock client data for testing
  const mockClient = {
    id: 456,
    name: "Test Client",
    email: "client@test.com"
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Check every 5 seconds for demo
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/notifications");
      if (response.data.success) {
        setNotifications(response.data.data || []);
        const unread = response.data.data?.filter(n => !n.read_at).length || 0;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  const createTestNotification = async () => {
    try {
      setLoading(true);
      // For now, use the working recurring processor endpoint to demonstrate
      const response = await axios.get(`/api/process-recurring-weighins`);
      if (response.data.success) {
        alert(`Test completed! Processed ${response.data.processed} recurring requests. Check notifications below and server logs for details.`);
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error creating test notification:", error);
      alert("Error creating test notification. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const respondToWeighIn = (notification) => {
    setSelectedNotification(notification);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📱 Notification System Test
          </h1>
          <p className="text-zinc-400 text-lg">
            This page simulates the client notification experience
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            Logged in as: <span className="text-blue-400">{mockClient.name}</span>
          </p>
        </div>        {/* Controls */}
        <div className="bg-zinc-800 rounded-xl p-6 mb-8 border border-zinc-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            🧪 Test Controls
          </h2>
          <div className="space-y-4">
            <div className="bg-zinc-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">📋 Setup Instructions</h3>
              <ol className="text-zinc-300 text-sm space-y-1 list-decimal list-inside">
                <li>Go to <span className="text-blue-400">Trainer → Clients</span> in the main app</li>                  <li>Click <span className="text-purple-400">"Set Recurring Check-in"</span> for any client</li>                  <li>Enable recurring and set frequency to <span className="text-green-400">"Daily"</span></li>
                  <li>Set time to <span className="text-yellow-400">current time + 2 minutes</span></li>
                  <li>Click the button below to process recurring check-ins</li>
              </ol>
            </div>
            <div className="flex gap-4">
              <button
                onClick={createTestNotification}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Process Recurring Check-ins
              </button>
              <button
                onClick={fetchNotifications}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
              >
                🔄 Refresh Notifications
              </button>
            </div>
          </div>
        </div>

        {/* Notification Badge Demo */}
        <div className="bg-zinc-800 rounded-xl p-6 mb-8 border border-zinc-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            🔔 Notification Badge (Updates every 5 seconds)
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-8 h-8 text-zinc-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-zinc-300">
              {unreadCount === 0 ? "No unread notifications" : `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            📋 Notifications
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">Create a test notification above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    notification.read_at
                      ? "bg-zinc-700 border-zinc-600"
                      : "bg-blue-900/30 border-blue-500/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-5 h-5 text-blue-400" />
                        <h3 className="font-semibold text-white">
                          {notification.title}
                        </h3>
                        {!notification.read_at && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-300 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(notification.created_at)}
                        </span>
                        {notification.read_at && (
                          <span className="flex items-center gap-1 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">                      {notification.type === 'weigh_in_request' && (
                        <button
                          onClick={() => respondToWeighIn(notification)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          📊 Respond to Check-in
                        </button>
                      )}
                      {!notification.read_at && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1 bg-zinc-600 text-white text-sm rounded hover:bg-zinc-500 transition-colors"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Response Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-800 rounded-xl p-6 max-w-md w-full border border-zinc-700">              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  📊 Check-in Response
                </h3>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>              <p className="text-zinc-300 mb-4">
                In a real application, this would open the CheckInRequestResponseModal 
                where clients can submit their metrics and photos.
              </p>
              <div className="bg-zinc-700 p-4 rounded-lg mb-4">
                <p className="text-sm text-zinc-400 mb-2">Notification Details:</p>
                <p className="text-white">{selectedNotification.title}</p>
                <p className="text-zinc-300 text-sm">{selectedNotification.message}</p>
              </div>
              <button
                onClick={() => {
                  markAsRead(selectedNotification.id);
                  setSelectedNotification(null);
                }}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                ✅ Mark as Handled
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
