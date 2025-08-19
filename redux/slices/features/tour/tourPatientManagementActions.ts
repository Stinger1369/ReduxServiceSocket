import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../../api/apiClient';
import { TourDTO, TourState } from '../../../types';

export const addPatientToTour = createAsyncThunk<
  TourDTO,
  { tourId: string; patientId: string; nurseId: string; isPermanent: boolean; days?: string[] },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/addPatientToTour', async ({ tourId, patientId, nurseId, isPermanent, days }, { rejectWithValue }) => {
  try {
    console.log('addPatientToTour: Sending POST request to /api/tours/', tourId, '/patients');
    const response = await apiClient.post(`/api/tours/${tourId}/patients`, {
      patientId,
      nurseId,
      isPermanent,
      days,
    });
    console.log('addPatientToTour: Response received:', JSON.stringify(response, null, 2));
    return response as TourDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('addPatientToTour: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to add patient to tour',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const updatePatientDetails = createAsyncThunk<
  TourDTO,
  { tourId: string; patientId: string; nurseId: string; isPermanent: boolean; days?: string[] },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/updatePatientDetails', async ({ tourId, patientId, nurseId, isPermanent, days }, { rejectWithValue }) => {
  try {
    console.log('updatePatientDetails: Sending PUT request to /api/tours/', tourId, '/patients/', patientId);
    const response = await apiClient.put(`/api/tours/${tourId}/patients/${patientId}`, {
      patientId,
      nurseId,
      isPermanent,
      days,
    });
    console.log('updatePatientDetails: Response received:', JSON.stringify(response, null, 2));
    return response as TourDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('updatePatientDetails: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to update patient details',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const removePatientFromTour = createAsyncThunk<
  TourDTO,
  { tourId: string; patientId: string; nurseId: string },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/removePatientFromTour', async ({ tourId, patientId, nurseId }, { rejectWithValue }) => {
  try {
    console.log('removePatientFromTour: Sending DELETE request to /api/tours/', tourId, '/patients/', patientId, '?nurseId=', nurseId);
    const response = await apiClient.delete(`/api/tours/${tourId}/patients/${patientId}?nurseId=${nurseId}`);
    console.log('removePatientFromTour: Response received:', JSON.stringify(response, null, 2));
    return response as TourDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('removePatientFromTour: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to remove patient from tour',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const addTourPatientManagementExtraReducers = (builder: any) => {
  builder
    .addCase(addPatientToTour.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(addPatientToTour.fulfilled, (state: TourState, action: { payload: TourDTO }) => {
      state.loading = false;
      state.tours = state.tours.map((tour) =>
        tour.id === action.payload.id ? action.payload : tour
      );
      if (state.selectedTour?.id === action.payload.id) {
        state.selectedTour = action.payload;
      }
    })
    .addCase(addPatientToTour.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(updatePatientDetails.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(updatePatientDetails.fulfilled, (state: TourState, action: { payload: TourDTO }) => {
      state.loading = false;
      state.tours = state.tours.map((tour) =>
        tour.id === action.payload.id ? action.payload : tour
      );
      if (state.selectedTour?.id === action.payload.id) {
        state.selectedTour = action.payload;
      }
    })
    .addCase(updatePatientDetails.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(removePatientFromTour.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(removePatientFromTour.fulfilled, (state: TourState, action: { payload: TourDTO }) => {
      state.loading = false;
      state.tours = state.tours.map((tour) =>
        tour.id === action.payload.id ? action.payload : tour
      );
      if (state.selectedTour?.id === action.payload.id) {
        state.selectedTour = action.payload;
      }
    })
    .addCase(removePatientFromTour.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    });
};
