import {get, post, put, del} from "./httpMethods";
import {ConversationDto} from "../socket/chat/chatTypes";

export const getConversation = async (
  conversationId: string,
  skip: number = 0,
  limit: number = 50
): Promise<ConversationDto> => {
  console.log(`chatMethods: Fetching conversation ${conversationId} with skip=${skip}, limit=${limit}`);
  try {
    const response = await get<ConversationDto>(`/conversations/${conversationId}`, {
      params: {
        skip,
        limit,
      },
    });

    if (!response.conversationId) {
      console.warn(`chatMethods: Conversation ${conversationId} not found, returning empty conversation`);
      // Retourner une conversation vide pour une nouvelle conversation
      return {
        conversationId,
        participants: [],
        messages: [],
        isPrivate: true,
        invitedUsers: [],
      };
    }

    // Convertir les timestamps des messages en objets Date
    const processedResponse: ConversationDto = {
      ...response,
      messages: response.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || [],
      })),
    };
    console.log(`chatMethods: Successfully fetched conversation ${conversationId}`);
    return processedResponse;
  } catch (error) {
    console.error(`chatMethods: Failed to fetch conversation ${conversationId}:`, error);
    // Si l'erreur est un 404, retourner une conversation vide
    if (error.response?.status === 404) {
      console.warn(`chatMethods: Conversation ${conversationId} not found, returning empty conversation`);
      return {
        conversationId,
        participants: [],
        messages: [],
        isPrivate: true,
        invitedUsers: [],
      };
    }
    throw error;
  }
};
export const getUserConversations = async (userId : string, currentUserId? : string): Promise<ConversationDto[]> => {
  console.log(`chatMethods: Fetching conversations for user ${userId} with currentUserId=${currentUserId || "none"}`);
  try {
    const response = await get<ConversationDto[]>(`/conversations/user/${userId}`, {params: {
        currentUserId
      }});
    if (!Array.isArray(response)) {
      console.error("chatMethods: Invalid response, expected array:", response);
      throw new Error("Invalid response: conversations must be an array");
    }
    // Convertir les timestamps des messages en objets Date
    const processedResponse = response.map((conv) => ({
      ...conv,
      messages: conv.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || []
      }))
    }));
    console.log(`chatMethods: Successfully fetched ${processedResponse.length} conversations for user ${userId}`);
    return processedResponse;
  } catch (error) {
    console.error(`chatMethods: Failed to fetch conversations for user ${userId}:`, error);
    throw error;
  }
};

export const markMessagesAsRead = async (conversationId : string, userId : string): Promise<ConversationDto> => {
  console.log(`chatMethods: Marking messages as read for conversation ${conversationId} by user ${userId}`);
  try {
    const response = await post<ConversationDto>(`/conversations/${conversationId}/mark-read`, {userId});
    if (!response.conversationId) {
      console.error("chatMethods: Invalid response, conversationId missing:", response);
      throw new Error("Invalid response: conversationId missing");
    }
    // Convertir les timestamps des messages en objets Date
    const processedResponse: ConversationDto = {
      ...response,
      messages: response.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || []
      }))
    };
    console.log(`chatMethods: Successfully marked messages as read for conversation ${conversationId}`);
    return processedResponse;
  } catch (error) {
    console.error(`chatMethods: Failed to mark messages as read for conversation ${conversationId}:`, error);
    throw error;
  }
};

export const inviteToGroup = async (groupId : string, inviterId : string, invitedUserId : string): Promise<ConversationDto> => {
  console.log(`chatMethods: Inviting user ${invitedUserId} to group ${groupId} by ${inviterId}`);
  try {
    const response = await post<ConversationDto>(`/conversations/group/${groupId}/invite`, {inviterId, invitedUserId});
    if (!response.conversationId) {
      console.error("chatMethods: Invalid response, conversationId missing:", response);
      throw new Error("Invalid response: conversationId missing");
    }
    // Convertir les timestamps des messages en objets Date
    const processedResponse: ConversationDto = {
      ...response,
      messages: response.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || []
      }))
    };
    console.log(`chatMethods: Successfully invited user ${invitedUserId} to group ${groupId}`);
    return processedResponse;
  } catch (error) {
    console.error(`chatMethods: Failed to invite user ${invitedUserId} to group ${groupId}:`, error);
    if (error.message.includes("not found")) {
      console.warn(`chatMethods: Invited user ${invitedUserId} not found`);
    }
    throw error;
  }
};

