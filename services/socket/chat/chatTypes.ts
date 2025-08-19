export interface ChatMessageDto {
  id: string;
  senderId: string;
  senderEmail: string;
  firstName?: string;
  lastName?: string;
  content: string;
  timestamp: Date;
  readBy: string[];
  likes: string[];
  dislikes: string[];
  reactions?: {
    userId: string;
    emoji: string
  }[];
  conversationId?: string;
  recipientId?: string;
  groupId?: string;
}

export interface ConversationDto {
  conversationId: string;
  participants: string[];
  groupId?: string;
  messages: ChatMessageDto[];
  isPrivate: boolean;
  invitedUsers: string[];
}

export interface TypingEvent {
  userId: string;
  firstName?: string;
  isTyping: boolean;
  recipientId?: string;
  groupId?: string;
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
    reactions?: {
      userId: string;
      emoji: string
    }[];
  };
}

export interface ReactionPayload {
  messageId: string;
  conversationId: string;
  emoji: string;
}

export interface ChatAction {
  type: | "chat/receiveMessage" | "chat/setTypingStatus" | "chat/setUnreadConversations" | "chat/updateMessageLikes" | "chat/updateMessageDislikes" | "chat/addReaction" | "chat/removeReaction" | "chat/messageRead" | "chat/messagesRead" | "chat/messageUpdated" | "chat/messageDeleted" | "chat/setError";
  payload: any;
}

export interface Dispatch {
  (action : ChatAction): void;
}
