import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { PatientState } from "../types";
import {
  addFetchExtraReducers,
  fetchAllPatients,
  fetchPublicPatients,
  fetchPatientsByNurseId,
  fetchPatientById,
  fetchMatchingNurses,
} from "./features/patient/fetchActions";
import {
  addManageExtraReducers,
  registerPatient,
  createPatient,
  setPatientVisibility,
  updatePatient,
  deletePatient,
  updatePatientAddress,
  updatePatientLocation,
  updatePatientProfile,
} from "./features/patient/manageActions";
import {
  addAuthExtraReducers,
  verifyPatientEmail,
  forgotPasswordPatient,
  resetPasswordPatient,
} from "./features/patient/patientAuthSlice";
import { addPatientLanguageExtraReducers, updatePatientLanguage } from "./features/languageActions";

const initialState: PatientState = {
  patients: [],
  selectedPatient: null,
  matchingNurses: [],
  loading: false,
  error: null,
  errorCode: null,
};

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    clearSelectedPatient(state) {
      state.selectedPatient = null;
    },
    clearMatchingNurses(state) {
      state.matchingNurses = [];
    },
    updateSelectedPatient(state, action) {
      if (state.selectedPatient) {
        state.selectedPatient = { ...state.selectedPatient, ...action.payload };
      }
    },
    resetPatients(state) {
      state.patients = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    addFetchExtraReducers(builder);
    addManageExtraReducers(builder);
    addAuthExtraReducers(builder);
    addPatientLanguageExtraReducers(builder); // Intégration des extraReducers pour la langue
    builder.addCase(PURGE, () => initialState);
  },
});

export const {
  clearSelectedPatient,
  clearMatchingNurses,
  updateSelectedPatient,
  resetPatients,
} = patientSlice.actions;

export {
  fetchAllPatients,
  fetchPublicPatients,
  fetchPatientsByNurseId,
  fetchPatientById,
  fetchMatchingNurses,
  registerPatient,
  createPatient,
  setPatientVisibility,
  updatePatient,
  deletePatient,
  updatePatientLanguage,
  updatePatientAddress,
  updatePatientLocation,
  updatePatientProfile,
  verifyPatientEmail,
  forgotPasswordPatient,
  resetPasswordPatient,
};

export default patientSlice.reducer;