import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { PatientDTO, NurseState } from "./types";

export const createPatientByNurse = createAsyncThunk<
  PatientDTO,
  { nurseId: string; patientData: Partial<PatientDTO>; mode: 'simple' | 'advanced' },
  { rejectValue: { message: string; code: string } }
>(
  "nurse/createPatientByNurse",
  async ({ nurseId, patientData, mode }, { rejectWithValue }) => {
    console.log(`createPatientByNurse: Sending POST request to /api/nurses/${nurseId}/patients?mode=${mode}`, { patientData });
    try {
      const response = await apiClient.post(`/api/nurses/${nurseId}/patients?mode=${mode}`, patientData);
      console.log("createPatientByNurse: Response received:", response);
      if (!response || response === undefined) {
        console.error("createPatientByNurse: Response is undefined or null");
        throw new Error("Response is undefined");
      }
      return response as PatientDTO;
    } catch (error: any) {
      console.error("createPatientByNurse: Request failed:", error.message, error.response?.data);
      const errorMessage = error.response?.data?.message || "Failed to create patient by nurse";
      const errorCode = error.response?.data?.error || "unknown_error";
      return rejectWithValue({ message: errorMessage, code: errorCode });
    }
  }
);

export const createPatientByNurseExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(createPatientByNurse.pending, (state) => {
      console.log("createPatientByNurse: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(createPatientByNurse.fulfilled, (state, action) => {
      console.log("createPatientByNurse: Fulfilled state, payload:", action.payload);
      state.loading = false;
      if (!action.payload || !action.payload.id) {
        console.error("createPatientByNurse: Invalid payload received:", action.payload);
        state.error = "Received invalid response from server";
        state.errorCode = "invalid_response";
        return;
      }
      const newPatient = action.payload;
      if (state.selectedNurse && state.selectedNurse.id === action.meta.arg.nurseId) {
        const patientIds = state.selectedNurse.patientIds || [];
        patientIds.push(newPatient.id);
        state.selectedNurse.patientIds = patientIds;
      }
      state.nurses = state.nurses.map((nurse) =>
        nurse.id === action.meta.arg.nurseId
          ? { ...nurse, patientIds: [...(nurse.patientIds || []), newPatient.id] }
          : nurse
      );
      state.patients = [...state.patients, newPatient];
    })
    .addCase(createPatientByNurse.rejected, (state, action) => {
      console.log("createPatientByNurse: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload?.message || "Failed to create patient by nurse";
      state.errorCode = action.payload?.code || null;
    });
};