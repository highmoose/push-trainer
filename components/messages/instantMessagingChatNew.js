"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  SendHorizonal,
  Check,
  Loader2,
  MessageSquare,
  CheckCircle,
} from "lucide-react";

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
}) {
  const textAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Create conversation items from messages
  const [conversationItems, setConversationItems] = useState([]);

  // Convert messages to conversation items
  useEffect(() => {
    if (!messages) {
      setConversationItems([]);
      return;
    }
    const items = messages.map((msg) => {
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

  // Render conversation items
  const renderConversationItem = (item, index) => {
    const isMe = item.senderId === authUserId;
    return <MessageItem key={item.id} item={item} isMe={isMe} />;
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
                </p>{" "}
              </div>
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
              <div className="flex items-center justify-center h-full  text-zinc-500">
                <div className="text-center">
                  <MessageSquare
                    size={48}
                    className="mx-auto mb-4 opacity-50"
                  />
                  <p>No messages yet</p>
                  <p className="text-sm">Start a conversation!</p>
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
        </div>{" "}
      </div>
    </div>
  );
}

// Individual conversation item components
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
