import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../../api/apiClient";
import { NurseState, ProfessionalActDTO, PatientDTO } from "../../../../types";

const API_URL = "/api/nurses";

// Assigner un acte professionnel
export const assignProfessionalAct = createAsyncThunk<
  PatientDTO,
  { nurseId: string; patientId: string; act: ProfessionalActDTO },
  { rejectValue: { message: string; code: string } }
>(
  "nurse/assignProfessionalAct",
  async ({ nurseId, patientId, act }, { rejectWithValue }) => {
    try {
      console.log(`assignProfessionalAct: Sending POST request to ${API_URL}/${nurseId}/patients/${patientId}/acts`);
      const response = await apiClient.post(`${API_URL}/${nurseId}/patients/${patientId}/acts`, act);
      console.log("assignProfessionalAct: Response received:", response);
      return response as PatientDTO;
    } catch (error: any) {
      console.error("assignProfessionalAct: Request failed:", error.message, error.response?.data);
      const errorMessage = error.response?.data?.message || "Failed to assign professional act";
      const errorCode = error.response?.data?.error || "unknown_error";
      return rejectWithValue({ message: errorMessage, code: errorCode });
    }
  }
);

// Récupérer les actes d'un patient
export const fetchProfessionalActs = createAsyncThunk<
  { patientId: string; acts: ProfessionalActDTO[] },
  { nurseId: string; patientId: string },
  { rejectValue: { message: string; code: string } }
>(
  "nurse/fetchProfessionalActs",
  async ({ nurseId, patientId }, { rejectWithValue }) => {
    try {
      console.log(`fetchProfessionalActs: Sending GET request to ${API_URL}/${nurseId}/patients/${patientId}/acts`);
      const response = await apiClient.get(`${API_URL}/${nurseId}/patients/${patientId}/acts`);
      console.log("fetchProfessionalActs: Response received:", response);
      return { patientId, acts: response as ProfessionalActDTO[] };
    } catch (error: any) {
      console.error("fetchProfessionalActs: Request failed:", error.message, error.response?.data);
      const errorMessage = error.response?.data?.message || "Failed to fetch professional acts";
      const errorCode = error.response?.data?.error || "unknown_error";
      return rejectWithValue({ message: errorMessage, code: errorCode });
    }
  }
);

// Récupérer les actes de plusieurs patients
export const fetchBatchProfessionalActs = createAsyncThunk<
  { [patientId: string]: ProfessionalActDTO[] },
  { nurseId: string; patientIds: string[] },
  { rejectValue: { message: string; code: string } }
>(
  "nurse/fetchBatchProfessionalActs",
  async ({ nurseId, patientIds }, { rejectWithValue }) => {
    try {
      console.log(`fetchBatchProfessionalActs: Sending GET request to ${API_URL}/${nurseId}/patients/acts with patientIds:`, patientIds);
      const response = await apiClient.get(`${API_URL}/${nurseId}/patients/acts`, {
        params: { patientIds: patientIds.join(",") }
      });
      console.log("fetchBatchProfessionalActs: Response received:", response);
      return response as { [patientId: string]: ProfessionalActDTO[] };
    } catch (error: any) {
      console.error("fetchBatchProfessionalActs: Request failed:", error.message, error.response?.data);
      const errorMessage = error.response?.data?.message || "Failed to fetch batch professional acts";
      const errorCode = error.response?.data?.error || "unknown_error";
      return rejectWithValue({ message: errorMessage, code: errorCode });
    }
  }
);

// Mettre à jour un acte professionnel
export const updateProfessionalAct = createAsyncThunk<
  PatientDTO,
  { nurseId: string; patientId: string; actCode: string; act: ProfessionalActDTO },
  { rejectValue: { message: string; code: string } }
