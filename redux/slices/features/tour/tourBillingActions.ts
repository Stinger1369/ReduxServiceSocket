import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../../api/apiClient';
import { TourBillingDTO, WeeklyBillingDTO, MonthlyBillingDTO, TourState } from '../../../types';

export const fetchTourBilling = createAsyncThunk<
  TourBillingDTO,
  { tourId: string; date: string },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/fetchTourBilling', async ({ tourId, date }, { rejectWithValue }) => {
  try {
    console.log('fetchTourBilling: Sending GET request to /api/tours/', tourId, '/billing?date=', date);
    const response = await apiClient.get(`/api/tours/${tourId}/billing?date=${date}`);
    console.log('fetchTourBilling: Response received:', JSON.stringify(response, null, 2));
    return response as TourBillingDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('fetchTourBilling: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to fetch tour billing',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const fetchWeeklyBilling = createAsyncThunk<
  WeeklyBillingDTO,
  { nurseId: string; startDate: string },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/fetchWeeklyBilling', async ({ nurseId, startDate }, { rejectWithValue }) => {
  try {
    console.log('fetchWeeklyBilling: Sending GET request to /api/tours/billing/weekly?nurseId=', nurseId, '&startDate=', startDate);
    const response = await apiClient.get(`/api/tours/billing/weekly?nurseId=${nurseId}&startDate=${startDate}`);
    console.log('fetchWeeklyBilling: Response received:', JSON.stringify(response, null, 2));
    return response as WeeklyBillingDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('fetchWeeklyBilling: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to fetch weekly billing',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const fetchMonthlyBilling = createAsyncThunk<
  MonthlyBillingDTO,
  { nurseId: string; year: number; month: number },
  { rejectValue: { message: string; errorCode: number | null } }
>('tour/fetchMonthlyBilling', async ({ nurseId, year, month }, { rejectWithValue }) => {
  try {
    console.log('fetchMonthlyBilling: Sending GET request to /api/tours/billing/monthly?nurseId=', nurseId, '&year=', year, '&month=', month);
    const response = await apiClient.get(`/api/tours/billing/monthly?nurseId=${nurseId}&year=${year}&month=${month}`);
    console.log('fetchMonthlyBilling: Response received:', JSON.stringify(response, null, 2));
    return response as MonthlyBillingDTO;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { error?: string } } };
    console.error('fetchMonthlyBilling: Error:', {
      message: err.response?.data?.error || 'Unknown error',
      errorCode: err.response?.status,
      response: err.response?.data,
    });
    return rejectWithValue({
      message: err.response?.data?.error || 'Failed to fetch monthly billing',
      errorCode: err.response?.status ?? null,
    });
  }
});

export const addTourBillingExtraReducers = (builder: any) => {
  builder
    .addCase(fetchTourBilling.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(fetchTourBilling.fulfilled, (state: TourState, action: { payload: TourBillingDTO }) => {
      state.loading = false;
      state.billing.tourBilling = action.payload;
    })
    .addCase(fetchTourBilling.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(fetchWeeklyBilling.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(fetchWeeklyBilling.fulfilled, (state: TourState, action: { payload: WeeklyBillingDTO }) => {
      state.loading = false;
      state.billing.weeklyBilling = action.payload;
    })
    .addCase(fetchWeeklyBilling.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(fetchMonthlyBilling.pending, (state: TourState) => {
      state.loading = true;
      state.error = null;
      state.errorCode = null;
    })
    .addCase(fetchMonthlyBilling.fulfilled, (state: TourState, action: { payload: MonthlyBillingDTO }) => {
      state.loading = false;
      state.billing.monthlyBilling = action.payload;
    })
    .addCase(fetchMonthlyBilling.rejected, (state: TourState, action: { payload: { message: string; errorCode: number | null } }) => {
      state.loading = false;
      state.error = action.payload.message;
      state.errorCode = action.payload.errorCode;
    });
};
