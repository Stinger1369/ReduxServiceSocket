import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { UserChatState } from "./userChatTypes";
import { fetchChatUser, fetchBlockedUsers, saveChatUser, fetchOrSaveChatUser, addChatActionsExtraReducers } from "./features/chatActions";
import {
  likeUserAsync,
  unlikeUserAsync,
  dislikeUserAsync,
  fetchUserLikesAsync,
  fetchBatchUserLikesAsync,
  addLikeActionsExtraReducers
} from "./features/likeActions";
import { blockUserAsync, unblockUserAsync, addBlockActionsExtraReducers } from "./features/blockActions";
import { reportUserAsync, addReportActionsExtraReducers } from "./features/reportActions";
import {
  addUserChatActions,
  receiveUserUpdate,
  receiveBlockedUsers,
  updateUserConnectionStatus,
  updateUserLikesDislikes,
  updateUserBlocked,
  updateUserBlockedSuccess,
  updateUserUnblocked,
  updateUserUnblockedSuccess,
  updateUserReported,
  updateUserReportedSuccess,
  removeInvalidUser,
  socketError,
  handleUserDeletion
} from "./features/userChatActions";
import { deactivateChatUser, reactivateChatUser, deleteChatUser } from "./features/chatActions";

const initialState: UserChatState = {
  user: null,
  users: {},
  blockedInfo: null,
  loading: false,
  error: null,
  fetchedUsers: [],
};

const userChatSlice = createSlice({
  name: "userChat",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    addChatActionsExtraReducers(builder);
    addLikeActionsExtraReducers(builder);
    addBlockActionsExtraReducers(builder);
    addReportActionsExtraReducers(builder);
    addUserChatActions(builder);
    builder
      .addCase(handleUserDeletion, (state) => {
        state.user = null;
        state.users = {};
        state.blockedInfo = null;
        state.error = 'Your account has been deleted';
        console.log("userChatSlice: User account deleted, state cleared");
      })
      .addCase(PURGE, () => initialState);
  }
});

export {
  fetchChatUser,
  fetchBlockedUsers,
  saveChatUser,
  fetchOrSaveChatUser,
  likeUserAsync,
  unlikeUserAsync,
  dislikeUserAsync,
  fetchUserLikesAsync,
  fetchBatchUserLikesAsync,
  blockUserAsync,
  unblockUserAsync,
  reportUserAsync,
  receiveUserUpdate,
  receiveBlockedUsers,
  updateUserConnectionStatus,
  updateUserLikesDislikes,
  updateUserBlocked,
  updateUserBlockedSuccess,
  updateUserUnblocked,
  updateUserUnblockedSuccess,
  updateUserReported,
  updateUserReportedSuccess,
  removeInvalidUser,
  socketError,
  handleUserDeletion,
  deactivateChatUser,
  reactivateChatUser,
  deleteChatUser
};

export default userChatSlice.reducer;