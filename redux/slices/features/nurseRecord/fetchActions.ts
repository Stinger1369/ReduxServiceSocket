import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { NurseRecordState } from "../../../types";

export const fetchNurseRecord = createAsyncThunk(
  "nurseRecord/fetchNurseRecord",
  async (
    { nurseId, recordType }: { nurseId: string; recordType: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.get(
        `/api/nurse-records/${nurseId}/${recordType}`
      );
      return {
        key: `${nurseId}_${recordType}`,
        record: response,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch nurse record"
      );
    }
  }
);

export const fetchAllNurseRecords = createAsyncThunk(
  "nurseRecord/fetchAllNurseRecords",
  async ({ nurseId }: { nurseId: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/nurse-records/${nurseId}`);
      return response.map((record: any) => ({
        key: `${nurseId}_${record.recordType}`,
        record,
      }));
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch all nurse records"
      );
    }
  }
);

export const addFetchExtraReducers = (
  builder: ActionReducerMapBuilder<NurseRecordState>
) => {
  builder
    .addCase(fetchNurseRecord.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchNurseRecord.fulfilled, (state, action) => {
      state.loading = false;
      state.records[action.payload.key] = action.payload.record;
    })
    .addCase(fetchNurseRecord.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    .addCase(fetchAllNurseRecords.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.records = {};
    })
    .addCase(fetchAllNurseRecords.fulfilled, (state, action) => {
      state.loading = false;
      action.payload.forEach((item: { key: string; record: any }) => {
        state.records[item.key] = item.record;
      });
    })
    .addCase(fetchAllNurseRecords.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
};
