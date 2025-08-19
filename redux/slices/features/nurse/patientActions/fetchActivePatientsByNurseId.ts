import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { PatientDTO, NurseState } from "../../../../types";

export const fetchActivePatientsByNurseId = createAsyncThunk<
  PatientDTO[],
  string,
  { rejectValue: string }
>(
  "nurse/fetchActivePatientsByNurseId",
  async (nurseId, { rejectWithValue }) => {
    try {
      console.log(`fetchActivePatientsByNurseId: Sending GET request to /api/nurses/${nurseId}/patients/active`);
      const response = await apiClient.get(`/api/nurses/${nurseId}/patients/active`);
      console.log(`fetchActivePatientsByNurseId: Response received:`, response);
      if (!Array.isArray(response)) {
        throw new Error("Response is not an array of patients");
      }
      return response as PatientDTO[];
    } catch (error: any) {
      console.error("fetchActivePatientsByNurseId: Request failed:", error.message, error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch active patients");
    }
  }
);

export const fetchActivePatientsByNurseIdExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(fetchActivePatientsByNurseId.pending, (state) => {
      console.log("fetchActivePatientsByNurseId: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchActivePatientsByNurseId.fulfilled, (state, action) => {
      console.log("fetchActivePatientsByNurseId: Fulfilled state, payload:", action.payload);
      state.loading = false;
      // Store active patients separately or filter existing patients
      state.patients = state.patients.map((patient) => ({
        ...patient,
        isActive: action.payload.some((activePatient) => activePatient.id === patient.id),
      }));
      // Optionally, store active patients in a separate array
      // state.activePatients = action.payload;
    })
    .addCase(fetchActivePatientsByNurseId.rejected, (state, action) => {
      console.log("fetchActivePatientsByNurseId: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
    });
};