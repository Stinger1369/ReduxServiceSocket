import { createAction } from "@reduxjs/toolkit";
import { UserDto, Report } from "../userChatTypes";

export const receiveUserUpdate = createAction<UserDto>("userChat/receiveUserUpdate");
export const receiveBlockedUsers = createAction<{
  blockedUsers: string[];
  blockedBy: string[];
}>("userChat/receiveBlockedUsers");
export const updateUserConnectionStatus = createAction<{
  userId: string;
  isOnline: boolean;
  lastConnectedAt: string;
}>("userChat/updateUserConnectionStatus");
export const updateUserLikesDislikes = createAction<{
  userId: string;
  likes: string[];
  dislikes: string[];
  likedBy?: string[];
}>("userChat/updateUserLikesDislikes");
export const updateUserBlocked = createAction<{
  blockerId: string;
}>("userChat/updateUserBlocked");
export const updateUserBlockedSuccess = createAction<{
  targetId: string;
}>("userChat/updateUserBlockedSuccess");
export const updateUserUnblocked = createAction<{
  unblockerId: string;
}>("userChat/updateUserUnblocked");
export const updateUserUnblockedSuccess = createAction<{
  targetId: string;
}>("userChat/updateUserUnblockedSuccess");
export const updateUserReported = createAction<{
  reporterId: string;
  targetId: string;
  reason: string;
}>("userChat/updateUserReported");
export const updateUserReportedSuccess = createAction<{
  targetId: string;
}>("userChat/updateUserReportedSuccess");
export const removeInvalidUser = createAction<{
  userId: string;
}>("userChat/removeInvalidUser");
export const socketError = createAction<string>("userChat/socketError");
export const handleUserDeletion = createAction("userChat/handleUserDeletion");

export const addUserChatActions = (builder: any) => {
  builder
    .addCase(receiveUserUpdate, (state: UserChatState, action: ReturnType<typeof receiveUserUpdate>) => {
      const updatedUser = action.payload;
      if (state.user && state.user.userId === updatedUser.userId) {
        state.user = updatedUser;
      }
      state.users[updatedUser.userId] = updatedUser;
      if (!state.fetchedUsers.includes(updatedUser.userId)) {
        state.fetchedUsers.push(updatedUser.userId);
      }
      console.log("receiveUserUpdate: Updated user state:", updatedUser);
    })
    .addCase(receiveBlockedUsers, (state: UserChatState, action: ReturnType<typeof receiveBlockedUsers>) => {
      state.blockedInfo = action.payload;
      console.log("receiveBlockedUsers: Updated blockedInfo:", state.blockedInfo);
    })
    .addCase(updateUserConnectionStatus, (state: UserChatState, action: ReturnType<typeof updateUserConnectionStatus>) => {
      const { userId, isOnline, lastConnectedAt } = action.payload;
      if (state.user && state.user.userId === userId) {
        state.user.isOnline = isOnline;
        state.user.lastConnectedAt = lastConnectedAt;
      }
      if (state.users[userId]) {
        state.users[userId].isOnline = isOnline;
        state.users[userId].lastConnectedAt = lastConnectedAt;
      }
      console.log("updateUserConnectionStatus: Updated connection status for userId:", userId);
    })
    .addCase(updateUserLikesDislikes, (state: UserChatState, action: ReturnType<typeof updateUserLikesDislikes>) => {
      const { userId, likes, dislikes, likedBy } = action.payload;
      if (state.user && state.user.userId === userId) {
        state.user.likes = likes;
        state.user.dislikes = dislikes;
        if (likedBy) state.user.likedBy = likedBy;
      }
      if (state.users[userId]) {
        state.users[userId].likes = likes;
        state.users[userId].dislikes = dislikes;
        if (likedBy) state.users[userId].likedBy = likedBy;
      }
      console.log("updateUserLikesDislikes: Updated likes/dislikes for userId:", userId);
    })
    .addCase(updateUserBlocked, (state: UserChatState, action: ReturnType<typeof updateUserBlocked>) => {
      const { blockerId } = action.payload;
      if (state.user) {
        if (!state.user.blockedBy.includes(blockerId)) {
          state.user.blockedBy.push(blockerId);
        }
      }
      console.log("updateUserBlocked: User blocked by:", blockerId);
    })
    .addCase(updateUserBlockedSuccess, (state: UserChatState, action: ReturnType<typeof updateUserBlockedSuccess>) => {
      const { targetId } = action.payload;
      if (state.blockedInfo) {
        if (!state.blockedInfo.blockedUsers.includes(targetId)) {
          state.blockedInfo.blockedUsers.push(targetId);
        }
      } else {
        state.blockedInfo = { blockedUsers: [targetId], blockedBy: [] };
      }
      console.log("updateUserBlockedSuccess: Blocked user:", targetId);
    })
    .addCase(updateUserUnblocked, (state: UserChatState, action: ReturnType<typeof updateUserUnblocked>) => {
      const { unblockerId } = action.payload;
      if (state.user) {
        state.user.blockedBy = state.user.blockedBy.filter(id => id !== unblockerId);
      }
      console.log("updateUserUnblocked: User unblocked by:", unblockerId);
    })
    .addCase(updateUserUnblockedSuccess, (state: UserChatState, action: ReturnType<typeof updateUserUnblockedSuccess>) => {
      const { targetId } = action.payload;
      if (state.blockedInfo) {
        state.blockedInfo.blockedUsers = state.blockedInfo.blockedUsers.filter(id => id !== targetId);
      }
      console.log("updateUserUnblockedSuccess: Unblocked user:", targetId);
    })
    .addCase(updateUserReported, (state: UserChatState, action: ReturnType<typeof updateUserReported>) => {
      const { reporterId, targetId, reason } = action.payload;
      if (state.user && state.user.userId === targetId) {
        state.user.reports.push({ reporterId, reason, timestamp: new Date().toISOString() });
      }
      if (state.users[targetId]) {
        state.users[targetId].reports.push({ reporterId, reason, timestamp: new Date().toISOString() });
      }
      console.log("updateUserReported: User reported:", { targetId, reason });
    })
    .addCase(updateUserReportedSuccess, (state: UserChatState, action: ReturnType<typeof updateUserReportedSuccess>) => {
      console.log("updateUserReportedSuccess: Report confirmed for user:", action.payload.targetId);
    })
    .addCase(removeInvalidUser, (state: UserChatState, action: ReturnType<typeof removeInvalidUser>) => {
      const { userId } = action.payload;
      delete state.users[userId];
      state.fetchedUsers = state.fetchedUsers.filter(id => id !== userId);
      console.log("removeInvalidUser: Removed user:", userId);
    })
    .addCase(socketError, (state: UserChatState, action: ReturnType<typeof socketError>) => {
      state.error = action.payload;
      console.log("socketError: Error set:", action.payload);
    });
};