// nursenovafrontend/src/redux/slices/features/nurse/patientActions/addPatientToNurse.ts
import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { NurseDTO, NurseState } from "./types";

export const addPatientToNurse = createAsyncThunk<
  NurseDTO,
  { nurseId: string; patientId: string },
  { rejectValue: string }
>(
  "nurse/addPatientToNurse",
  async ({ nurseId, patientId }, { rejectWithValue }) => {
    console.log("addPatientToNurse: Action triggered for nurseId:", nurseId, "patientId:", patientId);
    try {
      console.log("addPatientToNurse: Sending POST request to /api/nurses/", nurseId, "/patients/", patientId);
      const response = await apiClient.post(`/api/nurses/${nurseId}/patients/${patientId}`);
      console.log("addPatientToNurse: Response received:", response);
      if (!response) {
        throw new Error("Response is undefined");
      }
      return response as NurseDTO;
    } catch (error: any) {
      console.error("addPatientToNurse: Request failed:", error.message, error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to add patient to nurse");
    }
  }
);

export const addPatientToNurseExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(addPatientToNurse.pending, (state) => {
      console.log("addPatientToNurse: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(addPatientToNurse.fulfilled, (state, action) => {
      console.log("addPatientToNurse: Fulfilled state, payload:", action.payload);
      state.loading = false;
      if (!action.payload) {
        console.error("addPatientToNurse: Payload is undefined");
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
    })
    .addCase(addPatientToNurse.rejected, (state, action) => {
      console.log("addPatientToNurse: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
    });
};