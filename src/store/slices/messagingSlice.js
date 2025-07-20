import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";

// Async Thunks
export const fetchConversations = createAsyncThunk(
  "messaging/fetchConversations",
  async () => {
    const response = await axios.get("/api/conversations");
    return response.data;
  }
);

export const fetchMessages = createAsyncThunk(
  "messaging/fetchMessages",
  async (userId) => {
    const response = await axios.get(`/api/messages/${userId}`);
    return { userId, messages: response.data };
  }
);

export const sendMessage = createAsyncThunk(
  "messaging/sendMessage",
  async ({ receiver_id, content }, { dispatch }) => {
    console.log("📨 sendMessage thunk running with:", { receiver_id, content });

    const response = await axios.post("/api/messages", {
      receiver_id,
      content,
    });

    console.log("✅ API responded with:", response.data);

    dispatch(fetchConversations());
    return response.data;
  }
);

export const sendEnhancedMessage = createAsyncThunk(
  "messaging/sendEnhancedMessage",
  async (
    { receiver_id, message_text, message_type, metadata, attachments },
    { dispatch }
  ) => {
    const response = await axios.post("/api/messages/enhanced", {
      receiver_id,
      message_text,
      message_type,
      metadata,
      attachments,
    });

    dispatch(fetchConversations());
    return response.data;
  }
);

export const fetchAllMessages = createAsyncThunk(
  "messaging/fetchAllMessages",
  async ({ authUserId }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/messages");
      return { messages: response.data, authUserId };
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      return rejectWithValue(
        error.response?.data || { error: "Failed to fetch messages" }
      );
    }
  }
);

// Initial State
const initialState = {
  conversations: [],
  messagesByUser: {}, // { userId: [messages] }
  authUserId: null,
  typingUsers: {}, // { userId: { isTyping: boolean, timestamp: number } }
  messageReactions: {}, // { messageId: [{ userId, emoji, timestamp }] }
  unreadCounts: {}, // { userId: number }
  status: "idle",
  loading: false,
  error: null,
};

