export type NotificationType =
  | 'add_friend'
  | 'accept_friend'
  | 'reject_friend'
  | 'friend_removed'
  | 'like_post'
  | 'unlike_post'
  | 'dislike_post'
  | 'like_comment'
  | 'unlike_comment'
  | 'dislike_comment'
  | 'like_user'
  | 'unlike_user'
  | 'dislike_user'
  | 'like_message'
  | 'unlike_message'
  | 'dislike_message'
  | 'new_comment'
  | 'new_message'
  | 'user_connected'
  | 'user_disconnected'
  | 'profile_updated'
  | 'user_blocked'
  | 'user_reported'
  | 'user_unblocked'
  | 'follow_user'
  | 'unfollow_user';

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  type: NotificationType;
  message: string;
  targetId: string;
  targetType: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventHandler {
  event: string;
  action: (data: any) => void;
}