import { ActionReducerMapBuilder } from "@reduxjs/toolkit";
import { NurseState } from "../../../types";
import {
  addPatientToNurse,
  addPatientToNurseExtraReducers,
} from "./patientActions/addPatientToNurse";
import {
  createPatientByNurse,
  createPatientByNurseExtraReducers,
} from "./patientActions/createPatientByNurse";
import {
  fetchNursePatientsByNurseId,
  fetchNursePatientsByNurseIdExtraReducers,
} from "./patientActions/fetchNursePatientsByNurseId";
import {
  fetchAllNursePatients,
  fetchAllNursePatientsExtraReducers,
} from "./patientActions/fetchAllNursePatients";
import {
  fetchNursePatientById,
  fetchNursePatientByIdExtraReducers,
} from "./patientActions/fetchNursePatientById";
import {
  fetchAllPatientImagesByNurseId,
  fetchAllPatientImagesByNurseIdExtraReducers,
} from "./patientActions/fetchAllPatientImagesByNurseId";
import {
  fetchActivePatientsByNurseId,
  fetchActivePatientsByNurseIdExtraReducers,
} from "./patientActions/fetchActivePatientsByNurseId";
import {
  updatePatientByNurse,
  updatePatientByNurseExtraReducers,
} from "./patientActions/updatePatientByNurse";
import {
  deletePatientByNurse,
  deletePatientByNurseExtraReducers,
} from "./patientActions/deletePatientByNurse";
import {
  unassignPatientFromNurse,
  unassignPatientFromNurseExtraReducers,
} from "./patientActions/unassignPatientFromNurse";
import {
  setPatientVisibility,
  setPatientVisibilityExtraReducers,
} from "./patientActions/setPatientVisibility";
import {
  delegatePatientToNurse,
  delegatePatientToNurseExtraReducers,
} from "./patientActions/delegatePatientToNurse";
import {
  delegatePatientByVitaleCard,
  delegatePatientByVitaleCardExtraReducers,
} from "./patientActions/delegatePatientByVitaleCard";
import {
  assignProfessionalAct,
  fetchProfessionalActs,
  fetchBatchProfessionalActs,
  updateProfessionalAct,
  deleteProfessionalAct,
  fetchMonthlyBilling,
  addProfessionalActExtraReducers,
} from "./patientActions/professionalActActions";

export {
  addPatientToNurse,
  createPatientByNurse,
  fetchNursePatientsByNurseId,
  fetchAllNursePatients,
  fetchNursePatientById,
  fetchAllPatientImagesByNurseId,
  fetchActivePatientsByNurseId,
  updatePatientByNurse,
  deletePatientByNurse,
  unassignPatientFromNurse,
  setPatientVisibility,
  delegatePatientToNurse,
  delegatePatientByVitaleCard,
  assignProfessionalAct,
  fetchProfessionalActs,
  fetchBatchProfessionalActs,
  updateProfessionalAct,
  deleteProfessionalAct,
  fetchMonthlyBilling,
};

export const addPatientExtraReducers = (
  builder: ActionReducerMapBuilder<NurseState>
) => {
  addPatientToNurseExtraReducers(builder);
  createPatientByNurseExtraReducers(builder);
  fetchNursePatientsByNurseIdExtraReducers(builder);
  fetchAllNursePatientsExtraReducers(builder);
  fetchNursePatientByIdExtraReducers(builder);
  fetchAllPatientImagesByNurseIdExtraReducers(builder);
  fetchActivePatientsByNurseIdExtraReducers(builder);
  updatePatientByNurseExtraReducers(builder);
  deletePatientByNurseExtraReducers(builder);
  unassignPatientFromNurseExtraReducers(builder);
  setPatientVisibilityExtraReducers(builder);
  delegatePatientToNurseExtraReducers(builder);
  delegatePatientByVitaleCardExtraReducers(builder);
  addProfessionalActExtraReducers(builder);
};