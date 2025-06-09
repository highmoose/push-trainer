import React, { useEffect, useState, useRef } from "react";
import InstantMessagingChat from "@/components/messages/instantMessagingChat";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversations,
  sendMessage,
  addMessage,
  fetchAllMessages,
} from "@/redux/slices/messagingSlice";
import { nanoid } from "@reduxjs/toolkit";
import { Columns2, Columns3, Columns4, Square } from "lucide-react";
import api from "@/lib/axios";
import { initSocket } from "@/lib/socket";

export default function Messages() {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  const { conversations, messagesByUser } = useSelector(
    (state) => state.messaging
  );

  console.log("conversations", conversations);

  const authUser = useSelector((state) => state.auth.user);
  const authUserId = authUser?.user?.id;

  const [newMessages, setNewMessages] = useState({});
  const [timeframe, setTimeframe] = useState("24h");

  useEffect(() => {
    if (!authUserId) return;

    const socket = initSocket(authUserId);
    socket.connect();
    socketRef.current = socket;

    socket.on("receive-message", (message) => {
      dispatch(addMessage(message));
    });

    return () => {
      socket.disconnect();
    };
  }, [authUserId]);

  useEffect(() => {
    if (authUserId) {
      dispatch({ type: "messaging/setAuthUserId", payload: authUserId });
      dispatch(fetchConversations()); // ✅ fine
      dispatch(fetchAllMessages({ authUserId })); // ✅ pass id explicitly
    }
  }, [dispatch, authUserId]);

  const handleInputChange = (userId, value) => {
    setNewMessages((prev) => ({ ...prev, [userId]: value }));
  };

  const handleSendMessage = async (userId) => {
    const content = newMessages[userId]?.trim();
    if (!content) return;

    const tempId = nanoid();
    const optimisticMessage = {
      id: tempId,
      sender_id: authUserId,
      receiver_id: userId,
      content,
      created_at: new Date().toISOString(),
      pending: true,
    };

    dispatch(addMessage(optimisticMessage));
    setNewMessages((prev) => ({ ...prev, [userId]: "" }));

    try {
      // ✅ Emit via WebSocket once
      socketRef.current?.emit("send-message", optimisticMessage);

      // ✅ Persist to API
      await api.post("/api/messages", {
        sender_id: authUserId,
        receiver_id: userId,
        content,
        created_at: optimisticMessage.created_at,
      });
    } catch (err) {
      console.error("❌ Failed to send message via API:", err);
    }
  };

  function calculateEngagementLast24Hours(messages, authUserId, clientUserId) {
    const now = new Date();
    const buckets = [];

    // Create 24 hourly buckets going back from now
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      buckets.push({
        hour: hour.getHours(),
        label: hour.toLocaleTimeString([], { hour: "2-digit" }), // e.g., "14:00"
        you: 0,
        client: 0,
        timestamp: hour,
      });
    }

    messages.forEach((msg) => {
      const createdAt = new Date(msg.created_at);
      const hourDiff = Math.floor((now - createdAt) / (60 * 60 * 1000));

      if (hourDiff < 24) {
        const index = 23 - hourDiff;
        if (index >= 0 && index < 24) {
          if (msg.sender_id === authUserId) {
            buckets[index].you++;
          } else if (msg.sender_id === clientUserId) {
            buckets[index].client++;
          }
        }
      }
    });

    return [
      {
        name: "You",
        data: buckets.map((b) => b.you),
      },
      {
        name: "Client",
        data: buckets.map((b) => b.client),
      },
    ];
  }

  function movingAverage(data, windowSize = 3) {
    const smoothed = [];

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
      const slice = data.slice(start, end);
      const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      smoothed.push(Number(avg.toFixed(2)));
    }

    return smoothed;
  }

  function calculateEngagementDataAverages(
    messages,
    authUserId,
    clientUserId,
    timeframe = "24h"
  ) {
    const now = new Date();
    const you = Array(24).fill(0);
    const client = Array(24).fill(0);

    // Define time limit
    let timeLimit;
    switch (timeframe) {
      case "1h":
        timeLimit = 1;
        break;
      case "24h":
        timeLimit = 24;
        break;
      case "1w":
        timeLimit = 24 * 7;
        break;
      case "1m":
        timeLimit = 24 * 30;
        break;
      case "all":
        timeLimit = Infinity;
        break;
      default:
        timeLimit = 24;
    }

    messages.forEach((msg) => {
      const createdAt = new Date(msg.created_at);
      const hoursAgo = (now - createdAt) / (1000 * 60 * 60); // ms → hr

      if (hoursAgo <= timeLimit) {
        const hourIndex = Math.floor(hoursAgo); // Group into hourly buckets (0 to 23)
        const index = 23 - hourIndex; // flip so most recent hour is last
        if (index >= 0 && index < 24) {
          if (msg.sender_id === authUserId) {
            you[index]++;
          } else if (msg.sender_id === clientUserId) {
            client[index]++;
          }
        }
      }
    });

    return [
      { name: "You", data: movingAverage(you, 3) },
      { name: "Client", data: movingAverage(client, 3) },
    ];
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Area */}
      <div className="flex justify-between">
        <div className="flex mb-4">
          <div className=" flex items-center justify-center h-9 w-9 bg-zinc-900">
            <Square size={24} />
          </div>
          <div className=" flex items-center justify-center h-9 w-9 bg-zinc-900">
            <Columns2 size={24} />
          </div>
          <div className=" flex items-center justify-center h-9 w-9 bg-zinc-900">
            <Columns3 size={24} />
          </div>
          <div className=" flex items-center justify-center h-9 w-9 bg-zinc-900">
            <Columns4 size={24} />
          </div>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="mb-2 rounded border px-4 py-1 text-sm text-white "
        >
          <option value="1h">Last 1 Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="1w">Last Week</option>
          <option value="1m">Last Month</option>
          <option value="all">All Time</option>
        </select>
      </div>
      <div className="flex overflow-x-scroll gap-x-2">
        {(conversations || []).map((conv) => {
          const userId = conv.user.id;

          const user = {
            name: `${conv.user.first_name} ${conv.user.last_name}`,
            gym: conv.user.gym || "",
            lastActive: "Last active 12m ago",
            avatar: "/images/placeholder/profile-placeholder.png",
          };

          const messages = messagesByUser[userId] || [];

          return (
            <InstantMessagingChat
              key={userId}
              user={user}
              messages={messages}
              authUserId={authUserId}
              engagement={calculateEngagementDataAverages(
                messages,
                authUserId,
                userId
              )}
              message={newMessages[userId] || ""}
              onChange={(e) => handleInputChange(userId, e.target.value)}
              onSend={() => handleSendMessage(userId)}
            />
          );
        })}
      </div>
    </div>
  );
}
