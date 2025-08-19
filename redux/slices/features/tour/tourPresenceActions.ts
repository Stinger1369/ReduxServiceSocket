import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../../api/apiClient';
import { TourPatientPresenceDTO, TourState } from '../../../types';

export const markPatientPresence = createAsyncThunk<
  TourPatientPresenceDTO,
  { tourId: string; patientId: string; date: string; present: boolean; updatedBy: string; noteId?: string },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/markPatientPresence', async ({ tourId, patientId, date, present, updatedBy, noteId }, { rejectWithValue }) => {
  try {
    console.log('markPatientPresence: Sending POST request to /api/tours/', tourId, '/patients/', patientId, '/presence');
    const response = await apiClient.post(`/api/tours/${tourId}/patients/${patientId}/presence`, {
      date,
      present,
      updatedBy,
      noteId,
    });
    console.log('markPatientPresence: Response received:', JSON.stringify(response, null, 2));
    return response as TourPatientPresenceDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('markPatientPresence: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to set patient presence',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const markPatientPresenceRange = createAsyncThunk<
  TourPatientPresenceDTO[],
  { tourId: string; patientId: string; startDate: string; endDate: string; present: boolean; updatedBy: string; noteId?: string },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/markPatientPresenceRange', async ({ tourId, patientId, startDate, endDate, present, updatedBy, noteId }, { rejectWithValue }) => {
  try {
    console.log('markPatientPresenceRange: Sending POST request to /api/tours/', tourId, '/patients/', patientId, '/presence/range');
    const response = await apiClient.post(`/api/tours/${tourId}/patients/${patientId}/presence/range`, {
      startDate,
      endDate,
      present,
      updatedBy,
      noteId,
    });
    console.log('markPatientPresenceRange: Response received:', JSON.stringify(response, null, 2));
    return response as TourPatientPresenceDTO[];
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('markPatientPresenceRange: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to set patient presence range',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const fetchPresenceByTourIdAndDate = createAsyncThunk<
  TourPatientPresenceDTO[],
  { tourId: string; date: string },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/fetchPresenceByTourIdAndDate', async ({ tourId, date }, { rejectWithValue }) => {
  try {
    console.log('fetchPresenceByTourIdAndDate: Sending GET request to /api/tours/', tourId, '/presence?date=', date);
    const response = await apiClient.get(`/api/tours/${tourId}/presence?date=${date}`);
    console.log('fetchPresenceByTourIdAndDate: Response received:', JSON.stringify(response, null, 2));
    return response as TourPatientPresenceDTO[];
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('fetchPresenceByTourIdAndDate: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to fetch presence by tour and date',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const fetchPresenceByTourIdAndDateRange = createAsyncThunk<
  TourPatientPresenceDTO[],
  { tourId: string; startDate: string; endDate: string },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/fetchPresenceByTourIdAndDateRange', async ({ tourId, startDate, endDate }, { rejectWithValue }) => {
  try {
    console.log('fetchPresenceByTourIdAndDateRange: Sending GET request to /api/tours/', tourId, '/presence/range?startDate=', startDate, '&endDate=', endDate);
    const response = await apiClient.get(`/api/tours/${tourId}/presence/range?startDate=${startDate}&endDate=${endDate}`);
    console.log('fetchPresenceByTourIdAndDateRange: Response received:', JSON.stringify(response, null, 2));
    return response as TourPatientPresenceDTO[];
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('fetchPresenceByTourIdAndDateRange: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to fetch presence by tour and date range',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const addTourPresenceExtraReducers = (builder: any) => {
  builder
    .addCase(markPatientPresence.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(markPatientPresence.fulfilled, (state: TourState, action: { payload: TourPatientPresenceDTO }) => {
      state.loading = false;
      state.presences = state.presences.filter(
        (p) => !(p.tourId === action.payload.tourId && p.patientId === action.payload.patientId && p.date === action.payload.date)
      );
      state.presences.push(action.payload);
    })
    .addCase(markPatientPresence.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(markPatientPresenceRange.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(markPatientPresenceRange.fulfilled, (state: TourState, action: { payload: TourPatientPresenceDTO[] }) => {
      state.loading = false;
      state.presences = state.presences.filter(
        (p) => !action.payload.some((newP) => newP.tourId === p.tourId && newP.patientId === p.patientId && newP.date === p.date)
      );
      state.presences.push(...action.payload);
    })
    .addCase(markPatientPresenceRange.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(fetchPresenceByTourIdAndDate.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(fetchPresenceByTourIdAndDate.fulfilled, (state: TourState, action: { payload: TourPatientPresenceDTO[] }) => {
      state.loading = false;
      state.presences = action.payload;
    })
    .addCase(fetchPresenceByTourIdAndDate.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(fetchPresenceByTourIdAndDateRange.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(fetchPresenceByTourIdAndDateRange.fulfilled, (state: TourState, action: { payload: TourPatientPresenceDTO[] }) => {
      state.loading = false;
      state.presences = action.payload;
    })
    .addCase(fetchPresenceByTourIdAndDateRange.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    });
};
