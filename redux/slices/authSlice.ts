import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PURGE } from 'redux-persist';
import {
  login,
  addLoginExtraReducers,
} from './features/auth/login';
import { register, addRegisterExtraReducers } from './features/auth/register';
import {
  restoreAuthState,
  addRestoreAuthStateExtraReducers,
} from './features/auth/restoreAuthState';
import {
  addPasswordExtraReducers,
  forgotPassword,
  resetPassword,
} from './features/auth/passwordActions';
import {
  addVerificationExtraReducers,
  resendCode,
  verifyCode,
} from './features/auth/verificationActions';
import { addLogoutExtraReducers, logout } from './features/auth/logout';
import { AuthState } from '../types';
import {
  fetchChatUser,
  receiveUserUpdate,
  updateUserLikesDislikes,
} from '../slices/chat/userChat/userChatSlice';
import { addAuthLanguageExtraReducers } from './features/languageActions';
import { deleteNurse, deactivateNurse, reactivateNurse } from './features/nurse/deleteActions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  preferredLanguage: 'en',
  selectedRole: null,
  loading: false,
  error: null,
  errorAction: null,
  passwordChangeSuccess: false,
  isVerified: false,
  verificationSuccess: false,
  resendCooldown: 0,
  resetCode: null,
  isInPasswordResetFlow: false,
};

const normalizeRole = (role: string | undefined): string | undefined => {
  if (!role) return undefined;
  return role.toUpperCase();
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutAfterVerification(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.selectedRole = null;
      state.error = null;
      state.errorAction = null;
      state.passwordChangeSuccess = false;
      state.isVerified = false;
      state.verificationSuccess = false;
      state.resendCooldown = 0;
      state.resetCode = null;
      state.isInPasswordResetFlow = false;
    },
    setUser(state, action) {
      state.user = {
        ...action.payload,
        role: normalizeRole(action.payload.role),
        userId: action.payload._id,
      };
    },
    updateUser(state, action: PayloadAction<Partial<AuthState['user']>>) {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
          role: normalizeRole(action.payload.role || state.user.role),
          userId: action.payload._id || state.user._id,
        };
      }
    },
    clearPasswordChangeSuccess(state) {
      state.passwordChangeSuccess = false;
    },
    clearVerificationSuccess(state) {
      state.verificationSuccess = false;
    },
    decrementResendCooldown(state) {
      if (state.resendCooldown > 0) {
        state.resendCooldown -= 1;
      }
    },
    resetError(state) {
      state.error = null;
      state.errorAction = null;
    },
  },
  extraReducers: (builder) => {
    console.log('authSlice: Adding extraReducers for fetchChatUser:', !!fetchChatUser);
    addLoginExtraReducers(builder);
    addRegisterExtraReducers(builder);
    addRestoreAuthStateExtraReducers(builder);
    addPasswordExtraReducers(builder);
    addVerificationExtraReducers(builder);
    addAuthLanguageExtraReducers(builder);
    addLogoutExtraReducers(builder);

    builder
      .addCase(deleteNurse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNurse.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.selectedRole = null;
        state.error = null;
        state.errorAction = null;
        state.isInPasswordResetFlow = false;
        AsyncStorage.removeItem('token').catch((err) => console.error('Failed to remove token:', err));
        console.log("authSlice: User deleted, state cleared");
      })
      .addCase(deleteNurse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorAction = 'Failed to delete nurse account';
        console.log("authSlice: Deletion failed:", action.payload);
      })
      .addCase(deactivateNurse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateNurse.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.selectedRole = null;
        state.error = null;
        state.errorAction = null;
        state.isInPasswordResetFlow = false;
        AsyncStorage.removeItem('token').catch((err) => console.error('Failed to remove token:', err));
        console.log("authSlice: User deactivated, state cleared");
      })
      .addCase(deactivateNurse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorAction = 'Failed to deactivate nurse account';
        console.log("authSlice: Deactivation failed:", action.payload);
        // Si le compte est déjà désactivé (erreur 409), déconnecter l'utilisateur
        if (action.payload.includes('status code 409')) {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          state.selectedRole = null;
          state.error = null;
          state.errorAction = null;
          state.isInPasswordResetFlow = false;
          AsyncStorage.removeItem('token').catch((err) => console.error('Failed to remove token:', err));
          console.log("authSlice: User already deactivated, state cleared");
        }
      })
      .addCase(reactivateNurse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reactivateNurse.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        console.log("authSlice: User reactivated");
      })
      .addCase(reactivateNurse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorAction = 'Failed to reactivate nurse account';
        console.log("authSlice: Reactivation failed:", action.payload);
      })
      .addCase(PURGE, () => initialState);

    if (fetchChatUser) {
      builder
        .addCase(fetchChatUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchChatUser.fulfilled, (state, action) => {
          state.loading = false;
          if (state.user) {
            state.user = {
              ...state.user,
              userId: action.payload.userId,
              email: action.payload.email,
              firstName: action.payload.firstName || state.user.firstName,
              lastName: action.payload.lastName || state.user.lastName,
              role: action.payload.role || state.user.role,
              conversations: action.payload.conversations || [],
              friendRequests: action.payload.friendRequests || [],
              posts: action.payload.posts || [],
              likes: action.payload.likes || [],
              dislikes: action.payload.dislikes || [],
              isOnline: action.payload.isOnline || false,
              lastConnectedAt: action.payload.lastConnectedAt || null,
            };
          }
          console.log("authSlice: Updated user with chat data:", action.payload);
        })
        .addCase(fetchChatUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.error || 'Échec de la récupération des données utilisateur';
          console.log("authSlice: Failed to fetch chat user:", action.payload);
        });
    } else {
      console.warn('authSlice: fetchChatUser is undefined, skipping extra reducers');
    }

    if (receiveUserUpdate) {
      builder.addCase(receiveUserUpdate, (state, action) => {
        if (state.user && state.user.userId === action.payload.userId) {
          state.user = {
            ...state.user,
            ...action.payload,
            conversations: action.payload.conversations || state.user.conversations,
            friendRequests: action.payload.friendRequests || state.user.friendRequests,
            posts: action.payload.posts || state.user.posts,
            likes: action.payload.likes || state.user.likes,
            dislikes: action.payload.dislikes || state.user.dislikes,
          };
        }
      });
    } else {
      console.warn('authSlice: receiveUserUpdate is undefined, skipping extra reducer');
    }

    if (updateUserLikesDislikes) {
      builder.addCase(updateUserLikesDislikes, (state, action) => {
        if (state.user && state.user.userId === action.payload.userId) {
          state.user.likes = action.payload.likes;
          state.user.dislikes = action.payload.dislikes;
        }
      });
    } else {
      console.warn('authSlice: updateUserLikesDislikes is undefined, skipping extra reducer');
    }
  },
});

export const {
  logoutAfterVerification,
  setUser,
  updateUser,
  clearPasswordChangeSuccess,
  clearVerificationSuccess,
  decrementResendCooldown,
  resetError,
} = authSlice.actions;

export {
  restoreAuthState,
  login,
  register,
  forgotPassword,
  resetPassword,
  resendCode,
  verifyCode,
  logout,
};

export default authSlice.reducer;