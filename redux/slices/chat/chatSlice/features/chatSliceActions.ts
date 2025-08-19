import {PayloadAction} from "@reduxjs/toolkit";
import {ChatState, ChatMessageDto, TypingEvent} from "../chatTypes";

export const receiveMessage = (state : ChatState, action : PayloadAction<ChatMessageDto>) => {
  const message = action.payload;
  console.log("chatSlice: receiveMessage:", message);
  if (!message.conversationId) {
    if (message.senderId && message.recipientId) {
      message.conversationId = `private:${ [message.senderId, message.recipientId].sort().join(":")}`;
      console.log(`receiveMessage: Inferred conversationId as ${message.conversationId}`);
    } else if (message.groupId) {
      message.conversationId = `group:${message.groupId}`;
      console.log(`receiveMessage: Inferred conversationId as ${message.conversationId}`);
    } else {
      console.error("receiveMessage: Cannot infer conversationId, message rejected:", message);
      return;
    }
  }
  if (!message.id) {
    message.id = new Date().toISOString();
    console.warn(`receiveMessage: Generated temporary id ${message.id} for message`);
  }
  if (!state.messages[message.conversationId]) {
    state.messages[message.conversationId] = [];
  }
  const existingMessage = state.messages[message.conversationId].find((m) => m.id === message.id);
  if (!existingMessage) {
    state.messages[message.conversationId].push({
      ...message,
      timestamp: message.timestamp instanceof Date
        ? message.timestamp
        : new Date(message.timestamp),
      reactions: message.reactions || []
    });
    // Ajouter à unreadConversations si l'utilisateur actuel n'est pas l'expéditeur
    if (state.currentUserId && message.senderId !== state.currentUserId) {
      if (!state.unreadConversations.includes(message.conversationId)) {
        state.unreadConversations.push(message.conversationId);
        console.log(`receiveMessage: Added conversation ${message.conversationId} to unreadConversations for user ${state.currentUserId}`);
      }
    }
  } else {
    console.log(`receiveMessage: Skipping duplicate message ${message.id} in conversation ${message.conversationId}`);
  }
};

export const setTypingStatus = (state : ChatState, action : PayloadAction<TypingEvent>) => {
  console.log("chatSlice: setTypingStatus called with:", JSON.stringify(action.payload));
  const typing = action.payload;
  const existing = state.typingStatus.find((t) => t.userId === typing.userId && t.recipientId === typing.recipientId && t.groupId === typing.groupId);
  if (existing) {
    console.log("chatSlice: Updating existing typing status:", JSON.stringify(existing));
    existing.isTyping = typing.isTyping;
    if (!typing.isTyping) {
      console.log("chatSlice: Removing typing status for user:", typing.userId);
      state.typingStatus = state.typingStatus.filter((t) => !(t.userId === typing.userId && t.recipientId === typing.recipientId && t.groupId === typing.groupId));
    }
  } else if (typing.isTyping) {
    console.log("chatSlice: Adding new typing status:", JSON.stringify(typing));
    state.typingStatus.push(typing);
  }
};

export const setUnreadConversations = (state : ChatState, action : PayloadAction<string[]>) => {
  state.unreadConversations = action.payload;
};

export const updateMessageLikes = (state : ChatState, action : PayloadAction < {
  messageId: string;
  userId: string
} >) => {
  const {messageId, userId} = action.payload;
  for (const conversationId in state.messages) {
    const message = state.messages[conversationId].find((m) => m.id === messageId);
    if (message) {
      if (!message.likes.includes(userId)) {
        message.likes.push(userId);
        message.dislikes = message.dislikes.filter((id) => id !== userId);
      } else {
        message.likes = message.likes.filter((id) => id !== userId);
      }
      console.log(`Message ${messageId} liked/unliked by ${userId}`);
    }
  }
};

export const updateMessageDislikes = (state : ChatState, action : PayloadAction < {
  messageId: string;
  userId: string
} >) => {
  const {messageId, userId} = action.payload;
  for (const conversationId in state.messages) {
    const message = state.messages[conversationId].find((m) => m.id === messageId);
    if (message) {
      if (!message.dislikes.includes(userId)) {
        message.dislikes.push(userId);
        message.likes = message.likes.filter((id) => id !== userId);
      } else {
        message.dislikes = message.dislikes.filter((id) => id !== userId);
      }
      console.log(`Message ${messageId} disliked by ${userId}`);
    }
  }
};

