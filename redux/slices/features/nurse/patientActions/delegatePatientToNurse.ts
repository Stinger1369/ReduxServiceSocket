import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { PatientDTO, NurseState } from "./types";

export const delegatePatientToNurse = createAsyncThunk<
  PatientDTO,
  { currentNurseId: string; patientId: string; targetNurseId: string },
  { rejectValue: string }
>(
  "nurse/delegatePatientToNurse",
  async ({ currentNurseId, patientId, targetNurseId }, { rejectWithValue }) => {
    try {
      console.log(`delegatePatientToNurse: Sending PUT request to /api/nurses/${currentNurseId}/patients/${patientId}/delegate`);
      const response = await apiClient.put(
        `/api/nurses/${currentNurseId}/patients/${patientId}/delegate`,
        { targetNurseId }
      );
      console.log("delegatePatientToNurse: Response received:", response);
      if (!response || !response.data) {
        throw new Error("Response or response data is undefined");
      }
      return response.data as PatientDTO;
    } catch (error: any) {
      console.error("delegatePatientToNurse: Request failed:", error.message, error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to delegate patient to nurse");
    }
  }
);

export const delegatePatientToNurseExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(delegatePatientToNurse.pending, (state) => {
      console.log("delegatePatientToNurse: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(delegatePatientToNurse.fulfilled, (state, action) => {
      console.log("delegatePatientToNurse: Fulfilled state, payload:", action.payload);
      state.loading = false;
      if (!action.payload) {
        console.error("delegatePatientToNurse: Payload is undefined");
        state.error = "Received undefined response from server";
        return;
      }
      const updatedPatient = action.payload;
      state.patients = state.patients.map((patient) =>
        patient.id === updatedPatient.id ? updatedPatient : patient
      );
      if (state.selectedNurse && state.selectedNurse.id === action.meta.arg.currentNurseId) {
        state.selectedNurse.patientIds = state.selectedNurse.patientIds?.filter((id) => id !== updatedPatient.id) || [];
      }
      state.nurses = state.nurses.map((nurse) =>
        nurse.id === action.meta.arg.currentNurseId
          ? { ...nurse, patientIds: nurse.patientIds?.filter((id) => id !== updatedPatient.id) || [] }
          : nurse
      );
    })
    .addCase(delegatePatientToNurse.rejected, (state, action) => {
      console.log("delegatePatientToNurse: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
    });
};