import React, { useEffect, useState, useRef } from "react";
import InstantMessagingChat from "@/components/messages/instantMessagingChat";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversations,
  sendMessage,
  addMessage,
  fetchAllMessages,
  fetchMessages,
  setAuthUserId,
} from "@/redux/slices/messagingSlice";
import { fetchClientTrainer } from "@/redux/slices/trainerSlice";
import { nanoid } from "@reduxjs/toolkit";
import {
  Columns2,
  Columns3,
  Columns4,
  Square,
  MessageCircle,
  Users,
  Search,
  UserCheck,
} from "lucide-react";
import api from "@/lib/axios";
import { initSocket } from "@/lib/socket";

export default function Messages() {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  const { conversations, messagesByUser } = useSelector(
    (state) => state.messaging
  );

  const { info: trainer = null, status: trainerStatus } = useSelector(
    (state) => state.trainer
  );
  const authUser = useSelector((state) => state.auth.user);
  const authUserId = authUser?.id; // Changed from authUser?.user?.id

  console.log("Client Messages - Full authUser:", authUser);
  console.log("Client Messages - authUserId:", authUserId);

  const [newMessages, setNewMessages] = useState({});
  const [timeframe, setTimeframe] = useState("24h");
  const [showTrainerList, setShowTrainerList] = useState(true);
  const [selectedTrainerForNewChat, setSelectedTrainerForNewChat] =
    useState(null);

  // Debug logs after state declarations
  console.log("conversations", conversations);
  console.log("messagesByUser", messagesByUser);
  console.log("trainer", trainer);
  console.log("selectedTrainerForNewChat", selectedTrainerForNewChat);
  if (selectedTrainerForNewChat) {
    console.log(
      "Messages for selected trainer:",
      messagesByUser[selectedTrainerForNewChat.id]
    );
  }

  // Fetch trainer when component mounts
  useEffect(() => {
    if (trainerStatus === "idle") {
      dispatch(fetchClientTrainer());
    }
  }, [dispatch, trainerStatus]);

  // Fetch conversations and set up messaging when component mounts
  useEffect(() => {
    if (authUserId) {
      // Set the authUserId in the messaging slice first
      dispatch(setAuthUserId(authUserId));
      dispatch(fetchConversations());
      // Fetch all messages to populate the messagesByUser state
      dispatch(fetchAllMessages({ authUserId }));
    }
  }, [dispatch, authUserId]);

  useEffect(() => {
    if (!authUserId) return;

    const socket = initSocket(authUserId);
    socket.connect();
    socketRef.current = socket;
    socket.on("receive-message", (message) => {
      console.log("🔔 Client received WebSocket message:", message);
      dispatch(addMessage(message));
    });

    return () => {
      socket.disconnect();
    };
  }, [authUserId]);

  // Fetch messages for selected trainer when it changes
  useEffect(() => {
    if (selectedTrainerForNewChat && authUserId) {
      console.log(
        "🔄 Selected trainer changed, fetching messages for:",
        selectedTrainerForNewChat.id
      );
      dispatch(fetchMessages(selectedTrainerForNewChat.id));
    }
  }, [selectedTrainerForNewChat, authUserId, dispatch]);

  const handleInputChange = (userId, value) => {
    setNewMessages((prev) => ({ ...prev, [userId]: value }));
  };

  const handleSendMessage = async (userId) => {
    const content = newMessages[userId]?.trim();
    if (!content) return;

    console.log(
      "🚀 handleSendMessage called with userId:",
      userId,
      "content:",
      content
    );

    const tempId = nanoid();
    const optimisticMessage = {
      id: tempId,
      sender_id: authUserId,
      receiver_id: userId,
      content,
      created_at: new Date().toISOString(),
      pending: true,
    };

    console.log("📝 Dispatching optimistic message:", optimisticMessage);
    dispatch(addMessage(optimisticMessage));
    setNewMessages((prev) => ({ ...prev, [userId]: "" }));

    try {
      // ✅ Emit via WebSocket once (without pending flag)
      const websocketMessage = {
        id: tempId,
        sender_id: authUserId,
        receiver_id: userId,
        content,
        created_at: optimisticMessage.created_at,
        // Don't include pending: true for WebSocket
      };
      console.log("📡 Client sending WebSocket message:", websocketMessage);
      socketRef.current?.emit("send-message", websocketMessage);

      // ✅ Persist to API
      const response = await api.post("/api/messages", {
        sender_id: authUserId,
        receiver_id: userId,
        content,
        created_at: optimisticMessage.created_at,
      });

      console.log("✅ API response:", response.data);

      // Replace the optimistic message with the real one from the API
      const realMessage = response.data;
      dispatch(addMessage(realMessage));

      // Also refresh the conversation to make sure we have the latest data
      dispatch(fetchMessages(userId));
    } catch (err) {
      console.error("❌ Failed to send message via API:", err);
    }
  };

  // Handle starting a new conversation with trainer
  const handleStartChatWithTrainer = (trainer) => {
    setSelectedTrainerForNewChat(trainer);
    // Don't close the trainer info - keep it open

    // Initialize message state for this trainer if not exists
    if (!newMessages[trainer.id]) {
      setNewMessages((prev) => ({ ...prev, [trainer.id]: "" }));
    }

    // Always fetch messages for this specific trainer to get the latest conversation history
    console.log("🔄 Fetching messages for trainer:", trainer.id);
    dispatch(fetchMessages(trainer.id));
  };
  function calculateEngagementLast24Hours(messages, authUserId, trainerUserId) {
    const now = new Date();
    const buckets = [];

    // Create 24 hourly buckets going back from now
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      buckets.push({
        hour: hour.getHours(),
        label: hour.toLocaleTimeString([], { hour: "2-digit" }), // e.g., "14:00"
        you: 0,
        trainer: 0,
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
          } else if (msg.sender_id === trainerUserId) {
            buckets[index].trainer++;
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
        name: "Trainer",
        data: buckets.map((b) => b.trainer),
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
  return (
    <div className="flex h-full">
      {/* Trainer Sidebar */}
      {showTrainerList && (
        <div className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto border-r border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users size={20} />
              My Trainer
            </h2>
          </div>

          {trainerStatus === "loading" && (
            <div className="text-gray-400">Loading trainer...</div>
          )}

          {trainerStatus === "failed" && (
            <div className="text-red-400">Failed to load trainer</div>
          )}

          {trainer && (
            <div
              className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                selectedTrainerForNewChat?.id === trainer.id
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => handleStartChatWithTrainer(trainer)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {trainer.first_name} {trainer.last_name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {trainer.gym || "Your Trainer"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!trainer && trainerStatus === "succeeded" && (
            <div className="text-gray-400 text-center py-8">
              <Users size={48} className="mx-auto mb-2 opacity-50" />
              <p>No trainer assigned</p>
            </div>
          )}
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between p-4 border-b border-gray-700">
          <div className="flex mb-4">
            <div className="flex items-center justify-center h-9 w-9 bg-zinc-900">
              <Square size={24} />
            </div>
            <div className="flex items-center justify-center h-9 w-9 bg-zinc-900">
              <Columns2 size={24} />
            </div>
            <div className="flex items-center justify-center h-9 w-9 bg-zinc-900">
              <Columns3 size={24} />
            </div>
            <div className="flex items-center justify-center h-9 w-9 bg-zinc-900">
              <Columns4 size={24} />
            </div>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="mb-2 rounded border px-4 py-1 text-sm text-white bg-gray-800"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="1w">Last Week</option>
            <option value="1m">Last Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          {selectedTrainerForNewChat ? (
            <div className="h-full">
              <InstantMessagingChat
                user={{
                  name: `${selectedTrainerForNewChat.first_name} ${selectedTrainerForNewChat.last_name}`,
                  gym: selectedTrainerForNewChat.gym || "Your Trainer",
                  lastActive: "Last active recently",
                  avatar: "/images/placeholder/profile-placeholder.png",
                }}
                messages={messagesByUser[selectedTrainerForNewChat.id] || []}
                authUserId={authUserId}
                engagement={calculateEngagementLast24Hours(
                  messagesByUser[selectedTrainerForNewChat.id] || [],
                  authUserId,
                  selectedTrainerForNewChat.id
                )}
                message={newMessages[selectedTrainerForNewChat.id] || ""}
                onChange={(e) =>
                  handleInputChange(
                    selectedTrainerForNewChat.id,
                    e.target.value
                  )
                }
                onSend={() => handleSendMessage(selectedTrainerForNewChat.id)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Start a conversation</p>
                <p className="text-sm">
                  Select your trainer from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
