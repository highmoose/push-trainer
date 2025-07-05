"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  SendHorizonal,
  Check,
  Loader2,
  Scale,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import CreateWeighInRequestModal from "../trainer/CreateWeighInRequestModal";
import WeighInRequestResponseModal from "../client/WeighInRequestResponseModal";
import { addMessage, updateWeighInRequestStatus, acceptWeighInRequest, declineWeighInRequest, completeWeighInRequest } from "@/redux/slices/messagingSlice";

const ChartClient = dynamic(
  () => import("@/components/common/chart/ChartClient"),
  {
    ssr: false,
  }
);

export default function InstantMessagingChat({
  user,
  messages,
  authUserId,
  engagement,
  message,
  onChange,
  onSend,
  onMarkAsRead,
  userRole,
  socketRef, // Add socket reference
}) {
  const dispatch = useDispatch();
  const reduxMessagesByUser = useSelector(
    (state) => state.messaging.messagesByUser
  );
  const textAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showWeighInModal, setShowWeighInModal] = useState(false);
  const [selectedWeighInRequest, setSelectedWeighInRequest] = useState(null);

  // Create conversation items from messages
  const [conversationItems, setConversationItems] = useState([]);
  console.log("📨 InstantMessagingChat - Received props:");
  console.log("- messages:", messages);
  console.log("- userRole:", userRole);
  console.log("- authUserId:", authUserId);
  console.log("- user:", user);
  console.log("- socketRef:", socketRef);
  console.log("📊 Redux messagesByUser from component:", reduxMessagesByUser);
  console.log(
    "📊 Redux messages for this user:",
    reduxMessagesByUser[user?.id]
  );
  // Watch Redux state changes
  useEffect(() => {
    console.log("🔄 Redux messagesByUser changed:", reduxMessagesByUser);
    if (user?.id && reduxMessagesByUser[user.id]) {
      console.log(
        `🔄 Redux messages for user ${user.id}:`,
        reduxMessagesByUser[user.id]
      );
    }
  }, [reduxMessagesByUser, user?.id]);

  // Convert messages to conversation items
  useEffect(() => {
    console.log("🔄 useEffect triggered - messages changed:", messages);
    if (!messages) {
      console.log("🔄 No messages, setting empty conversation items");
      setConversationItems([]);
      return;
    }

    const items = messages.map((msg) => {
      console.log("🔄 Processing message:", msg);
      if (msg.message_type === "weigh_in_request") {
        const item = {
          id: msg.id,
          type: "weigh_in_request",
          timestamp: msg.created_at,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          data: {
            request: msg.weigh_in_request,
            requestId: msg.weigh_in_request_id,
          },
          pending: msg.pending || false,
        };
        console.log("🔄 Created weigh-in request item:", item);
        return item;
      } else if (msg.message_type === "weigh_in_completion") {
        return {
          id: msg.id,
          type: "weigh_in_completion",
          timestamp: msg.created_at,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          data: {
            message: msg.message,
            requestId: msg.weigh_in_request_id,
          },
          pending: msg.pending || false,
        };
      } else {
        return {
          id: msg.id,
          type: "message",
          timestamp: msg.created_at,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          data: {
            content: msg.message || msg.content || msg.text || "",
          },
          pending: msg.pending || false,
        };
      }
    });

    const sortedItems = items.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    console.log("🔄 Processed conversation items:", sortedItems);
    setConversationItems(sortedItems);
  }, [messages]);

  // Auto-scroll to bottom when new items are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [conversationItems]);

  // Handle input changes
  const handleInputChange = (e) => {
    onChange(e);
    const el = textAreaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
      el.scrollIntoView({ block: "end", behavior: "smooth" });
    }
  };
  // Handle weigh-in request creation  const handleWeighInRequest = (request) => {
    console.log("🎯 Weigh-in request created:", request);

    // Emit via WebSocket if socket is available
    if (socketRef?.current) {
      console.log("📡 Emitting weigh-in request via WebSocket:", request);
      socketRef.current.emit("send-message", request);
    }

    setShowWeighInModal(false);
  };

  // Render conversation items
  const renderConversationItem = (item, index) => {
    const isMe = item.senderId === authUserId;

    switch (item.type) {
      case "weigh_in_request":        return (
          <WeighInRequestItem
            key={item.id}
            item={item}
            isMe={isMe}
            onAccept={setSelectedWeighInRequest}
            userRole={userRole}
            user={user}
            dispatch={dispatch}
          />
        );
      case "weigh_in_completion":
        return <WeighInCompletionItem key={item.id} item={item} isMe={isMe} />;
      case "message":
      default:
        return <MessageItem key={item.id} item={item} isMe={isMe} />;
    }
  };

  const chartOptions = {
    chart: { id: "basic-bar", toolbar: { show: false } },
    legend: { show: false },
    grid: {
      padding: { top: -20, bottom: -20, left: 1, right: 10 },
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
    },
    colors: ["#EEEEEE", "#FF4560"],
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
  };

  return (
    <div className="flex-1 flex items-center w-full gap-4">
      <div className="flex flex-col gap-1 w-[400px] h-[770px]">
        <div className="flex-1 flex flex-col h-full bg-zinc-200 pt-4 px-4 rounded-lg">
          {/* Header */}
          <div className="flex w-full justify-between">
            <div className="flex items-center gap-4 w-full mb-4">
              <div className="relative rounded-full bg-zinc-300 w-14 h-14 overflow-hidden">
                <Image
                  src={user.avatar}
                  alt="avatar"
                  layout="fill"
                  objectFit="cover"
                  className="p-0.5 mt-1"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg text-zinc-900">
                  {user.name}
                </p>
                <p className="text-sm font-extralight text-zinc-900 -mt-2">
                  {user.gym}
                </p>
                <p className="text-xs font-extralight text-zinc-900">
                  {user.email}
                </p>
              </div>{" "}
              {/* Weigh-in Request Buttons for Trainers */}
              {(() => {
                console.log(
                  "🎭 Checking userRole for buttons:",
                  userRole,
                  userRole === "trainer"
                );
                return userRole === "trainer";
              })() && (
                <div className="flex gap-2">                  <button
                    onClick={() => setShowWeighInModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    title="Send Weigh-in Request"
                  >
                    <Scale size={16} />
                    Request
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesEndRef}
            className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-zinc-200"
          >
            {conversationItems && conversationItems.length > 0 ? (
              conversationItems.map((item, index) =>
                renderConversationItem(item, index)
              )
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                <div className="text-center">
                  <MessageSquare
                    size={48}
                    className="mx-auto mb-4 opacity-50"
                  />
                  <p>No messages yet</p>                  <p className="text-sm">Start a conversation!</p>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="relative">
            <textarea
              ref={textAreaRef}
              value={message}
              onChange={handleInputChange}
              onFocus={() => onMarkAsRead && onMarkAsRead()}
              onClick={() => onMarkAsRead && onMarkAsRead()}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                  onMarkAsRead && onMarkAsRead();
                }
              }}
              rows={1}
              className="max-h-40 w-full overflow-hidden border-t border-zinc-300 resize-none p-2 text-black placeholder:text-black/30 placeholder:text-sm text-sm focus:outline-none"
              placeholder="Type a message..."
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                if (message.trim()) {
                  onSend();
                  onMarkAsRead && onMarkAsRead();
                }
              }}
              type="button"
              className="cursor-pointer"
            >
              <SendHorizonal
                size={20}
                className="absolute bottom-2 right-2 text-zinc-800"
              />
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="p-8 bg-zinc-900 rounded-lg">
          <ChartClient
            options={chartOptions}
            series={engagement}
            type="line"
            height={60}
          />
          <div className="flex justify-between">
            <p className="text-xs font-bold text-zinc-500">Engagement</p>
            <div className="flex items-center gap-2">
              <Dot colour="#FF4560" label="You" />
              <Dot colour="#EEEEEE" label="Client" />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showWeighInModal && userRole === "trainer" && (
        <CreateWeighInRequestModal
          isOpen={showWeighInModal}
          onClose={() => setShowWeighInModal(false)}
          clientId={user.id}
          clientName={user.name}
          authUserId={authUserId}
          onRequestCreated={handleWeighInRequest}
        />
      )}
      {selectedWeighInRequest && userRole === "client" && (
        <WeighInRequestResponseModal
          isOpen={!!selectedWeighInRequest}
          onClose={() => setSelectedWeighInRequest(null)}
          request={selectedWeighInRequest}
          authUserId={authUserId}
          onCompleted={() => setSelectedWeighInRequest(null)}
        />
      )}
    </div>
  );
}

