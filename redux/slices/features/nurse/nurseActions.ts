import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { NurseDTO, NurseState } from "../../../types";

// Fetch all nurses
export const fetchNurses = createAsyncThunk<
  NurseDTO[],
  void,
  { rejectValue: string }
>("nurse/fetchNurses", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<NurseDTO[]>("/api/nurses");
    return response.map((nurse: NurseDTO) => ({
      ...nurse,
      id: nurse.id,
      patientIds: nurse.patientIds || [],
      primaryImageId: nurse.primaryImageId,
      pseudo: nurse.pseudo,
    })) as NurseDTO[];
  } catch (error: any) {
    console.error("Fetch Nurses Error:", {
      error,
      data: error,
      message: error.message || error,
    });
    const errorMessage =
      error.message ||
      error.error ||
      (typeof error === 'string' ? error : "Failed to fetch nurses");
    return rejectWithValue(errorMessage);
  }
});

// Fetch nurse by ID
export const fetchNurseById = createAsyncThunk<
  NurseDTO,
  string,
  { rejectValue: string }
>("nurse/fetchNurseById", async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<NurseDTO>(`/api/nurses/${id}`);
    console.log("Raw API Response:", response);
    if (!response) {
      throw new Error("No data returned from API");
    }
    console.log("fetchNurseById: patientIds in response:", response.patientIds);
    return {
      ...response,
      id: response.id,
      patientIds: response.patientIds || [],
      primaryImageId: response.primaryImageId,
      pseudo: response.pseudo,
    } as NurseDTO;
  } catch (error: any) {
    console.error("Fetch Nurse Error:", {
      error,
      data: error,
      message: error.message || error,
    });
    const errorMessage =
      error.message ||
      error.error ||
      (typeof error === 'string' ? error : "Failed to fetch nurse");
    return rejectWithValue(errorMessage);
  }
});

// Fetch nurse by user ID (email)
export const fetchNurseByUserId = createAsyncThunk<
  NurseDTO,
  string,
  { rejectValue: string }
>("nurse/fetchNurseByUserId", async (userId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<NurseDTO>(`/api/nurses/user/${userId}`);
    console.log("Fetch nurse by user ID response:", response);
    if (!response) {
      throw new Error("No data returned from API");
    }
    console.log("fetchNurseByUserId: patientIds in response:", response.patientIds);
    return {
      ...response,
      id: response.id,
      patientIds: response.patientIds || [],
      primaryImageId: response.primaryImageId,
      pseudo: response.pseudo,
    } as NurseDTO;
  } catch (error: any) {
    console.error("Fetch nurse by user ID error:", {
      error,
      data: error,
      message: error.message || error,
    });
    const errorMessage =
      error.message ||
      error.error ||
      (typeof error === 'string' ? error : "Failed to fetch nurse by user ID");
    return rejectWithValue(errorMessage);
  }
});

// Create a new nurse
export const createNurse = createAsyncThunk<
  NurseDTO,
  NurseDTO,
  { rejectValue: string }
>("nurse/createNurse", async (nurseData, { rejectWithValue }) => {
  try {
    const payload = {
      ...nurseData,
      pseudo: nurseData.pseudo,
    };
    const response = await apiClient.post<NurseDTO>("/api/nurses", payload);
    console.log("Create Nurse Response:", response);
    return {
      ...response,
      id: response.id,
      patientIds: response.patientIds || [],
      primaryImageId: response.primaryImageId,
      pseudo: response.pseudo,
    } as NurseDTO;
  } catch (error: any) {
    console.error("Create Nurse Error:", {
      error,
      data: error,
      message: error.message || error,
    });
    const errorMessage =
      error.message ||
      error.error ||
      (typeof error === 'string' ? error : "Failed to create nurse");
    return rejectWithValue(errorMessage);
  }
});

// Update nurse (partial update)
export const updateNurse = createAsyncThunk<
  NurseDTO,
  { id: string; nurseData: Partial<NurseDTO> },
  { rejectValue: string }
>("nurse/updateNurse", async ({ id, nurseData }, { rejectWithValue }) => {
  try {
    const payload = {
      ...nurseData,
      pseudo: nurseData.pseudo,
    };
    const response = await apiClient.put<NurseDTO>(`/api/nurses/${id}`, payload);
    console.log("Update Nurse Response:", response);
    return {
      ...response,
      id: response.id,
      patientIds: response.patientIds || [],
      primaryImageId: response.primaryImageId,
      pseudo: response.pseudo,
    } as NurseDTO;
  } catch (error: any) {
    console.error("Update Nurse Error:", {
      error,
      data: error,
      message: error.message || error,
    });
    const errorMessage =
      error.message ||
      error.error ||
      (typeof error === 'string' ? error : "Failed to update nurse");
    return rejectWithValue(errorMessage);
  }
});

// Fonction pour ajouter les extraReducers spécifiques à nurseActions
export const addNurseExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    // Fetch Nurses
    .addCase(fetchNurses.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchNurses.fulfilled, (state, action) => {
      state.loading = false;
      state.nurses = action.payload;
      console.log("fetchNurses: Updated nurses state:", state.nurses);
    })
    .addCase(fetchNurses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("fetchNurses.rejected: Error:", action.payload);
    })
    // Fetch Nurse by ID
    .addCase(fetchNurseById.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchNurseById.fulfilled, (state, action) => {
      state.loading = false;
      const nurse = action.payload;
      state.selectedNurse = nurse;
      const existingIndex = state.nurses.findIndex((n) => n.id === nurse.id);
      if (existingIndex >= 0) {
        state.nurses[existingIndex] = nurse;
      } else {
        state.nurses.push(nurse);
      }
      console.log("fetchNurseById: Updated nurses state:", state.nurses);
    })
    .addCase(fetchNurseById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("fetchNurseById.rejected: Error:", action.payload);
    })
    // Fetch Nurse by User ID
    .addCase(fetchNurseByUserId.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchNurseByUserId.fulfilled, (state, action) => {
      state.loading = false;
      const nurse = action.payload;
      state.selectedNurse = nurse;
      const existingIndex = state.nurses.findIndex((n) => n.id === nurse.id);
      if (existingIndex >= 0) {
        state.nurses[existingIndex] = nurse;
      } else {
        state.nurses.push(nurse);
      }
      console.log("fetchNurseByUserId: Updated nurses state:", state.nurses);
    })
    .addCase(fetchNurseByUserId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("fetchNurseByUserId.rejected: Error:", action.payload);
    })
    // Create Nurse
    .addCase(createNurse.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(createNurse.fulfilled, (state, action) => {
      state.loading = false;
      state.nurses.push(action.payload);
      console.log("createNurse: Updated nurses state:", state.nurses);
    })
    .addCase(createNurse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("createNurse.rejected: Error:", action.payload);
    })
    // Update Nurse
    .addCase(updateNurse.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateNurse.fulfilled, (state, action) => {
      state.loading = false;
      const updatedNurse = action.payload;
      console.log("updateNurse: Updated nurse data:", updatedNurse);
      state.nurses = state.nurses.map((nurse) =>
        nurse.id === updatedNurse.id ? updatedNurse : nurse
      );
      if (state.selectedNurse && state.selectedNurse.id === updatedNurse.id) {
        state.selectedNurse = updatedNurse;
      }
      console.log("updateNurse: Updated nurses state:", state.nurses);
    })
    .addCase(updateNurse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("updateNurse.rejected: Error:", action.payload);
    });
};