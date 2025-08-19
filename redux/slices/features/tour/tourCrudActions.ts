import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../../api/apiClient';
import { TourDTO, TourState } from '../../../types';

export const createTour = createAsyncThunk<
  TourDTO,
  { nurseId: string; tour: Partial<TourDTO> },
  { rejectValue: { message: string; errorCode: number | null; response?: any } }
>('tour/createTour', async ({ nurseId, tour }, { rejectWithValue }) => {
  try {
    console.log('createTour: Sending POST request to /api/tours/nurse/', nurseId);
    const response = await apiClient.post(`/api/tours/nurse/${nurseId}`, tour);
    console.log('createTour: Response received:', JSON.stringify(response, null, 4));
    return response as TourDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('createTour: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || err.message || 'Failed to create tour',
      errorCode: err.response?.status ?? null,
      response: err.response?.data,
    });
  }
});

export const updateTour = createAsyncThunk<
  TourDTO,
  { id: string; tour: Partial<TourDTO> },
  { rejectValue: { message: string; errorCode: number | null; response?: any } }
>('tour/updateTour', async ({ id, tour }, { rejectWithValue }) => {
  try {
    console.log('updateTour: Sending PUT request to /api/tours/', id);
    const response = await apiClient.put(`/api/tours/${id}`, tour);
    console.log('updateTour: Response received:', JSON.stringify(response, null, 4));
    return response as TourDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('updateTour: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || err.message || 'Failed to update tour',
      errorCode: err.response?.status ?? null,
      response: err.response?.data,
    });
  }
});

export const deleteTour = createAsyncThunk<
  void,
  string,
  { rejectValue: { message: string; errorCode: number | null; response?: any } }
>('tour/deleteTour', async (id, { rejectWithValue }) => {
  try {
    console.log('deleteTour: Sending DELETE request to /api/tours/', id);
    await apiClient.delete(`/api/tours/${id}`);
    console.log('deleteTour: Tour deleted successfully');
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('deleteTour: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || err.message || 'Failed to delete tour',
      errorCode: err.response?.status ?? null,
      response: err.response?.data,
    });
  }
});

export const fetchAllTours = createAsyncThunk<
  TourDTO[],
  void,
  { rejectValue: { message: string; errorCode: number | null; response?: any } }
>('tour/fetchAllTours', async (_, { rejectWithValue }) => {
  try {
    console.log('fetchAllTours: Sending GET request to /api/tours');
    const response = await apiClient.get('/api/tours');
    console.log('fetchAllTours: Response received:', JSON.stringify(response, null, 4));
    return response as TourDTO[];
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('fetchAllTours: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || err.message || 'Failed to fetch tours',
      errorCode: err.response?.status ?? null,
      response: err.response?.data,
    });
  }
});

export const fetchTourById = createAsyncThunk<
  TourDTO,
  string,
  { rejectValue: { message: string; errorCode: number | null; response?: any } }
>('tour/fetchTourById', async (id, { rejectWithValue }) => {
  try {
    console.log('fetchTourById: Sending GET request to /api/tours/', id);
    const response = await apiClient.get(`/api/tours/${id}`);
    console.log('fetchTourById: Response received:', JSON.stringify(response, null, 4));
    return response as TourDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('fetchTourById: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || err.message || 'Failed to fetch tour',
      errorCode: err.response?.status ?? null,
      response: err.response?.data,
    });
  }
});

export const fetchToursByNurseId = createAsyncThunk<
  TourDTO[],
  string,
  { rejectValue: { message: string; errorCode: number | null; response?: any } }
>('tour/fetchToursByNurseId', async (nurseId, { rejectWithValue }) => {
  try {
    console.log('fetchToursByNurseId: Sending GET request to /api/tours/nurse/', nurseId);
    const response = await apiClient.get(`/api/tours/nurse/${nurseId}`);
    console.log('fetchToursByNurseId: Response received:', JSON.stringify(response, null, 4));
    return response as TourDTO[]; // Accepter un tableau vide
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('fetchToursByNurseId: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data || err.message,
    });
    return rejectWithValue({
      message: err.response?.data?.error || err.message || 'Failed to fetch tours by nurse',
      errorCode: err.response?.status ?? null,
      response: err.response?.data || err.message,
    });
  }
});

