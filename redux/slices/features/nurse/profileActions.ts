import { createAsyncThunk, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import apiClient from '../../../../api/apiClient';
import { updateUser } from '../../authSlice';
import { fetchOrSaveChatUser } from '../../chat/userChat/userChatSlice';
import { NurseDTO, LocationDTO, NurseState, AddressSuggestionDTO } from '../../../types';
import { getChatUserId } from '../../../selectors/userChatSelectors';
import { ErrorResponse } from '../../chat/userChat/userChatTypes';

// Interface pour les erreurs API
interface ApiError {
  message?: string;
  error?: string;
  status?: number;
}

interface FetchAddressSuggestionsPayload {
  input: string;
  region: string;
}

interface UpdateNurseProfileParams {
  nurseId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  preferredLanguage?: string;
  pseudo?: string;
}

interface UpdateNurseAddressParams {
  nurseId: string;
  address: { placeId: string; address: string };
}

export const fetchAddressSuggestions = createAsyncThunk<
  AddressSuggestionDTO[],
  FetchAddressSuggestionsPayload,
  { rejectValue: string }
>("nurse/fetchAddressSuggestions", async ({ input, region }, { rejectWithValue }) => {
  try {
    console.log('Fetching address suggestions with input:', input, 'region:', region);
    const response = await apiClient.get<AddressSuggestionDTO[]>(
      `/api/nurses/autocomplete-address?input=${encodeURIComponent(input)}&region=${encodeURIComponent(region)}`
    );
    console.log("Fetch Address Suggestions Response:", response);
    return Array.isArray(response) ? response : [];
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error("Fetch Address Suggestions Error:", {
      error,
      data: apiError,
      message: apiError.message || apiError.error,
    });
    const errorMessage =
      apiError.message ||
      apiError.error ||
      (typeof error === 'string' ? error : "Failed to fetch address suggestions");
    return rejectWithValue(errorMessage);
  }
});

export const updateNurseProfile = createAsyncThunk<
  NurseDTO,
  UpdateNurseProfileParams,
  { rejectValue: string }
>(
  "nurse/updateNurseProfile",
  async (
    {
      nurseId,
      firstName,
      lastName,
      phoneNumber,
      birthDate,
      gender,
      preferredLanguage,
      pseudo,
    },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      console.log('Updating nurse profile:', {
        nurseId,
        firstName,
        lastName,
        phoneNumber,
        birthDate,
        gender,
        preferredLanguage,
        pseudo,
      });
      const response = await apiClient.put<NurseDTO>(`/api/nurses/${nurseId}/profile`, {
        firstName,
        lastName,
        phoneNumber,
        birthDate,
        gender,
        preferredLanguage,
        pseudo,
      });
      console.log('apiClient PUT: Response received:', response);

      const updatedNurse = {
        ...response,
        id: response.id,
        patientIds: response.patientIds || [],
        pseudo: response.pseudo,
      } as NurseDTO;

      const state = getState() as {
        auth: { user: { _id: string; role: string; email: string; firstName?: string; lastName?: string } };
        userChat: { user: { firstName?: string; lastName?: string; role?: string; pseudo?: string } | null };
      };
      const chatUserId = getChatUserId(state);

      if (
        state.auth.user?._id === nurseId &&
        state.auth.user?.role === "NURSE"
      ) {
        dispatch(updateUser({ ...updatedNurse, role: "NURSE" }));

        // Vérifier si les données pertinentes pour le chat ont changé
        const chatUser = state.userChat.user;
        if (!chatUserId) {
          console.log('updateNurseProfile: Chat user not initialized, skipping sync');
        } else if (
          chatUser &&
          chatUser.firstName === firstName &&
          chatUser.lastName === lastName &&
          chatUser.pseudo === pseudo &&
          chatUser.role === 'NURSE'
        ) {
          console.log('updateNurseProfile: No changes in chat-relevant data, skipping sync');
        } else {
          try {
            await dispatch(
              fetchOrSaveChatUser({
                userId: nurseId,
                email: state.auth.user.email,
                firstName,
                lastName,
                pseudo,
                role: 'NURSE',
                likes: [],
                dislikes: [],
              })
            ).unwrap();
            console.log('updateNurseProfile: Synced user with chat service');
          } catch (chatError: any) {
            console.warn('updateNurseProfile: Chat service sync failed, continuing:', {
              error: chatError,
              message: chatError.error || 'Unknown error',
            });
          }
        }
      }

      return updatedNurse;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Update Nurse Profile Error:', {
        error,
        data: apiError,
        message: apiError.message || apiError.error,
      });
      const errorMessage =
        apiError.message ||
        apiError.error ||
        (typeof error === 'string' ? error : "Failed to update nurse profile");
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateNurseAddress = createAsyncThunk<
  NurseDTO,
  UpdateNurseAddressParams,
  { rejectValue: string }
>(
  "nurse/updateNurseAddress",
  async (
    { nurseId, address },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      console.log('Updating nurse address:', { nurseId, address });
      const response = await apiClient.put<NurseDTO>(
        `/api/nurses/${nurseId}/address`,
        {
          placeId: address.placeId,
          address: address.address,
        }
      );
      console.log('apiClient PUT: Response received:', response);
      const updatedNurse = {
        ...response,
        id: response.id,
        patientIds: response.patientIds || [],
        pseudo: response.pseudo,
      } as NurseDTO;

      const state = getState() as {
        auth: { user: { _id: string; role: string } };
      };
      if (
        state.auth.user?._id === nurseId &&
        state.auth.user?.role === "NURSE"
      ) {
        dispatch(updateUser({ ...updatedNurse, role: "NURSE" }));
      }

      return updatedNurse;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Update Nurse Address Error:', {
        error,
        data: apiError,
        message: apiError.message || apiError.error,
      });
      const errorMessage =
        apiError.message ||
        apiError.error ||
        (typeof error === 'string' ? error : "Failed to update nurse address");
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateNurseLocation = createAsyncThunk<
  NurseDTO,
  { nurseId: string; location: LocationDTO },
  { rejectValue: string }
>(
  "nurse/updateNurseLocation",
  async ({ nurseId, location }, { rejectWithValue, dispatch, getState }) => {
    try {
      console.log('Updating nurse location:', { nurseId, location });
      const response = await apiClient.put<NurseDTO>(
        `/api/nurses/${nurseId}/location`,
        location
      );
      console.log('apiClient PUT: Response received:', response);
      const updatedNurse = {
        ...response,
        id: response.id,
        patientIds: response.patientIds || [],
        pseudo: response.pseudo,
      } as NurseDTO;

      const state = getState() as {
        auth: { user: { _id: string; role: string } };
      };
      if (
        state.auth.user?._id === nurseId &&
        state.auth.user?.role === "NURSE"
      ) {
        dispatch(updateUser({ ...updatedNurse, role: "NURSE" }));
      }

      return updatedNurse;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Update Nurse Location Error:', {
        error,
        data: apiError,
        message: apiError.message || apiError.error,
      });
      const errorMessage =
        apiError.message ||
        apiError.error ||
        (typeof error === 'string' ? error : "Failed to update nurse location");
      return rejectWithValue(errorMessage);
    }
  }
);

