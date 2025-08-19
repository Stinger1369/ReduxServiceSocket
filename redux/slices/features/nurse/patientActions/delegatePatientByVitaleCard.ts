import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { PatientDTO, NurseState } from "./types";

export const delegatePatientByVitaleCard = createAsyncThunk<
  PatientDTO,
  { currentNurseId: string; vitaleCardId: string; targetNurseId: string },
  { rejectValue: string }
>(
  "nurse/delegatePatientByVitaleCard",
  async ({ currentNurseId, vitaleCardId, targetNurseId }, { rejectWithValue }) => {
    try {
      console.log(`delegatePatientByVitaleCard: Sending PUT request to /api/nurses/${currentNurseId}/patients/vitale/${vitaleCardId}/delegate`);
      const response = await apiClient.put(
        `/api/nurses/${currentNurseId}/patients/vitale/${vitaleCardId}/delegate`,
        { targetNurseId }
      );
      console.log("delegatePatientByVitaleCard: Response received:", response);
      if (!response || !response.data) {
        throw new Error("Response or response data is undefined");
      }
      return response.data as PatientDTO;
    } catch (error: any) {
      console.error("delegatePatientByVitaleCard: Request failed:", error.message, error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to delegate patient by vitale card");
    }
  }
);

export const delegatePatientByVitaleCardExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(delegatePatientByVitaleCard.pending, (state) => {
      console.log("delegatePatientByVitaleCard: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(delegatePatientByVitaleCard.fulfilled, (state, action) => {
      console.log("delegatePatientByVitaleCard: Fulfilled state, payload:", action.payload);
      state.loading = false;
      if (!action.payload) {
        console.error("delegatePatientByVitaleCard: Payload is undefined");
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
    .addCase(delegatePatientByVitaleCard.rejected, (state, action) => {
      console.log("delegatePatientByVitaleCard: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
    });
};