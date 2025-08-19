import { createAsyncThunk } from '@reduxjs/toolkit';
import chatApiClient from '../../../../../services/chatApiClient';
import { ChatState, ErrorResponse } from '../chatTypes';
import { ConversationDto } from '../chatTypes';

export const performAddReaction = createAsyncThunk<
  ConversationDto,
  { conversationId: string; messageId: string; userId: string; emoji: string },
  { rejectValue: ErrorResponse }
>(
  'chat/performAddReaction',
  async ({ conversationId, messageId, userId, emoji }, { rejectWithValue }) => {
    try {
      console.log('chatSlice: Adding reaction:', { conversationId, messageId, userId, emoji });
      const response = await chatApiClient.addReaction(conversationId, messageId, userId, emoji);
      console.log('chatSlice: Add reaction response:', response);
      return response;
    } catch (error: unknown) {
      console.error('chatSlice: Add reaction error:', error);
      const errorResponse: ErrorResponse = {
        error: (error as ErrorResponse).error || 'Échec de l’ajout de la réaction',
        action: (error as ErrorResponse).action || 'Veuillez réessayer.',
        status: (error as ErrorResponse).status,
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const performRemoveReaction = createAsyncThunk<
  ConversationDto,
  { conversationId: string; messageId: string; userId: string },
  { rejectValue: ErrorResponse }
>(
  'chat/performRemoveReaction',
  async ({ conversationId, messageId, userId }, { rejectWithValue }) => {
    try {
      console.log('chatSlice: Removing reaction:', { conversationId, messageId, userId });
      const response = await chatApiClient.removeReaction(conversationId, messageId, userId);
      console.log('chatSlice: Remove reaction response:', response);
      return response;
    } catch (error: unknown) {
      console.error('chatSlice: Remove reaction error:', error);
      const errorResponse: ErrorResponse = {
        error: (error as ErrorResponse).error || 'Échec de la suppression de la réaction',
        action: (error as ErrorResponse).action || 'Veuillez réessayer.',
        status: (error as ErrorResponse).status,
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const addReactionActionsExtraReducers = (builder: any) => {
  builder
    .addCase(performAddReaction.pending, (state: ChatState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(performAddReaction.fulfilled, (state: ChatState, action: any) => {
      state.loading = false;
      const conversation = action.payload;
      console.log('chatSlice: performAddReaction fulfilled:', conversation);
      const existing = state.conversations.find((c) => c.conversationId === conversation.conversationId);
      if (existing) {
        existing.messages = conversation.messages;
        existing.participants = conversation.participants;
        existing.invitedUsers = conversation.invitedUsers;
        existing.isPrivate = conversation.isPrivate;
      }
      state.messages[conversation.conversationId] = conversation.messages;
    })
    .addCase(performAddReaction.rejected, (state: ChatState, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de l’ajout de la réaction';
      console.error('chatSlice: performAddReaction rejected:', action.payload);
    })
    .addCase(performRemoveReaction.pending, (state: ChatState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(performRemoveReaction.fulfilled, (state: ChatState, action: any) => {
      state.loading = false;
      const conversation = action.payload;
      console.log('chatSlice: performRemoveReaction fulfilled:', conversation);
      const existing = state.conversations.find((c) => c.conversationId === conversation.conversationId);
      if (existing) {
        existing.messages = conversation.messages;
        existing.participants = conversation.participants;
        existing.invitedUsers = conversation.invitedUsers;
        existing.isPrivate = conversation.isPrivate;
      }
      state.messages[conversation.conversationId] = conversation.messages;
    })
    .addCase(performRemoveReaction.rejected, (state: ChatState, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la suppression de la réaction';
      console.error('chatSlice: performRemoveReaction rejected:', action.payload);
    });
};