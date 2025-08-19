import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { TourDTO, TourState } from "../types";
import {
  addTourCrudExtraReducers,
  fetchAllTours,
  fetchTourById,
  fetchToursByNurseId,
  fetchToursByPatientId,
  fetchToursByNurseIdAndDate,
  createTour,
  updateTour,
  deleteTour,
} from "./features/tour/tourCrudActions";
import {
  addTourPatientManagementExtraReducers,
  addPatientToTour,
  updatePatientDetails,
  removePatientFromTour,
} from "./features/tour/tourPatientManagementActions";
import {
  addTourPresenceExtraReducers,
  markPatientPresence,
  markPatientPresenceRange,
  fetchPresenceByTourIdAndDate,
  fetchPresenceByTourIdAndDateRange,
} from "./features/tour/tourPresenceActions";
import {
  addTourNoteExtraReducers,
  addPatientNote,
  fetchTourNotes,
  updatePatientNote,
  deletePatientNote,
  fetchGlobalNotes,
} from "./features/tour/tourNoteActions";
import {
  addTourSharingExtraReducers,
  shareTour,
} from "./features/tour/tourSharingActions";
import {
  addTourOrderExtraReducers,
  reorderPatientsByActs,
  optimizeTour,
  updatePatientOrder,
} from "./features/tour/tourOrderActions";
import {
  addTourBillingExtraReducers,
  fetchTourBilling,
  fetchWeeklyBilling,
  fetchMonthlyBilling,
} from "./features/tour/tourBillingActions";

const initialState: TourState = {
  tours: [],
  selectedTour: null,
  presences: [],
  billing: {
    tourBilling: null,
    weeklyBilling: null,
    monthlyBilling: null,
  },
  loading: false,
  error: null,
  errorCode: null,
};

const tourSlice = createSlice({
  name: "tour",
  initialState,
  reducers: {
    clearSelectedTour(state) {
      state.selectedTour = null;
    },
    clearBilling(state) {
      state.billing = {
        tourBilling: null,
        weeklyBilling: null,
        monthlyBilling: null,
      };
    },
    updateSelectedTour(state, action: { payload: Partial<TourDTO> }) {
      if (state.selectedTour) {
        state.selectedTour = {
          ...state.selectedTour,
          ...action.payload,
        };
      }
    },
    resetTours(state) {
      state.tours = [];
      state.presences = [];
      state.loading = false;
      state.error = null;
      state.errorCode = null;
    },
  },
  extraReducers: (builder) => {
    addTourCrudExtraReducers(builder);
    addTourPatientManagementExtraReducers(builder);
    addTourPresenceExtraReducers(builder);
    addTourNoteExtraReducers(builder);
    addTourSharingExtraReducers(builder);
    addTourOrderExtraReducers(builder);
    addTourBillingExtraReducers(builder);
    builder.addCase(PURGE, () => initialState);
  },
});

export const { clearSelectedTour, clearBilling, updateSelectedTour, resetTours } = tourSlice.actions;

export {
  fetchAllTours,
  fetchTourById,
  fetchToursByNurseId,
  fetchToursByPatientId,
  fetchToursByNurseIdAndDate,
  createTour,
  updateTour,
  deleteTour,
  addPatientToTour,
  updatePatientDetails,
  removePatientFromTour,
  markPatientPresence,
  markPatientPresenceRange,
  fetchPresenceByTourIdAndDate,
  fetchPresenceByTourIdAndDateRange,
  addPatientNote,
  fetchTourNotes,
  updatePatientNote,
  deletePatientNote,
  fetchGlobalNotes,
  shareTour,
  reorderPatientsByActs,
  optimizeTour,
  updatePatientOrder,
  fetchTourBilling,
  fetchWeeklyBilling,
  fetchMonthlyBilling,
};

export default tourSlice.reducer;
