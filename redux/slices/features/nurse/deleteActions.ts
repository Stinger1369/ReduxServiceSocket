import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { NurseState } from "../../../types";

// Delete nurse
export const deleteNurse = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>("nurse/deleteNurse", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/api/nurses/${id}`);
    console.log(`deleteNurse: Successfully deleted nurse with ID ${id}`);
  } catch (error: any) {
    console.error("Delete Nurse Error:", {
      error,
      data: error,
      message: error.message || error,
    });
    const errorMessage =
      error.message ||
      error.error ||
      (typeof error === 'string' ? error : "Failed to delete nurse");
    return rejectWithValue(errorMessage);
  }
});

// Deactivate nurse
export const deactivateNurse = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>("nurse/deactivateNurse", async (id, { rejectWithValue }) => {
  try {
    await apiClient.put(`/api/nurses/${id}/deactivate`, {});
    console.log(`deactivateNurse: Successfully deactivated nurse with ID ${id}`);
  } catch (error: any) {
    console.error("Deactivate Nurse Error:", {
      error,
      data: error,
      message: error.message || error,
    });
    const errorMessage =
      error.message ||
      error.error ||
      (typeof error === 'string' ? error : "Failed to deactivate nurse");
    return rejectWithValue(errorMessage);
  }
});

// Reactivate nurse
export const reactivateNurse = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>("nurse/reactivateNurse", async (id, { rejectWithValue }) => {
  try {
    await apiClient.put(`/api/nurses/${id}/reactivate`, {});
    console.log(`reactivateNurse: Successfully reactivated nurse with ID ${id}`);
  } catch (error: any) {
    console.error("Reactivate Nurse Error:", {
      error,
      data: error,
      message: error.message || error,
    });
    const errorMessage =
      error.message ||
      error.error ||
      (typeof error === 'string' ? error : "Failed to reactivate nurse");
    return rejectWithValue(errorMessage);
  }
});

// Fonction pour ajouter les extraReducers spécifiques
export const addDeleteExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  builder
    // Delete Nurse
    .addCase(deleteNurse.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteNurse.fulfilled, (state, action) => {
      state.loading = false;
      state.nurses = state.nurses.filter(
        (nurse) => nurse.id !== action.meta.arg
      );
      if (state.selectedNurse && state.selectedNurse.id === action.meta.arg) {
        state.selectedNurse = null;
      }
      console.log("deleteNurse: Updated nurses state:", state.nurses);
    })
    .addCase(deleteNurse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("deleteNurse.rejected: Error:", action.payload);
    })
    // Deactivate Nurse
    .addCase(deactivateNurse.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deactivateNurse.fulfilled, (state, action) => {
      state.loading = false;
      const now = new Date().toISOString();
      state.nurses = state.nurses.map((nurse) =>
        nurse.id === action.meta.arg
          ? {
              ...nurse,
              isActive: false,
              deactivatedAt: now,
              deactivationCount: (nurse.deactivationCount || 0) + 1,
            }
          : nurse
      );
      if (state.selectedNurse && state.selectedNurse.id === action.meta.arg) {
        state.selectedNurse = {
          ...state.selectedNurse,
          isActive: false,
          deactivatedAt: now,
          deactivationCount: (state.selectedNurse.deactivationCount || 0) + 1,
        };
      }
      console.log("deactivateNurse: Updated nurses state:", state.nurses);
    })
    .addCase(deactivateNurse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("deactivateNurse.rejected: Error:", action.payload);
      // Si le compte est déjà désactivé (erreur 409), mettre à jour l'état local
      if (action.payload.includes('status code 409')) {
        const now = new Date().toISOString();
        state.nurses = state.nurses.map((nurse) =>
          nurse.id === action.meta.arg
            ? {
                ...nurse,
                isActive: false,
                deactivatedAt: now,
              }
            : nurse
        );
        if (state.selectedNurse && state.selectedNurse.id === action.meta.arg) {
          state.selectedNurse = {
            ...state.selectedNurse,
            isActive: false,
            deactivatedAt: now,
          };
        }
      }
    })
    // Reactivate Nurse
    .addCase(reactivateNurse.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(reactivateNurse.fulfilled, (state, action) => {
      state.loading = false;
      const now = new Date().toISOString();
      state.nurses = state.nurses.map((nurse) =>
        nurse.id === action.meta.arg
          ? {
              ...nurse,
              isActive: true,
              deactivatedAt: null,
              activatedAt: now,
            }
          : nurse
      );
      if (state.selectedNurse && state.selectedNurse.id === action.meta.arg) {
        state.selectedNurse = {
          ...state.selectedNurse,
          isActive: true,
          deactivatedAt: null,
          activatedAt: now,
        };
      }
      console.log("reactivateNurse: Updated nurses state:", state.nurses);
    })
    .addCase(reactivateNurse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("reactivateNurse.rejected: Error:", action.payload);
    });
};