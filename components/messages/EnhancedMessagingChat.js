"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Search,
  Star,
  Reply,
  Forward,
  Copy,
  Trash2,
  Edit3,
  Download,
  Image as ImageIcon,
  File,
  Mic,
  Plus,
  Calendar,
  Dumbbell,
  Scale,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  Clock,
  CheckCheck,
  Check,
} from "lucide-react";
import { useEnhancedMessaging } from "@/hooks/messaging/useEnhancedMessaging";

// Simple emoji picker component
const SimpleEmojiPicker = ({ onEmojiSelect, onClose }) => {
  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "🤔",
    "🤭",
    "🤫",
    "🤥",
    "😶",
    "😐",
    "😑",
    "😬",
    "🙄",
    "😯",
    "😦",
    "😧",
    "😮",
    "😲",
    "🥱",
    "😴",
    "🤤",
    "😪",
    "😵",
    "🤐",
    "🥴",
    "🤢",
    "🤮",
    "🤧",
    "😷",
    "🤒",
    "🤕",
    "🤑",
    "🤠",
    "😈",
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👏",
    "🙌",
    "🤝",
    "🙏",
    "✍️",
    "💪",
    "🦵",
    "🦶",
    "👂",
    "🦻",
    "👃",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
    "✨",
    "🌟",
    "💫",
    "⭐",
    "🌠",
    "☀️",
    "🌞",
    "🌝",
    "🌛",
    "🌜",
    "🔥",
    "💯",
    "⚡",
    "💥",
    "💢",
    "💨",
    "💦",
    "💤",
    "💀",
    "☠️",
  ];

  return (
    <div className="absolute bottom-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-xs z-50">
      <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="text-lg hover:bg-gray-100 rounded p-1 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-2 text-sm text-gray-500 hover:text-gray-700 w-full"
      >
        Close
      </button>
    </div>
  );
};

const MESSAGE_TYPES = {
  text: "text",
  image: "image",
  file: "file",
  audio: "audio",
  workout_plan: "workout_plan",
  checkin_request: "checkin_request",
  session_booking: "session_booking",
  system: "system",
};

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const MESSAGE_TEMPLATES = [
  {
    id: 1,
    name: "Weekly Check-in",
    content:
      "Hi! Time for your weekly check-in. Please update your progress when you have a moment. Thanks!",
    category: "check-in",
  },
  {
    id: 2,
    name: "Workout Reminder",
    content:
      "Don't forget about your workout session today! Let me know if you need to reschedule.",
    category: "reminder",
  },
  {
    id: 3,
    name: "Great Progress",
    content:
      "Amazing progress this week! Keep up the excellent work. Your dedication is really showing!",
    category: "motivation",
  },
  {
    id: 4,
    name: "Plan Updated",
    content:
      "I've updated your training plan based on your recent progress. Check it out when you can!",
    category: "update",
  },
];

