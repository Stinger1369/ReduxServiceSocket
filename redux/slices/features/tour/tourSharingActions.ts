import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../../api/apiClient';
import { TourSharingDTO, TourState } from '../../../types';

export const shareTour = createAsyncThunk<
  TourSharingDTO,
  { tourId: string; nurseId: string; sharing: { nurseId: string; startDate: string; endDate: string; type: string; days?: number[]; active: boolean; noteIds?: string[]; createdBy: string; updatedBy: string } },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/shareTour', async ({ tourId, nurseId, sharing }, { rejectWithValue }) => {
  try {
    console.log('shareTour: Sending POST request to /api/tours/', tourId, '/share');
    const response = await apiClient.post(`/api/tours/${tourId}/share`, sharing);
    console.log('shareTour: Response received:', JSON.stringify(response, null, 2));
    return response as TourSharingDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('shareTour: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to share tour',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const addTourSharingExtraReducers = (builder: any) => {
  builder
    .addCase(shareTour.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(shareTour.fulfilled, (state: TourState, action: { payload: TourSharingDTO }) => {
      state.loading = false;
      if (state.selectedTour?.id === action.payload.tourId) {
        state.selectedTour.nurseIds = [...(state.selectedTour.nurseIds || []), action.payload.nurseId];
      }
    })
    .addCase(shareTour.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    });
};