>(
  "nurse/updateProfessionalAct",
  async ({ nurseId, patientId, actCode, act }, { rejectWithValue }) => {
    try {
      console.log(`updateProfessionalAct: Sending PUT request to ${API_URL}/${nurseId}/patients/${patientId}/acts/${actCode}`);
      const response = await apiClient.put(`${API_URL}/${nurseId}/patients/${patientId}/acts/${actCode}`, act);
      console.log("updateProfessionalAct: Response received:", response);
      return response as PatientDTO;
    } catch (error: any) {
      console.error("updateProfessionalAct: Request failed:", error.message, error.response?.data);
      const errorMessage = error.response?.data?.message || "Failed to update professional act";
      const errorCode = error.response?.data?.error || "unknown_error";
      return rejectWithValue({ message: errorMessage, code: errorCode });
    }
  }
);

// Supprimer un acte professionnel
export const deleteProfessionalAct = createAsyncThunk<
  PatientDTO,
  { nurseId: string; patientId: string; actCode: string },
  { rejectValue: { message: string; code: string } }
>(
  "nurse/deleteProfessionalAct",
  async ({ nurseId, patientId, actCode }, { rejectWithValue }) => {
    try {
      console.log(`deleteProfessionalAct: Sending DELETE request to ${API_URL}/${nurseId}/patients/${patientId}/acts/${actCode}`);
      const response = await apiClient.delete(`${API_URL}/${nurseId}/patients/${patientId}/acts/${actCode}`);
      console.log("deleteProfessionalAct: Response received:", response);
      return response as PatientDTO;
    } catch (error: any) {
      console.error("deleteProfessionalAct: Request failed:", error.message, error.response?.data);
      const errorMessage = error.response?.data?.message || "Failed to delete professional act";
      const errorCode = error.response?.data?.error || "unknown_error";
      return rejectWithValue({ message: errorMessage, code: errorCode });
    }
  }
);

// Récupérer les gains mensuels
export const fetchMonthlyBilling = createAsyncThunk<
  { nurseId: string; billing: number },
  { nurseId: string; year: number; month: number },
  { rejectValue: { message: string; code: string } }
>(
  "nurse/fetchMonthlyBilling",
  async ({ nurseId, year, month }, { rejectWithValue }) => {
    try {
      console.log(`fetchMonthlyBilling: Sending GET request to ${API_URL}/${nurseId}/billing/monthly?year=${year}&month=${month}`);
      const response = await apiClient.get(`${API_URL}/${nurseId}/billing/monthly?year=${year}&month=${month}`);
      console.log("fetchMonthlyBilling: Response received:", response);
      return { nurseId, billing: response as number };
    } catch (error: any) {
      console.error("fetchMonthlyBilling: Request failed:", error.message, error.response?.data);
      const errorMessage = error.response?.data?.message || "Failed to fetch monthly billing";
      const errorCode = error.response?.data?.error || "unknown_error";
      return rejectWithValue({ message: errorMessage, code: errorCode });
    }
  }
);

