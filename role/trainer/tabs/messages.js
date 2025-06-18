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
import { fetchClients } from "@/redux/slices/clientSlice";
import { nanoid } from "@reduxjs/toolkit";
import {
  Columns2,
  Columns3,
  Columns4,
  Square,
  MessageCircle,
  Users,
  Search,
  Plus,
} from "lucide-react";
import api from "@/lib/axios";
import { initSocket } from "@/lib/socket";

export default function Messages({ authUserId }) {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  const { conversations, messagesByUser } = useSelector(
    (state) => state.messaging
  );

  const { list: clients = [], status: clientsStatus } = useSelector(
    (state) => state.clients
  );

  const [newMessages, setNewMessages] = useState({});
  const [timeframe, setTimeframe] = useState("24h");
  const [showClientList, setShowClientList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientForNewChat, setSelectedClientForNewChat] =
    useState(null);

  // Debug logs after state declarations
  console.log("conversations", conversations);
  console.log("messagesByUser", messagesByUser);
  console.log("selectedClientForNewChat", selectedClientForNewChat);
  if (selectedClientForNewChat) {
    console.log(
      "Messages for selected client:",
      messagesByUser[selectedClientForNewChat.id]
    );
  }
  // Fetch clients when component mounts
  useEffect(() => {
    if (clientsStatus === "idle") {
      dispatch(fetchClients());
    }
  }, [dispatch, clientsStatus]); // Fetch conversations and set up messaging when component mounts
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
      console.log("🔔 Trainer received WebSocket message:", message);
      dispatch(addMessage(message));
    });
    return () => {
      socket.disconnect();
    };
  }, [authUserId]);

  // Fetch messages for selected client when it changes
  useEffect(() => {
    if (selectedClientForNewChat && authUserId) {
      console.log(
        "🔄 Selected client changed, fetching messages for:",
        selectedClientForNewChat.id
      );
      dispatch(fetchMessages(selectedClientForNewChat.id));
    }
  }, [selectedClientForNewChat, authUserId, dispatch]);
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
      console.log("📡 Trainer sending WebSocket message:", websocketMessage);
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
  }; // Handle starting a new conversation with a client
  const handleStartChatWithClient = (client) => {
    setSelectedClientForNewChat(client);
    // Don't close the client list - keep it open for easy navigation

    // Initialize message state for this client if not exists
    if (!newMessages[client.id]) {
      setNewMessages((prev) => ({ ...prev, [client.id]: "" }));
    }

    // Always fetch messages for this specific client to get the latest conversation history
    console.log("🔄 Fetching messages for client:", client.id);
    dispatch(fetchMessages(client.id));
  };

  // Filter clients based on search query
  const filteredClients = clients.filter((client) => {
    const fullName = `${client.first_name || ""} ${
      client.last_name || ""
    }`.toLowerCase();
    const email = (client.email || "").toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  // Get clients that don't have existing conversations
  const availableClients = filteredClients.filter((client) => {
    return !conversations.some((conv) => conv.user.id === client.id);
  });
  // Create a temporary conversation object for the selected client
  const getClientAsConversation = (client) => ({
    user: {
      id: client.id,
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      gym: client.gym || "Unknown Gym",
    },
  });

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
    <div className="flex h-full">
      {/* Client List Sidebar */}
      {showClientList && (
        <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Clients
              </h2>
              <button
                onClick={() => setShowClientList(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Client List */}
          <div className="flex-1 overflow-y-auto">
            {" "}
            {clientsStatus === "loading" && (
              <div className="p-4 text-center text-zinc-400">
                Loading clients...
              </div>
            )}
            {clientsStatus === "failed" && (
              <div className="p-4 text-center text-red-400">
                Failed to load clients
              </div>
            )}
            {filteredClients.length === 0 && searchQuery && (
              <div className="p-4 text-center text-zinc-400">
                No clients found
              </div>
            )}
            {filteredClients.length === 0 &&
              !searchQuery &&
              clientsStatus === "succeeded" && (
                <div className="p-4 text-center text-zinc-400">
                  No clients assigned
                </div>
              )}
            {filteredClients.map((client) => {
              const hasConversation = conversations.some(
                (conv) => conv.user.id === client.id
              );
              return (
                <div
                  key={client.id}
                  onClick={() => handleStartChatWithClient(client)}
                  className={`p-4 border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer transition-colors group ${
                    selectedClientForNewChat?.id === client.id
                      ? "bg-zinc-800"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center relative">
                      <span className="text-white font-medium">
                        {(client.first_name?.[0] || "").toUpperCase()}
                        {(client.last_name?.[0] || "").toUpperCase()}
                      </span>
                      {hasConversation && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {client.first_name} {client.last_name}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {client.email}
                        {hasConversation && (
                          <span className="ml-2 text-green-400">
                            • Active conversation
                          </span>
                        )}
                      </div>
                    </div>
                    <MessageCircle className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            {!showClientList && (
              <button
                onClick={() => setShowClientList(true)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <Users className="w-5 h-5" />
              </button>
            )}

            <div className="flex">
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
          </div>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="rounded border px-4 py-1 text-sm text-white bg-zinc-800"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="1w">Last Week</option>
            <option value="1m">Last Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex overflow-x-scroll gap-x-2 p-4">
          {" "}
          {/* Show new client chat if selected */}
          {selectedClientForNewChat && (
            <InstantMessagingChat
              key={selectedClientForNewChat.id}
              user={{
                name: `${selectedClientForNewChat.first_name} ${selectedClientForNewChat.last_name}`,
                gym: selectedClientForNewChat.gym || "Unknown Gym",
                lastActive: "Start new conversation",
                avatar: "/images/placeholder/profile-placeholder.png",
              }}
              messages={(() => {
                const messages =
                  messagesByUser[selectedClientForNewChat.id] || [];
                console.log(
                  `📨 Messages for client ${selectedClientForNewChat.id}:`,
                  messages
                );
                return messages;
              })()}
              authUserId={authUserId}
              engagement={calculateEngagementDataAverages(
                messagesByUser[selectedClientForNewChat.id] || [],
                authUserId,
                selectedClientForNewChat.id
              )}
              message={newMessages[selectedClientForNewChat.id] || ""}
              onChange={(e) =>
                handleInputChange(selectedClientForNewChat.id, e.target.value)
              }
              onSend={() => handleSendMessage(selectedClientForNewChat.id)}
            />
          )}
          {/* Show existing conversations */}
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
          {/* Empty state when no conversations */}
          {!selectedClientForNewChat &&
            (!conversations || conversations.length === 0) && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-zinc-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-sm">
                    {showClientList
                      ? "Select a client to start messaging"
                      : "Click the users icon to view clients"}
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