export const fetchToursByNurseIdAndDate = createAsyncThunk<
  TourDTO[],
  { nurseId: string; date: string },
  { rejectValue: { message: string; errorCode: number | null; response?: any } }
>('tour/fetchToursByNurseIdAndDate', async ({ nurseId, date }, { rejectWithValue }) => {
  try {
    console.log('fetchToursByNurseIdAndDate: Sending GET request to /api/tours/nurse/', nurseId, '/date/', date);
    const response = await apiClient.get(`/api/tours/nurse/${nurseId}/date/${date}`);
    console.log('fetchToursByNurseIdAndDate: Response received:', JSON.stringify(response, null, 4));
    return response as TourDTO[];
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('fetchToursByNurseIdAndDate: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || err.message || 'Failed to fetch tours by nurse and date',
      errorCode: err.response?.status ?? null,
      response: err.response?.data,
    });
  }
});

export const fetchToursByPatientId = createAsyncThunk<
  TourDTO[],
  string,
  { rejectValue: { message: string; errorCode: number | null; response?: any } }
>('tour/fetchToursByPatientId', async (patientId, { rejectWithValue }) => {
  try {
    console.log('fetchToursByPatientId: Sending GET request to /api/tours/patient/', patientId);
    const response = await apiClient.get(`/api/tours/patient/${patientId}`);
    console.log('fetchToursByPatientId: Response received:', JSON.stringify(response, null, 4));
    return response as TourDTO[];
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('fetchToursByPatientId: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || err.message || 'Failed to fetch tours by patient',
      errorCode: err.response?.status ?? null,
      response: err.response?.data,
    });
  }
});

export const addTourCrudExtraReducers = (builder: any) => {
  builder
    .addCase(createTour.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(createTour.fulfilled, (state: TourState, action: { payload: TourDTO }) => {
      state.loading = false;
      state.tours.push(action.payload);
      state.selectedTour = action.payload;
    })
    .addCase(createTour.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(updateTour.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(updateTour.fulfilled, (state: TourState, action: { payload: TourDTO }) => {
      state.loading = false;
      state.tours = state.tours.map((tour) =>
        tour.id === action.payload.id ? action.payload : tour
      );
      state.selectedTour = action.payload;
    })
    .addCase(updateTour.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(deleteTour.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(deleteTour.fulfilled, (state: TourState, action: { meta: { arg: string } }) => {
      state.loading = false;
      state.tours = state.tours.filter((tour) => tour.id !== action.meta.arg);
      if (state.selectedTour?.id === action.meta.arg) {
        state.selectedTour = null;
      }
    })
    .addCase(deleteTour.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(fetchAllTours.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(fetchAllTours.fulfilled, (state: TourState, action: { payload: TourDTO[] }) => {
      state.loading = false;
      state.tours = action.payload;
    })
    .addCase(fetchAllTours.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(fetchTourById.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(fetchTourById.fulfilled, (state: TourState, action: { payload: TourDTO }) => {
      state.loading = false;
      state.selectedTour = action.payload;
    })
    .addCase(fetchTourById.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(fetchToursByNurseId.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(fetchToursByNurseId.fulfilled, (state: TourState, action: { payload: TourDTO[] }) => {
      state.loading = false;
      state.tours = action.payload;
    })
    .addCase(fetchToursByNurseId.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(fetchToursByNurseIdAndDate.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(fetchToursByNurseIdAndDate.fulfilled, (state: TourState, action: { payload: TourDTO[] }) => {
      state.loading = false;
      state.tours = action.payload;
    })
    .addCase(fetchToursByNurseIdAndDate.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(fetchToursByPatientId.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(fetchToursByPatientId.fulfilled, (state: TourState, action: { payload: TourDTO[] }) => {
      state.loading = false;
      state.tours = action.payload;
    })
    .addCase(fetchToursByPatientId.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    });
};
