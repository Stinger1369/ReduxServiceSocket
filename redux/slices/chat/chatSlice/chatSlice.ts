import {createSlice} from "@reduxjs/toolkit";
import {PURGE} from "redux-persist";
import {ChatState} from "./chatTypes";
import {fetchConversation, fetchUserConversations, addChatActionsExtraReducers} from "./features/chatActions";
import {performAddReaction, performRemoveReaction, addReactionActionsExtraReducers} from "./features/reactionActions";
import {markMessageAsUnread, updateMessage, deleteMessage, addMessageActionsExtraReducers} from "./features/messageActions";
import {inviteToGroup, deleteConversation, addConversationActionsExtraReducers} from "./features/conversationActions";
import {
  receiveMessage,
  setTypingStatus,
  setUnreadConversations,
  updateMessageLikes,
  updateMessageDislikes,
  addReaction,
  removeReaction,
  messageRead,
  messageUnread,
  messagesRead,
  messageUpdated,
  messageDeleted,
  setError,
  clearError,
  setCurrentUserId,
  addChatSliceActions
} from "./features/chatSliceActions";

const initialState: ChatState = {
  conversations: [],
  messages: {},
  typingStatus: [],
  unreadConversations: [],
  loading: false,
  error: null,
  currentUserId: undefined
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    addChatActionsExtraReducers(builder);
    addReactionActionsExtraReducers(builder);
    addMessageActionsExtraReducers(builder);
    addConversationActionsExtraReducers(builder);
    addChatSliceActions(builder);
    builder.addCase(PURGE, () => initialState);
  }
});

export {
  fetchConversation,
  fetchUserConversations,
  markMessageAsUnread,
  performAddReaction,
  performRemoveReaction,
  inviteToGroup,
  updateMessage,
  deleteMessage,
  deleteConversation,
  receiveMessage,
  setTypingStatus,
  setUnreadConversations,
  updateMessageLikes,
  updateMessageDislikes,
  addReaction,
  removeReaction,
  messageRead,
  messageUnread,
  messagesRead,
  messageUpdated,
  messageDeleted,
  setError,
  clearError,
  setCurrentUserId
};

export default chatSlice.reducer;
