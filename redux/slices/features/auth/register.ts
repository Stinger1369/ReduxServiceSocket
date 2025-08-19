import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import chatApiClient from "../../../../services/chatApiClient";
import {
  RegisterRequest,
  LoginResponse,
  ErrorResponse,
  AuthState,
} from "../../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setPreferredLanguage, updateNurseLanguage, updatePatientLanguage } from "../languageActions";
import { fetchChatUser } from "../../chat/userChat/userChatSlice";

export const register = createAsyncThunk<
  LoginResponse,
  RegisterRequest,
  { rejectValue: ErrorResponse }
>(
  "auth/register",
  async (userData, { rejectWithValue, dispatch, getState }) => {
    console.log("Dispatching register with:", userData);
    try {
      const state = getState() as any;
      const preferredLanguage = state.auth.preferredLanguage || "en";

      const response = await apiClient.post("/api/auth/register", {
        ...userData,
        preferredLanguage,
      });
      await AsyncStorage.setItem("token", response.token);

      let user;
      if (response.role === "NURSE" && response.id) {
        console.log("Fetching full nurse data for user ID:", response.id);
        const nurseResponse = await apiClient.get(`/api/nurses/${response.id}`);
        console.log("Full nurse data response:", nurseResponse);
        user = {
          _id: nurseResponse.id,
          userId: nurseResponse.userId || userData.email,
          email: nurseResponse.email,
          role: response.role,
          firstName: nurseResponse.firstName,
          lastName: nurseResponse.lastName,
          imageIds: nurseResponse.imageIds || [],
          primaryImageId: nurseResponse.primaryImageId || null,
        };
        if (nurseResponse.preferredLanguage !== preferredLanguage) {
          await dispatch(
            updateNurseLanguage({
              nurseId: user._id,
              language: preferredLanguage,
            })
          ).unwrap();
          console.log(`Synchronized nurse language to ${preferredLanguage}`);
        }
      } else if (response.role === "PATIENT" && response.id) {
        console.log("Fetching full patient data for user ID:", response.id);
        const patientResponse = await apiClient.get(
          `/api/patients/${response.id}`
        );
        console.log("Full patient data response:", patientResponse);
        user = {
          _id: patientResponse.id,
          userId: patientResponse.userId || userData.email,
          email: patientResponse.email,
          role: response.role,
          firstName: patientResponse.firstName,
          lastName: patientResponse.lastName,
          imageIds: patientResponse.imageIds || [],
          primaryImageId: patientResponse.primaryImageId || null,
        };
        if (patientResponse.preferredLanguage !== preferredLanguage) {
          await dispatch(
            updatePatientLanguage({
              patientId: user._id,
              language: preferredLanguage,
            })
          ).unwrap();
          console.log(`Synchronized patient language to ${preferredLanguage}`);
        }
      } else {
        throw new Error('Rôle non supporté : ' + response.role);
      }

      if (!user._id) {
        console.error('register: _id is missing in user:', user);
        throw new Error('User ID (_id) is missing after register');
      }

      // Créer ou mettre à jour l'utilisateur dans le microservice de tchat
      try {
        console.log('Creating/updating user in chat service:', user);
        await chatApiClient.post('/users', {
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        });
        console.log('User created/updated in chat service');
      } catch (chatCreateError: any) {
        console.error('Failed to create/update user in chat service:', chatCreateError);
        throw new Error('chat_create_failure');
      }

      // Récupérer les données complètes du tchat
      try {
        await dispatch(fetchChatUser(user._id)).unwrap();
      } catch (chatError: any) {
        console.error('Failed to fetch chat user data:', chatError);
        throw new Error('chat_data_failure');
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
      console.error("Register error:", error.message, error.response?.data);
      const errorResponse = error.response?.data || {
        error: error.message || "Registration failed",
        action: "Please try again.",
      };
      return rejectWithValue({
        error: errorResponse.error || "Registration failed",
        action: errorResponse.action || "Please try again.",
        email: userData.email,
        role: errorResponse.role || "",
        isVerified: errorResponse.isVerified || false,
      });
    }
  }
);

export const addRegisterExtraReducers = (
  builder: ActionReducerMapBuilder<AuthState>
) => {
  builder
    .addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.errorAction = null;
    })
    .addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.isVerified = action.payload.isVerified;
      state.user = {
        _id: action.payload.id,
        userId: action.meta.arg.email,
        email: action.meta.arg.email,
        role: action.payload.role,
        firstName: action.meta.arg.firstName,
        lastName: action.meta.arg.lastName,
        imageIds: action.payload.imageIds || [],
        primaryImageId: action.payload.primaryImageId || null,
        conversations: [],
        friendRequests: [],
        posts: [],
        comments: [],
        likes: [],
        dislikes: [],
      };
      state.resendCooldown = 0;
      state.resetCode = null;
      console.log("Register fulfilled, user:", state.user);
    })
    .addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || "Registration failed";
      state.errorAction = action.payload?.action || "Please try again.";
      console.log(
        "Register rejected, error:",
        state.error,
        "action:",
        state.errorAction
      );
    });
};