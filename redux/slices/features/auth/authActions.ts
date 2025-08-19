// // src/redux/slices/features/auth/authActions.ts
// import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
// import apiClient from "../../../../api/apiClient";
// import {
//   LoginRequest,
//   LoginResponse,
//   RegisterRequest,
//   CreatePatientByNurseRequest,
//   ErrorResponse,
//   AuthState,
// } from "../../../types";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { setPreferredLanguage } from "../../authSlice";
// import { updateNurseLanguage } from "../nurse/profileActions";
// import { updatePatientLanguage } from "../patient/manageActions";

// // Action asynchrone pour restaurer l'état d'authentification
// export const restoreAuthState = createAsyncThunk<
//   {
//     token: string | null;
//     isAuthenticated: boolean;
//     isVerified: boolean;
//     user: {
//       _id: string;
//       email: string;
//       role: string;
//       firstName?: string;
//       lastName?: string;
//       imageIds: string[];
//       primaryImageId: string | null;
//     } | null;
//   },
//   void,
//   { rejectValue: ErrorResponse }
// >("auth/restoreAuthState", async (_, { rejectWithValue }) => {
//   try {
//     console.log("Starting restoreAuthState...");
//     const token = await AsyncStorage.getItem("token");
//     const preferredLanguage = await AsyncStorage.getItem("preferredLanguage");
//     const userString = await AsyncStorage.getItem("user");
//     const user = userString ? JSON.parse(userString) : null;
//     console.log("Token from AsyncStorage:", token);
//     console.log("Preferred Language from AsyncStorage:", preferredLanguage);
//     console.log("User from AsyncStorage:", user);

//     if (token) {
//       console.log("Verifying token with /api/auth/verify-token...");
//       const response = await apiClient.get("/api/auth/verify-token", {
//         headers: { Authorization: `Bearer ${token}` },
//         timeout: 5000,
//       });
//       console.log("Verify token response:", response);

//       let updatedUser;
//       if (response.role === "NURSE") {
//         if (!response.id) {
//           console.warn(
//             "No ID returned from /api/auth/verify-token, using stored user ID if available"
//           );
//           if (!user?._id) {
//             throw new Error("No user ID available to fetch nurse data");
//           }
//           console.log("Fetching full nurse data for user ID:", user._id);
//           const nurseResponse = await apiClient.get(`/api/nurses/${user._id}`);
//           console.log("Full nurse data response:", nurseResponse);
//           updatedUser = {
//             _id: nurseResponse.id,
//             email: nurseResponse.email,
//             role: response.role,
//             firstName: nurseResponse.firstName,
//             lastName: nurseResponse.lastName,
//             imageIds: nurseResponse.imageIds || [],
//             primaryImageId: nurseResponse.primaryImageId || null,
//           };
//         } else {
//           console.log("Fetching full nurse data for user ID:", response.id);
//           const nurseResponse = await apiClient.get(
//             `/api/nurses/${response.id}`
//           );
//           console.log("Full nurse data response:", nurseResponse);
//           updatedUser = {
//             _id: nurseResponse.id,
//             email: nurseResponse.email,
//             role: response.role,
//             firstName: nurseResponse.firstName,
//             lastName: nurseResponse.lastName,
//             imageIds: nurseResponse.imageIds || [],
//             primaryImageId: nurseResponse.primaryImageId || null,
//           };
//         }
//       } else if (response.role === "PATIENT") {
//         if (!response.id) {
//           console.warn(
//             "No ID returned from /api/auth/verify-token, using stored user ID if available"
//           );
//           if (!user?._id) {
//             throw new Error("No user ID available to fetch patient data");
//           }
//           console.log("Fetching full patient data for user ID:", user._id);
//           const patientResponse = await apiClient.get(
//             `/api/patients/${user._id}`
//           );
//           console.log("Full patient data response:", patientResponse);
//           updatedUser = {
//             _id: patientResponse.id,
//             email: patientResponse.email,
//             role: response.role,
//             firstName: patientResponse.firstName,
//             lastName: patientResponse.lastName,
//             imageIds: patientResponse.imageIds || [],
//             primaryImageId: patientResponse.primaryImageId || null,
//           };
//         } else {
//           console.log("Fetching full patient data for user ID:", response.id);
//           const patientResponse = await apiClient.get(
//             `/api/patients/${response.id}`
//           );
//           console.log("Full patient data response:", patientResponse);
//           updatedUser = {
//             _id: patientResponse.id,
//             email: patientResponse.email,
//             role: response.role,
//             firstName: patientResponse.firstName,
//             lastName: patientResponse.lastName,
//             imageIds: patientResponse.imageIds || [],
//             primaryImageId: patientResponse.primaryImageId || null,
//           };
//         }
//       } else {
//         console.error("Unknown role in verify-token response:", response.role);
//         throw new Error("Unknown user role");
//       }

