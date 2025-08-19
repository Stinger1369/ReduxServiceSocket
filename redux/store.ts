import {configureStore, combineReducers} from "@reduxjs/toolkit";
// SpringBoot
import authReducer from "./slices/authSlice";
import nurseReducer from "./slices/nurseSlice";
import patientReducer from "./slices/patientSlice";
import imageReducer from "./slices/ImageSlice";
import patientRecordReducer from "./slices/PatientRecordSlice";
// Chat Socket Service
import userChatReducer from "./slices/chat/userChat/userChatSlice";
import postChatReducer from "./slices/chat/postChat/postChatSlice";
import commentChatReducer from "./slices/chat/commentChat/commentChatSlice";
import chatReducer from "./slices/chat/chatSlice/chatSlice";
import notificationReducer from "./slices/chat/notificationSlice/notificationSlice";
import friendReducer from "./slices/chat/friendSlice/friendSlice";
import tourReducer from "./slices/tourSlice";

const rootReducer = combineReducers({
  // SpringBoot
  auth: authReducer,
  nurse: nurseReducer,
  patient: patientReducer,
  image: imageReducer,
  patientRecord: patientRecordReducer,
  tour: tourReducer,
  // Chat Socket Service
  userChat: userChatReducer,
  postChat: postChatReducer,
  commentChat: commentChatReducer,
  chat: chatReducer,
  notifications: notificationReducer,
  friends: friendReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false})
});

export type RootState = ReturnType < typeof rootReducer >;
export type AppDispatch = typeof store.dispatch;

export default store;
