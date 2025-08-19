// src/redux/slices/features/auth/createPatientByNurse.ts
import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import {
  CreatePatientByNurseRequest,
  LoginResponse,
  ErrorResponse,
  AuthState,
} from "../../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setPreferredLanguage } from "./login";
import { updatePatientLanguage } from "../languageActions"; // Nouvelle importation

export const createPatientByNurse = createAsyncThunk<
  LoginResponse,
  CreatePatientByNurseRequest,
  { rejectValue: ErrorResponse }
>(
  "auth/createPatientByNurse",
  async (patientData, { rejectWithValue, dispatch, getState }) => {
    console.log("Dispatching createPatientByNurse with:", patientData);
    try {
      const state = getState() as any;
      const preferredLanguage = state.auth.preferredLanguage || "en";

      const response = await apiClient.post(
        "/api/auth/create-patient-by-nurse",
        {
          email: patientData.email,
          password: patientData.password,
          nurseId: patientData.nurseId,
          phoneNumber: patientData.phoneNumber,
          preferredLanguage,
        }
      );
      await AsyncStorage.setItem("token", response.token);

      const user = {
        _id: response.id,
        email: patientData.email,
        role: response.role,
        imageIds: response.imageIds || [],
        primaryImageId: response.primaryImageId || null,
      };

      console.log("Fetching full patient data for user ID:", response.id);
      const patientResponse = await apiClient.get(
        `/api/patients/${response.id}`
      );
      console.log("Full patient data response:", patientResponse);
      if (patientResponse.preferredLanguage !== preferredLanguage) {
        await dispatch(
          updatePatientLanguage({
            patientId: user._id,
            language: preferredLanguage,
          })
        ).unwrap();
        console.log(`Synchronized patient language to ${preferredLanguage}`);
      }

      await AsyncStorage.setItem("user", JSON.stringify(user));
      await dispatch(setPreferredLanguage(preferredLanguage));
      return {
        id: response.id,
        token: response.token,
        isVerified: response.isVerified,
        role: response.role,
      } as LoginResponse;
    } catch (error: any) {
      console.error(
        "Create patient error:",
        error.message,
        error.response?.data
      );
      const errorResponse = error.response?.data || {
        error: error.message || "Failed to create patient",
        action: "Please try again.",
      };
      return rejectWithValue({
        error: errorResponse.error || "Failed to create patient",
        action: errorResponse.action || "Please try again.",
        email: patientData.email,
        role: errorResponse.role || "",
        isVerified: errorResponse.isVerified || false,
      });
    }
  }
);

export const addCreatePatientByNurseExtraReducers = (
  builder: ActionReducerMapBuilder<AuthState>
) => {
  builder
    .addCase(createPatientByNurse.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.errorAction = null;
    })
    .addCase(createPatientByNurse.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.isVerified = action.payload.isVerified;
      state.user = {
        _id: action.payload.id,
        email: action.meta.arg.email,
        role: action.payload.role,
        imageIds: action.payload.imageIds || [],
        primaryImageId: action.payload.primaryImageId || null,
      };
      state.resendCooldown = 0;
      state.resetCode = null;
      console.log("Create patient fulfilled, user:", state.user);
    })
    .addCase(createPatientByNurse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || "Failed to create patient";
      state.errorAction = action.payload?.action || "Please try again.";
      console.log(
        "Create patient rejected, error:",
        state.error,
        "action:",
        state.errorAction
      );
    });
};
