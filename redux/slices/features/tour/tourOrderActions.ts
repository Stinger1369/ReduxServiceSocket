import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../../api/apiClient';
import { TourDTO, TourState } from '../../../types';

export const updatePatientOrder = createAsyncThunk<
  TourDTO,
  { tourId: string; patientOrder: string[] },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/updatePatientOrder', async ({ tourId, patientOrder }, { rejectWithValue }) => {
  try {
    console.log('updatePatientOrder: Sending PUT request to /api/tours/', tourId, '/order');
    const response = await apiClient.put(`/api/tours/${tourId}/order`, patientOrder);
    console.log('updatePatientOrder: Response received:', JSON.stringify(response, null, 2));
    return response as TourDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('updatePatientOrder: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to update patient order',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const reorderPatientsByActs = createAsyncThunk<
  TourDTO,
  { tourId: string; nurseId: string },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/reorderPatientsByActs', async ({ tourId, nurseId }, { rejectWithValue }) => {
  try {
    console.log('reorderPatientsByActs: Sending POST request to /api/tours/', tourId, '/order/acts?nurseId=', nurseId);
    const response = await apiClient.post(`/api/tours/${tourId}/order/acts?nurseId=${nurseId}`);
    console.log('reorderPatientsByActs: Response received:', JSON.stringify(response, null, 2));
    return response as TourDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('reorderPatientsByActs: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to reorder patients by acts',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const optimizeTour = createAsyncThunk<
  TourDTO,
  string,
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/optimizeTour', async (tourId, { rejectWithValue }) => {
  try {
    console.log('optimizeTour: Sending POST request to /api/tours/', tourId, '/order/optimize');
    const response = await apiClient.post(`/api/tours/${tourId}/order/optimize`);
    console.log('optimizeTour: Response received:', JSON.stringify(response, null, 2));
    return response as TourDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('optimizeTour: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to optimize tour',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const addTourOrderExtraReducers = (builder: any) => {
  builder
    .addCase(updatePatientOrder.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(updatePatientOrder.fulfilled, (state: TourState, action: { payload: TourDTO }) => {
      state.loading = false;
      state.tours = state.tours.map((tour) =>
        tour.id === action.payload.id ? action.payload : tour
      );
      if (state.selectedTour?.id === action.payload.id) {
        state.selectedTour = action.payload;
      }
    })
    .addCase(updatePatientOrder.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(reorderPatientsByActs.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(reorderPatientsByActs.fulfilled, (state: TourState, action: { payload: TourDTO }) => {
      state.loading = false;
      state.tours = state.tours.map((tour) =>
        tour.id === action.payload.id ? action.payload : tour
      );
      if (state.selectedTour?.id === action.payload.id) {
        state.selectedTour = action.payload;
      }
    })
    .addCase(reorderPatientsByActs.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(optimizeTour.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(optimizeTour.fulfilled, (state: TourState, action: { payload: TourDTO }) => {
      state.loading = false;
      state.tours = state.tours.map((tour) =>
        tour.id === action.payload.id ? action.payload : tour
      );
      if (state.selectedTour?.id === action.payload.id) {
        state.selectedTour = action.payload;
      }
    })
    .addCase(optimizeTour.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    });
};
