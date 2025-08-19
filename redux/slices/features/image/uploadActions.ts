import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { ImageState } from "../../../types";
import { fetchAllImages } from "./fetchActions";
import { mapImageUploadError } from "../../../../utils/erreurImage";

// Upload a new image
export const uploadImage = createAsyncThunk(
  "image/uploadImage",
  async (
    {
      userId,
      userType,
      formData,
    }: { userId: string; userType: string; formData: FormData },
    { rejectWithValue, dispatch }
  ) => {
    try {
      console.log(
        "uploadImage: Envoi de la requête avec userId:",
        userId,
        "userType:",
        userType
      );
      const response = await apiClient.post("/api/images/upload", formData);
      console.log(
        "uploadImage: Réponse brute du backend:",
        JSON.stringify(response, null, 2)
      );

      // Vérification des champs attendus
      if (!response.id || !response.url || !response.name) {
        console.error("uploadImage: Champs manquants dans la réponse:", {
          id: response.id,
          url: response.url,
          name: response.name,
          rawResponse: response,
        });
        throw new Error(
          "Réponse du backend incomplète : champs manquants (id, url, name)"
        );
      }

      // Gérer isPrimary/is_primary
      const isPrimary = response.isPrimary ?? response.is_primary ?? false;
      console.log("uploadImage: isPrimary value:", isPrimary);

      // Re-fetch images to ensure state is updated
      console.log("uploadImage: Dispatch de fetchAllImages");
      await dispatch(fetchAllImages({ userId, userType })).unwrap();

      return {
        key: response.id,
        id: response.id,
        url: response.url,
        name: response.name,
        isPrimary: isPrimary,
      };
    } catch (error: any) {
      console.error("uploadImage: Erreur capturée:", error);
      const errorMessage =
        error.response?.data || error.message || "Échec de l'upload de l'image";

      // Mapper l'erreur avec mapImageUploadError
      const errorKey = mapImageUploadError(errorMessage);

      // Gestion des erreurs génériques
      if (errorKey === "genericError") {
        const genericErrorMessage =
          error.response?.status === 400
            ? typeof error.response?.data === "string"
              ? error.response.data
              : error.response?.data?.error || "Requête invalide"
            : error.response?.status === 409
            ? error.response?.data?.error || "Conflit"
            : error.response?.data?.error || "Échec de l'upload de l'image";
        return rejectWithValue(genericErrorMessage);
      }

      return rejectWithValue(errorKey);
    }
  }
);

// Update an existing image
export const updateImage = createAsyncThunk(
  "image/updateImage",
  async (
    {
      userId,
      userType,
      name,
      formData,
    }: { userId: string; userType: string; name: string; formData: FormData },
    { rejectWithValue, dispatch }
  ) => {
    try {
      console.log(
        "updateImage: Envoi de la requête avec userId:",
        userId,
        "name:",
        name,
        "userType:",
        userType
      );
      const response = await apiClient.put(
        `/api/images/update/${userId}/${userType}/${name}`,
        formData
      );
      console.log(
        "updateImage: Réponse brute du backend:",
        JSON.stringify(response, null, 2)
      );

      // Vérification des champs attendus
      if (!response.id || !response.url || !response.name) {
        console.error("updateImage: Champs manquants dans la réponse:", {
          id: response.id,
          url: response.url,
          name: response.name,
          rawResponse: response,
        });
        throw new Error(
          "Réponse du backend incomplète : champs manquants (id, url, name)"
        );
      }

      // Gérer isPrimary/is_primary
      const isPrimary = response.isPrimary ?? response.is_primary ?? false;
      console.log("updateImage: isPrimary value:", isPrimary);

      await dispatch(fetchAllImages({ userId, userType })).unwrap();

      return {
        key: response.id,
        id: response.id,
        url: response.url,
        name: response.name,
        isPrimary: isPrimary,
      };
    } catch (error: any) {
      console.error("updateImage: Erreur capturée:", error);
      const errorMessage =
        error.response?.data ||
        error.message ||
        "Échec de la mise à jour de l'image";

      // Mapper l'erreur avec mapImageUploadError
      const errorKey = mapImageUploadError(errorMessage);

      // Gestion des erreurs génériques
      if (errorKey === "genericError") {
        const genericErrorMessage =
          error.response?.status === 400
            ? typeof error.response?.data === "string"
              ? error.response.data
              : error.response?.data?.error || "Requête invalide"
            : error.response?.status === 404
            ? error.response?.data?.error || "Image non trouvée"
            : error.response?.data?.error ||
              "Échec de la mise à jour de l'image";
        return rejectWithValue(genericErrorMessage);
      }

      return rejectWithValue(errorKey);
    }
  }
);

// Fonction pour ajouter les extraReducers spécifiques à uploadActions
export const addUploadExtraReducers = (
  builder: ActionReducerMapBuilder<ImageState>
) => {
  builder
    .addCase(uploadImage.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(uploadImage.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      console.log("uploadImage.fulfilled: action.payload:", action.payload);
      state.images[action.payload.key] = {
        id: action.payload.id,
        url: action.payload.url,
        name: action.payload.name,
        isPrimary: action.payload.isPrimary,
      };
      state.userImages[action.payload.key] = {
        id: action.payload.id,
        url: action.payload.url,
        name: action.payload.name,
        isPrimary: action.payload.isPrimary,
      };
    })
    .addCase(uploadImage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    .addCase(updateImage.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateImage.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      console.log("updateImage.fulfilled: action.payload:", action.payload);
      state.images[action.payload.key] = {
        id: action.payload.id,
        url: action.payload.url,
        name: action.payload.name,
        isPrimary: action.payload.isPrimary,
      };
      state.userImages[action.payload.key] = {
        id: action.payload.id,
        url: action.payload.url,
        name: action.payload.name,
        isPrimary: action.payload.isPrimary,
      };
    })
    .addCase(updateImage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
};
