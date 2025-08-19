import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { NurseState } from "../types";
import {
  addNurseExtraReducers,
  fetchNurses,
  fetchNurseById,
  fetchNurseByUserId,
  createNurse,
  updateNurse,
} from "./features/nurse/nurseActions";
import {
  addProfileExtraReducers,
  updateNurseProfile,
  updateNurseAddress,
  updateNurseLocation,
  fetchAddressSuggestions,
} from "./features/nurse/profileActions";
import {
  addMiscExtraReducers,
  verifyEmail,
  getWeatherForNurse,
  resetPatientPasswordByNurse,
} from "./features/nurse/miscActions";
import {
  addPatientExtraReducers,
  addPatientToNurse,
  createPatientByNurse,
  fetchNursePatientsByNurseId,
  fetchAllNursePatients,
  fetchNursePatientById,
  updatePatientByNurse,
  deletePatientByNurse,
  unassignPatientFromNurse,
  setPatientVisibility,
  delegatePatientToNurse,
  delegatePatientByVitaleCard,
  fetchAllPatientImagesByNurseId,
  fetchActivePatientsByNurseId,
} from "./features/nurse/patientActions";
import {
  addNurseLanguageExtraReducers,
  updateNurseLanguage,
} from "./features/languageActions";
import {
  addDeleteExtraReducers,
  deleteNurse,
  deactivateNurse,
  reactivateNurse,
} from "./features/nurse/deleteActions";
import {
  assignProfessionalAct,
  fetchProfessionalActs,
  fetchBatchProfessionalActs,
  updateProfessionalAct,
  deleteProfessionalAct,
  fetchMonthlyBilling,
} from "./features/nurse/patientActions/professionalActActions";

const initialState: NurseState = {
  nurses: [],
  selectedNurse: null,
  patients: [],
  selectedPatient: null,
  suggestions: [],
  patientImages: {},
  professionalActs: {},
  monthlyBilling: {},
  tours: [],
  loading: false,
  loadingPatients: {},
  loadingTours: false,
  error: null,
  errorCode: null,
};

const nurseSlice = createSlice({
  name: "nurse",
  initialState,
  reducers: {
    clearSelectedNurse(state) {
      state.selectedNurse = null;
    },
    updateSelectedNurse(state, action) {
      if (state.selectedNurse) {
        state.selectedNurse = {
          ...state.selectedNurse,
          ...action.payload,
        };
      }
    },
    clearSelectedPatient(state) {
      state.selectedPatient = null;
    },
    clearNurseError(state) {
      state.error = null;
      state.errorCode = null;
    },
  },
  extraReducers: (builder) => {
    addNurseExtraReducers(builder);
    addProfileExtraReducers(builder);
    addMiscExtraReducers(builder);
    addPatientExtraReducers(builder);
    addNurseLanguageExtraReducers(builder);
    addDeleteExtraReducers(builder);
    builder.addCase(PURGE, () => initialState);
  },
});

export const { clearSelectedNurse, updateSelectedNurse, clearSelectedPatient, clearNurseError } = nurseSlice.actions;

export {
  fetchNurses,
  fetchNurseById,
  fetchNurseByUserId,
  createNurse,
  updateNurse,
  deleteNurse,
  deactivateNurse,
  reactivateNurse,
  updateNurseProfile,
  updateNurseAddress,
  updateNurseLocation,
  updateNurseLanguage,
  fetchAddressSuggestions,
  verifyEmail,
  getWeatherForNurse,
  resetPatientPasswordByNurse,
  addPatientToNurse,
  createPatientByNurse,
  fetchNursePatientsByNurseId,
  fetchAllNursePatients,
  fetchNursePatientById,
  updatePatientByNurse,
  deletePatientByNurse,
  unassignPatientFromNurse,
  setPatientVisibility,
  delegatePatientToNurse,
  delegatePatientByVitaleCard,
  fetchAllPatientImagesByNurseId,
  fetchActivePatientsByNurseId,
  assignProfessionalAct,
  fetchProfessionalActs,
  fetchBatchProfessionalActs,
  updateProfessionalAct,
  deleteProfessionalAct,
  fetchMonthlyBilling,
};

export default nurseSlice.reducer;