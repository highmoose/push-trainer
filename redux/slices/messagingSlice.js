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

export const fetchAllMessages = createAsyncThunk(
  "messaging/fetchAllMessages",
  async ({ authUserId }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/messages");
      return { messages: response.data, authUserId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Unknown error" }
      );
    }
  }
);

// Initial State
const initialState = {
  conversations: [],
  messagesByUser: {}, // { userId: [messages] }
  authUserId: null,
  status: "idle",
};

// Slice
const messagingSlice = createSlice({
  name: "messaging",
  initialState,
  reducers: {
    addMessage(state, action) {
      const msg = action.payload;
      const otherUserId =
        msg.sender_id === state.authUserId ? msg.receiver_id : msg.sender_id;

      if (!state.messagesByUser[otherUserId]) {
        state.messagesByUser[otherUserId] = [];
      }

      // prevent duplicates by ID
      const exists = state.messagesByUser[otherUserId].some(
        (m) => m.id === msg.id
      );
      if (!exists) {
        state.messagesByUser[otherUserId].push(msg);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { userId, messages } = action.payload;
        state.messagesByUser[userId] = messages;
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

        const grouped = {};

        messages.forEach((msg) => {
          const otherUserId =
            msg.sender_id === authUserId ? msg.receiver_id : msg.sender_id;

          if (!grouped[otherUserId]) grouped[otherUserId] = [];
          grouped[otherUserId].push(msg);
        });
        state.messagesByUser = grouped;
        state.authUserId = authUserId;
      });
  },
});

export const { addMessage } = messagingSlice.actions;
export default messagingSlice.reducer;
