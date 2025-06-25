import { useState, useCallback, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "@/lib/axios";
import { initSocket } from "@/lib/socket";
import {
  addMessage,
  updateMessageStatus,
  setTypingUsers,
  addReaction,
  removeReaction,
  markAsRead,
} from "@/redux/slices/messagingSlice";

export const useEnhancedMessaging = (authUserId) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  // Redux state
  const { conversations, messagesByUser, typingUsers, loading, error } =
    useSelector((state) => state.messaging);

  const [uploadingFiles, setUploadingFiles] = useState({});
  const [messageTemplates, setMessageTemplates] = useState([]);

  // Socket connection
  useEffect(() => {
    if (authUserId && !socketRef.current) {
      socketRef.current = initSocket(authUserId);

      if (socketRef.current) {
        socketRef.current.connect();

        // Enhanced socket listeners
        socketRef.current.on("new_message", (message) => {
          dispatch(addMessage(message));
          // Play notification sound for new messages
          playNotificationSound();
        });

        socketRef.current.on("message_status_update", (data) => {
          dispatch(updateMessageStatus(data));
        });

        socketRef.current.on("user_typing", (data) => {
          dispatch(setTypingUsers(data));
        });

        socketRef.current.on("user_stopped_typing", (data) => {
          dispatch(setTypingUsers({ ...data, isTyping: false }));
        });

        socketRef.current.on("message_reaction", (data) => {
          if (data.action === "add") {
            dispatch(addReaction(data));
          } else {
            dispatch(removeReaction(data));
          }
        });

        socketRef.current.on("message_read", (data) => {
          dispatch(markAsRead(data));
        });
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [authUserId, dispatch]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (typeof window !== "undefined" && "Audio" in window) {
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore autoplay errors
        });
      } catch (error) {
        console.log("Could not play notification sound:", error);
      }
    }
  }, []);

  // Send enhanced message with type and metadata
  const sendEnhancedMessage = useCallback(async (messageData) => {
    try {
      const response = await axios.post("/api/messages/enhanced", {
        receiver_id: messageData.receiverId,
        message_text: messageData.text,
        message_type: messageData.type || "text",
        metadata: messageData.metadata || {},
        attachments: messageData.attachments || [],
        reply_to_id: messageData.replyToId || null,
      });

      // Emit via socket for real-time delivery
      if (socketRef.current) {
        socketRef.current.emit("send_message", response.data.message);
      }

      return response.data.message;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }, []);

  // Send workout plan via message
  const sendWorkoutPlan = useCallback(
    async (clientId, planId, message = "") => {
      try {
        const response = await axios.post("/api/messages/send-workout-plan", {
          client_id: clientId,
          workout_plan_id: planId,
          message: message || "I've created a new workout plan for you!",
        });

        if (socketRef.current) {
          socketRef.current.emit("send_message", response.data.message);
        }

        return response.data.message;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to send workout plan"
        );
      }
    },
    []
  );

  // Send check-in request via message
  const sendCheckInRequest = useCallback(
    async (clientId, requestData, message = "") => {
      try {
        const response = await axios.post(
          "/api/messages/send-checkin-request",
          {
            client_id: clientId,
            checkin_data: requestData,
            message:
              message ||
              "Please complete your check-in when you have a moment.",
          }
        );

        if (socketRef.current) {
          socketRef.current.emit("send_message", response.data.message);
        }

        return response.data.message;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to send check-in request"
        );
      }
    },
    []
  );

  // Send session booking via message
  const sendSessionBooking = useCallback(
    async (clientId, sessionData, message = "") => {
      try {
        const response = await axios.post(
          "/api/messages/send-session-booking",
          {
            client_id: clientId,
            session_data: sessionData,
            message: message || "I've scheduled a training session for you.",
          }
        );

        if (socketRef.current) {
          socketRef.current.emit("send_message", response.data.message);
        }

        return response.data.message;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to send session booking"
        );
      }
    },
    []
  );

  // Upload file/image
  const uploadFile = useCallback(async (file, receiverId) => {
    const uploadId = Date.now().toString();
    setUploadingFiles((prev) => ({
      ...prev,
      [uploadId]: { progress: 0, file },
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("receiver_id", receiverId);

      const response = await axios.post("/api/messages/upload-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadingFiles((prev) => ({
            ...prev,
            [uploadId]: { ...prev[uploadId], progress },
          }));
        },
      });

      // Remove from uploading files
      setUploadingFiles((prev) => {
        const { [uploadId]: removed, ...rest } = prev;
        return rest;
      });

      return response.data;
    } catch (error) {
      setUploadingFiles((prev) => {
        const { [uploadId]: removed, ...rest } = prev;
        return rest;
      });
      throw new Error(error.response?.data?.message || "Failed to upload file");
    }
  }, []);

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (receiverId, isTyping = true) => {
      if (socketRef.current) {
        socketRef.current.emit(isTyping ? "typing" : "stop_typing", {
          receiver_id: receiverId,
          sender_id: authUserId,
        });
      }
    },
    [authUserId]
  );

  // Add reaction to message
  const addMessageReaction = useCallback(
    async (messageId, emoji) => {
      try {
        const response = await axios.post(`/api/messages/${messageId}/react`, {
          emoji,
        });

        if (socketRef.current) {
          socketRef.current.emit("message_reaction", {
            message_id: messageId,
            emoji,
            action: "add",
            user_id: authUserId,
          });
        }

        return response.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to add reaction"
        );
      }
    },
    [authUserId]
  );

  // Remove reaction from message
  const removeMessageReaction = useCallback(
    async (messageId, emoji) => {
      try {
        const response = await axios.delete(
          `/api/messages/${messageId}/react`,
          {
            data: { emoji },
          }
        );

        if (socketRef.current) {
          socketRef.current.emit("message_reaction", {
            message_id: messageId,
            emoji,
            action: "remove",
            user_id: authUserId,
          });
        }

        return response.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to remove reaction"
        );
      }
    },
    [authUserId]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (conversationId) => {
      try {
        const response = await axios.post(
          `/api/conversations/${conversationId}/mark-read`
        );

        if (socketRef.current) {
          socketRef.current.emit("messages_read", {
            conversation_id: conversationId,
            user_id: authUserId,
          });
        }

        dispatch(markAsRead({ conversationId, userId: authUserId }));
        return response.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to mark as read"
        );
      }
    },
    [authUserId, dispatch]
  );

  // Load message templates
  const loadMessageTemplates = useCallback(async () => {
    try {
      const response = await axios.get("/api/messages/templates");
      setMessageTemplates(response.data.templates || []);
    } catch (error) {
      console.error("Failed to load message templates:", error);
    }
  }, []);

  // Save message template
  const saveMessageTemplate = useCallback(async (templateData) => {
    try {
      const response = await axios.post(
        "/api/messages/templates",
        templateData
      );
      setMessageTemplates((prev) => [...prev, response.data.template]);
      return response.data.template;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to save template"
      );
    }
  }, []);

  // Get conversation analytics
  const getConversationAnalytics = useCallback(
    async (conversationId, timeframe = "30d") => {
      try {
        const response = await axios.get(
          `/api/conversations/${conversationId}/analytics`,
          {
            params: { timeframe },
          }
        );
        return response.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to get analytics"
        );
      }
    },
    []
  );

  // Search messages
  const searchMessages = useCallback(async (query, filters = {}) => {
    try {
      const response = await axios.get("/api/messages/search", {
        params: { q: query, ...filters },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to search messages"
      );
    }
  }, []);

  // Load templates on mount
  useEffect(() => {
    loadMessageTemplates();
  }, [loadMessageTemplates]);

  return {
    // State
    conversations,
    messagesByUser,
    typingUsers,
    uploadingFiles,
    messageTemplates,
    loading,
    error,

    // Enhanced messaging functions
    sendEnhancedMessage,
    sendWorkoutPlan,
    sendCheckInRequest,
    sendSessionBooking,
    uploadFile,
    sendTypingIndicator,
    addMessageReaction,
    removeMessageReaction,
    markMessagesAsRead,

    // Templates and search
    saveMessageTemplate,
    searchMessages,
    getConversationAnalytics,

    // Socket reference
    socket: socketRef.current,
  };
};
