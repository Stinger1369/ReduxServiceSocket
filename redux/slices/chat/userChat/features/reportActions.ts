import { createAsyncThunk } from '@reduxjs/toolkit';
import { socketService } from '../../../../../services/socketService';
import { ErrorResponse } from '../types';

export const reportUserAsync = createAsyncThunk<
  void,
  { reporterId: string; targetId: string; reason: string },
  { rejectValue: ErrorResponse }
>(
  'userChat/reportUserAsync',
  async ({ reporterId, targetId, reason }, { rejectWithValue }) => {
    try {
      console.log('reportActions: Dispatching reportUserAsync via WebSocket:', { reporterId, targetId, reason });
      await socketService.user!.reportUser(reporterId, targetId, reason);
      console.log('reportActions: reportUserAsync completed successfully');
    } catch (error: any) {
      console.error('reportActions: Report user async error:', error);
      const errorResponse: ErrorResponse = {
        error: error.message || 'Échec du signalement de l’utilisateur',
        action: 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const addReportActionsExtraReducers = (builder: any) => {
  builder
    .addCase(reportUserAsync.pending, (state: any) => {
      state.loading = true;
      state.error = null;
      console.log('reportActions: reportUserAsync pending');
    })
    .addCase(reportUserAsync.fulfilled, (state: any) => {
      state.loading = false;
      console.log('reportActions: reportUserAsync fulfilled');
    })
    .addCase(reportUserAsync.rejected, (state: any, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec du signalement de l’utilisateur';
      console.error('reportActions: reportUserAsync rejected:', action.payload);
    });
};