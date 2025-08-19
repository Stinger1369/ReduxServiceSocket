import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { PatientDTO, NurseState } from "./types";

export const fetchAllNursePatients = createAsyncThunk<
  PatientDTO[],
  void,
  { rejectValue: string }
>(
  "nurse/fetchAllNursePatients",
  async (_, { rejectWithValue }) => {
    try {
      console.log("fetchAllNursePatients: Sending GET request to /api/nurses/patients");
      const response = await apiClient.get("/api/nurses/patients");
      console.log("fetchAllNursePatients: Response received:", response);
      if (!Array.isArray(response)) {
        throw new Error("Response is not an array of patients");
      }
      return response as PatientDTO[];
    } catch (error: any) {
      console.error("fetchAllNursePatients: Request failed:", error.message, error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch all nurse patients");
    }
  }
);

export const fetchAllNursePatientsExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(fetchAllNursePatients.pending, (state) => {
      console.log("fetchAllNursePatients: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchAllNursePatients.fulfilled, (state, action) => {
      console.log("fetchAllNursePatients: Fulfilled state, payload:", action.payload);
      state.loading = false;
      if (!action.payload) {
        console.error("fetchAllNursePatients: Payload is undefined");
        state.error = "Received undefined response from server";
        return;
      }
      state.patients = action.payload;
    })
    .addCase(fetchAllNursePatients.rejected, (state, action) => {
      console.log("fetchAllNursePatients: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
    });
};