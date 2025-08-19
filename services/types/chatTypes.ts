export interface ChatMessageDto {
  id: string;
  senderId: string;
  senderEmail: string;
  firstName?: string;
  lastName?: string;
  content: string;
  timestamp: string;
  readBy: string[];
  likes: string[];
  dislikes: string[];
}

export interface ConversationDto {
  conversationId: string;
  participants: string[];
  groupId?: string;
  messages: ChatMessageDto[];
  isPrivate: boolean;
  invitedUsers: string[];
}