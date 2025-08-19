import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { PatientRecordState } from "../../../types";

export const fetchPatientRecord = createAsyncThunk(
  "patientRecord/fetchPatientRecord",
  async (
    { patientId, recordType }: { patientId: string; recordType: string },
    { rejectWithValue }
  ) => {
    try {
      console.log(`fetchPatientRecord: Sending GET to /api/patient-records/${patientId}/${recordType}`);
      const data = await apiClient.get(`/api/patient-records/${patientId}/${recordType}`);
      console.log("fetchPatientRecord: Response data:", JSON.stringify(data, null, 2));
      if (!data) {
        console.error("fetchPatientRecord: No data in response");
        return rejectWithValue("No data received from server");
      }
      return {
        key: `${patientId}_${recordType}`,
        record: data,
      };
    } catch (error: any) {
      console.error("fetchPatientRecord: Error:", JSON.stringify(error.response?.data || error.message, null, 2));
      if (error.response?.status === 404) {
        console.log(`fetchPatientRecord: No record found for ${patientId}_${recordType}`);
        return {
          key: `${patientId}_${recordType}`,
          record: null,
        };
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch patient record"
      );
    }
  }
);

export const fetchAllPatientRecords = createAsyncThunk(
  "patientRecord/fetchAllPatientRecords",
  async ({ patientId }: { patientId: string }, { rejectWithValue }) => {
    try {
      console.log(`fetchAllPatientRecords: Sending GET to /api/patient-records/${patientId}`);
      const data = await apiClient.get(`/api/patient-records/${patientId}`);
      console.log("fetchAllPatientRecords: Response data:", JSON.stringify(data, null, 2));
      return data.map((record: any) => ({
        key: `${patientId}_${record.recordType}`,
        record,
      }));
    } catch (error: any) {
      console.error("fetchAllPatientRecords: Error:", JSON.stringify(error.response?.data || error.message, null, 2));
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch all patient records"
      );
    }
  }
);

export const addFetchExtraReducers = (
  builder: ActionReducerMapBuilder<PatientRecordState>
) => {
  builder
    .addCase(fetchPatientRecord.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log("fetchPatientRecord: Pending");
    })
    .addCase(fetchPatientRecord.fulfilled, (state, action) => {
      state.loading = false;
      console.log("fetchPatientRecord: Fulfilled with key:", action.payload.key, "data:", JSON.stringify(action.payload.record, null, 2));
      if (action.payload.record) {
        state.records[action.payload.key] = action.payload.record;
      } else {
        delete state.records[action.payload.key];
      }
    })
    .addCase(fetchPatientRecord.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("fetchPatientRecord: Rejected with error:", state.error);
    })
    .addCase(fetchAllPatientRecords.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log("fetchAllPatientRecords: Pending");
    })
    .addCase(fetchAllPatientRecords.fulfilled, (state, action) => {
      state.loading = false;
      state.records = {};
      action.payload.forEach((item: { key: string; record: any }) => {
        console.log("fetchAllPatientRecords: Storing record for key:", item.key, "data:", JSON.stringify(item.record, null, 2));
        state.records[item.key] = item.record;
      });
    })
    .addCase(fetchAllPatientRecords.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("fetchAllPatientRecords: Rejected with error:", state.error);
    });
};