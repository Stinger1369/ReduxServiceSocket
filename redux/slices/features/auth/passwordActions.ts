import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import {
  ChangePasswordRequest,
  ErrorResponse,
  AuthState,
} from "../../../types";

// Interface pour la nouvelle requête de réinitialisation
interface ResetCodePasswordRequest {
  email: string;
  resetCode: string;
  newPassword: string;
}

// Action asynchrone pour demander une réinitialisation de mot de passe
export const forgotPassword = createAsyncThunk<
  { message: string; resetCode?: string },
  string,
  { rejectValue: ErrorResponse }
>("auth/forgotPassword", async (email, { rejectWithValue }) => {
  console.log("Dispatching forgotPassword with email:", email);
  try {
    const response = await apiClient.post("/api/auth/forgot-password", null, {
      params: { email },
    });
    return { message: response.message, resetCode: response.resetCode };
  } catch (error: any) {
    console.info("Forgot password error:", error.message, error.response?.data);
    const errorResponse = error.response?.data || {
      error: error.message || "Failed to send reset code",
      action: "Please try again.",
    };
    return rejectWithValue(errorResponse);
  }
});

// Action asynchrone pour réinitialiser le mot de passe avec un code
export const resetPassword = createAsyncThunk<
  string,
  ResetCodePasswordRequest,
  { rejectValue: ErrorResponse }
>("auth/resetPassword", async (resetData, { rejectWithValue }) => {
  console.log("Dispatching resetPassword with:", resetData);
  try {
    const response = await apiClient.post("/api/auth/reset-password", null, {
      params: {
        email: resetData.email,
        resetCode: resetData.resetCode,
        newPassword: resetData.newPassword,
      },
    });
    return response.message;
  } catch (error: any) {
    console.error("Reset password error:", error.message, error.response?.data);
    const errorResponse = error.response?.data || {
      error: error.message || "Failed to reset password",
      action: "Please try again.",
    };
    return rejectWithValue(errorResponse);
  }
});

// Action asynchrone pour changer le mot de passe (utilisateur connecté)
export const changePassword = createAsyncThunk<
  string,
  ChangePasswordRequest,
  { rejectValue: ErrorResponse }
>("auth/changePassword", async (passwordData, { rejectWithValue }) => {
  console.log("Dispatching changePassword with:", passwordData);
  try {
    const response = await apiClient.post("/api/auth/change-password", null, {
      params: {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      },
    });
    return response.message;
  } catch (error: any) {
    console.error(
      "Change password error:",
      error.message,
      error.response?.data
    );
    const errorResponse = error.response?.data || {
      error: error.message || "Failed to change password",
      action: "Please try again.",
    };
    return rejectWithValue(errorResponse);
  }
});

// Fonction pour ajouter les extraReducers spécifiques à passwordActions
export const addPasswordExtraReducers = (
  builder: ActionReducerMapBuilder<AuthState>
) => {
  builder
    // forgotPassword
    .addCase(forgotPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.errorAction = null;
    })
    .addCase(forgotPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.errorAction = null;
      state.resendCooldown = 0;
      state.resetCode = action.payload.resetCode || null;
      console.log("Forgot password fulfilled, resetCode:", state.resetCode);
    })
    .addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      console.log("Entering forgotPassword.rejected");
      console.log("Forgot password rejected payload:", action.payload);
      state.error = action.payload?.error || "Failed to send reset code";
      state.errorAction = action.payload?.action || "Please try again.";
      if (action.payload?.remainingSeconds) {
        state.resendCooldown =
          parseInt(action.payload.remainingSeconds, 10) || 900;
        state.resetCode = action.payload.resetCode || null;
        console.log("Updated resendCooldown to:", state.resendCooldown);
        console.log("Updated resetCode to:", state.resetCode);
      }
    })
    // resetPassword
    .addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.errorAction = null;
    })
    .addCase(resetPassword.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.errorAction = null;
      state.resendCooldown = 0;
      state.resetCode = null;
    })
    .addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || "Failed to reset password";
      state.errorAction = action.payload?.action || "Please try again.";
    })
    // changePassword
    .addCase(changePassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.errorAction = null;
      state.passwordChangeSuccess = false;
    })
    .addCase(changePassword.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.errorAction = null;
      state.passwordChangeSuccess = true;
    })
    .addCase(changePassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || "Failed to change password";
      state.errorAction = action.payload?.action || "Please try again.";
      state.passwordChangeSuccess = false;
    });
};
