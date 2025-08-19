import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { PatientDTO, NurseState } from "./types";

export const setPatientVisibility = createAsyncThunk<
  PatientDTO,
  { nurseId: string; patientId: string; isPublic: boolean },
  { rejectValue: string }
>(
  "nurse/setPatientVisibility",
  async ({ nurseId, patientId, isPublic }, { rejectWithValue }) => {
    try {
      console.log(`setPatientVisibility: Sending PUT request to /api/nurses/${nurseId}/patients/${patientId}/visibility`);
      const response = await apiClient.put(`/api/nurses/${nurseId}/patients/${patientId}/visibility`, null, { params: { isPublic } });
      console.log("setPatientVisibility: Response received:", response);
      if (!response) {
        throw new Error("Response is undefined");
      }
      return response as PatientDTO;
    } catch (error: any) {
      console.error("setPatientVisibility: Request failed:", error.message, error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to set patient visibility");
    }
  }
);

export const setPatientVisibilityExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(setPatientVisibility.pending, (state) => {
      console.log("setPatientVisibility: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(setPatientVisibility.fulfilled, (state, action) => {
      console.log("setPatientVisibility: Fulfilled state, payload:", action.payload);
      state.loading = false;
      if (!action.payload) {
        console.error("setPatientVisibility: Payload is undefined");
        state.error = "Received undefined response from server";
        return;
      }
      const updatedPatient = action.payload;
      state.patients = state.patients.map((patient) =>
        patient.id === updatedPatient.id ? updatedPatient : patient
      );
    })
    .addCase(setPatientVisibility.rejected, (state, action) => {
      console.log("setPatientVisibility: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
    });
};