export const addReaction = (state : ChatState, action : PayloadAction < {
  messageId: string;
  userId: string;
  emoji: string
} >) => {
  const {messageId, userId, emoji} = action.payload;
  for (const conversationId in state.messages) {
    const message = state.messages[conversationId].find((m) => m.id === messageId);
    if (message) {
      if (!message.reactions)
        message.reactions = [];
      const existingReaction = message.reactions.find((r) => r.userId === userId);
      if (existingReaction) {
        existingReaction.emoji = emoji; // Remplacer l'ancienne réaction
        console.log(`Reaction updated to ${emoji} for message ${messageId} by ${userId}`);
      } else {
        message.reactions.push({userId, emoji});
        console.log(`Reaction ${emoji} added to message ${messageId} by ${userId}`);
      }
    }
  }
};

export const removeReaction = (state : ChatState, action : PayloadAction < {
  messageId: string;
  userId: string;
  emoji?: string
} >) => {
  const {messageId, userId} = action.payload;
  for (const conversationId in state.messages) {
    const message = state.messages[conversationId].find((m) => m.id === messageId);
    if (message && message.reactions) {
      message.reactions = message.reactions.filter((r) => r.userId !== userId);
      console.log(`Reaction removed from message ${messageId} by ${userId}`);
    }
  }
};

export const messageRead = (state : ChatState, action : PayloadAction < {
  conversationId: string;
  messageId: string;
  userId: string;
} >) => {
  const {conversationId, messageId, userId} = action.payload;
  console.log(`chatSlice: messageRead called with conversationId=${conversationId}, messageId=${messageId}, userId=${userId}`);

  if (!state.messages[conversationId]) {
    console.warn(`chatSlice: Conversation ${conversationId} not found in state.messages, it may need to be fetched`);
    return;
  }

  const message = state.messages[conversationId].find((m) => m.id === messageId);
  if (message) {
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      console.log(`chatSlice: Message ${messageId} read by ${userId} in conversation ${conversationId}`);
      const allRead = state.messages[conversationId].every((m) => m.readBy.includes(userId) || m.senderId === userId);
      if (allRead) {
        state.unreadConversations = state.unreadConversations.filter((id) => id !== conversationId);
        console.log(`chatSlice: Conversation ${conversationId} removed from unreadConversations for user ${userId}, all messages read`);
      } else {
        console.log(`chatSlice: Some messages in conversation ${conversationId} are still unread for user ${userId}`);
      }
      console.log(`chatSlice: Updated messages state for conversation ${conversationId}:`, state.messages[conversationId]);
    } else {
      console.log(`chatSlice: Message ${messageId} already read by ${userId} in conversation ${conversationId}`);
    }
  } else {
    console.warn(`chatSlice: Message ${messageId} not found in conversation ${conversationId}`);
  }
};

export const messageUnread = (state : ChatState, action : PayloadAction < {
  conversationId: string;
  messageId: string;
  userId: string;
} >) => {
  const {conversationId, messageId, userId} = action.payload;
  console.log(`chatSlice: messageUnread called with conversationId=${conversationId}, messageId=${messageId}, userId=${userId}`);
  if (state.messages[conversationId]) {
    const message = state.messages[conversationId].find((m) => m.id === messageId);
    if (message) {
      message.readBy = message.readBy.filter((id) => id !== userId);
      console.log(`chatSlice: Message ${messageId} marked as unread by ${userId} in conversation ${conversationId}`);
      if (!state.unreadConversations.includes(conversationId)) {
        state.unreadConversations.push(conversationId);
        console.log(`chatSlice: Conversation ${conversationId} added to unreadConversations for user ${userId}`);
      }
    } else {
      console.warn(`chatSlice: Message ${messageId} not found in conversation ${conversationId}`);
    }
  } else {
    console.warn(`chatSlice: Conversation ${conversationId} not found in state.messages`);
  }
};

