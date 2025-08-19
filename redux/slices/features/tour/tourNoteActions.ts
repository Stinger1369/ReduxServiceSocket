import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../../api/apiClient';
import { TourNoteDTO, TourState } from '../../../types';

export const addPatientNote = createAsyncThunk<
  TourNoteDTO,
  { tourId: string; patientId?: string; note: { text: string; date?: string; weekPeriod?: string; timestamp?: string; author: string; type: string; recurringDays?: string[]; createdBy: string; updatedBy: string } },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/addPatientNote', async ({ tourId, patientId, note }, { rejectWithValue }) => {
  try {
    console.log('addPatientNote: Sending POST request to /api/tours/', tourId, '/notes');
    const response = await apiClient.post(`/api/tours/${tourId}/notes`, {
      patientId,
      ...note,
    });
    console.log('addPatientNote: Response received:', JSON.stringify(response, null, 2));
    return response as TourNoteDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('addPatientNote: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to add patient note',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const fetchTourNotes = createAsyncThunk<
  TourNoteDTO[],
  { tourId: string; noteIds: string[] },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/fetchTourNotes', async ({ tourId, noteIds }, { rejectWithValue }) => {
  try {
    console.log('fetchTourNotes: Sending GET request to /api/tours/', tourId, '/notes?noteIds=', noteIds.join(','));
    const response = await apiClient.get(`/api/tours/${tourId}/notes`, {
      params: { noteIds: noteIds.join(',') },
    });
    console.log('fetchTourNotes: Response received:', JSON.stringify(response, null, 2));
    return response as TourNoteDTO[];
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('fetchTourNotes: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to fetch tour notes',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const updatePatientNote = createAsyncThunk<
  TourNoteDTO,
  { tourId: string; noteId: string; note: { text: string; date?: string; weekPeriod?: string; timestamp?: string; author: string; type: string; patientId?: string; recurringDays?: string[]; updatedBy: string } },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/updatePatientNote', async ({ tourId, noteId, note }, { rejectWithValue }) => {
  try {
    console.log('updatePatientNote: Sending PUT request to /api/tours/', tourId, '/notes/', noteId);
    const response = await apiClient.put(`/api/tours/${tourId}/notes/${noteId}`, note);
    console.log('updatePatientNote: Response received:', JSON.stringify(response, null, 2));
    return response as TourNoteDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('updatePatientNote: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to update patient note',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const deletePatientNote = createAsyncThunk<
  { tourId: string; noteId: string },
  { tourId: string; noteId: string },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/deletePatientNote', async ({ tourId, noteId }, { rejectWithValue }) => {
  try {
    console.log('deletePatientNote: Sending DELETE request to /api/tours/', tourId, '/notes/', noteId);
    await apiClient.delete(`/api/tours/${tourId}/notes/${noteId}`);
    console.log('deletePatientNote: Note deleted successfully');
    return { tourId, noteId };
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('deletePatientNote: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to delete patient note',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const fetchGlobalNotes = createAsyncThunk<
  TourNoteDTO[],
  { tourId: string; date?: string },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/fetchGlobalNotes', async ({ tourId, date }, { rejectWithValue }) => {
  try {
    console.log('fetchGlobalNotes: Sending GET request to /api/tours/', tourId, '/notes/global?date=', date);
    const response = await apiClient.get(`/api/tours/${tourId}/notes/global`, {
      params: { date },
    });
    console.log('fetchGlobalNotes: Response received:', JSON.stringify(response, null, 2));
    return response as TourNoteDTO[];
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('fetchGlobalNotes: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to fetch global notes',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const addTourNoteExtraReducers = (builder: any) => {
  builder
    .addCase(addPatientNote.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(addPatientNote.fulfilled, (state: TourState, action: { payload: TourNoteDTO }) => {
      state.loading = false;
      if (state.selectedTour?.id === action.payload.tourId) {
        state.selectedTour.noteIds = [...(state.selectedTour.noteIds || []), action.payload.id];
        state.selectedTour.notes = [...(state.selectedTour.notes || []), action.payload];
      }
    })
    .addCase(addPatientNote.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(fetchTourNotes.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(fetchTourNotes.fulfilled, (state: TourState, action: { payload: TourNoteDTO[] }) => {
      state.loading = false;
      if (state.selectedTour) {
        state.selectedTour.notes = action.payload;
      }
    })
    .addCase(fetchTourNotes.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(updatePatientNote.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(updatePatientNote.fulfilled, (state: TourState, action: { payload: TourNoteDTO }) => {
      state.loading = false;
      if (state.selectedTour?.id === action.payload.tourId) {
        state.selectedTour.notes = (state.selectedTour.notes || []).map(note =>
          note.id === action.payload.id ? action.payload : note
        );
      }
    })
    .addCase(updatePatientNote.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(deletePatientNote.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(deletePatientNote.fulfilled, (state: TourState, action: { payload: { tourId: string; noteId: string } }) => {
      state.loading = false;
      if (state.selectedTour?.id === action.payload.tourId) {
        state.selectedTour.noteIds = (state.selectedTour.noteIds || []).filter(id => id !== action.payload.noteId);
        state.selectedTour.notes = (state.selectedTour.notes || []).filter(note => note.id !== action.payload.noteId);
      }
    })
    .addCase(deletePatientNote.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(fetchGlobalNotes.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(fetchGlobalNotes.fulfilled, (state: TourState, action: { payload: TourNoteDTO[] }) => {
      state.loading = false;
      if (state.selectedTour) {
        state.selectedTour.notes = action.payload;
      }
    })
    .addCase(fetchGlobalNotes.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    });
};
