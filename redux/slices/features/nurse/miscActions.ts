import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { NurseState } from "../../../types";

// Verify email
export const verifyEmail = createAsyncThunk<
  string,
  { id: string; code: string },
  { rejectValue: string }
>("nurse/verifyEmail", async ({ id, code }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<string>(
      `/api/nurses/${id}/verify-email`,
      null,
      {
        params: { code },
      }
    );
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    console.error("Verify Email Error:", err);
    return rejectWithValue(
      err.response?.data?.message || "Failed to verify email"
    );
  }
});

// Get weather for nurse
export const getWeatherForNurse = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("nurse/getWeatherForNurse", async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<string>(`/api/nurses/${id}/weather`);
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    console.error("Get Weather Error:", err);
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch weather"
    );
  }
});

// Reset patient password by nurse
export const resetPatientPasswordByNurse = createAsyncThunk<
  string,
  { nurseId: string; patientId: string; newPassword: string },
  { rejectValue: string }
>(
  "nurse/resetPatientPasswordByNurse",
  async ({ nurseId, patientId, newPassword }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<string>(
        `/api/nurses/${nurseId}/patient/${patientId}/reset-password`,
        null,
        {
          params: { newPassword },
        }
      );
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Reset Patient Password Error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to reset patient password"
      );
    }
  }
);

// Fonction pour ajouter les extraReducers spécifiques à miscActions
export const addMiscExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    // Verify Email
    .addCase(verifyEmail.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(verifyEmail.fulfilled, (state, action) => {
      state.loading = false;
      if (
        state.selectedNurse &&
        state.selectedNurse.id === action.meta.arg.id
      ) {
        state.selectedNurse.isVerified = true;
      }
    })
    .addCase(verifyEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Get Weather
    .addCase(getWeatherForNurse.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getWeatherForNurse.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(getWeatherForNurse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Reset Patient Password by Nurse
    .addCase(resetPatientPasswordByNurse.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(resetPatientPasswordByNurse.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(resetPatientPasswordByNurse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
};