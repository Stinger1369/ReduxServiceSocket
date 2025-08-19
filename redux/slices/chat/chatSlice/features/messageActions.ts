import { createAsyncThunk } from '@reduxjs/toolkit';
import chatApiClient from '../../../../../services/chatApiClient';
import { ChatState, ErrorResponse } from '../chatTypes';
import { ConversationDto } from '../chatTypes';


export const markMessageAsUnread = createAsyncThunk<
  ConversationDto,
  { conversationId: string; messageId: string; userId: string },
  { rejectValue: ErrorResponse }
>(
  'chat/markMessageAsUnread',
  async ({ conversationId, messageId, userId }, { rejectWithValue }) => {
    try {
      console.log('chatSlice: Marking message as unread:', { conversationId, messageId, userId });
      const response = await chatApiClient.markMessageAsUnread(conversationId, messageId, userId);
      console.log('chatSlice: Mark message as unread response:', response);
      return response;
    } catch (error: unknown) {
      console.error('chatSlice: Mark message as unread error:', error);
      const errorResponse: ErrorResponse = {
        error: (error as ErrorResponse).error || 'Échec du marquage du message comme non lu',
        action: (error as ErrorResponse).action || 'Veuillez réessayer.',
        status: (error as ErrorResponse).status,
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const updateMessage = createAsyncThunk<
  ConversationDto,
  { conversationId: string; messageId: string; content: string; userId: string },
  { rejectValue: ErrorResponse }
>(
  'chat/updateMessage',
  async ({ conversationId, messageId, content, userId }, { rejectWithValue }) => {
    try {
      console.log('chatSlice: Updating message:', { conversationId, messageId, content, userId });
      const response = await chatApiClient.updateMessage(conversationId, messageId, content, userId);
      console.log('chatSlice: Update message response:', response);
      return response;
    } catch (error: unknown) {
      console.error('chatSlice: Update message error:', error);
      const errorResponse: ErrorResponse = {
        error: (error as ErrorResponse).error || 'Échec de la mise à jour du message',
        action: (error as ErrorResponse).action || 'Veuillez réessayer.',
        status: (error as ErrorResponse).status,
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const deleteMessage = createAsyncThunk<
  ConversationDto,
  { conversationId: string; messageId: string },
  { rejectValue: ErrorResponse }
>(
  'chat/deleteMessage',
  async ({ conversationId, messageId }, { rejectWithValue }) => {
    try {
      console.log('chatSlice: Deleting message:', { conversationId, messageId });
      const response = await chatApiClient.deleteMessage(conversationId, messageId);
      console.log('chatSlice: Delete message response:', response);
      return response;
    } catch (error: unknown) {
      console.error('chatSlice: Delete message error:', error);
      const errorResponse: ErrorResponse = {
        error: (error as ErrorResponse).error || 'Échec de la suppression du message',
        action: (error as ErrorResponse).action || 'Veuillez réessayer.',
        status: (error as ErrorResponse).status,
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const addMessageActionsExtraReducers = (builder: any) => {
  builder

    .addCase(markMessageAsUnread.pending, (state: ChatState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(markMessageAsUnread.fulfilled, (state: ChatState, action: any) => {
      state.loading = false;
      const conversation = action.payload;
      console.log('chatSlice: markMessageAsUnread fulfilled:', conversation);
      const existing = state.conversations.find((c) => c.conversationId === conversation.conversationId);
      if (existing) {
        existing.messages = conversation.messages;
        existing.participants = conversation.participants;
        existing.invitedUsers = conversation.invitedUsers;
        existing.isPrivate = conversation.isPrivate;
      }
      state.messages[conversation.conversationId] = conversation.messages;
      if (!state.unreadConversations.includes(conversation.conversationId)) {
        state.unreadConversations.push(conversation.conversationId);
      }
    })
    .addCase(markMessageAsUnread.rejected, (state: ChatState, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec du marquage du message comme non lu';
      console.error('chatSlice: markMessageAsUnread rejected:', action.payload);
    })
    .addCase(updateMessage.pending, (state: ChatState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateMessage.fulfilled, (state: ChatState, action: any) => {
      state.loading = false;
      const conversation = action.payload;
      console.log('chatSlice: updateMessage fulfilled:', conversation);
      const existing = state.conversations.find((c) => c.conversationId === conversation.conversationId);
      if (existing) {
        existing.messages = conversation.messages;
        existing.participants = conversation.participants;
        existing.invitedUsers = conversation.invitedUsers;
        existing.isPrivate = conversation.isPrivate;
      }
      state.messages[conversation.conversationId] = conversation.messages;
    })
    .addCase(updateMessage.rejected, (state: ChatState, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la mise à jour du message';
      console.error('chatSlice: updateMessage rejected:', action.payload);
    })
    .addCase(deleteMessage.pending, (state: ChatState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteMessage.fulfilled, (state: ChatState, action: any) => {
      state.loading = false;
      const conversation = action.payload;
      console.log('chatSlice: deleteMessage fulfilled:', conversation);
      const existing = state.conversations.find((c) => c.conversationId === conversation.conversationId);
      if (existing) {
        existing.messages = conversation.messages;
        existing.participants = conversation.participants;
        existing.invitedUsers = conversation.invitedUsers;
        existing.isPrivate = conversation.isPrivate;
      }
      state.messages[conversation.conversationId] = conversation.messages;
    })
    .addCase(deleteMessage.rejected, (state: ChatState, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la suppression du message';
      console.error('chatSlice: deleteMessage rejected:', action.payload);
    });
};