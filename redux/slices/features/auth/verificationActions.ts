import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { VerifyCodeRequest, ErrorResponse, AuthState } from "../../../types";

// Action asynchrone pour renvoyer un code de vérification
export const resendCode = createAsyncThunk<
  string,
  string,
  { rejectValue: ErrorResponse }
>("auth/resendCode", async (email, { rejectWithValue }) => {
  if (!email) {
    console.error("ResendCode called without email");
    return rejectWithValue({
      error: "Email is required",
      action: "Please provide an email.",
    });
  }
  console.log("Dispatching resendCode with email:", email);
  try {
    const response = await apiClient.post("/api/auth/resend-code", { email });
    console.log("Resend code success response:", response);
    return response.message;
  } catch (error: any) {
    console.error("Resend code error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });
    const errorResponse = error.response?.data || {
      error: error.message || "Failed to resend verification code",
      action: "Please try again.",
    };
    return rejectWithValue(errorResponse);
  }
});

// Action asynchrone pour vérifier le code de vérification
export const verifyCode = createAsyncThunk<
  string,
  VerifyCodeRequest,
  { rejectValue: ErrorResponse }
>("auth/verifyCode", async (verifyData, { rejectWithValue }) => {
  console.log("Dispatching verifyCode with:", verifyData);
  try {
    const response = await apiClient.post("/api/auth/verify-code", {
      email: verifyData.email,
      code: verifyData.code,
    });
    console.log("Verify code response:", response);
    return response.message;
  } catch (error: any) {
    console.error("Verify code error:", error.message, error.response?.data);
    const errorResponse = error.response?.data || {
      error: error.message || "Failed to verify code",
      action: "Please try again.",
    };
    return rejectWithValue(errorResponse);
  }
});

// Fonction pour ajouter les extraReducers spécifiques à verificationActions
export const addVerificationExtraReducers = (
  builder: ActionReducerMapBuilder<AuthState>
) => {
  builder
    // resendCode
    .addCase(resendCode.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.errorAction = null;
    })
    .addCase(resendCode.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.errorAction = null;
      state.resendCooldown = 60; // Cooldown de 60 secondes
    })
    .addCase(resendCode.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload?.error || "Failed to resend verification code";
      state.errorAction = action.payload?.action || "Please try again.";
    })
    // verifyCode
    .addCase(verifyCode.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.errorAction = null;
      state.verificationSuccess = false;
    })
    .addCase(verifyCode.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.errorAction = null;
      state.verificationSuccess = true;
      state.isVerified = true;
      state.resendCooldown = 0;
    })
    .addCase(verifyCode.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || "Failed to verify code";
      state.errorAction = action.payload?.action || "Please try again.";
      state.verificationSuccess = false;
    });
};
