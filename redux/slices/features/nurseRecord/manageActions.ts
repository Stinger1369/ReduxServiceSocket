import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { NurseRecordState } from "../../../types";
import { fetchAllNurseRecords } from "./fetchActions";

export const deleteNurseRecord = createAsyncThunk(
  "nurseRecord/deleteNurseRecord",
  async (
    { nurseId, recordType }: { nurseId: string; recordType: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await apiClient.delete(`/api/nurse-records/${nurseId}/${recordType}`);
      await dispatch(fetchAllNurseRecords({ nurseId })).unwrap();
      return { nurseId, recordType };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to delete nurse record"
      );
    }
  }
);

export const addManageExtraReducers = (
  builder: ActionReducerMapBuilder<NurseRecordState>
) => {
  builder
    .addCase(deleteNurseRecord.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteNurseRecord.fulfilled, (state, action) => {
      state.loading = false;
      const key = `${action.payload.nurseId}_${action.payload.recordType}`;
      delete state.records[key];
    })
    .addCase(deleteNurseRecord.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
};
