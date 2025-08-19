import { createAsyncThunk } from '@reduxjs/toolkit';
import chatApiClient from '../../../../../services/chatApiClient';
import { ChatState, ErrorResponse } from '../chatTypes';
import { ConversationDto } from '../chatTypes';

export const inviteToGroup = createAsyncThunk<
  ConversationDto,
  { groupId: string; inviterId: string; invitedUserId: string },
  { rejectValue: ErrorResponse }
>(
  'chat/inviteToGroup',
  async ({ groupId, inviterId, invitedUserId }, { rejectWithValue }) => {
    try {
      console.log('chatSlice: Inviting user to group:', { groupId, inviterId, invitedUserId });
      const response = await chatApiClient.inviteToGroup(groupId, inviterId, invitedUserId);
      console.log('chatSlice: Invite to group response:', response);
      return response;
    } catch (error: unknown) {
      console.error('chatSlice: Invite to group error:', error);
      const errorResponse: ErrorResponse = {
        error: (error as ErrorResponse).error || 'Échec de l’invitation au groupe',
        action: (error as ErrorResponse).action || 'Veuillez réessayer.',
        status: (error as ErrorResponse).status,
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const deleteConversation = createAsyncThunk<
  void,
  { conversationId: string; userId: string },
  { rejectValue: ErrorResponse }
>(
  'chat/deleteConversation',
  async ({ conversationId, userId }, { rejectWithValue }) => {
    try {
      console.log('chatSlice: Deleting conversation:', { conversationId, userId });
      await chatApiClient.deleteConversation(conversationId, userId);
      console.log('chatSlice: Delete conversation successful');
    } catch (error: unknown) {
      console.error('chatSlice: Delete conversation error:', error);
      const errorResponse: ErrorResponse = {
        error: (error as ErrorResponse).error || 'Échec de la suppression de la conversation',
        action: (error as ErrorResponse).action || 'Veuillez réessayer.',
        status: (error as ErrorResponse).status,
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const addConversationActionsExtraReducers = (builder: any) => {
  builder
    .addCase(inviteToGroup.pending, (state: ChatState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(inviteToGroup.fulfilled, (state: ChatState, action: any) => {
      state.loading = false;
      const conversation = action.payload;
      console.log('chatSlice: inviteToGroup fulfilled:', conversation);
      const existing = state.conversations.find((c) => c.conversationId === conversation.conversationId);
      if (existing) {
        existing.participants = conversation.participants;
        existing.invitedUsers = conversation.invitedUsers;
        existing.isPrivate = conversation.isPrivate;
      } else {
        state.conversations.push(conversation);
      }
    })
    .addCase(inviteToGroup.rejected, (state: ChatState, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de l’invitation au groupe';
      console.error('chatSlice: inviteToGroup rejected:', action.payload);
    })
    .addCase(deleteConversation.pending, (state: ChatState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteConversation.fulfilled, (state: ChatState, action: any) => {
      state.loading = false;
      const { conversationId } = action.meta.arg;
      console.log('chatSlice: deleteConversation fulfilled:', conversationId);
      state.conversations = state.conversations.filter((c) => c.conversationId !== conversationId);
      delete state.messages[conversationId];
      state.unreadConversations = state.unreadConversations.filter((id) => id !== conversationId);
    })
    .addCase(deleteConversation.rejected, (state: ChatState, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la suppression de la conversation';
      console.error('chatSlice: deleteConversation rejected:', action.payload);
    });
};