import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { PatientState } from "../../../types";

export const verifyPatientEmail = createAsyncThunk<
  void,
  { id: string; code: string },
  { rejectValue: string }
>("patient/verifyPatientEmail", async ({ id, code }, { rejectWithValue }) => {
  try {
    await apiClient.post(`/api/patients/${id}/verify-email`, { code });
  } catch (error: any) {
    const message =
      error.response?.data?.error || "Échec de la vérification de l'email";
    return rejectWithValue(message);
  }
});

export const forgotPasswordPatient = createAsyncThunk<
  void,
  { id: string; email: string },
  { rejectValue: string }
>(
  "patient/forgotPasswordPatient",
  async ({ id, email }, { rejectWithValue }) => {
    try {
      await apiClient.post(`/api/patients/${id}/forgot-password`, { email });
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        "Échec de l'envoi de l'email de réinitialisation";
      return rejectWithValue(message);
    }
  }
);

export const resetPasswordPatient = createAsyncThunk<
  void,
  { id: string; token: string; newPassword: string },
  { rejectValue: string }
>(
  "patient/resetPasswordPatient",
  async ({ id, token, newPassword }, { rejectWithValue }) => {
    try {
      await apiClient.post(`/api/patients/${id}/reset-password`, {
        token,
        newPassword,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        "Échec de la réinitialisation du mot de passe";
      return rejectWithValue(message);
    }
  }
);

export const addAuthExtraReducers = (
  builder: ActionReducerMapBuilder<PatientState>
) => {
  builder
    // verifyPatientEmail
    .addCase(verifyPatientEmail.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(verifyPatientEmail.fulfilled, (state, action) => {
      state.loading = false;
      if (
        state.selectedPatient &&
        state.selectedPatient.id === action.meta.arg.id
      ) {
        state.selectedPatient.isVerified = true;
      }
      state.patients = state.patients.map((patient) =>
        patient.id === action.meta.arg.id
          ? { ...patient, isVerified: true }
          : patient
      );
    })
    .addCase(verifyPatientEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Échec de la vérification de l'email";
    })
    // forgotPasswordPatient
    .addCase(forgotPasswordPatient.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(forgotPasswordPatient.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(forgotPasswordPatient.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload || "Échec de l'envoi de l'email de réinitialisation";
    })
    // resetPasswordPatient
    .addCase(resetPasswordPatient.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(resetPasswordPatient.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(resetPasswordPatient.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload || "Échec de la réinitialisation du mot de passe";
    });
};
