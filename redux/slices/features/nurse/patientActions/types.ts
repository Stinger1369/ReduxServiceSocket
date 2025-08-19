export interface CreatePatientFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
  preferredLanguage: string;
  vitaleCardIds: string[];
  pseudo: string;
  address: string;
  placeId: string;
  latitude: number;
  longitude: number;
  professionalActs: ProfessionalAct[];
  countryCode: string;
}

export interface ProfessionalAct {
  actCode?: string;
  passagesPerDay?: number;
  scheduledTime?: string;
  hygieneLevel?: string;
  eliminationLevel?: string;
  mobilityLevel?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PatientDTO {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  age?: number;
  gender?: string;
  email?: string;
  phoneNumber?: string;
  pseudo?: string;
  address?: any;
  latitude?: number;
  longitude?: number;
  nurseId?: string;
  imageIds?: string[];
  idCardIds?: string[];
  vitaleCardIds?: string[];
  primaryImageId?: string;
  isVerified?: boolean;
  isPublic?: boolean;
  isActive?: boolean;
  preferredLanguage?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  region?: string;
  professionalActs?: ProfessionalAct[];
  hygieneLevel?: string;
  eliminationLevel?: string;
  mobilityLevel?: string;
}

export interface NurseState {
  nurses: any[];
  selectedNurse: any;
  patients: PatientDTO[];
  selectedPatient: PatientDTO | null;
  suggestions: any[];
  patientImages: { [key: string]: any[] };
  professionalActs: { [key: string]: ProfessionalAct[] };
  monthlyBilling: { [key: string]: any };
  tours: any[];
  loading: boolean;
  loadingPatients: { [key: string]: boolean };
  loadingTours: boolean;
  error: string | null;
  errorCode: string | null;
}