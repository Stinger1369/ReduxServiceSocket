import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { AuthState, ErrorResponse } from "../../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const normalizeRole = (role: string | undefined): string | undefined => {
  if (!role) return undefined;
  return role.toUpperCase();
};

export const restoreAuthState = createAsyncThunk<
  {
    token: string | null;
    isAuthenticated: boolean;
    isVerified: boolean;
    user: {
      _id: string;
      userId: string;
      email: string;
      role: string;
      firstName?: string;
      lastName?: string;
      imageIds: string[];
      primaryImageId: string | null;
    } | null;
  },
  { user: any; token: string } | void,
  { rejectValue: ErrorResponse }
>("auth/restoreAuthState", async (params, { rejectWithValue }) => {
  try {
    let token: string | null;
    let user: any;

    if (params) {
      ({ user, token } = params);
    } else {
      token = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");
      user = userString ? JSON.parse(userString) : null;
    }

    if (!token) {
      return {
        token: null,
        isAuthenticated: false,
        isVerified: false,
        user: null,
      };
    }

    const response = await apiClient.get("/api/auth/verify-token", {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });

    let updatedUser;
    if (response.role === "NURSE") {
      if (!response.id && !user?._id) {
        throw new Error("No user ID available to fetch nurse data");
      }
      const nurseResponse = await apiClient.get(
        `/api/nurses/${response.id || user._id}`
      );
      updatedUser = {
        _id: nurseResponse.id,
        userId: nurseResponse.id, // Normaliser userId
        email: nurseResponse.email,
        role: normalizeRole(response.role),
        firstName: nurseResponse.firstName,
        lastName: nurseResponse.lastName,
        imageIds: nurseResponse.imageIds || [],
        primaryImageId: nurseResponse.primaryImageId || null,
      };
    } else if (response.role === "PATIENT") {
      if (!response.id && !user?._id) {
        throw new Error("No user ID available to fetch patient data");
      }
      const patientResponse = await apiClient.get(
        `/api/patients/${response.id || user._id}`
      );
      updatedUser = {
        _id: patientResponse.id,
        userId: patientResponse.id, // Normaliser userId
        email: patientResponse.email,
        role: normalizeRole(response.role),
        firstName: patientResponse.firstName,
        lastName: patientResponse.lastName,
        imageIds: patientResponse.imageIds || [],
        primaryImageId: patientResponse.primaryImageId || null,
      };
    } else {
      throw new Error("Unknown user role");
    }

    if (!updatedUser._id) {
      throw new Error("User ID is missing after verification");
    }

    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

    return {
      token,
      isAuthenticated: true,
      isVerified: response.isVerified,
      user: updatedUser,
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
    return rejectWithValue({
      error: error.message || "Failed to restore auth state",
      action: "Please log in again",
    });
  }
});

export const addRestoreAuthStateExtraReducers = (
  builder: ActionReducerMapBuilder<AuthState>
) => {
  builder
    .addCase(restoreAuthState.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(restoreAuthState.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.token = action.payload.token;
      state.isVerified = action.payload.isVerified;
      state.user = action.payload.user
        ? {
            ...action.payload.user,
            role: normalizeRole(action.payload.user.role),
          }
        : null;
      console.log('authSlice: Restored auth state, user:', state.user);
    })
    .addCase(restoreAuthState.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.token = null;
      state.isVerified = false;
      state.user = null;
      state.error = action.payload?.error || 'Failed to restore auth state';
      state.errorAction = action.payload?.action || 'Please log in again';
      console.log('authSlice: Restore auth state failed:', action.payload);
    });
};