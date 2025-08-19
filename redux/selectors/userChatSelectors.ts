import { createSelector } from 'reselect';
import { RootState } from '../store';

const getUserChatState = (state: RootState) => state.userChat;

export const getChatUserId = createSelector(
  [getUserChatState],
  (userChatState) => userChatState.user?.userId
);

export const getChatUsers = createSelector(
  [getUserChatState],
  (userChatState) => userChatState.users
);

export const getFetchedUsers = createSelector(
  [getUserChatState],
  (userChatState) => userChatState.fetchedUsers || []
);

export const getChatError = createSelector(
  [getUserChatState],
  (userChatState) => userChatState.error
);

export const getBlockedInfo = createSelector(
  [getUserChatState],
  (userChatState) => userChatState.blockedInfo
);

// Nouveau sélecteur pour getUserDisplayName
export const makeGetUserDisplayName = () =>
  createSelector(
    [getChatUsers, (_, userId: string) => userId, (_, __, translate: (key: string) => string) => translate],
    (chatUsers, userId, translate) => {
      const chatUser = chatUsers[userId];
      if (chatUser?.firstName) {
        return chatUser.firstName;
      }
      if (chatUser?.email) {
        return chatUser.email;
      }
      return translate('unknown_user') || 'Unknown User';
    }
  );