export const addProfessionalActExtraReducers = (builder: ActionReducerMapBuilder<NurseState>) => {
  builder
    .addCase(assignProfessionalAct.pending, (state) => {
      console.log("assignProfessionalAct: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(assignProfessionalAct.fulfilled, (state, action) => {
      console.log("assignProfessionalAct: Fulfilled state, payload:", action.payload);
      state.loading = false;
      const updatedPatient = action.payload;
      const patientIndex = state.patients.findIndex((p) => p.id === updatedPatient.id);
      if (patientIndex !== -1) {
        state.patients[patientIndex] = updatedPatient;
        state.professionalActs[updatedPatient.id] = updatedPatient.professionalActs || [];
      } else {
        state.patients.push(updatedPatient);
        state.professionalActs[updatedPatient.id] = updatedPatient.professionalActs || [];
      }
    })
    .addCase(assignProfessionalAct.rejected, (state, action) => {
      console.log("assignProfessionalAct: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload?.message || "Failed to assign professional act";
      state.errorCode = action.payload?.code || "unknown_error";
    });

  builder
    .addCase(fetchProfessionalActs.pending, (state) => {
      console.log("fetchProfessionalActs: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchProfessionalActs.fulfilled, (state, action) => {
      console.log("fetchProfessionalActs: Fulfilled state, payload:", action.payload);
      state.loading = false;
      const { patientId, acts } = action.payload;
      state.professionalActs[patientId] = acts;
    })
    .addCase(fetchProfessionalActs.rejected, (state, action) => {
      console.log("fetchProfessionalActs: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload?.message || "Failed to fetch professional acts";
      state.errorCode = action.payload?.code || "unknown_error";
    });

  builder
    .addCase(fetchBatchProfessionalActs.pending, (state) => {
      console.log("fetchBatchProfessionalActs: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchBatchProfessionalActs.fulfilled, (state, action) => {
      console.log("fetchBatchProfessionalActs: Fulfilled state, payload:", action.payload);
      state.loading = false;
      Object.entries(action.payload).forEach(([patientId, acts]) => {
        state.professionalActs[patientId] = acts;
      });
    })
    .addCase(fetchBatchProfessionalActs.rejected, (state, action) => {
      console.log("fetchBatchProfessionalActs: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload?.message || "Failed to fetch batch professional acts";
      state.errorCode = action.payload?.code || "unknown_error";
    });

  builder
    .addCase(updateProfessionalAct.pending, (state) => {
      console.log("updateProfessionalAct: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(updateProfessionalAct.fulfilled, (state, action) => {
      console.log("updateProfessionalAct: Fulfilled state, payload:", action.payload);
      state.loading = false;
      const updatedPatient = action.payload;
      const patientIndex = state.patients.findIndex((p) => p.id === updatedPatient.id);
      if (patientIndex !== -1) {
        state.patients[patientIndex] = updatedPatient;
        state.professionalActs[updatedPatient.id] = updatedPatient.professionalActs || [];
      } else {
        state.patients.push(updatedPatient);
        state.professionalActs[updatedPatient.id] = updatedPatient.professionalActs || [];
      }
    })
    .addCase(updateProfessionalAct.rejected, (state, action) => {
      console.log("updateProfessionalAct: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload?.message || "Failed to update professional act";
      state.errorCode = action.payload?.code || "unknown_error";
    });

  builder
    .addCase(deleteProfessionalAct.pending, (state) => {
      console.log("deleteProfessionalAct: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteProfessionalAct.fulfilled, (state, action) => {
      console.log("deleteProfessionalAct: Fulfilled state, payload:", action.payload);
      state.loading = false;
      const updatedPatient = action.payload;
      const patientIndex = state.patients.findIndex((p) => p.id === updatedPatient.id);
      if (patientIndex !== -1) {
        state.patients[patientIndex] = updatedPatient;
        state.professionalActs[updatedPatient.id] = updatedPatient.professionalActs || [];
      } else {
        state.patients.push(updatedPatient);
        state.professionalActs[updatedPatient.id] = updatedPatient.professionalActs || [];
      }
    })
    .addCase(deleteProfessionalAct.rejected, (state, action) => {
      console.log("deleteProfessionalAct: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload?.message || "Failed to delete professional act";
      state.errorCode = action.payload?.code || "unknown_error";
    });

  builder
    .addCase(fetchMonthlyBilling.pending, (state) => {
      console.log("fetchMonthlyBilling: Pending state");
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMonthlyBilling.fulfilled, (state, action) => {
      console.log("fetchMonthlyBilling: Fulfilled state, payload:", action.payload);
      state.loading = false;
      const { nurseId, billing } = action.payload;
      state.monthlyBilling[nurseId] = billing;
    })
    .addCase(fetchMonthlyBilling.rejected, (state, action) => {
      console.log("fetchMonthlyBilling: Rejected state, error:", action.payload);
      state.loading = false;
      state.error = action.payload?.message || "Failed to fetch monthly billing";
      state.errorCode = action.payload?.code || "unknown_error";
    });
};
