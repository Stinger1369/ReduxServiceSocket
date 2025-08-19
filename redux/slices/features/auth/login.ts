import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../../api/apiClient';
import chatApiClient from '../../../../services/chatApiClient';
import { fetchChatUser } from '../../chat/userChat/userChatSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { updatePatientLanguage, updateNurseLanguage, setPreferredLanguage } from '../languageActions';
import { socketService } from '../../../../services/socketService';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  id: string;
  token: string;
  isVerified: boolean;
  role: string;
  firstName?: string;
  lastName?: string;
  pseudo?: string;
  imageIds?: string[];
  primaryImageId?: string | null;
}

interface ErrorResponse {
  error: string;
  action: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
  userId?: string;
}

export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest & { role: 'NURSE' | 'PATIENT' },
  { rejectValue: ErrorResponse }
>(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch, getState }) => {
    console.log('login: Attempting login with:', credentials);
    try {
      const state = getState() as any;
      const preferredLanguage = state.auth.preferredLanguage || 'en';

      const response = await apiClient.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password,
        role: credentials.role,
        preferredLanguage,
      });
      console.log('login: Full API response:', response);

      const responseData = response;
      console.log('login: API response data:', responseData);

      if (!responseData || !responseData.role || !responseData.id || !responseData.token) {
        console.error('login: Invalid response data:', responseData);
        throw new Error('Réponse invalide de l\'API de connexion');
      }

      if (responseData.role !== credentials.role) {
        throw new Error(
          `Rôle incorrect : attendu ${credentials.role}, reçu ${responseData.role}`
        );
      }

      await AsyncStorage.setItem('token', responseData.token);
      const storedToken = await AsyncStorage.getItem('token');
      console.log('login: Token stored in AsyncStorage:', storedToken ? 'present' : 'null');

      let user;
      if (responseData.role === 'NURSE' && responseData.id) {
        console.log('login: Fetching full nurse data for user ID:', responseData.id);
        try {
          const nurseResponse = await apiClient.get('/api/nurses/' + responseData.id);
          console.log('login: Full nurse data response:', nurseResponse);
          user = {
            _id: nurseResponse.id,
            userId: nurseResponse.id,
            email: nurseResponse.email,
            role: responseData.role,
            firstName: nurseResponse.firstName || '',
            lastName: nurseResponse.lastName || '',
            pseudo: nurseResponse.pseudo || '',
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
            console.log(`login: Synchronized nurse language to ${preferredLanguage}`);
          }
        } catch (nurseError: any) {
          console.error('login: Failed to fetch nurse data:', nurseError);
          if (nurseError.response?.data?.error === 'Account is deactivated') {
            return rejectWithValue({
              error: 'Account is deactivated',
              action: 'Veuillez réactiver votre compte.',
              email: credentials.email,
              role: credentials.role,
              isVerified: responseData.isVerified,
              userId: responseData.id,
            });
          }
          throw nurseError;
        }
      } else if (responseData.role === 'PATIENT' && responseData.id) {
        console.log('login: Fetching full patient data for user ID:', responseData.id);
        const patientResponse = await apiClient.get('/api/patients/' + responseData.id);
        console.log('login: Full patient data response:', patientResponse);
        user = {
          _id: patientResponse.id,
          userId: patientResponse.id,
          email: patientResponse.email,
          role: responseData.role,
          firstName: patientResponse.firstName || '',
          lastName: patientResponse.lastName || '',
          pseudo: patientResponse.pseudo || '',
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
          console.log(`login: Synchronized patient language to ${preferredLanguage}`);
        }
      } else {
        throw new Error('Rôle non supporté : ' + responseData.role);
      }

      if (!user._id || typeof user._id !== 'string') {
        console.error('login: _id is missing or invalid in user:', user);
        throw new Error('L\'ID utilisateur (_id) est manquant ou invalide après la connexion');
      }

      try {
        console.log('login: Creating/updating user in chat service:', user);
        await chatApiClient.post('/users', {
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          pseudo: user.pseudo,
          role: user.role,
        });
        console.log('login: User created/updated in chat service');
      } catch (chatCreateError: any) {
        console.error('login: Failed to create/update user in chat service:', chatCreateError);
        if (chatCreateError.response?.data?.message?.includes('already exists')) {
          console.log('login: User already exists in chat service, proceeding');
        } else {
          return rejectWithValue({
            error: 'chat_create_failure',
            action: 'Veuillez réessayer plus tard.',
            email: credentials.email,
            role: credentials.role,
            isVerified: false,
            userId: responseData.id,
          });
        }
      }

      console.log('login: Fetching chat user with userId:', user._id);
      try {
        await dispatch(fetchChatUser(user._id)).unwrap();
        console.log('login: Chat user successfully fetched');
      } catch (chatError: any) {
        console.error('login: Failed to fetch chat user data:', chatError);
        return rejectWithValue({
          error: 'chat_data_failure',
          action: 'Veuillez réessayer plus tard.',
          email: credentials.email,
          role: credentials.role,
          isVerified: false,
          userId: responseData.id,
        });
      }

      try {
        socketService.setDispatch(dispatch);
        await socketService.initialize(
          user._id,
          user.email,
          user.firstName,
          user.lastName,
          user.role as 'NURSE' | 'PATIENT'
        );
        console.log('login: SocketService initialized and connected');
      } catch (socketError: any) {
        console.error('login: Failed to initialize SocketService:', socketError.message);
        console.log('login: Proceeding with login despite socket initialization failure');
      }

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await dispatch(setPreferredLanguage(preferredLanguage));
      return {
        id: responseData.id,
        token: responseData.token,
        isVerified: responseData.isVerified,
        role: responseData.role,
        firstName: user.firstName,
        lastName: user.lastName,
        pseudo: user.pseudo,
        imageIds: user.imageIds,
        primaryImageId: user.primaryImageId,
      } as LoginResponse;
    } catch (error: any) {
      console.error('Login error:', {
        status: error.response?.status,
        data: JSON.stringify(error.response?.data, null, 2),
        message: error.message,
        fullError: JSON.stringify(error, null, 2),
      });
      if (error.response && error.response.data) {
        console.log('login: Using server error response:', error.response.data);
        return rejectWithValue({
          error: error.response.data.error || 'Échec de la connexion',
          action: error.response.data.action || 'Veuillez réessayer.',
          email: credentials.email,
          role: credentials.role,
          isVerified: error.response.data.isVerified ?? false,
          userId: responseData?.id || '',
        });
      }
      console.error('login: No response data, falling back to default error');
      return rejectWithValue({
        error: error.message || 'Échec de la connexion',
        action: 'Veuillez réessayer.',
        email: credentials.email,
        role: credentials.role,
        isVerified: false,
        userId: '',
      });
    }
  }
);