//       if (!updatedUser._id) {
//         console.error(
//           "restoreAuthState: _id is missing in updatedUser:",
//           updatedUser
//         );
//         throw new Error("User ID is missing after verification");
//       }

//       await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

//       return {
//         token,
//         isAuthenticated: true,
//         isVerified: response.isVerified,
//         user: updatedUser,
//       };
//     }

//     console.log("No token found, returning default state...");
//     return {
//       token: null,
//       isAuthenticated: false,
//       isVerified: false,
//       user: user || null,
//     };
//   } catch (error: any) {
//     console.error(
//       "Restore auth state error:",
//       error.message,
//       error.response?.data
//     );
//     // Ne pas supprimer le token et l'utilisateur sauf si le token est explicitement invalide
//     if (error.response?.status === 401) {
//       await AsyncStorage.removeItem("token");
//       await AsyncStorage.removeItem("user");
//     }
//     return {
//       token: null,
//       isAuthenticated: false,
//       isVerified: false,
//       user: null,
//     };
//   }
// });

// // Action asynchrone pour la connexion
// export const login = createAsyncThunk<
//   LoginResponse,
//   LoginRequest,
//   { rejectValue: ErrorResponse }
// >(
//   "auth/login",
//   async (credentials, { rejectWithValue, dispatch, getState }) => {
//     console.log("Dispatching login with:", credentials);
//     try {
//       const state = getState() as any;
//       const preferredLanguage = state.auth.preferredLanguage || "en";

//       const response = await apiClient.post("/api/auth/login", {
//         email: credentials.email,
//         password: credentials.password,
//         preferredLanguage,
//       });
//       console.log("Login response:", response);
//       await AsyncStorage.setItem("token", response.token);

//       let user;
//       if (response.role === "NURSE" && response.id) {
//         console.log("Fetching full nurse data for user ID:", response.id);
//         const nurseResponse = await apiClient.get(`/api/nurses/${response.id}`);
//         console.log("Full nurse data response:", nurseResponse);
//         user = {
//           _id: nurseResponse.id,
//           email: nurseResponse.email,
//           role: response.role,
//           firstName: nurseResponse.firstName,
//           lastName: nurseResponse.lastName,
//           imageIds: nurseResponse.imageIds || [],
//           primaryImageId: nurseResponse.primaryImageId || null,
//         };
//         if (nurseResponse.preferredLanguage !== preferredLanguage) {
//           await dispatch(
//             updateNurseLanguage({
//               nurseId: user._id,
//               language: preferredLanguage,
//             })
//           ).unwrap();
//           console.log(`Synchronized nurse language to ${preferredLanguage}`);
//         }
//       } else if (response.role === "PATIENT" && response.id) {
//         console.log("Fetching full patient data for user ID:", response.id);
//         const patientResponse = await apiClient.get(
//           `/api/patients/${response.id}`
//         );
//         console.log("Full patient data response:", patientResponse);
//         user = {
//           _id: patientResponse.id,
//           email: patientResponse.email,
//           role: response.role,
//           firstName: patientResponse.firstName,
//           lastName: patientResponse.lastName,
//           imageIds: patientResponse.imageIds || [],
//           primaryImageId: patientResponse.primaryImageId || null,
//         };
//         if (patientResponse.preferredLanguage !== preferredLanguage) {
//           await dispatch(
//             updatePatientLanguage({
//               patientId: user._id,
//               language: preferredLanguage,
//             })
//           ).unwrap();
//           console.log(`Synchronized patient language to ${preferredLanguage}`);
//         }
//       } else {
//         user = {
//           _id: response.id,
//           email: credentials.email,
//           role: response.role,
//           firstName: response.firstName,
//           lastName: response.lastName,
//           imageIds: response.imageIds || [],
//           primaryImageId: response.primaryImageId || null,
//         };
//       }

