// src/redux/slices/features/patientRecord/manageActions.ts
import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { PatientRecordState } from "../../../types";
import { fetchAllPatientRecords } from "./fetchActions";

export const deletePatientRecord = createAsyncThunk(
  "patientRecord/deletePatientRecord",
  async (
    { patientId, recordType }: { patientId: string; recordType: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await apiClient.delete(`/api/patient-records/${patientId}/${recordType}`);
      console.log(
        "deletePatientRecord: Record deleted for patientId:",
        patientId,
        "recordType:",
        recordType
      );

      // Rafraîchir la liste des enregistrements
      await dispatch(fetchAllPatientRecords({ patientId })).unwrap();

      return { patientId, recordType };
    } catch (error: any) {
      console.error(
        "deletePatientRecord error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete patient record"
      );
    }
  }
);

export const addManageExtraReducers = (
  builder: ActionReducerMapBuilder<PatientRecordState>
) => {
  builder
    .addCase(deletePatientRecord.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deletePatientRecord.fulfilled, (state, action) => {
      state.loading = false;
      const key = `${action.payload.patientId}_${action.payload.recordType}`;
      delete state.records[key];
    })
    .addCase(deletePatientRecord.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
};