export const updateMessage = async (conversationId : string, messageId : string, content : string, userId : string): Promise<ConversationDto> => {
  console.log(`chatMethods: Updating message ${messageId} in conversation ${conversationId} by user ${userId}`);
  try {
    const response = await put<ConversationDto>(`/conversations/${conversationId}/message/${messageId}`, {content, userId});
    if (!response.conversationId) {
      console.error("chatMethods: Invalid response, conversationId missing:", response);
      throw new Error("Invalid response: conversationId missing");
    }
    // Convertir les timestamps des messages en objets Date
    const processedResponse: ConversationDto = {
      ...response,
      messages: response.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || []
      }))
    };
    console.log(`chatMethods: Successfully updated message ${messageId} in conversation ${conversationId}`);
    return processedResponse;
  } catch (error) {
    console.error(`chatMethods: Failed to update message ${messageId} in conversation ${conversationId}:`, error);
    throw error;
  }
};

export const deleteMessage = async (
  conversationId: string,
  messageId: string,
  userId: string // Ajout de userId
): Promise<ConversationDto> => {
  console.log(`chatMethods: Deleting message ${messageId} from conversation ${conversationId} by user ${userId}`);
  try {
    const response = await del<ConversationDto>(`/conversations/${conversationId}/message/${messageId}`, { userId });
    if (!response.conversationId) {
      console.error("chatMethods: Invalid response, conversationId missing:", response);
      throw new Error("Invalid response: conversationId missing");
    }
    const processedResponse: ConversationDto = {
      ...response,
      messages: response.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || []
      }))
    };
    console.log(`chatMethods: Successfully deleted message ${messageId} from conversation ${conversationId}`);
    return processedResponse;
  } catch (error) {
    console.error(`chatMethods: Failed to delete message ${messageId} from conversation ${conversationId}:`, error);
    throw error;
  }
};

export const deleteConversation = async (conversationId : string, userId : string): Promise<void> => {
  console.log(`chatMethods: Deleting conversation ${conversationId} for user ${userId}`);
  try {
    await del<void>(`/conversations/${conversationId}`, {userId});
    console.log(`chatMethods: Successfully deleted conversation ${conversationId}`);
  } catch (error) {
    console.error(`chatMethods: Failed to delete conversation ${conversationId}:`, error);
    throw error;
  }
};

export const markMessageAsUnread = async (conversationId : string, messageId : string, userId : string): Promise<ConversationDto> => {
  console.log(`chatMethods: Marking message ${messageId} as unread in conversation ${conversationId} for user ${userId}`);
  try {
    const response = await post<ConversationDto>(`/conversations/${conversationId}/message/${messageId}/mark-unread`, {userId});
    if (!response.conversationId) {
      console.error("chatMethods: Invalid response, conversationId missing:", response);
      throw new Error("Invalid response: conversationId missing");
    }
    // Convertir les timestamps des messages en objets Date
    const processedResponse: ConversationDto = {
      ...response,
      messages: response.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || []
      }))
    };
    console.log(`chatMethods: Successfully marked message ${messageId} as unread in conversation ${conversationId}`);
    return processedResponse;
  } catch (error) {
    console.error(`chatMethods: Failed to mark message ${messageId} as unread in conversation ${conversationId}:`, error);
    throw error;
  }
};

export const addReaction = async (conversationId : string, messageId : string, userId : string, emoji : string): Promise<ConversationDto> => {
  console.log(`chatMethods: Adding reaction ${emoji} to message ${messageId} in conversation ${conversationId} by user ${userId}`);
  try {
    const response = await post<ConversationDto>(`/conversations/${conversationId}/message/${messageId}/reaction`, {userId, emoji});
    if (!response.conversationId) {
      console.error("chatMethods: Invalid response, conversationId missing:", response);
      throw new Error("Invalid response: conversationId missing");
    }
    // Convertir les timestamps des messages en objets Date
    const processedResponse: ConversationDto = {
      ...response,
      messages: response.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || []
      }))
    };
    console.log(`chatMethods: Successfully added reaction ${emoji} to message ${messageId} in conversation ${conversationId}`);
    return processedResponse;
  } catch (error) {
    console.error(`chatMethods: Failed to add reaction to message ${messageId} in conversation ${conversationId}:`, error);
    throw error;
  }
};

export const removeReaction = async (conversationId : string, messageId : string, userId : string): Promise<ConversationDto> => {
  console.log(`chatMethods: Removing reaction from message ${messageId} in conversation ${conversationId} by user ${userId}`);
  try {
    const response = await del<ConversationDto>(`/conversations/${conversationId}/message/${messageId}/reaction`, {userId});
    if (!response.conversationId) {
      console.error("chatMethods: Invalid response, conversationId missing:", response);
      throw new Error("Invalid response: conversationId missing");
    }
    // Convertir les timestamps des messages en objets Date
    const processedResponse: ConversationDto = {
      ...response,
      messages: response.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || []
      }))
    };
    console.log(`chatMethods: Successfully removed reaction from message ${messageId} in conversation ${conversationId}`);
    return processedResponse;
  } catch (error) {
    console.error(`chatMethods: Failed to remove reaction from message ${messageId} in conversation ${conversationId}:`, error);
    throw error;
  }
};
