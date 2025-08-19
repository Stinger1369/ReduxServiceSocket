// src/redux/slices/features/nurse/patientActions/fetchAllPatientImagesByNurseId.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { NurseState } from "./types";

export const fetchAllPatientImagesByNurseId = createAsyncThunk(
  "nurse/fetchAllPatientImagesByNurseId",
  async (nurseId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/nurses/${nurseId}/patients/images`);
      console.log(`fetchAllPatientImagesByNurseId: Response for nurseId ${nurseId}:`, response);
      // Vérifier que la réponse est un tableau
      if (!Array.isArray(response)) {
        console.error(`fetchAllPatientImagesByNurseId: Expected array, got:`, response);
        return [];
      }
      return response;
    } catch (error: any) {
      console.error(`fetchAllPatientImagesByNurseId: Error for nurseId ${nurseId}:`, error);
      return rejectWithValue(error.response?.data?.message || "Échec de la récupération des images des patients");
    }
  }
);

export const fetchAllPatientImagesByNurseIdExtraReducers = (builder: any) => {
  builder
    .addCase(fetchAllPatientImagesByNurseId.pending, (state: NurseState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchAllPatientImagesByNurseId.fulfilled, (state: NurseState, action: any) => {
      state.loading = false;
      const images = action.payload || [];
      console.log("fetchAllPatientImagesByNurseIdExtraReducers: Processing images:", images);
      state.patientImages = {};
      images.forEach((image: { id: string; url: string; name: string; primary: boolean }) => {
        state.patientImages[image.id] = {
          id: image.id,
          url: image.url,
          name: image.name,
          isPrimary: image.primary,
        };
      });
      console.log("fetchAllPatientImagesByNurseIdExtraReducers: Updated patientImages:", state.patientImages);
    })
    .addCase(fetchAllPatientImagesByNurseId.rejected, (state: NurseState, action: any) => {
      state.loading = false;
      state.error = action.payload;
      console.error("fetchAllPatientImagesByNurseIdExtraReducers: Error:", action.payload);
    });
};