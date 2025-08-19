import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { NurseRecordState } from "../../../types";
import { fetchAllNurseRecords } from "./fetchActions";

export const uploadNurseRecord = createAsyncThunk(
  "nurseRecord/uploadNurseRecord",
  async (
    {
      nurseId,
      recordType,
      file,
    }: { nurseId: string; recordType: string; file: File },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const formData = new FormData();
      formData.append("nurseId", nurseId);
      formData.append("recordType", recordType);
      formData.append("file", file);

      const response = await apiClient.post(
        "/api/nurse-records/upload",
        formData
      );
      await dispatch(fetchAllNurseRecords({ nurseId })).unwrap();

      return {
        key: `${nurseId}_${recordType}`,
        record: response,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to upload nurse record"
      );
    }
  }
);

export const updateNurseRecord = createAsyncThunk(
  "nurseRecord/updateNurseRecord",
  async (
    {
      nurseId,
      recordType,
      file,
    }: { nurseId: string; recordType: string; file: File },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.put(
        `/api/nurse-records/${nurseId}/${recordType}`,
        formData
      );
      await dispatch(fetchAllNurseRecords({ nurseId })).unwrap();

      return {
        key: `${nurseId}_${recordType}`,
        record: response,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to update nurse record"
      );
    }
  }
);

export const addUploadExtraReducers = (
  builder: ActionReducerMapBuilder<NurseRecordState>
) => {
  builder
    .addCase(uploadNurseRecord.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(uploadNurseRecord.fulfilled, (state, action) => {
      state.loading = false;
      state.records[action.payload.key] = action.payload.record;
    })
    .addCase(uploadNurseRecord.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    .addCase(updateNurseRecord.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateNurseRecord.fulfilled, (state, action) => {
      state.loading = false;
      state.records[action.payload.key] = action.payload.record;
    })
    .addCase(updateNurseRecord.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
};
