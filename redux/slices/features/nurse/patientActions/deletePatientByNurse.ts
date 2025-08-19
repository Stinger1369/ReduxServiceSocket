// nursenovafrontend/src/redux/slices/features/nurse/patientActions/deletePatientByNurse.ts
import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { NurseState } from "./types";

export const deletePatientByNurse = createAsyncThunk<
  void,
  { nurseId: string; patientId: string },
  { rejectValue: string }
>(
  "nurse/deletePatientByNurse",
  async ({ nurseId, patientId }, { rejectWithValue }) => {
    try {
      console.log("deletePatientByNurse: Sending DELETE request to /api/nurses/", nurseId, "/patients/", patientId, "/delete");
      const response = await apiClient.delete(`/api/nurses/${nurseId}/patients/${patientId}/delete`);
      console.log("deletePatientByNurse: Response received:", response);
      return response;
    } catch (error: any) {
      console.error("deletePatientByNurse: Request failed:", error.message, error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to delete patient");
    }
  }
);

export const deletePatientByNurseExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(deletePatientByNurse.pending, (state) => {
      console.log("deletePatientByNurse: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(deletePatientByNurse.fulfilled, (state, action) => {
      console.log("deletePatientByNurse: Fulfilled state, payload:", action.payload);
      state.loading = false;
      const { patientId } = action.meta.arg;
      state.patients = state.patients.filter((patient) => patient.id !== patientId);
      if (state.selectedNurse) {
        state.selectedNurse.patientIds = state.selectedNurse.patientIds?.filter((id) => id !== patientId) || [];
      }
      state.nurses = state.nurses.map((nurse) =>
        nurse.id === action.meta.arg.nurseId
          ? { ...nurse, patientIds: nurse.patientIds?.filter((id) => id !== patientId) || [] }
          : nurse
      );
    })
    .addCase(deletePatientByNurse.rejected, (state, action) => {
      console.log("deletePatientByNurse: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
    });
};