//       if (!user._id) {
//         console.error("login: _id is missing in user:", user);
//         throw new Error("User ID is missing after login");
//       }

//       await AsyncStorage.setItem("user", JSON.stringify(user));
//       await dispatch(setPreferredLanguage(preferredLanguage));
//       return {
//         id: response.id,
//         token: response.token,
//         isVerified: response.isVerified,
//         role: response.role,
//       } as LoginResponse;
//     } catch (error: any) {
//       console.error("Login error:", error.message, error.response?.data);
//       const errorResponse = error.response?.data || {
//         error: error.message || "Login failed",
//         action: "Please try again.",
//       };
//       return rejectWithValue({
//         error: errorResponse.error || "Login failed",
//         action: errorResponse.action || "Please try again.",
//         email: credentials.email,
//         role: errorResponse.role || "",
//         isVerified: errorResponse.isVerified || false,
//       });
//     }
//   }
// );

// // Action asynchrone pour l'inscription
// export const register = createAsyncThunk<
//   LoginResponse,
//   RegisterRequest,
//   { rejectValue: ErrorResponse }
// >(
//   "auth/register",
//   async (userData, { rejectWithValue, dispatch, getState }) => {
//     console.log("Dispatching register with:", userData);
//     try {
//       const state = getState() as any;
//       const preferredLanguage = state.auth.preferredLanguage || "en";

//       const response = await apiClient.post("/api/auth/register", {
//         ...userData,
//         preferredLanguage,
//       });
//       const token = response.token;
//       const isVerified = response.isVerified;
//       const role = response.role;
//       await AsyncStorage.setItem("token", token);

//       let user;
//       if (response.role === "NURSE" && response.id) {
//         console.log("Fetching full nurse data for user ID:", response.id);
//         const nurseResponse = await apiClient.get(`/api/nurses/${response.id}`);
//         console.log("Full nurse data response:", nurseResponse);
//         user = {
//           _id: nurseResponse.id,
//           email: nurseResponse.email,
//           role: response.role,
//           firstName: nurseResponse.firstName,
//           lastName: nurseResponse.lastName,
//           imageIds: nurseResponse.imageIds || [],
//           primaryImageId: nurseResponse.primaryImageId || null,
//         };
//         if (nurseResponse.preferredLanguage !== preferredLanguage) {
//           await dispatch(
//             updateNurseLanguage({
//               nurseId: user._id,
//               language: preferredLanguage,
//             })
//           ).unwrap();
//           console.log(`Synchronized nurse language to ${preferredLanguage}`);
//         }
//       } else {
//         console.log("Fetching full patient data for user ID:", response.id);
//         const patientResponse = await apiClient.get(
//           `/api/patients/${response.id}`
//         );
//         console.log("Full patient data response:", patientResponse);
//         user = {
//           _id: patientResponse.id,
//           email: patientResponse.email,
//           role: response.role,
//           firstName: patientResponse.firstName,
//           lastName: patientResponse.lastName,
//           imageIds: patientResponse.imageIds || [],
//           primaryImageId: patientResponse.primaryImageId || null,
//         };
//         if (patientResponse.preferredLanguage !== preferredLanguage) {
//           await dispatch(
//             updatePatientLanguage({
//               patientId: user._id,
//               language: preferredLanguage,
//             })
//           ).unwrap();
//           console.log(`Synchronized patient language to ${preferredLanguage}`);
//         }
//       }

