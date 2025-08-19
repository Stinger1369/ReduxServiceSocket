import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../api/apiClient";
import { NurseDTO, NurseState, PatientState, PatientDTO } from "../../types";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import * as Localization from 'expo-localization';

export const updateNurseLanguage = createAsyncThunk<
  NurseDTO,
  { nurseId: string; language: string },
  { rejectValue: string }
>(
  "nurse/updateLanguage",
  async ({ nurseId, language }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/api/nurses/${nurseId}/language`,
        null,
        {
          params: { language },
        }
      );
      const updatedNurse = response as NurseDTO;
      return updatedNurse;
    } catch (error: any) {
      console.error("Update Nurse Language Error:", error.message || error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update nurse language"
      );
    }
  }
);

export const updatePatientLanguage = createAsyncThunk<
  PatientDTO,
  { patientId: string; language: string },
  { rejectValue: string }
>(
  "patient/updateLanguage",
  async ({ patientId, language }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/api/patients/${patientId}/language`, { language });
      const updatedPatient = response as PatientDTO;
      return updatedPatient;
    } catch (error: any) {
      console.error("Update Patient Language Error:", error.message || error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update patient language"
      );
    }
  }
);

export const initializeLanguage = createAsyncThunk(
  'auth/initializeLanguage',
  async (_, { dispatch, getState }) => {
    const state = getState() as any;
    if (!state.auth.preferredLanguage) {
      const locales = Localization.getLocales();
      const defaultLanguage =
        locales.length > 0 ? locales[0].languageCode : 'en';
      await AsyncStorage.setItem('preferredLanguage', defaultLanguage);
      i18n.changeLanguage(defaultLanguage);
      return defaultLanguage;
    }
    return state.auth.preferredLanguage;
  }
);

export const setPreferredLanguage = createAsyncThunk(
  'auth/setPreferredLanguage',
  async (language: string, { dispatch }) => {
    await AsyncStorage.setItem('preferredLanguage', language);
    i18n.changeLanguage(language);
    return language;
  }
);

// ExtraReducers pour nurseSlice
export const addNurseLanguageExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(updateNurseLanguage.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateNurseLanguage.fulfilled, (state, action) => {
      state.loading = false;
      const updatedNurse = action.payload;
      state.nurses = state.nurses.map((nurse) =>
        nurse.id === updatedNurse.id ? updatedNurse : nurse
      );
      if (state.selectedNurse && state.selectedNurse.id === updatedNurse.id) {
        state.selectedNurse = updatedNurse;
      }
    })
    .addCase(updateNurseLanguage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to update nurse language";
    });
};

// ExtraReducers pour patientSlice
export const addPatientLanguageExtraReducers = (
  builder: ActionReducerMapBuilder<PatientState>
) => {
  builder
    .addCase(updatePatientLanguage.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updatePatientLanguage.fulfilled, (state, action) => {
      state.loading = false;
      const updatedPatient = action.payload;
      state.patients = state.patients.map((patient) =>
        patient.id === updatedPatient.id ? updatedPatient : patient
      );
      if (state.selectedPatient && state.selectedPatient.id === updatedPatient.id) {
        state.selectedPatient = updatedPatient;
      }
    })
    .addCase(updatePatientLanguage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to update patient language";
    });
};

// ExtraReducer pour authSlice
export const addAuthLanguageExtraReducers = (
  builder: ActionReducerMapBuilder<AuthState>
) => {
  builder.addCase(setPreferredLanguage.fulfilled, (state, action) => {
    state.preferredLanguage = action.payload;
  });
};