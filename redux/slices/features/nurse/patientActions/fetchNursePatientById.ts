// patientActions/fetchNursePatientById.ts
import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { PatientDTO, NurseState } from "./types";

export const fetchNursePatientById = createAsyncThunk<
  PatientDTO,
  { nurseId: string; patientId: string },
  { rejectValue: string; state: { nurse: NurseState } }
>(
  "nurse/fetchNursePatientById",
  async ({ nurseId, patientId }, { getState, rejectWithValue }) => {
    const state = getState();
    // Vérifier si le patient existe déjà dans l'état
    const existingPatient = state.nurse.patients.find((p) => p.id === patientId) || state.nurse.selectedPatient;
    if (existingPatient && existingPatient.id === patientId) {
      console.log(`fetchNursePatientById: Returning cached patient ${patientId}`);
      return existingPatient;
    }

    try {
      console.log(`fetchNursePatientById: Sending GET request to /api/nurses/${nurseId}/patients/${patientId}`);
      const response = await apiClient.get(`/api/nurses/${nurseId}/patients/${patientId}`);
      console.log("fetchNursePatientById: Response received:", response);
      if (!response) {
        throw new Error("Response is undefined");
      }
      return response as PatientDTO;
    } catch (error: any) {
      console.error("fetchNursePatientById: Request failed:", error.message, error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch nurse patient");
    }
  }
);

export const fetchNursePatientByIdExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(fetchNursePatientById.pending, (state, action) => {
      console.log("fetchNursePatientById: Pending state");
      const { patientId } = action.meta.arg;
      state.loadingPatients[patientId] = true;
      state.error = null;
    })
    .addCase(fetchNursePatientById.fulfilled, (state, action) => {
      console.log("fetchNursePatientById: Fulfilled state, payload:", action.payload);
      const { patientId } = action.meta.arg;
      state.loadingPatients[patientId] = false;
      if (!action.payload) {
        console.error("fetchNursePatientById: Payload is undefined");
        state.error = "Received undefined response from server";
        return;
      }
      const fetchedPatient = action.payload;
      state.selectedPatient = fetchedPatient;
      const existingPatientIndex = state.patients.findIndex((p) => p.id === fetchedPatient.id);
      if (existingPatientIndex >= 0) {
        state.patients[existingPatientIndex] = fetchedPatient;
      } else {
        state.patients.push(fetchedPatient);
      }
    })
    .addCase(fetchNursePatientById.rejected, (state, action) => {
      console.log("fetchNursePatientById: Rejected state, error:", action.payload);
      const { patientId } = action.meta.arg;
      state.loadingPatients[patientId] = false;
      state.error = action.payload as string;
    });
};