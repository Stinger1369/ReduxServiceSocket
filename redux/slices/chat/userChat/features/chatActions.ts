import { createAsyncThunk, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import chatApiClient from '../../../../../services/chatApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorResponse, DecodedToken, decodeJwt, UserDto } from '../userChatTypes';
import { UserChatState } from '../userChatTypes';

export const fetchChatUser = createAsyncThunk<
  UserDto,
  string,
  { rejectValue: ErrorResponse }
>(
  'userChat/fetchChatUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log('chatActions: Fetching chat user data for userId:', userId);
      const response = await chatApiClient.getUser(userId);
      console.log('chatActions: Chat user data response:', response);
      return response;
    } catch (error: any) {
      console.error('chatActions: Fetch chat user error:', error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec de la récupération des données utilisateur',
        action: error.action || 'Veuillez vérifier votre connexion et réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const fetchBlockedUsers = createAsyncThunk<
  { blockedUsers: string[]; blockedBy: string[] },
  string,
  { rejectValue: ErrorResponse }
>(
  'userChat/fetchBlockedUsers',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('chatActions: Fetching blocked users for userId:', userId);
      const response = await chatApiClient.getBlockedUsers(userId);
      console.log('chatActions: Blocked users response:', response);
      return response;
    } catch (error: any) {
      console.error('chatActions: Fetch blocked users error:', error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec de la récupération des utilisateurs bloqués',
        action: error.action || 'Veuillez vérifier votre connexion et réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const saveChatUser = createAsyncThunk<
  UserDto,
  Partial<UserDto>,
  { rejectValue: ErrorResponse }
>(
  'userChat/saveChatUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('chatActions: Saving chat user:', userData);
      const response = await chatApiClient.saveUser(userData);
      console.log('chatActions: Chat user save response:', response);
      return response;
    } catch (error: any) {
      console.error('chatActions: Save chat user error:', error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec de la sauvegarde de l’utilisateur',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// src/redux/slices/chat/userChat/userChatSlice.ts (extrait)
export const fetchOrSaveChatUser = createAsyncThunk<
  UserDto,
  Partial<UserDto>,
  { rejectValue: ErrorResponse }
>(
  'userChat/fetchOrSaveChatUser',
  async (userData, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('chatActions: Token retrieved:', token ? 'Valid token' : 'No token');
      if (!token) {
        console.error('chatActions: No token found');
        return rejectWithValue({
          error: 'No token found',
          action: 'Veuillez vous reconnecter.',
        });
      }
      let tokenEmail: string;
      try {
        const decodedToken: DecodedToken = decodeJwt(token);
        tokenEmail = decodedToken.sub;
        console.log('chatActions: Decoded token email:', tokenEmail);
      } catch (error) {
        console.error('chatActions: Failed to decode JWT token:', error);
        return rejectWithValue({
          error: 'Failed to decode JWT token',
          action: 'Veuillez vous reconnecter.',
        });
      }

      console.log('chatActions: Fetching or saving user with token email:', tokenEmail, 'userData:', userData);

      let existingUser;
      try {
        existingUser = await chatApiClient.getUserByEmail(tokenEmail);
        console.log('chatActions: User exists:', existingUser);
      } catch (error: unknown) {
        console.error('chatActions: Error checking user by email:', error);
        if ((error as ApiError).status === 404) {
          existingUser = null;
        } else {
          throw error;
        }
      }

      if (existingUser) {
        if (
          userData.firstName === existingUser.firstName &&
          userData.lastName === existingUser.lastName &&
          userData.pseudo === existingUser.pseudo && // Ajout de pseudo
          userData.role === existingUser.role
        ) {
          console.log('chatActions: No changes detected for user:', existingUser.userId);
          return existingUser;
        }
        const updateData = {
          userId: userData.userId || existingUser.userId,
          email: existingUser.email,
          firstName: userData.firstName || existingUser.firstName,
          lastName: userData.lastName || existingUser.lastName,
          pseudo: userData.pseudo || existingUser.pseudo, // Ajout de pseudo
          role: userData.role || existingUser.role,
          likes: userData.likes || existingUser.likes || [],
          dislikes: userData.dislikes || existingUser.dislikes || [],
          blockedBy: userData.blockedBy || existingUser.blockedBy || [],
          blockedUsers: userData.blockedUsers || existingUser.blockedUsers || [],
          reports: userData.reports || existingUser.reports || [],
        };
        console.log('chatActions: Updating user with:', updateData);
        const updatedUser = await chatApiClient.saveUser(updateData);
        console.log('chatActions: User updated:', updatedUser);
        return updatedUser;
      } else {
        if (!userData.userId) {
          console.error('chatActions: User ID is required for new user');
          return rejectWithValue({
            error: 'User ID is required for new user',
            action: 'Veuillez fournir un ID utilisateur valide.',
          });
        }
        const newUserData = {
          userId: userData.userId,
          email: tokenEmail,
          firstName: userData.firstName,
          lastName: userData.lastName,
          pseudo: userData.pseudo, // Ajout de pseudo
          role: userData.role,
          likes: userData.likes || [],
          dislikes: userData.dislikes || [],
          blockedBy: userData.blockedBy || [],
          blockedUsers: userData.blockedUsers || [],
          reports: userData.reports || [],
        };
        console.log('chatActions: Creating new user with:', newUserData);
        const response = await chatApiClient.saveUser(newUserData);
        console.log('chatActions: Chat user save response:', response);
        return response;
      }
    } catch (error: unknown) {
      console.error('chatActions: Error in fetchOrSaveChatUser:', error);
      const errorResponse: ErrorResponse = {
        error: (error as ApiError).error || 'Échec de la récupération ou sauvegarde de l’utilisateur',
        action: (error as ApiError).action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const deactivateChatUser = createAsyncThunk<
  void,
  string,
  { rejectValue: ErrorResponse }
>(
  'userChat/deactivateChatUser',
  async (userId, { rejectWithValue }) => {
    try {
      await chatApiClient.deactivateUser(userId);
      console.log(`deactivateChatUser: Successfully deactivated user with ID ${userId}`);
    } catch (error: any) {
      console.error("Deactivate Chat User Error:", error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec de la désactivation de l’utilisateur',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const reactivateChatUser = createAsyncThunk<
  void,
  string,
  { rejectValue: ErrorResponse }
>(
  'userChat/reactivateChatUser',
  async (userId, { rejectWithValue }) => {
    try {
      await chatApiClient.reactivateUser(userId);
      console.log(`reactivateChatUser: Successfully reactivated user with ID ${userId}`);
    } catch (error: any) {
      console.error("Reactivate Chat User Error:", error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec de la réactivation de l’utilisateur',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const deleteChatUser = createAsyncThunk<
  void,
  string,
  { rejectValue: ErrorResponse }
>(
  'userChat/deleteChatUser',
  async (userId, { rejectWithValue }) => {
    try {
      await chatApiClient.deleteUser(userId);
      console.log(`deleteChatUser: Successfully deleted user with ID ${userId}`);
    } catch (error: any) {
      console.error("Delete Chat User Error:", error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec de la suppression de l’utilisateur',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const addChatActionsExtraReducers = (builder: ActionReducerMapBuilder<UserChatState>) => {
  builder
    .addCase(fetchChatUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log('chatActions: fetchChatUser pending');
    })
    .addCase(fetchChatUser.fulfilled, (state, action) => {
      state.loading = false;
      state.users[action.payload.userId] = action.payload;
      if (!state.user) {
        state.user = action.payload;
      }
      if (!state.fetchedUsers.includes(action.payload.userId)) {
        state.fetchedUsers.push(action.payload.userId);
      }
      console.log('chatActions: fetchChatUser fulfilled:', action.payload);
    })
    .addCase(fetchChatUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la récupération de l’utilisateur';
      console.error('chatActions: fetchChatUser rejected:', action.payload);
    })
    .addCase(fetchBlockedUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log('chatActions: fetchBlockedUsers pending');
    })
    .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.blockedInfo = action.payload;
      console.log('chatActions: fetchBlockedUsers fulfilled:', action.payload);
    })
    .addCase(fetchBlockedUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la récupération des utilisateurs bloqués';
      console.error('chatActions: fetchBlockedUsers rejected:', action.payload);
    })
    .addCase(saveChatUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log('chatActions: saveChatUser pending');
    })
    .addCase(saveChatUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.users[action.payload.userId] = action.payload;
      console.log('chatActions: saveChatUser fulfilled:', action.payload);
    })
    .addCase(saveChatUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la sauvegarde de l’utilisateur';
      console.error('chatActions: saveChatUser rejected:', action.payload);
    })
    .addCase(fetchOrSaveChatUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log('chatActions: fetchOrSaveChatUser pending');
    })
    .addCase(fetchOrSaveChatUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.users[action.payload.userId] = action.payload;
      console.log('chatActions: fetchOrSaveChatUser fulfilled:', action.payload);
    })
    .addCase(fetchOrSaveChatUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la récupération ou sauvegarde de l’utilisateur';
      console.error('chatActions: fetchOrSaveChatUser rejected:', action.payload);
    })
    .addCase(deactivateChatUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log('chatActions: deactivateChatUser pending');
    })
    .addCase(deactivateChatUser.fulfilled, (state, action) => {
      state.loading = false;
      const userId = action.meta.arg;
      if (state.user && state.user.userId === userId) {
        state.user.isActive = false;
      }
      if (state.users[userId]) {
        state.users[userId].isActive = false;
      }
      console.log('chatActions: deactivateChatUser fulfilled for userId:', userId);
    })
    .addCase(deactivateChatUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la désactivation de l’utilisateur';
      console.error('chatActions: deactivateChatUser rejected:', action.payload);
    })
    .addCase(reactivateChatUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log('chatActions: reactivateChatUser pending');
    })
    .addCase(reactivateChatUser.fulfilled, (state, action) => {
      state.loading = false;
      const userId = action.meta.arg;
      if (state.user && state.user.userId === userId) {
        state.user.isActive = true;
      }
      if (state.users[userId]) {
        state.users[userId].isActive = true;
      }
      console.log('chatActions: reactivateChatUser fulfilled for userId:', userId);
    })
    .addCase(reactivateChatUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la réactivation de l’utilisateur';
      console.error('chatActions: reactivateChatUser rejected:', action.payload);
    })
    .addCase(deleteChatUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log('chatActions: deleteChatUser pending');
    })
    .addCase(deleteChatUser.fulfilled, (state, action) => {
      state.loading = false;
      const userId = action.meta.arg;
      delete state.users[userId];
      state.fetchedUsers = state.fetchedUsers.filter(id => id !== userId);
      if (state.user && state.user.userId === userId) {
        state.user = null;
      }
      console.log('chatActions: deleteChatUser fulfilled for userId:', userId);
    })
    .addCase(deleteChatUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || 'Échec de la suppression de l’utilisateur';
      console.error('chatActions: deleteChatUser rejected:', action.payload);
    });
};