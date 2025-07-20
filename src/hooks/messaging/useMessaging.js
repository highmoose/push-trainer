import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";

export const useMessaging = (authUserId) => {
  const [conversations, setConversations] = useState([]);
  const [messagesByUser, setMessagesByUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/conversations");
      setConversations(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/messages/${userId}`);
      setMessagesByUser((prev) => ({
        ...prev,
        [userId]: response.data || [],
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async ({
      receiver_id,
      content,
      message_type = "text",
      weigh_in_request,
    }) => {
      console.log("📨 sendMessage hook running with:", {
        receiver_id,
        content,
      });

      // Generate temporary message for optimistic update
      const tempId = `temp_${Date.now()}`;
      const tempMessage = {
        id: tempId,
        sender_id: authUserId,
        receiver_id,
        content,
        message_type,
        weigh_in_request,
        created_at: new Date().toISOString(),
        pending: true,
      };

      // Optimistic update - add to both sender and receiver conversations
      setMessagesByUser((prev) => {
        const updatedMessages = { ...prev };

        // Add to sender's conversation with receiver
        if (!updatedMessages[receiver_id]) {
          updatedMessages[receiver_id] = [];
        }
        updatedMessages[receiver_id] = [
          ...updatedMessages[receiver_id],
          tempMessage,
        ];

        return updatedMessages;
      });

      try {
        const response = await axios.post("/api/messages", {
          receiver_id,
          content,
          message_type,
          weigh_in_request,
        });

        console.log("✅ API responded with:", response.data);
        const newMessage = response.data;

        // Replace temporary message with real data
        setMessagesByUser((prev) => {
          const updatedMessages = { ...prev };

          if (updatedMessages[receiver_id]) {
            updatedMessages[receiver_id] = updatedMessages[receiver_id].map(
              (msg) =>
                msg.id === tempId ? { ...newMessage, pending: false } : msg
            );
          }

          return updatedMessages;
        });

        // Refresh conversations
        fetchConversations();

        return newMessage;
      } catch (err) {
        // Remove temporary message on error
        setMessagesByUser((prev) => {
          const updatedMessages = { ...prev };

          if (updatedMessages[receiver_id]) {
            updatedMessages[receiver_id] = updatedMessages[receiver_id].filter(
              (msg) => msg.id !== tempId
            );
          }

          return updatedMessages;
        });

        setError(err.response?.data?.message || "Failed to send message");
        throw err;
      }
    },
    [authUserId, fetchConversations]
  );

  const addMessage = useCallback(
    (message) => {
      console.log("🔄 addMessage hook - msg:", message);
      console.log("🔄 addMessage hook - current authUserId:", authUserId);

      // For pending messages (optimistic updates), only show to the sender
      if (message.pending && message.sender_id != authUserId) {
        console.log(
          "⏭️ addMessage hook - skipping pending message for non-sender"
        );
        return;
      }

      // Helper function to add message to a specific user's conversation
      const addToConversation = (userId, msg) => {
        setMessagesByUser((prev) => {
          const updatedMessages = { ...prev };

          if (!updatedMessages[userId]) {
            updatedMessages[userId] = [];
          }

          const exists = updatedMessages[userId].some((m) => m.id === msg.id);
          if (!exists) {
            updatedMessages[userId] = [...updatedMessages[userId], msg];
            console.log(
              `✅ addMessage hook - added message to user: ${userId}`
            );
          }

          return updatedMessages;
        });
      };

      // Add message to appropriate conversations based on sender/receiver
      if (message.sender_id == authUserId) {
        // Current user sent this message - add to receiver's conversation
        addToConversation(message.receiver_id, message);
      } else {
        // Someone else sent this message to current user - add to sender's conversation
        addToConversation(message.sender_id, message);
      }
    },
    [authUserId]
  );

  const acceptWeighInRequest = useCallback(async ({ requestId }) => {
    // This would typically update a specific message's status optimistically
    console.log(`Accepting weigh-in request: ${requestId}`);

    try {
      const response = await axios.patch(
        `/api/weigh-in-requests/${requestId}/accept`
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept request");
      throw err;
    }
  }, []);

  const declineWeighInRequest = useCallback(async ({ requestId }) => {
    console.log(`Declining weigh-in request: ${requestId}`);

    try {
      const response = await axios.patch(
        `/api/weigh-in-requests/${requestId}/decline`
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to decline request");
      throw err;
    }
  }, []);

  const completeWeighInRequest = useCallback(async ({ requestId }) => {
    console.log(`Completing weigh-in request: ${requestId}`);

    try {
      const response = await axios.patch(
        `/api/weigh-in-requests/${requestId}/complete`
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete request");
      throw err;
    }
  }, []);

  return {
    conversations,
    messagesByUser,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    addMessage,
    acceptWeighInRequest,
    declineWeighInRequest,
    completeWeighInRequest,
    // Helper methods
    getConversation: useCallback(
      (userId) => messagesByUser[userId] || [],
      [messagesByUser]
    ),
    getLatestMessage: useCallback(
      (userId) => {
        const messages = messagesByUser[userId] || [];
        return messages[messages.length - 1];
      },
      [messagesByUser]
    ),
  };
};
