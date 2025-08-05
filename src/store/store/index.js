import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import clientReducer from "../slices/clientSlice";
import trainerReducer from "../slices/trainerSlice";
import messagingReducer from "../slices/messagingSlice";
import taskReducer from "../slices/taskSlice";
import dietPlanReducer from "../slices/dietPlanSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
    trainer: trainerReducer,
    messaging: messagingReducer,
    tasks: taskReducer,
    dietPlans: dietPlanReducer,
  },
});

export default store;