export default function EnhancedMessagingChat({
  selectedUser,
  authUserId,
  onClose,
}) {
  const {
    messagesByUser,
    typingUsers,
    sendEnhancedMessage,
    sendWorkoutPlan,
    sendCheckInRequest,
    sendSessionBooking,
    uploadFile,
    sendTypingIndicator,
    addMessageReaction,
    removeMessageReaction,
    markMessagesAsRead,
    uploadingFiles,
  } = useEnhancedMessaging(authUserId);

  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showMessageActions, setShowMessageActions] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messageInputRef = useRef(null);

  const messages = messagesByUser[selectedUser?.id] || [];
  const isTyping = typingUsers[selectedUser?.id]?.isTyping || false;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedUser?.id) {
      markMessagesAsRead(selectedUser.id);
    }
  }, [selectedUser?.id, markMessagesAsRead]);

  // Handle typing indicator
  const handleTypingIndicator = (isTyping) => {
    if (selectedUser?.id) {
      sendTypingIndicator(selectedUser.id, isTyping);

      if (isTyping) {
        // Clear existing timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }

        // Set new timeout to stop typing indicator
        const timeout = setTimeout(() => {
          sendTypingIndicator(selectedUser.id, false);
        }, 3000);

        setTypingTimeout(timeout);
      }
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Send typing indicator
    if (e.target.value.length > 0) {
      handleTypingIndicator(true);
    } else {
      handleTypingIndicator(false);
    }
  };

  const handleSendMessage = async (
    messageType = MESSAGE_TYPES.text,
    metadata = {}
  ) => {
    if (!message.trim() && messageType === MESSAGE_TYPES.text) return;

    try {
      await sendEnhancedMessage({
        receiverId: selectedUser.id,
        text: message,
        type: messageType,
        metadata,
        replyToId: replyToMessage?.id,
      });

      setMessage("");
      setReplyToMessage(null);
      setEditingMessage(null);
      handleTypingIndicator(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileUpload = async (file, type = "file") => {
    try {
      const uploadResult = await uploadFile(file, selectedUser.id);

      await sendEnhancedMessage({
        receiverId: selectedUser.id,
        text: `Shared ${type}: ${file.name}`,
        type: type === "image" ? MESSAGE_TYPES.image : MESSAGE_TYPES.file,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileUrl: uploadResult.url,
          mimeType: file.type,
        },
      });
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      // Check if user already reacted with this emoji
      const existingReaction = messages
        .find((msg) => msg.id === messageId)
        ?.reactions?.find((r) => r.userId === authUserId && r.emoji === emoji);

      if (existingReaction) {
        await removeMessageReaction(messageId, emoji);
      } else {
        await addMessageReaction(messageId, emoji);
      }
    } catch (error) {
      console.error("Failed to handle reaction:", error);
    }
  };

  const handleQuickAction = async (actionType) => {
    switch (actionType) {
      case "workout_plan":
        // This would open a workout plan selector modal
        console.log("Send workout plan");
        break;
      case "checkin_request":
        try {
          await sendCheckInRequest(selectedUser.id, {
            fields: ["weight", "energy_level", "mood"],
            photo_required: false,
            due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          });
        } catch (error) {
          console.error("Failed to send check-in request:", error);
        }
        break;
      case "session_booking":
        // This would open a session booking modal
        console.log("Book session");
        break;
    }
    setShowQuickActions(false);
  };

  const handleTemplateSelect = (template) => {
    setMessage(template.content);
    setShowTemplates(false);
    messageInputRef.current?.focus();
  };

  const MessageBubble = ({ msg, isOwn }) => {
    const [showReactions, setShowReactions] = useState(false);

    const getMessageIcon = (type) => {
      switch (type) {
        case MESSAGE_TYPES.workout_plan:
          return <Dumbbell className="h-4 w-4" />;
        case MESSAGE_TYPES.checkin_request:
          return <Scale className="h-4 w-4" />;
        case MESSAGE_TYPES.session_booking:
          return <Calendar className="h-4 w-4" />;
        case MESSAGE_TYPES.image:
          return <ImageIcon className="h-4 w-4" />;
        case MESSAGE_TYPES.file:
          return <File className="h-4 w-4" />;
        default:
          return null;
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "sent":
          return <Check className="h-3 w-3 text-zinc-400" />;
        case "delivered":
          return <CheckCheck className="h-3 w-3 text-zinc-400" />;
        case "read":
          return <CheckCheck className="h-3 w-3 text-blue-400" />;
        default:
          return <Clock className="h-3 w-3 text-zinc-400" />;
      }
    };

    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
        <div
          className={`max-w-xs lg:max-w-md ${isOwn ? "order-1" : "order-2"}`}
        >
          {/* Reply context */}
          {msg.reply_to && (
            <div className="bg-zinc-800 rounded-t-lg p-2 text-xs text-zinc-400 border-l-2 border-blue-500">
              Replying to: {msg.reply_to.content?.substring(0, 50)}...
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`relative rounded-lg px-4 py-2 ${
              isOwn ? "bg-blue-600 text-white" : "bg-zinc-800 text-white"
            } ${msg.reply_to ? "rounded-t-none" : ""}`}
            onDoubleClick={() => setShowReactions(!showReactions)}
          >
            {/* Message type indicator */}
            {msg.message_type !== MESSAGE_TYPES.text && (
              <div className="flex items-center gap-2 mb-2 text-sm opacity-80">
                {getMessageIcon(msg.message_type)}
                <span className="capitalize">
                  {msg.message_type.replace("_", " ")}
                </span>
              </div>
            )}

            {/* Message content */}
            <div className="break-words">
              {msg.message_type === MESSAGE_TYPES.image &&
                msg.metadata?.fileUrl && (
                  <img
                    src={msg.metadata.fileUrl}
                    alt="Shared image"
                    className="max-w-full rounded-lg mb-2"
                  />
                )}

              {msg.message_type === MESSAGE_TYPES.file &&
                msg.metadata?.fileName && (
                  <div className="flex items-center gap-2 mb-2 p-2 bg-black/20 rounded">
                    <File className="h-4 w-4" />
                    <span className="text-sm">{msg.metadata.fileName}</span>
                    <Download className="h-4 w-4 ml-auto cursor-pointer" />
                  </div>
                )}

              <p>{msg.content || msg.message_text}</p>
            </div>

            {/* Message metadata for special types */}
            {msg.metadata && Object.keys(msg.metadata).length > 0 && (
              <div className="text-xs opacity-70 mt-1">
                {msg.message_type === MESSAGE_TYPES.checkin_request && (
                  <div>
                    Due: {new Date(msg.metadata.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}

            {/* Reactions */}
            {msg.reactions && msg.reactions.length > 0 && (
              <div className="flex gap-1 mt-2">
                {msg.reactions.map((reaction, index) => (
                  <button
                    key={index}
                    onClick={() => handleReaction(msg.id, reaction.emoji)}
                    className="text-sm bg-black/20 rounded-full px-2 py-1 hover:bg-black/30"
                  >
                    {reaction.emoji} {reaction.count > 1 && reaction.count}
                  </button>
                ))}
              </div>
            )}

            {/* Quick reactions overlay */}
            {showReactions && (
              <div className="absolute -top-8 left-0 bg-zinc-700 rounded-full px-2 py-1 flex gap-1 shadow-lg">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      handleReaction(msg.id, emoji);
                      setShowReactions(false);
                    }}
                    className="hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message footer */}
          <div
            className={`flex items-center gap-1 mt-1 text-xs text-zinc-500 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            <span>
              {new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isOwn && getStatusIcon(msg.status)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {selectedUser?.name?.charAt(0) || "U"}
            </span>
          </div>
          <div>
            <h3 className="text-white font-medium">
              {selectedUser?.name || "User"}
            </h3>
            {isTyping && <p className="text-xs text-blue-400">typing...</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
            <Search className="h-5 w-5" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={String(msg.sender_id) === String(authUserId)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Context */}
      {replyToMessage && (
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-400">
              Replying to: {replyToMessage.content?.substring(0, 50)}...
            </div>
            <button
              onClick={() => setReplyToMessage(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Templates Panel */}
      {showTemplates && (
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">
              Message Templates
            </span>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {MESSAGE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="text-left p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-white"
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-zinc-400 text-xs">
                  {template.content.substring(0, 60)}...
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">
              Quick Actions
            </span>
            <button
              onClick={() => setShowQuickActions(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickAction("workout_plan")}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              <Dumbbell className="h-4 w-4" />
              Send Workout Plan
            </button>
            <button
              onClick={() => handleQuickAction("checkin_request")}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              <Scale className="h-4 w-4" />
              Request Check-in
            </button>
            <button
              onClick={() => handleQuickAction("session_booking")}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
            >
              <Calendar className="h-4 w-4" />
              Book Session
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-end gap-3">
          {/* Attachment buttons */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              ref={messageInputRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="w-full p-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              rows={1}
            />

            {/* Input actions */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="p-1 text-zinc-400 hover:text-white rounded"
              >
                <Star className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 text-zinc-400 hover:text-white rounded"
              >
                <Smile className="h-4 w-4" />
              </button>
            </div>

            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <SimpleEmojiPicker
                  onEmojiSelect={(emoji) => {
                    setMessage((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!message.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-400 text-white rounded-lg transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          Array.from(e.target.files || []).forEach((file) => {
            handleFileUpload(file, "file");
          });
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          Array.from(e.target.files || []).forEach((file) => {
            handleFileUpload(file, "image");
          });
        }}
      />
    </div>
  );
}
