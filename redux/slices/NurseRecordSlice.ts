import { createSlice } from "@reduxjs/toolkit";
import { NurseRecordState } from "../types";
import { PURGE } from "redux-persist";
import {
  addFetchExtraReducers,
  fetchNurseRecord,
  fetchAllNurseRecords,
} from "./features/nurseRecord/fetchActions";
import {
  addUploadExtraReducers,
  uploadNurseRecord,
  updateNurseRecord,
} from "./features/nurseRecord/uploadActions";
import {
  addManageExtraReducers,
  deleteNurseRecord,
} from "./features/nurseRecord/manageActions";

const initialState: NurseRecordState = {
  records: {},
  loading: false,
  error: null,
};

const nurseRecordSlice = createSlice({
  name: "nurseRecord",
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

export const { clearRecords } = nurseRecordSlice.actions;

export {
  fetchNurseRecord,
  fetchAllNurseRecords,
  uploadNurseRecord,
  updateNurseRecord,
  deleteNurseRecord,
};

export default nurseRecordSlice.reducer;
