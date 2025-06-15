import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import clientReducer from "../slices/clientSlice";
import messagingReducer from "../slices/messagingSlice";
import sessionReducer from "../slices/sessionSlice";
import taskReducer from "../slices/taskSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
    messaging: messagingReducer,
    sessions: sessionReducer,
    tasks: taskReducer,
  },
});

export default store;
