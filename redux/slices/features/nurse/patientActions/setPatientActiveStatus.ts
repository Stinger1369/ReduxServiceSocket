import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { PatientDTO, NurseState } from "../../../types";

export const setPatientActiveStatus = createAsyncThunk<
  PatientDTO,
  { nurseId: string; patientId: string; isActive: boolean },
  { rejectValue: string }
>(
  "nurse/setPatientActiveStatus",
  async ({ nurseId, patientId, isActive }, { rejectWithValue }) => {
    try {
      console.log(`setPatientActiveStatus: Sending PUT request to /api/nurses/${nurseId}/patients/${patientId}/active`);
      const response = await apiClient.put(`/api/nurses/${nurseId}/patients/${patientId}/active`, null, {
        params: { isActive },
      });
      console.log(`setPatientActiveStatus: Response received:`, response);
      return response as PatientDTO;
    } catch (error: any) {
      console.error("setPatientActiveStatus: Request failed:", error.message, error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to update patient active status");
    }
  }
);

export const setPatientActiveStatusExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(setPatientActiveStatus.pending, (state) => {
      console.log("setPatientActiveStatus: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(setPatientActiveStatus.fulfilled, (state, action) => {
      console.log("setPatientActiveStatus: Fulfilled state, payload:", action.payload);
      state.loading = false;
      const updatedPatient = action.payload;
      const index = state.patients.findIndex((p) => p.id === updatedPatient.id);
      if (index !== -1) {
        state.patients[index] = updatedPatient;
      } else {
        state.patients.push(updatedPatient);
      }
      if (state.selectedPatient?.id === updatedPatient.id) {
        state.selectedPatient = updatedPatient;
      }
    })
    .addCase(setPatientActiveStatus.rejected, (state, action) => {
      console.log("setPatientActiveStatus: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
    });
};