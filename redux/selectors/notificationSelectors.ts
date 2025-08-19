import { createSelector } from 'reselect';
import { RootState } from '../store';

const getNotificationsState = (state: RootState) => state.notifications;

export const getUnreadNotificationsCount = createSelector(
  [getNotificationsState],
  (notificationsState) => notificationsState.notifications.filter((n) => !n.isRead).length
);

export const getUnreadConversations = createSelector(
  [getNotificationsState],
  (notificationsState) => {
    const messageNotifications = notificationsState.notifications.filter(
      (n) => n.type === 'new_message' && !n.isRead
    );
    const conversationIds = new Set<string>();
    messageNotifications.forEach((n) => {
      if (n.targetId) {
        conversationIds.add(n.targetId);
      }
    });
    return Array.from(conversationIds);
  }
);