export const addProfileExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    .addCase(fetchAddressSuggestions.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchAddressSuggestions.fulfilled, (state, action) => {
      state.loading = false;
      state.suggestions = action.payload;
    })
    .addCase(fetchAddressSuggestions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("Fetch Address Suggestions Rejected:", action.payload);
    })
    .addCase(updateNurseProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateNurseProfile.fulfilled, (state, action) => {
      state.loading = false;
      const updatedNurse = action.payload;
      state.nurses = state.nurses.map((nurse) =>
        nurse.id === updatedNurse.id ? updatedNurse : nurse
      );
      if (state.selectedNurse && state.selectedNurse.id === updatedNurse.id) {
        state.selectedNurse = updatedNurse;
      }
    })
    .addCase(updateNurseProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("Update Nurse Profile Error:", action.payload);
    })
    .addCase(updateNurseAddress.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateNurseAddress.fulfilled, (state, action) => {
      state.loading = false;
      const updatedNurse = action.payload;
      state.nurses = state.nurses.map((nurse) =>
        nurse.id === updatedNurse.id ? updatedNurse : nurse
      );
      if (state.selectedNurse && state.selectedNurse.id === updatedNurse.id) {
        state.selectedNurse = updatedNurse;
      }
    })
    .addCase(updateNurseAddress.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("Update Nurse Address Rejected:", action.payload);
    })
    .addCase(updateNurseLocation.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateNurseLocation.fulfilled, (state, action) => {
      state.loading = false;
      const updatedNurse = action.payload;
      state.nurses = state.nurses.map((nurse) =>
        nurse.id === updatedNurse.id ? updatedNurse : nurse
      );
      if (state.selectedNurse && state.selectedNurse.id === updatedNurse.id) {
        state.selectedNurse = updatedNurse;
      }
    })
    .addCase(updateNurseLocation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("Update Nurse Location Rejected:", action.payload);
    });
};