//       await AsyncStorage.setItem("user", JSON.stringify(user));
//       await dispatch(setPreferredLanguage(preferredLanguage));
//       return {
//         id: response.id,
//         token: response.token,
//         isVerified: response.isVerified,
//         role: response.role,
//       } as LoginResponse;
//     } catch (error: any) {
//       console.error("Register error:", error.message, error.response?.data);
//       const errorResponse = error.response?.data || {
//         error: error.message || "Registration failed",
//         action: "Please try again.",
//       };
//       return rejectWithValue({
//         error: errorResponse.error || "Registration failed",
//         action: errorResponse.action || "Please try again.",
//         email: userData.email,
//         role: errorResponse.role || "",
//         isVerified: errorResponse.isVerified || false,
//       });
//     }
//   }
// );

// // Action asynchrone pour permettre à une infirmière de créer un compte patient
// export const createPatientByNurse = createAsyncThunk<
//   LoginResponse,
//   CreatePatientByNurseRequest,
//   { rejectValue: ErrorResponse }
// >(
//   "auth/createPatientByNurse",
//   async (patientData, { rejectWithValue, dispatch, getState }) => {
//     console.log("Dispatching createPatientByNurse with:", patientData);
//     try {
//       const state = getState() as any;
//       const preferredLanguage = state.auth.preferredLanguage || "en";

//       const response = await apiClient.post(
//         "/api/auth/create-patient-by-nurse",
//         {
//           email: patientData.email,
//           password: patientData.password,
//           nurseId: patientData.nurseId,
//           phoneNumber: patientData.phoneNumber,
//           preferredLanguage,
//         }
//       );
//       const token = response.token;
//       const isVerified = response.isVerified;
//       const role = response.role;
//       await AsyncStorage.setItem("token", token);

//       const user = {
//         _id: response.id,
//         email: patientData.email,
//         role: response.role,
//         imageIds: response.imageIds || [],
//         primaryImageId: response.primaryImageId || null,
//       };

//       console.log("Fetching full patient data for user ID:", response.id);
//       const patientResponse = await apiClient.get(
//         `/api/patients/${response.id}`
//       );
//       console.log("Full patient data response:", patientResponse);
//       if (patientResponse.preferredLanguage !== preferredLanguage) {
//         await dispatch(
//           updatePatientLanguage({
//             patientId: user._id,
//             language: preferredLanguage,
//           })
//         ).unwrap();
//         console.log(`Synchronized patient language to ${preferredLanguage}`);
//       }

//       await AsyncStorage.setItem("user", JSON.stringify(user));
//       await dispatch(setPreferredLanguage(preferredLanguage));
//       return {
//         id: response.id,
//         token: response.token,
//         isVerified: response.isVerified,
//         role: response.role,
//       } as LoginResponse;
//     } catch (error: any) {
//       console.error(
//         "Create patient error:",
//         error.message,
//         error.response?.data
//       );
//       const errorResponse = error.response?.data || {
//         error: error.message || "Failed to create patient",
//         action: "Please try again.",
//       };
//       return rejectWithValue({
//         error: errorResponse.error || "Failed to create patient",
//         action: errorResponse.action || "Please try again.",
//         email: patientData.email,
//         role: errorResponse.role || "",
//         isVerified: errorResponse.isVerified || false,
//       });
//     }
//   }
// );

