import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { PatientDTO, NurseState } from "./types";

export const fetchNursePatientsByNurseId = createAsyncThunk<
  PatientDTO[],
  string,
  { rejectValue: string }
>(
  "nurse/fetchNursePatientsByNurseId",
  async (nurseId, { rejectWithValue }) => {
    try {
      console.log(`fetchNursePatientsByNurseId: Sending GET request to /api/nurses/${nurseId}/patients`);
      const response = await apiClient.get(`/api/nurses/${nurseId}/patients`);
      console.log(`fetchNursePatientsByNurseId: Response received:`, response);
      if (!Array.isArray(response)) {
        throw new Error("Response is not an array of patients");
      }
      return response as PatientDTO[];
    } catch (error: any) {
      console.error("fetchNursePatientsByNurseId: Request failed:", error.message, error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch nurse patients");
    }
  }
);

export const fetchNursePatientsByNurseIdExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(fetchNursePatientsByNurseId.pending, (state) => {
      console.log("fetchNursePatientsByNurseId: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchNursePatientsByNurseId.fulfilled, (state, action) => {
      console.log("fetchNursePatientsByNurseId: Fulfilled state, payload:", action.payload);
      state.loading = false;
      if (!action.payload) {
        console.error("fetchNursePatientsByNurseId: Payload is undefined");
        state.error = "Received undefined response from server";
        return;
      }
      state.patients = action.payload;
    })
    .addCase(fetchNursePatientsByNurseId.rejected, (state, action) => {
      console.log("fetchNursePatientsByNurseId: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
    });
};