// Slice
const messagingSlice = createSlice({
  name: "messaging",
  initialState,
  reducers: {
    setAuthUserId(state, action) {
      state.authUserId = action.payload;
    },
    addMessage(state, action) {
      const msg = action.payload;
      console.log("🔄 addMessage reducer - msg:", msg);
      console.log(
        "🔄 addMessage reducer - current authUserId:",
        state.authUserId
      );
      console.log("🔄 addMessage reducer - msg.pending:", msg.pending);
      console.log("🔄 addMessage reducer - msg.sender_id:", msg.sender_id);

      // For pending messages (optimistic updates), only show to the sender
      if (msg.pending && msg.sender_id != state.authUserId) {
        console.log(
          "⏭️ addMessage reducer - skipping pending message for non-sender"
        );
        return;
      }

      // Helper function to add message to a specific user's conversation
      const addToConversation = (userId, message) => {
        if (!state.messagesByUser[userId]) {
          state.messagesByUser[userId] = [];
        }

        const exists = state.messagesByUser[userId].some(
          (m) => m.id === message.id
        );

        if (!exists) {
          state.messagesByUser[userId].push(message);
          console.log(
            `✅ addMessage reducer - added message to user: ${userId}`
          );
        } else {
          // If message exists and this is a non-pending version, replace the pending one
          if (!message.pending) {
            const index = state.messagesByUser[userId].findIndex(
              (m) => m.id === message.id
            );
            if (index !== -1) {
              state.messagesByUser[userId][index] = message;
              console.log(
                `🔄 addMessage reducer - replaced pending message for user: ${userId}`
              );
            }
          }
        }
      };

      // Handle replacement of optimistic messages
      if (msg.replaceOptimistic) {
        const otherUserId =
          msg.sender_id == state.authUserId ? msg.receiver_id : msg.sender_id;
        const optimisticIndex = state.messagesByUser[otherUserId]?.findIndex(
          (m) => m.id === msg.replaceOptimistic
        );
        if (optimisticIndex !== -1) {
          // Replace the optimistic message
          state.messagesByUser[otherUserId][optimisticIndex] = {
            ...msg,
            replaceOptimistic: undefined, // Remove the flag
          };
          console.log(
            "🔄 addMessage reducer - replaced optimistic message with real message"
          );
          return;
        }
      }

      // Store message in BOTH user conversations so both participants can see it
      // For the sender: store under receiver's ID
      // For the receiver: store under sender's ID
      const senderId = String(msg.sender_id);
      const receiverId = String(msg.receiver_id);

      console.log(
        `� addMessage reducer - storing message for both users: sender=${senderId}, receiver=${receiverId}`
      );
      // Add to sender's conversation with receiver
      addToConversation(receiverId, msg);

      // Add to receiver's conversation with sender - simplified logic
      addToConversation(senderId, msg);

      console.log(
        "📊 addMessage reducer - messagesByUser after add:",
        state.messagesByUser
      );
    },
    setTypingUsers(state, action) {
      const { userId, isTyping, timestamp = Date.now() } = action.payload;
      if (isTyping) {
        state.typingUsers[userId] = { isTyping: true, timestamp };
      } else {
        delete state.typingUsers[userId];
      }
    },
    addReaction(state, action) {
      const {
        messageId,
        userId,
        emoji,
        timestamp = Date.now(),
      } = action.payload;
      if (!state.messageReactions[messageId]) {
        state.messageReactions[messageId] = [];
      }

      // Remove existing reaction from this user for this message
      state.messageReactions[messageId] = state.messageReactions[
        messageId
      ].filter((reaction) => reaction.userId !== userId);

      // Add new reaction
      state.messageReactions[messageId].push({ userId, emoji, timestamp });
    },
    removeReaction(state, action) {
      const { messageId, userId } = action.payload;
      if (state.messageReactions[messageId]) {
        state.messageReactions[messageId] = state.messageReactions[
          messageId
        ].filter((reaction) => reaction.userId !== userId);

        // Clean up empty reaction arrays
        if (state.messageReactions[messageId].length === 0) {
          delete state.messageReactions[messageId];
        }
      }
    },
    updateMessageStatus(state, action) {
      const { messageId, status, timestamp = Date.now() } = action.payload;

      // Find and update message status across all conversations
      Object.keys(state.messagesByUser).forEach((userId) => {
        const messageIndex = state.messagesByUser[userId].findIndex(
          (msg) => msg.id === messageId
        );
        if (messageIndex !== -1) {
          state.messagesByUser[userId][messageIndex] = {
            ...state.messagesByUser[userId][messageIndex],
            status,
            [`${status}_at`]: timestamp,
          };
        }
      });
    },
    markAsRead(state, action) {
      const { conversationId, userId } = action.payload;

      // Reset unread count for this conversation
      state.unreadCounts[conversationId] = 0;

      // Mark all messages in this conversation as read
      if (state.messagesByUser[conversationId]) {
        state.messagesByUser[conversationId].forEach((message) => {
          if (message.sender_id !== userId && message.status !== "read") {
            message.status = "read";
            message.read_at = Date.now();
          }
        });
      }
    },
    incrementUnreadCount(state, action) {
      const { conversationId } = action.payload;
      state.unreadCounts[conversationId] =
        (state.unreadCounts[conversationId] || 0) + 1;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { userId, messages } = action.payload;
        console.log(
          "fetchMessages.fulfilled - userId:",
          userId,
          "messages:",
          messages
        );
        state.messagesByUser[userId] = messages;
        console.log(
          "fetchMessages.fulfilled - messagesByUser updated:",
          state.messagesByUser
        );
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        const otherUserId =
          msg.sender_id === state.authUserId ? msg.receiver_id : msg.sender_id;

        if (!state.messagesByUser[otherUserId]) {
          state.messagesByUser[otherUserId] = [];
        }

        const existingIndex = state.messagesByUser[otherUserId].findIndex(
          (m) =>
            m.pending &&
            m.content === msg.content &&
            m.receiver_id === msg.receiver_id
        );

        if (existingIndex !== -1) {
          // Replace the optimistic message with the real one
          state.messagesByUser[otherUserId][existingIndex] = msg;
        } else {
          // No match – just push the real one
          state.messagesByUser[otherUserId].push(msg);
        }
      })
      .addCase(fetchAllMessages.fulfilled, (state, action) => {
        const payload = action.payload || {};
        const messages = payload.messages || [];
        const authUserId = payload.authUserId || null;

        console.log("fetchAllMessages.fulfilled - payload:", payload);
        console.log("fetchAllMessages.fulfilled - messages:", messages);
        console.log("fetchAllMessages.fulfilled - authUserId:", authUserId);

        const grouped = {};

        messages.forEach((msg) => {
          const senderId = String(msg.sender_id);
          const receiverId = String(msg.receiver_id);

          // Store message in BOTH user conversations so both participants can see it
          // For the current user, determine the "other user" in the conversation
          const otherUserId =
            senderId === String(authUserId) ? receiverId : senderId;

          if (!grouped[otherUserId]) grouped[otherUserId] = [];
          grouped[otherUserId].push(msg);
        });

        console.log("fetchAllMessages.fulfilled - grouped messages:", grouped);

        state.messagesByUser = grouped;
        state.authUserId = authUserId;
      });
  },
});

export const {
  addMessage,
  setAuthUserId,
  setTypingUsers,
  addReaction,
  removeReaction,
  updateMessageStatus,
  markAsRead,
  incrementUnreadCount,
  setLoading,
  setError,
} = messagingSlice.actions;
export default messagingSlice.reducer;
