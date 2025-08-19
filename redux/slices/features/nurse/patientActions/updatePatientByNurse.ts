// nursenovafrontend/src/redux/slices/features/nurse/patientActions/updatePatientByNurse.ts
import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { PatientDTO, NurseState } from "./types";

export const updatePatientByNurse = createAsyncThunk<
  PatientDTO,
  { nurseId: string; patientId: string; patientData: Partial<PatientDTO> },
  { rejectValue: { message: string; code: string } }
>(
  "nurse/updatePatientByNurse",
  async ({ nurseId, patientId, patientData }, { rejectWithValue }) => {
    try {
      console.log("updatePatientByNurse: Sending PUT request to /api/nurses/", nurseId, "/patients/", patientId);
      const response = await apiClient.put(`/api/nurses/${nurseId}/patients/${patientId}`, patientData);
      console.log("updatePatientByNurse: Response received:", response);
      if (!response) {
        throw new Error("Response is undefined");
      }
      return response as PatientDTO;
    } catch (error: any) {
      console.error("updatePatientByNurse: Request failed:", error.message, error.response?.data);
      const errorMessage = error.response?.data?.message || "Failed to update patient by nurse";
      const errorCode = error.response?.data?.error || "unknown_error";
      return rejectWithValue({ message: errorMessage, code: errorCode });
    }
  }
);

export const updatePatientByNurseExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(updatePatientByNurse.pending, (state) => {
      console.log("updatePatientByNurse: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(updatePatientByNurse.fulfilled, (state, action) => {
      console.log("updatePatientByNurse: Fulfilled state, payload:", action.payload);
      state.loading = false;
      if (!action.payload) {
        console.error("updatePatientByNurse: Payload is undefined");
        state.error = "Received undefined response from server";
        return;
      }
      const updatedPatient = action.payload;
      state.patients = state.patients.map((patient) =>
        patient.id === updatedPatient.id ? updatedPatient : patient
      );
    })
    .addCase(updatePatientByNurse.rejected, (state, action) => {
      console.log("updatePatientByNurse: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload?.message || "Failed to update patient by nurse";
      state.errorCode = action.payload?.code || null;
    });
};