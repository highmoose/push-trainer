import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import clientReducer from "../slices/clientSlice";
import messagingReducer from "../slices/messagingSlice";
import sessionReducer from "../slices/sessionSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
    messaging: messagingReducer,
    sessions: sessionReducer,
  },
});

export default store;
