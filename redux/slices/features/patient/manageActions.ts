import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { PatientState, PatientDTO, AddressDTO, LocationDTO } from "../../../types";
import { updateUser } from "../../authSlice";

export const createPatient = createAsyncThunk<
  PatientDTO,
  Partial<PatientDTO>,
  { rejectValue: string }
>("patient/createPatient", async (patientData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post("/api/patients", patientData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.error || "Échec de la création du patient"
    );
  }
});

export const updatePatient = createAsyncThunk<
  PatientDTO,
  { id: string; patientData: Partial<PatientDTO> },
  { rejectValue: string }
>(
  "patient/updatePatient",
  async ({ id, patientData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await apiClient.put(`/api/patients/${id}`, patientData);
      const updatedPatient = response.data;

      // Synchroniser state.auth.user si l'utilisateur connecté est le patient mis à jour
      const state = getState() as {
        auth: { user: { _id: string; role: string } };
      };
      if (state.auth.user?._id === id && state.auth.user?.role === "PATIENT") {
        dispatch(updateUser({ ...updatedPatient, role: "PATIENT" }));
      }

      return updatedPatient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Échec de la mise à jour du patient"
      );
    }
  }
);

export const deletePatient = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("patient/deletePatient", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/api/patients/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.error || "Échec de la suppression du patient"
    );
  }
});

export const updatePatientAddress = createAsyncThunk<
  PatientDTO,
  { patientId: string; address: AddressDTO },
  { rejectValue: string }
>(
  "patient/updatePatientAddress",
  async ({ patientId, address }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await apiClient.put(
        `/api/patients/${patientId}/address`,
        address
      );
      const updatedPatient = response.data;

      // Synchroniser state.auth.user si l'utilisateur connecté est le patient mis à jour
      const state = getState() as {
        auth: { user: { _id: string; role: string } };
      };
      if (
        state.auth.user?._id === patientId &&
        state.auth.user?.role === "PATIENT"
      ) {
        dispatch(updateUser({ ...updatedPatient, role: "PATIENT" }));
      }

      return updatedPatient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Échec de la mise à jour de l'adresse"
      );
    }
  }
);

export const updatePatientProfile = createAsyncThunk<
  PatientDTO,
  {
    patientId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    birthDate?: string;
    gender?: string;
    preferredLanguage: string;
  },
  { rejectValue: string }
>(
  "patient/updatePatientProfile",
  async (profileData, { rejectWithValue, dispatch, getState }) => {
    try {
      const { patientId, ...data } = profileData;
      const state = getState() as {
        patient: PatientState;
        auth: { user: { _id: string; role: string; email: string; password?: string } };
      };
      const selectedPatient = state.patient.selectedPatient;

      const response = await apiClient.put(`/api/patients/${patientId}`, {
        ...data,
        email: selectedPatient?.email || state.auth.user.email,
        verified: selectedPatient?.isVerified || true,
        imageIds: selectedPatient?.imageIds || [],
        idCardIds: selectedPatient?.idCardIds || [],
        vitaleCardIds: selectedPatient?.vitaleCardIds || [],
        primaryImageId: selectedPatient?.primaryImageId || null,
        role: "PATIENT",
      });
      const updatedPatient = response.data;

      // Synchroniser state.auth.user si l'utilisateur connecté est le patient mis à jour
      if (
        state.auth.user?._id === patientId &&
        state.auth.user?.role === "PATIENT"
      ) {
        dispatch(updateUser({ ...updatedPatient, role: "PATIENT" }));
      }

      return updatedPatient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Échec de la mise à jour du profil"
      );
    }
  }
);

export const updatePatientLocation = createAsyncThunk<
  PatientDTO,
  { patientId: string; location: LocationDTO },
  { rejectValue: string }
>(
  "patient/updatePatientLocation",
  async ({ patientId, location }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await apiClient.put(
        `/api/patients/${patientId}/location`,
        location
      );
      const updatedPatient = response.data;

      // Synchroniser state.auth.user si l'utilisateur connecté est le patient mis à jour
      const state = getState() as {
        auth: { user: { _id: string; role: string } };
      };
      if (
        state.auth.user?._id === patientId &&
        state.auth.user?.role === "PATIENT"
      ) {
        dispatch(updateUser({ ...updatedPatient, role: "PATIENT" }));
      }

      return updatedPatient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Échec de la mise à jour de la localisation"
      );
    }
  }
);

export const addManageExtraReducers = (
  builder: ActionReducerMapBuilder<PatientState>
) => {
  builder
    // createPatient
    .addCase(createPatient.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(createPatient.fulfilled, (state, action) => {
      state.loading = false;
      state.patients.push(action.payload);
    })
    .addCase(createPatient.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Échec de la création du patient";
    })
    // updatePatientProfile
    .addCase(updatePatientProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updatePatientProfile.fulfilled, (state, action) => {
      state.loading = false;
      const updatedPatient = action.payload;
      state.patients = state.patients.map((p) =>
        p.id === updatedPatient.id ? updatedPatient : p
      );
      if (
        state.selectedPatient &&
        state.selectedPatient.id === updatedPatient.id
      ) {
        state.selectedPatient = updatedPatient;
      }
    })
    .addCase(updatePatientProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Échec de la mise à jour du profil";
    })
    // updatePatient
    .addCase(updatePatient.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updatePatient.fulfilled, (state, action) => {
      state.loading = false;
      const updatedPatient = action.payload;
      state.patients = state.patients.map((p) =>
        p.id === updatedPatient.id ? updatedPatient : p
      );
      if (
        state.selectedPatient &&
        state.selectedPatient.id === updatedPatient.id
      ) {
        state.selectedPatient = updatedPatient;
      }
    })
    .addCase(updatePatient.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Échec de la mise à jour du patient";
    })
    // deletePatient
    .addCase(deletePatient.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deletePatient.fulfilled, (state, action) => {
      state.loading = false;
      state.patients = state.patients.filter((p) => p.id !== action.payload);
      if (
        state.selectedPatient &&
        state.selectedPatient.id === action.payload
      ) {
        state.selectedPatient = null;
      }
    })
    .addCase(deletePatient.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Échec de la suppression du patient";
    })
    // updatePatientAddress
    .addCase(updatePatientAddress.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updatePatientAddress.fulfilled, (state, action) => {
      state.loading = false;
      const updatedPatient = action.payload;
      state.patients = state.patients.map((p) =>
        p.id === updatedPatient.id ? updatedPatient : p
      );
      if (
        state.selectedPatient &&
        state.selectedPatient.id === updatedPatient.id
      ) {
        state.selectedPatient = updatedPatient;
      }
    })
    .addCase(updatePatientAddress.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Échec de la mise à jour de l'adresse";
    })
    // updatePatientLocation
    .addCase(updatePatientLocation.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updatePatientLocation.fulfilled, (state, action) => {
      state.loading = false;
      const updatedPatient = action.payload;
      state.patients = state.patients.map((p) =>
        p.id === updatedPatient.id ? updatedPatient : p
      );
      if (
        state.selectedPatient &&
        state.selectedPatient.id === updatedPatient.id
      ) {
        state.selectedPatient = updatedPatient;
      }
    })
    .addCase(updatePatientLocation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Échec de la mise à jour de la localisation";
    });
};