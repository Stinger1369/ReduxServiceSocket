import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { PatientState, PatientDTO, NurseDTO } from "../../../types";

export const fetchAllPatients = createAsyncThunk<
  PatientDTO[],
  void,
  { rejectValue: string }
>("patient/fetchAllPatients", async (_, { rejectWithValue }) => {
  try {
    console.log("Fetching all patients from /api/patients...");
    const response = await apiClient.get("/api/patients");
    console.log("Raw response from /api/patients:", response);
    return response as PatientDTO[];
  } catch (error: any) {
    console.error("fetchAllPatients error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.message || "Échec de la récupération des patients");
  }
});

export const fetchPublicPatients = createAsyncThunk<
  PatientDTO[],
  void,
  { rejectValue: string }
>("patient/fetchPublicPatients", async (_, { rejectWithValue }) => {
  try {
    console.log("Fetching public patients from /api/patients?publicOnly=true...");
    const response = await apiClient.get("/api/patients", {
      params: { publicOnly: true },
    });
    console.log("Raw response from /api/patients?publicOnly=true:", response);
    return response as PatientDTO[];
  } catch (error: any) {
    console.error("fetchPublicPatients error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.message || "Échec de la récupération des patients publics");
  }
});

export const fetchPatientsByNurseId = createAsyncThunk<
  PatientDTO[],
  string,
  { rejectValue: string }
>("patient/fetchPatientsByNurseId", async (nurseId, { rejectWithValue }) => {
  try {
    console.log(`Fetching patients for nurse ID ${nurseId} from /api/nurses/${nurseId}/patients...`);
    const response = await apiClient.get(`/api/nurses/${nurseId}/patients`);
    console.log(`Raw response from /api/nurses/${nurseId}/patients:`, response);
    return response as PatientDTO[];
  } catch (error: any) {
    console.error("fetchPatientsByNurseId error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.message || "Échec de la récupération des patients de l'infirmière");
  }
});

export const fetchPatientById = createAsyncThunk<
  PatientDTO,
  { nurseId: string; patientId: string },
  { rejectValue: string }
>("patient/fetchPatientById", async ({ nurseId, patientId }, { rejectWithValue }) => {
  try {
    console.log(`Fetching patient with ID ${patientId} from /api/nurses/${nurseId}/patients/${patientId}...`);
    const response = await apiClient.get(`/api/nurses/${nurseId}/patients/${patientId}`);
    console.log(`Raw response from /api/nurses/${nurseId}/patients/${patientId}:`, response);
    return response as PatientDTO;
  } catch (error: any) {
    console.error("fetchPatientById error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.message || "Échec de la récupération du patient");
  }
});

export const fetchMatchingNurses = createAsyncThunk<
  NurseDTO[],
  string,
  { rejectValue: string }
>("patient/fetchMatchingNurses", async (id, { rejectWithValue }) => {
  try {
    console.log(`Fetching matching nurses for patient ID ${id} from /api/patients/${id}/matching-nurses...`);
    const response = await apiClient.get(`/api/patients/${id}/matching-nurses`);
    console.log(`Raw response from /api/patients/${id}/matching-nurses:`, response);
    return response as NurseDTO[];
  } catch (error: any) {
    console.error("fetchMatchingNurses error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.message || "Échec de la récupération des infirmiers correspondants");
  }
});

export const addFetchExtraReducers = (
  builder: ActionReducerMapBuilder<PatientState>
) => {
  builder
    .addCase(fetchAllPatients.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchAllPatients.fulfilled, (state, action) => {
      state.loading = false;
      state.patients = action.payload;
      console.log("fetchAllPatients fulfilled, patients updated:", action.payload);
    })
    .addCase(fetchAllPatients.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("fetchAllPatients rejected, error:", action.payload);
    })
    .addCase(fetchPublicPatients.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchPublicPatients.fulfilled, (state, action) => {
      state.loading = false;
      state.patients = action.payload;
      console.log("fetchPublicPatients fulfilled, public patients updated:", action.payload);
    })
    .addCase(fetchPublicPatients.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("fetchPublicPatients rejected, error:", action.payload);
    })
    .addCase(fetchPatientsByNurseId.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchPatientsByNurseId.fulfilled, (state, action) => {
      state.loading = false;
      state.patients = action.payload;
      console.log("fetchPatientsByNurseId fulfilled, nurse patients updated:", action.payload);
    })
    .addCase(fetchPatientsByNurseId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("fetchPatientsByNurseId rejected, error:", action.payload);
    })
    .addCase(fetchPatientById.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchPatientById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedPatient = action.payload;
      const index = state.patients.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.patients[index] = action.payload;
      } else {
        state.patients.push(action.payload);
      }
      console.log("fetchPatientById fulfilled, selectedPatient updated:", state.selectedPatient);
      console.log("fetchPatientById fulfilled, patients updated:", state.patients);
    })
    .addCase(fetchPatientById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("fetchPatientById rejected, error:", action.payload);
    })
    .addCase(fetchMatchingNurses.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMatchingNurses.fulfilled, (state, action) => {
      state.loading = false;
      state.matchingNurses = action.payload;
      console.log("fetchMatchingNurses fulfilled, matching nurses updated:", action.payload);
    })
    .addCase(fetchMatchingNurses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("fetchMatchingNurses rejected, error:", action.payload);
    });
};
