export interface UserDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "NURSE" | "PATIENT";
  conversations: string[];
  friendRequests: string[];
  sentFriendRequests: string[];
  posts: string[];
  likes: string[];
  dislikes: string[];
  notifications: string[];
  followers: string[];
  blockedUsers: string[];
  isOnline: boolean;
  lastConnectedAt: string | null;
}

export interface FriendDto {
  _id: string;
  userId: string;
  friendId: string;
  status: "pending" | "accepted";
  createdAt: string;
  updatedAt: string;
}

export interface FollowDto {
  _id: string;
  followerId: string;
  followedId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowRequest {
  followerId: string;
  followedId: string;
}

export interface ChatMessageDto {
  id: string;
  senderId: string;
  senderEmail: string;
  firstName?: string;
  lastName?: string;
  content: string;
  timestamp: string | Date;
  readBy: string[];
  likes: string[];
  dislikes: string[];
  conversationId?: string;
  recipientId?: string;
  groupId?: string;
}

export interface ConversationDto {
  conversationId: string;
  participants: string[];
  messages: ChatMessageDto[];
  isGroup: boolean;
  groupName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostDto {
  _id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDto {
  _id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  type: string;
  message: string;
  targetId: string;
  targetType: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TypingEvent {
  userId: string;
  isTyping: boolean;
  recipientId?: string;
  groupId?: string;
}

export interface ErrorResponse {
  error: string;
  action?: string;
}

export interface DecodedToken {
  sub: string;
  iat?: number;
  exp?: number;
}

export interface PrivateMessagePayload {
  event: "privateMessage";
  sender: string;
  senderEmail?: string;
  firstName?: string;
  lastName?: string;
  message: {
    id?: string;
    recipientId: string;
    content: string;
    timestamp?: string;
    readBy?: string[];
    likes?: string[];
    dislikes?: string[];
  };
}

export interface EventHandler {
  event: string;
  action: (data : |PrivateMessagePayload | ChatMessageDto | TypingEvent | string[] | {
    [key: string]: any
  }) => void;
}
