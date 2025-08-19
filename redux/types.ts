export interface ErrorResponse {
  error: string;
  message?: string;
  action?: string;
  isVerified?: boolean;
  role?: string;
  email?: string;
  remainingSeconds?: string;
  resetCode?: string;
}

export interface ImageData {
  id: string;
  url: string;
  name: string;
  isPrimary: boolean;
  userId?: string;
  userType?: "nurse" | "patient";
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ImageState {
  images: Record<string, ImageData>;
  loading: boolean;
  userImages: Record<string, ImageData[]>;
  error: string | null;
}

export interface ImageDTO {
  id: string;
  userId: string;
  userType: "nurse" | "patient";
  name: string;
  url: string;
  isPrimary?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface User {
  _id: string;
  email: string;
  pseudo: string;
  role: "NURSE" | "PATIENT";
  firstName?: string;
  lastName?: string;
  isOnline?: boolean;
  lastConnectedAt?: string | null;
  imageIds?: string[];
  primaryImageId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  preferredLanguage: string;
  loading: boolean;
  error: string | null;
  errorAction: string | null;
  passwordChangeSuccess: boolean;
  isVerified: boolean;
  verificationSuccess: boolean;
  resendCooldown: number;
  resetCode: string | null;
  isInPasswordResetFlow: boolean;
}

export interface LocationDTO {
  latitude: number;
  longitude: number;
}

export interface AddressDTO {
  placeId: string;
  address: string;
  streetNumber?: string;
  route?: string;
  sublocality?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface AddressSuggestionDTO {
  placeId: string;
  description: string;
}

export interface Availability {
  workingHours: string;
}

export interface ProfessionalActDTO {
  actCode: string;
  passagesPerDay: number;
  scheduledTime: string;
  hygieneLevel?: number;
  eliminationLevel?: number;
  mobilityLevel?: number;
  applyNightMajoration?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  patientId?: string;
}

export interface NurseDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "NURSE";
  birthDate?: string | Date;
  gender?: string;
  phoneNumber?: string;
  pseudo: string;
  address?: AddressDTO;
  latitude?: number;
  longitude?: number;
  patientIds?: string[];
  colleagueIds?: string[];
  tourIds?: string[];
  imageIds?: string[];
  primaryImageId?: string;
  vitaleCardIds?: string[];
  professionalCardIds?: string[];
  kbisIds?: string[];
  idCardIds?: string[];
  preferredLanguage?: string;
  licenseNumber?: string;
  specialties?: string;
  yearsOfExperience?: number;
  certifications?: string;
  availability?: Availability;
  isVerified: boolean;
  isActive: boolean;
  deactivatedAt?: string | null;
  activatedAt?: string | null;
  deactivationCount?: number;
}

export interface PatientDTO {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: string;
  email?: string;
  phoneNumber?: string;
  pseudo: string;
  address?: AddressDTO;
  latitude?: number;
  longitude?: number;
  nurseId?: string;
  tourIds?: string[];
  imageIds?: string[];
  idCardIds?: string[];
  vitaleCardIds?: string[];
  primaryImageId?: string;
  isVerified: boolean;
  isPublic?: boolean;
  isActive?: boolean;
  preferredLanguage?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  medicalHistory?: string[];
  region?: string;
  professionalActs?: ProfessionalActDTO[];
  hygieneLevel?: number;
  eliminationLevel?: number;
  mobilityLevel?: number;
}

export interface NurseState {
  nurses: NurseDTO[];
  selectedNurse: NurseDTO | null;
  patients: PatientDTO[];
  suggestions: AddressSuggestionDTO[];
  patientImages: Record<string, ImageDTO[]>;
  professionalActs: Record<string, ProfessionalActDTO[]>;
  monthlyBilling: Record<string, number>;
  tours: TourDTO[];
  loading: boolean;
  loadingPatients: Record<string, boolean>;
  loadingTours: boolean;
  error: string | null;
  errorCode?: string | null;
}

export interface PatientState {
  patients: PatientDTO[];
  selectedPatient: PatientDTO | null;
  matchingNurses?: NurseDTO[];
  loading: boolean;
  error: string | null;
  errorCode?: string | null;
}

export interface TourDTO {
  id: string;
  name: string;
  nurseId: string;
  nurseIds: string[];
  patientIds: string[];
  patientOrder: string[];
  patientJoinDates: { [patientId: string]: string };
  patientDetails?: {
    [patientId: string]: {
      isPermanent: boolean;
      days: string[];
    };
  };
  patientAbsentDates?: { [patientId: string]: string[] };
  noteIds?: string[];
  notes?: TourNoteDTO[];
  initialSharings?: TourSharingDTO[];
  days: number[];
  date?: string;
  startTime?: string;
  endTime?: string;
  scheduledTimes?: { [patientId: string]: string[] };
  status: string;
  recurrence: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isPrimary?: boolean;
}

export interface TourNoteDTO {
  id: string;
  text: string;
  date: string;
  weekPeriod?: string;
  timestamp: string;
  author: string;
  type: string;
  patientId?: string;
  recurringDays?: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TourInvitationDTO {
  id?: string;
  tourId: string;
  invitedEmail: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  token?: string;
  invitedAt?: string;
  acceptedAt?: string;
}

export interface TourSharingDTO {
  id?: string;
  tourId: string;
  nurseId?: string;
  startDate: string;
  endDate: string;
  type: string;
  days?: number[];
  active?: boolean;
  noteIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TourBillingDTO {
  tourId: string;
  tourName: string;
  nurseId: string;
  patients: {
    patientId: string;
    firstName: string;
    lastName: string;
    isAbsent: boolean;
    acts: {
      actCode: string;
      cost: number;
    }[];
    total: number;
  }[];
  total: number;
  warnings: string[];
}

export interface TourPatientPresenceDTO {
  id: string;
  tourId: string;
  patientId: string;
  date: string;
  present: boolean;
  updatedBy: string;
  updatedAt: string;
  noteId?: string;
}

export interface TourPatientPresenceState {
  presences: TourPatientPresenceDTO[];
  loading: boolean;
  error: string | null;
  errorCode: number | null;
}

export interface TourState {
  tours: TourDTO[];
  selectedTour: TourDTO | null;
  billing: {
    tourBilling: TourBillingDTO | null;
    weeklyBilling: number | null;
    monthlyBilling: number | null;
  };
  presences: TourPatientPresenceDTO[];
  loading: boolean;
  error: string | null;
  errorCode: number | null;
}

export interface RootState {
  auth: AuthState;
  image: ImageState;
  nurse: NurseState;
  patient: PatientState;
  tour: TourState;
  tourPatientPresence: TourPatientPresenceState;
  nurseRecord: NurseRecordState;
  patientRecord: PatientRecordState;
}

export interface LoginRequest {
  email: string;
  password: string;
  role?: "NURSE" | "PATIENT";
}

export interface LoginResponse {
  id?: string;
  token: string;
  isVerified: boolean;
  role: "NURSE" | "PATIENT";
}

export interface RegisterRequest {
  email: string;
  password: string;
  pseudo: string;
  role?: "NURSE" | "PATIENT";
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber: string;
  countryCode?: string;
  language?: string;
  address?: AddressDTO;
  location?: LocationDTO;
  licenseNumber?: string;
  specialties?: string;
  yearsOfExperience?: number;
  certifications?: string;
  vitaleCardIds?: string[];
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface CreatePatientByNurseRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  pseudo: string;
  birthDate?: string;
  gender?: string;
  address?: AddressDTO;
  latitude?: number;
  longitude?: number;
  vitaleCardIds?: string[];
  password?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface NurseRecord {
  id?: string;
  nurseId: string;
  recordUrl: string;
  recordType: "id_card" | "vitale_card" | "professional_card" | "kbis";
  validated: boolean;
  recordData: {
    recordNumber?: string;
    recordCategory?: string;
    firstName?: string;
    lastName?: string;
    serialNumber?: string;
    secondName?: string;
    gender?: string;
    nationality?: string;
    birthDate?: string;
    birthPlace?: string;
    alternateName?: string;
    expiryDate?: string;
    rppsNumber?: string;
  } | null;
  statusMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NurseRecordState {
  records: Record<string, NurseRecord>;
  loading: boolean;
  error: string | null;
}

export interface PatientRecord {
  id?: string;
  patientId: string;
  recordUrl: string;
  recordType: "id_card" | "vitale_card";
  validated: boolean;
  recordData: {
    recordNumber?: string;
    recordCategory?: string;
    firstName?: string;
    lastName?: string;
    serialNumber?: string;
    secondName?: string;
    gender?: string;
    nationality?: string;
    birthDate?: string;
    birthPlace?: string;
    alternateName?: string;
    expiryDate?: string;
  } | null;
  statusMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientRecordState {
  records: Record<string, PatientRecord>;
  loading: boolean;
  error: string | null;
}
