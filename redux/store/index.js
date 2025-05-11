import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import clientReducer from "../slices/clientSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
  },
});

export default store;