// Individual conversation item components
function WeighInRequestItem({ item, isMe, onAccept, userRole, user, dispatch }) {
  const request = item.data.request;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`p-4 rounded-lg max-w-[80%] ${
          isMe
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white text-black rounded-bl-none border border-zinc-300 shadow-md"
        }`}
      >
        <div className="flex items-start gap-3">
          <Scale size={20} className={isMe ? "text-white" : "text-blue-600"} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4
                className="text-sm font-semibold"
                style={{ color: isMe ? "white" : "black" }}
              >
                📋 Weigh-in Request
              </h4>
              {request?.priority && (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    request.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : request.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {request.priority}
                </span>
              )}
            </div>

            <p
              className="text-sm font-medium mb-1"
              style={{ color: isMe ? "white" : "black" }}
            >
              {request?.title || "New weigh-in request"}
            </p>

            {request?.description && (
              <p
                className="text-xs opacity-75 mb-2"
                style={{ color: isMe ? "white" : "black" }}
              >
                {request.description}
              </p>
            )}

            <div
              className="text-xs opacity-75 mb-3"
              style={{ color: isMe ? "white" : "black" }}
            >
              {request?.requested_metrics?.length > 0 && (
                <div className="mb-1">
                  📊 Metrics: {request.requested_metrics.join(", ")}
                </div>
              )}
              {request?.requested_photos?.length > 0 && (
                <div className="mb-1">
                  📸 Photos: {request.requested_photos.join(", ")}
                </div>
              )}
              {request?.due_date && (
                <div>
                  📅 Due: {new Date(request.due_date).toLocaleDateString()}
                </div>
              )}
            </div>            {/* Status-based UI for client */}
            {userRole === "client" && !isMe && (
              <div>
                {request?.status === "pending" && (
                  <div className="flex gap-2">                    <button
                      onClick={() => {
                        console.log("🎯 Client accepting weigh-in request:", request);
                        dispatch(acceptWeighInRequest({
                          requestId: request?.id || item.data.requestId
                        }));
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors font-medium"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => {
                        console.log("❌ Client denied weigh-in request:", request);
                        dispatch(declineWeighInRequest({
                          requestId: request?.id || item.data.requestId
                        }));
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors font-medium"
                    >
                      ✗ Deny
                    </button>
                  </div>
                )}                {request?.status === "declined" && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                    ❌ You declined this request
                  </div>
                )}
                {request?.status === "accepted" && (
                  <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                    ✓ Request accepted - Please submit your data
                  </div>
                )}
                {request?.status === "completed" && (
                  <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                    ✅ Weigh-in completed successfully
                  </div>
                )}
              </div>
            )}            {/* Status indicator for trainer */}
            {userRole === "trainer" && isMe && (
              <div className="text-xs opacity-70 bg-black/20 rounded px-2 py-1">
                Status: {(() => {                  switch(request?.status) {
                    case "pending": return "⏳ Waiting for client response";
                    case "accepted": return "✓ Accepted - Awaiting submission";
                    case "declined": return "❌ Declined by client";
                    case "completed": return "✅ Completed";
                    default: return "pending";
                  }
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/20">
          <span className="text-xs opacity-70">
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isMe && (
            <div className="inline-flex items-center justify-center ml-2 gap-1">
              {item.pending ? (
                <Loader2 className="w-3 h-3 text-zinc-300 animate-spin" />
              ) : (
                <Check className="w-3 h-3 text-zinc-300" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WeighInCompletionItem({ item, isMe }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`p-3 rounded-lg max-w-[80%] ${
          isMe
            ? "bg-green-600 text-white rounded-br-none"
            : "bg-green-50 text-green-800 rounded-bl-none border border-green-200"
        }`}
      >
        <div className="flex items-start gap-2">
          <CheckCircle
            size={16}
            className={isMe ? "text-white" : "text-green-600"}
          />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {item.data.message || "Weigh-in request completed"}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs opacity-70">
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isMe && (
            <div className="inline-flex items-center justify-center ml-2 gap-1">
              <Check className="w-3 h-3 text-zinc-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageItem({ item, isMe }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`p-3 rounded-lg max-w-[80%] ${
          isMe
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white text-black rounded-bl-none border border-zinc-300"
        }`}
      >
        <p
          className="text-sm font-medium"
          style={{ color: isMe ? "white" : "black", fontSize: "14px" }}
        >
          {item.data.content || "[No message content]"}
        </p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs opacity-70">
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isMe && (
            <div className="inline-flex items-center justify-center ml-2 gap-1">
              {item.pending ? (
                <Loader2 className="w-3 h-3 text-zinc-300 animate-spin" />
              ) : (
                <Check className="w-3 h-3 text-zinc-300" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dot({ colour, label }) {
  return (
    <>
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: colour }}
      ></div>
      <p className="text-xs text-zinc-500">{label}</p>
    </>
  );
}