export const messagesRead = (state : ChatState, action : PayloadAction < {
  conversationId: string;
  userId: string;
  messages: ChatMessageDto[];
} >) => {
  const {conversationId, userId, messages} = action.payload;
  console.log("chatSlice: messagesRead called with:", JSON.stringify({conversationId, userId, messageCount: messages.length}));
  if (state.messages[conversationId]) {
    messages.forEach((newMessage) => {
      const message = state.messages[conversationId].find((m) => m.id === newMessage.id); // Correction: summonedId -> conversationId
      if (message && !message.readBy.includes(userId)) {
        message.readBy = newMessage.readBy;
        message.timestamp = newMessage.timestamp instanceof Date
          ? newMessage.timestamp
          : new Date(newMessage.timestamp);
        console.log(`chatSlice: Message ${newMessage.id} read by ${userId} in conversation ${conversationId}`);
      } else if (message) {
        console.log(`chatSlice: Message ${newMessage.id} already read by ${userId} in conversation ${conversationId}`);
      } else {
        console.warn(`chatSlice: Message ${newMessage.id} not found in conversation ${conversationId}`);
      }
    });
    const allRead = state.messages[conversationId].every((m) => m.readBy.includes(userId) || m.senderId === userId);
    if (allRead) {
      state.unreadConversations = state.unreadConversations.filter((id) => id !== conversationId);
      console.log(`chatSlice: Conversation ${conversationId} removed from unreadConversations for user ${userId}, all messages read`);
    } else {
      console.log(`chatSlice: Some messages in conversation ${conversationId} are still unread for user ${userId}`);
    }
  } else {
    console.warn(`chatSlice: Conversation ${conversationId} not found in state.messages`);
  }
};

export const messageUpdated = (state: ChatState, action: PayloadAction<{
  conversationId: string;
  messageId: string;
  content: string;
  userId?: string; // Ajout de userId
}>) => {
  const { conversationId, messageId, content, userId } = action.payload;
  console.log("chatSlice: messageUpdated called with:", JSON.stringify({conversationId, messageId, content, userId}));
  if (state.messages[conversationId]) {
    const message = state.messages[conversationId].find((m) => m.id === messageId);
    if (message) {
      // Vérifier si l'utilisateur actuel est autorisé (optionnel, selon tes besoins)
      if (userId && userId !== state.currentUserId) {
        console.warn(`chatSlice: Message ${messageId} updated by another user: ${userId}`);
      }
      message.content = content;
      message.timestamp = new Date();
      console.log(`chatSlice: Message ${messageId} updated in conversation ${conversationId}`);
    } else {
      console.warn(`chatSlice: Message ${messageId} not found in conversation ${conversationId}`);
    }
  } else {
    console.warn(`chatSlice: Conversation ${conversationId} not found in state.messages`);
  }
};

export const messageDeleted = (state: ChatState, action: PayloadAction<{
  conversationId: string;
  messageId: string;
  userId?: string; // Ajout de userId
}>) => {
  const { conversationId, messageId, userId } = action.payload;
  console.log("chatSlice: messageDeleted called with:", JSON.stringify({conversationId, messageId, userId}));
  if (state.messages[conversationId]) {
    // Vérifier si l'utilisateur actuel est autorisé (optionnel)
    if (userId && userId !== state.currentUserId) {
      console.warn(`chatSlice: Message ${messageId} deleted by another user: ${userId}`);
    }
    state.messages[conversationId] = state.messages[conversationId].filter((m) => m.id !== messageId);
    console.log(`chatSlice: Message ${messageId} deleted from conversation ${conversationId}`);
  } else {
    console.warn(`chatSlice: Conversation ${conversationId} not found in state.messages`);
  }
};

export const setError = (state : ChatState, action : PayloadAction<string>) => {
  state.error = action.payload;
};

export const clearError = (state : ChatState) => {
  state.error = null;
};

export const setCurrentUserId = (state : ChatState, action : PayloadAction<string>) => {
  state.currentUserId = action.payload;
  console.log(`chatSlice: setCurrentUserId called with: ${action.payload}`);
};

export const addChatSliceActions = (builder: any) => {
  builder
    .addCase('chat/receiveMessage', receiveMessage)
    .addCase('chat/setTypingStatus', setTypingStatus)
    .addCase('chat/setUnreadConversations', setUnreadConversations)
    .addCase('chat/updateMessageLikes', updateMessageLikes)
    .addCase('chat/updateMessageDislikes', updateMessageDislikes)
    .addCase('chat/addReaction', addReaction)
    .addCase('chat/removeReaction', removeReaction)
    .addCase('chat/messageRead', messageRead)
    .addCase('chat/messageUnread', messageUnread)
    .addCase('chat/messagesRead', messagesRead)
    .addCase('chat/messageUpdated', messageUpdated)
    .addCase('chat/messageDeleted', messageDeleted)
    .addCase('chat/setError', setError)
    .addCase('chat/clearError', clearError)
    .addCase('chat/setCurrentUserId', setCurrentUserId);
};