export const addLoginExtraReducers = (builder: any) => {
  builder
    .addCase(login.pending, (state: any, action: any) => {
      state.loading = true;
      state.error = null;
      state.errorAction = null;
      state.selectedRole = action.meta.arg.role;
    })
    .addCase(login.fulfilled, (state: any, action: any) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.isVerified = action.payload.isVerified;
      state.user = {
        _id: action.payload.id,
        userId: action.payload.id,
        email: action.meta.arg.email,
        role: action.payload.role,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        pseudo: action.payload.pseudo || '',
        imageIds: action.payload.imageIds || [],
        primaryImageId: action.payload.primaryImageId || null,
        conversations: [],
        friendRequests: [],
        posts: [],
        comments: [],
        likes: [],
        dislikes: [],
      };
      state.resendCode = null;
      console.log('login: Login fulfilled, user:', state.user);
    })
    .addCase(login.rejected, (state: any, action: any) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload?.error || 'Échec de la connexion';
      state.errorAction = action.payload?.action || '';
      state.isVerified = action.payload?.isVerified ?? false;
      state.selectedRole = action.payload?.role || null;
      // Ne pas supprimer le token si l'erreur est "Account is deactivated"
      if (action.payload?.error !== 'Account is deactivated') {
        AsyncStorage.removeItem('token');
      }
      state.user = {
        email: action.payload?.email || action.meta?.arg?.email || '',
        role: action.payload?.role || '',
        imageIds: [],
        _id: action.payload?.userId || '',
        userId: action.payload?.userId || '',
        pseudo: '',
        primaryImageId: null,
        conversations: [],
        friendRequests: [],
        posts: [],
        comments: [],
        likes: [],
        dislikes: [],
      };
      console.log('login: Login rejected:', state.error, state.errorAction);
    });
};