// // Fonction pour ajouter les extraReducers spécifiques à authActions
// export const addAuthExtraReducers = (
//   builder: ActionReducerMapBuilder<AuthState>
// ) => {
//   builder
//     // setPreferredLanguage
//     .addCase(setPreferredLanguage.fulfilled, (state, action) => {
//       state.preferredLanguage = action.payload;
//     })
//     // restoreAuthState
//     .addCase(restoreAuthState.pending, (state) => {
//       state.loading = true;
//     })
//     .addCase(restoreAuthState.fulfilled, (state, action) => {
//       state.loading = false;
//       state.isAuthenticated = action.payload.isAuthenticated;
//       state.token = action.payload.token;
//       state.isVerified = action.payload.isVerified;
//       state.user = action.payload.user;
//       console.log("Restored auth state:", action.payload);
//     })
//     .addCase(restoreAuthState.rejected, (state) => {
//       state.loading = false;
//       state.isAuthenticated = false;
//       state.token = null;
//       state.isVerified = false;
//       state.user = null;
//     })
//     // login
//     .addCase(login.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//       state.errorAction = null;
//     })
//     .addCase(login.fulfilled, (state, action) => {
//       state.loading = false;
//       state.isAuthenticated = true;
//       state.token = action.payload.token;
//       state.isVerified = action.payload.isVerified;
//       state.user = {
//         _id: action.payload.id,
//         email: action.meta.arg.email,
//         role: action.payload.role,
//         firstName: action.payload.firstName,
//         lastName: action.payload.lastName,
//         imageIds: action.payload.imageIds || [],
//         primaryImageId: action.payload.primaryImageId || null,
//       };
//       state.resendCooldown = 0;
//       state.resetCode = null;
//       console.log("Login fulfilled, user:", state.user);
//     })
//     .addCase(login.rejected, (state, action) => {
//       state.loading = false;
//       state.isAuthenticated = false;
//       state.error = action.payload?.error || "Login failed";
//       state.errorAction = action.payload?.action || "Please try again.";
//       state.isVerified = action.payload?.isVerified || false;

//       state.user = {
//         email: action.payload?.email || action.meta.arg.email,
//         role: action.payload?.role || "",
//         imageIds: [],
//         _id: "",
//         primaryImageId: null,
//       };

//       AsyncStorage.removeItem("token");
//       console.log(
//         "Login rejected, error:",
//         state.error,
//         "action:",
//         state.errorAction
//       );
//     })
//     // register
//     .addCase(register.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//       state.errorAction = null;
//     })
//     .addCase(register.fulfilled, (state, action) => {
//       state.loading = false;
//       state.isAuthenticated = true;
//       state.token = action.payload.token;
//       state.isVerified = action.payload.isVerified;
//       state.user = {
//         _id: action.payload.id,
//         email: action.meta.arg.email,
//         role: action.payload.role,
//         firstName: action.meta.arg.firstName,
//         lastName: action.meta.arg.lastName,
//         imageIds: action.payload.imageIds || [],
//         primaryImageId: action.payload.primaryImageId || null,
//       };
//       state.resendCooldown = 0;
//       state.resetCode = null;
//       console.log("Register fulfilled, user:", state.user);
//     })
//     .addCase(register.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload?.error || "Registration failed";
//       state.errorAction = action.payload?.action || "Please try again.";
//       console.log(
//         "Register rejected, error:",
//         state.error,
//         "action:",
//         state.errorAction
//       );
//     })
//     // createPatientByNurse
//     .addCase(createPatientByNurse.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//       state.errorAction = null;
//     })
//     .addCase(createPatientByNurse.fulfilled, (state, action) => {
//       state.loading = false;
//       state.isAuthenticated = true;
//       state.token = action.payload.token;
//       state.isVerified = action.payload.isVerified;
//       state.user = {
//         _id: action.payload.id,
//         email: action.meta.arg.email,
//         role: action.payload.role,
//         imageIds: action.payload.imageIds || [],
//         primaryImageId: action.payload.primaryImageId || null,
//       };
//       state.resendCooldown = 0;
//       state.resetCode = null;
//       console.log("Create patient fulfilled, user:", state.user);
//     })
//     .addCase(createPatientByNurse.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload?.error || "Failed to create patient";
//       state.errorAction = action.payload?.action || "Please try again.";
//       console.log(
//         "Create patient rejected, error:",
//         state.error,
//         "action:",
//         state.errorAction
//       );
//     });
// };
