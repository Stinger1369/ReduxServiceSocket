import { createAsyncThunk } from '@reduxjs/toolkit';
import { socketService } from '../../../../../services/socketService';
import { ErrorResponse } from '../types';

export const blockUserAsync = createAsyncThunk<
  void,
  { userId: string; targetId: string },
  { rejectValue: ErrorResponse }
>(
  'userChat/blockUserAsync',
  async ({ userId, targetId }, { rejectWithValue }) => {
    try {
      console.log('blockActions: Dispatching blockUserAsync via WebSocket:', { userId, targetId });
      await socketService.user!.blockUser(userId, targetId);
      console.log('blockActions: blockUserAsync completed successfully');
    } catch (error: any) {
      console.error('blockActions: Block user async error:', error);
      const errorResponse: ErrorResponse = {
        error: error.message || 'Échec du blocage de l’utilisateur',
        action: 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const unblockUserAsync = createAsyncThunk<
  void,
  { userId: string; targetId: string },
  { rejectValue: ErrorResponse }
>(
  'userChat/unblockUserAsync',
  async ({ userId, targetId }, { rejectWithValue }) => {
    try {
      console.log('blockActions: Dispatching unblockUserAsync via WebSocket:', { userId, targetId });
      await socketService.user!.unblockUser(userId, targetId);
      console.log('blockActions: unblockUserAsync completed successfully');
    } catch (error: any) {
      console.error('blockActions: Unblock user async error:', error);
      const errorResponse: ErrorResponse = {
        error: error.message || 'Échec du déblocage de l’utilisateur',
        action: 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const addBlockActionsExtraReducers = (builder: any) => {
  builder
    .addCase(blockUserAsync.pending, (state: any) => {
      state.loading = true;
      state.error = null;
      console.log('blockActions: blockUserAsync pending');
    })
    .addCase(blockUserAsync.fulfilled, (state: any) => {
      state.loading = false;
      console.log('blockActions: blockUserAsync fulfilled');
    })
    .addCase(blockUserAsync.rejected, (state: any, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec du blocage de l’utilisateur';
      console.error('blockActions: blockUserAsync rejected:', action.payload);
    })
    .addCase(unblockUserAsync.pending, (state: any) => {
      state.loading = true;
      state.error = null;
      console.log('blockActions: unblockUserAsync pending');
    })
    .addCase(unblockUserAsync.fulfilled, (state: any) => {
      state.loading = false;
      console.log('blockActions: unblockUserAsync fulfilled');
    })
    .addCase(unblockUserAsync.rejected, (state: any, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec du déblocage de l’utilisateur';
      console.error('blockActions: unblockUserAsync rejected:', action.payload);
    });
};