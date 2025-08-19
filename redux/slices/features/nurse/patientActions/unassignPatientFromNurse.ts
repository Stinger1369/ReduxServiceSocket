// nursenovafrontend/src/redux/slices/features/nurse/patientActions/unassignPatientFromNurse.ts
import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { NurseDTO, NurseState } from "./types";

export const unassignPatientFromNurse = createAsyncThunk<
  NurseDTO,
  { nurseId: string; patientId: string },
  { rejectValue: string }
>(
  "nurse/unassignPatientFromNurse",
  async ({ nurseId, patientId }, { rejectWithValue }) => {
    try {
      console.log("unassignPatientFromNurse: Sending DELETE request to /api/nurses/", nurseId, "/patients/", patientId);
      const response = await apiClient.delete(`/api/nurses/${nurseId}/patients/${patientId}`);
      console.log("unassignPatientFromNurse: Response received:", response);
      if (!response) {
        throw new Error("Response is undefined");
      }
      return response as NurseDTO;
    } catch (error: any) {
      console.error("unassignPatientFromNurse: Request failed:", error.message, error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to unassign patient from nurse");
    }
  }
);

export const unassignPatientFromNurseExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(unassignPatientFromNurse.pending, (state) => {
      console.log("unassignPatientFromNurse: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(unassignPatientFromNurse.fulfilled, (state, action) => {
      console.log("unassignPatientFromNurse: Fulfilled state, payload:", action.payload);
      state.loading = false;
      const { patientId, nurseId } = action.meta.arg;
      if (!action.payload) {
        console.error("unassignPatientFromNurse: Payload is undefined");
        state.error = "Received undefined response from server";
        return;
      }
      const updatedNurse = action.payload;
      state.nurses = state.nurses.map((nurse) =>
        nurse.id === updatedNurse.id ? updatedNurse : nurse
      );
      if (state.selectedNurse && state.selectedNurse.id === updatedNurse.id) {
        state.selectedNurse = updatedNurse;
      }
      state.patients = state.patients.map((patient) =>
        patient.id === patientId ? { ...patient, isPublic: true } : patient
      );
    })
    .addCase(unassignPatientFromNurse.rejected, (state, action) => {
      console.log("unassignPatientFromNurse: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
    });
};