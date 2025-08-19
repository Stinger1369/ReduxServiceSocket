import { createAsyncThunk } from '@reduxjs/toolkit';
import chatApiClient from '../../../../../services/chatApiClient';
import { ChatState, ErrorResponse } from '../chatTypes';
import { ConversationDto } from '../chatTypes';

export const fetchConversation = createAsyncThunk<
  ConversationDto,
  { conversationId: string; skip?: number; limit?: number },
  { rejectValue: ErrorResponse }
>(
  'chat/fetchConversation',
  async ({ conversationId, skip = 0, limit = 50 }, { rejectWithValue }) => {
    try {
      console.log('chatSlice: Fetching conversation:', conversationId);
      const response = await chatApiClient.getConversation(conversationId, skip, limit);
      console.log('chatSlice: Conversation response:', response);
      return response;
    } catch (error: unknown) {
      console.error('chatSlice: Fetch conversation error:', error);
      const errorResponse: ErrorResponse = {
        error: (error as ErrorResponse).error || 'Échec de la récupération de la conversation',
        action: (error as ErrorResponse).action || 'Veuillez réessayer.',
        status: (error as ErrorResponse).status,
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const fetchConversationById = createAsyncThunk<
  ConversationDto,
  { userId: string; conversationId: string },
  { rejectValue: ErrorResponse }
>(
  'chat/fetchConversationById',
  async ({ userId, conversationId }, { rejectWithValue }) => {
    try {
      console.log('chatSlice: Fetching conversation by ID for user:', userId, 'conversationId:', conversationId);
      const response = await chatApiClient.getConversation(conversationId);
      console.log('chatSlice: Conversation response:', response);
      return response;
    } catch (error: unknown) {
      console.error('chatSlice: Fetch conversation by ID error:', error);
      const errorResponse: ErrorResponse = {
        error: (error as ErrorResponse).error || 'Échec de la récupération de la conversation',
        action: (error as ErrorResponse).action || 'Veuillez réessayer.',
        status: (error as ErrorResponse).status,
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const fetchUserConversations = createAsyncThunk<
  ConversationDto[],
  string,
  { rejectValue: ErrorResponse }
>(
  'chat/fetchUserConversations',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('chatSlice: Fetching conversations for user:', userId);
      const response = await chatApiClient.getUserConversations(userId);
      console.log('chatSlice: User conversations response:', response);
      return response;
    } catch (error: unknown) {
      console.error('chatSlice: Fetch user conversations error:', error);
      const errorResponse: ErrorResponse = {
        error: (error as ErrorResponse).error || 'Échec de la récupération des conversations',
        action: (error as ErrorResponse).action || 'Veuillez réessayer.',
        status: (error as ErrorResponse).status,
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const addChatActionsExtraReducers = (builder: any) => {
  builder
    .addCase(fetchConversation.pending, (state: ChatState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchConversation.fulfilled, (state: ChatState, action: any) => {
      state.loading = false;
      const conversation = action.payload;
      console.log('chatSlice: fetchConversation fulfilled:', conversation);
      const existing = state.conversations.find((c) => c.conversationId === conversation.conversationId);
      if (existing) {
        existing.messages = conversation.messages;
        existing.participants = conversation.participants;
        existing.invitedUsers = conversation.invitedUsers;
        existing.isPrivate = conversation.isPrivate;
      } else {
        state.conversations.push(conversation);
      }
      state.messages[conversation.conversationId] = conversation.messages;
    })
    .addCase(fetchConversation.rejected, (state: ChatState, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la récupération de la conversation';
      console.error('chatSlice: fetchConversation rejected:', action.payload);
    })
    .addCase(fetchConversationById.pending, (state: ChatState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchConversationById.fulfilled, (state: ChatState, action: any) => {
      state.loading = false;
      const conversation = action.payload;
      console.log('chatSlice: fetchConversationById fulfilled:', conversation);
      const existing = state.conversations.find((c) => c.conversationId === conversation.conversationId);
      if (existing) {
        existing.messages = conversation.messages;
        existing.participants = conversation.participants;
        existing.invitedUsers = conversation.invitedUsers;
        existing.isPrivate = conversation.isPrivate;
      } else {
        state.conversations.push(conversation);
      }
      state.messages[conversation.conversationId] = conversation.messages;
    })
    .addCase(fetchConversationById.rejected, (state: ChatState, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la récupération de la conversation';
      console.error('chatSlice: fetchConversationById rejected:', action.payload);
    })
    .addCase(fetchUserConversations.pending, (state: ChatState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchUserConversations.fulfilled, (state: ChatState, action: any) => {
      state.loading = false;
      state.conversations = action.payload;
      console.log('chatSlice: fetchUserConversations fulfilled:', action.payload);
      action.payload.forEach((conversation: ConversationDto) => {
        console.log('chatSlice: Setting messages for', conversation.conversationId, ':', conversation.messages);
        state.messages[conversation.conversationId] = conversation.messages;
      });
    })
    .addCase(fetchUserConversations.rejected, (state: ChatState, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la récupération des conversations';
      console.error('chatSlice: fetchUserConversations rejected:', action.payload);
    });
};