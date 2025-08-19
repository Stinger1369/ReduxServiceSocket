// src/redux/slices/patientRecordSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { PatientRecordState } from "../types";
import { PURGE } from "redux-persist";
import {
  addFetchExtraReducers,
  fetchPatientRecord,
  fetchAllPatientRecords,
} from "./features/patientRecord/fetchActions";
import {
  addUploadExtraReducers,
  uploadPatientRecord,
  updatePatientRecord,
} from "./features/patientRecord/uploadActions";
import {
  addManageExtraReducers,
  deletePatientRecord,
} from "./features/patientRecord/manageActions";

const initialState: PatientRecordState = {
  records: {},
  loading: false,
  error: null,
};

const patientRecordSlice = createSlice({
  name: "patientRecord",
  initialState,
  reducers: {
    clearRecords(state) {
      state.records = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    addFetchExtraReducers(builder);
    addUploadExtraReducers(builder);
    addManageExtraReducers(builder);
    builder.addCase(PURGE, () => initialState);
  },
});

export const { clearRecords } = patientRecordSlice.actions;

export {
  fetchPatientRecord,
  fetchAllPatientRecords,
  uploadPatientRecord,
  updatePatientRecord,
  deletePatientRecord,
};

export default patientRecordSlice.reducer;
