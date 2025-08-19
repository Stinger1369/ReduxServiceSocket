// src/redux/slices/features/patientRecord/uploadActions.ts
import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { PatientRecordState } from "../../../types";
import { fetchAllPatientRecords } from "./fetchActions";

export const uploadPatientRecord = createAsyncThunk(
  "patientRecord/uploadPatientRecord",
  async (
    {
      patientId,
      recordType,
      file,
    }: { patientId: string; recordType: string; file: File },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const formData = new FormData();
      formData.append("patientId", patientId);
      formData.append("recordType", recordType);
      formData.append("file", file);

      const response = await apiClient.post(
        "/api/patient-records/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("uploadPatientRecord response:", response);

      // Rafraîchir la liste des enregistrements
      await dispatch(fetchAllPatientRecords({ patientId })).unwrap();

      return {
        key: `${patientId}_${recordType}`,
        record: response,
      };
    } catch (error: any) {
      console.error(
        "uploadPatientRecord error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload patient record"
      );
    }
  }
);

export const updatePatientRecord = createAsyncThunk(
  "patientRecord/updatePatientRecord",
  async (
    {
      patientId,
      recordType,
      file,
    }: { patientId: string; recordType: string; file: File },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.put(
        `/api/patient-records/${patientId}/${recordType}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("updatePatientRecord response:", response);

      // Rafraîchir la liste des enregistrements
      await dispatch(fetchAllPatientRecords({ patientId })).unwrap();

      return {
        key: `${patientId}_${recordType}`,
        record: response,
      };
    } catch (error: any) {
      console.error(
        "updatePatientRecord error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to update patient record"
      );
    }
  }
);

export const addUploadExtraReducers = (
  builder: ActionReducerMapBuilder<PatientRecordState>
) => {
  builder
    .addCase(uploadPatientRecord.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(uploadPatientRecord.fulfilled, (state, action) => {
      state.loading = false;
      state.records[action.payload.key] = action.payload.record;
    })
    .addCase(uploadPatientRecord.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    .addCase(updatePatientRecord.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updatePatientRecord.fulfilled, (state, action) => {
      state.loading = false;
      state.records[action.payload.key] = action.payload.record;
    })
    .addCase(updatePatientRecord.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
};
