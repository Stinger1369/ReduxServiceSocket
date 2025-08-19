// src/features/image/manageActions.ts
import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { ImageState, Image } from "../../../types";
import { fetchAllImages } from "./fetchActions";
import { fetchNurseById } from "../../nurseSlice";
import { fetchPatientById } from "../../patientSlice";

// Supprimer une image
export const deleteImage = createAsyncThunk(
  "image/deleteImage",
  async (
    {
      userId,
      userType,
      name,
    }: { userId: string; userType: string; name: string },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const state = getState() as any;
      const imageToDelete = Object.values(state.image.images).find(
        (img: Image) => img.name === name
      );
      const imageId = imageToDelete?.id;

      console.log(
        "deleteImage: Envoi de la requête avec userId:",
        userId,
        "userType:",
        userType,
        "name:",
        name,
        "imageId:",
        imageId
      );

      // Construire l'URL avec le name comme paramètre de requête
      const response = await apiClient.delete(
        `/api/images/delete/${userId}/${userType}?name=${encodeURIComponent(
          name
        )}`
      );
      console.log("deleteImage: Backend response:", response);

      // Mettre à jour la liste des images après la suppression
      const updatedImages = await dispatch(
        fetchAllImages({ userId, userType })
      ).unwrap();
      console.log(
        "deleteImage: Updated images after fetchAllImages:",
        updatedImages
      );

      // Recharger l'utilisateur selon le type
      if (userType.toLowerCase() === "nurse") {
        console.log("deleteImage: Rechargement de selectedNurse");
        await dispatch(fetchNurseById(userId)).unwrap();
        console.log("deleteImage: selectedNurse rechargé");
      } else if (userType.toLowerCase() === "patient") {
        console.log("deleteImage: Rechargement de selectedPatient");
        await dispatch(fetchPatientById(userId)).unwrap();
        console.log("deleteImage: selectedPatient rechargé");
      }

      return { imageId };
    } catch (error: any) {
      console.error(
        "Delete Image Error:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.status === 404
          ? error.response?.data?.error || "Image non trouvée"
          : error.response?.data?.error || "Échec de la suppression de l'image";
      return rejectWithValue(errorMessage);
    }
  }
);

// Définir une image comme principale
export const setPrimaryImage = createAsyncThunk(
  "image/setPrimaryImage",
  async (
    {
      userId,
      userType,
      imageId,
    }: { userId: string; userType: string; imageId: string },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      // Vérifier si l'image existe dans le state approprié et dans nurse/patient.imageIds
      const state = getState() as {
        image: { images: { [key: string]: Image }; userImages: { [key: string]: Image } };
        nurse: { selectedNurse: { imageIds?: string[] } };
        patient: { selectedPatient: { imageIds?: string[] } };
      };
      const images = userType.toLowerCase() === "patient" ? state.image.images : state.image.userImages;
      const nurseImageIds = state.nurse.selectedNurse?.imageIds || [];
      const patientImageIds = state.patient.selectedPatient?.imageIds || [];

      const imageIds = userType.toLowerCase() === "nurse" ? nurseImageIds : patientImageIds;

      if (!images[imageId]) {
        console.warn(
          "setPrimaryImage: Image ID",
          imageId,
          "non trouvée dans",
          userType.toLowerCase() === "patient" ? "images" : "userImages",
          Object.keys(images)
        );
        throw new Error("Image non trouvée dans les images de l'utilisateur");
      }

      if (!imageIds.includes(imageId)) {
        console.warn(
          "setPrimaryImage: Image ID",
          imageId,
          "non trouvée dans imageIds de l'utilisateur:",
          imageIds
        );
        throw new Error("Image non trouvée dans la liste des images de l'utilisateur");
      }

      console.log(
        "setPrimaryImage: Envoi de la requête avec userId:",
        userId,
        "userType:",
        userType,
        "imageId:",
        imageId
      );
      const response = await apiClient.post(
        `/api/images/set-primary/${userId}/${userType}/${imageId}`
      );
      console.log("setPrimaryImage: Backend response:", response);

      // Mettre à jour la liste des images après avoir défini l'image principale
      const updatedImages = await dispatch(
        fetchAllImages({ userId, userType })
      ).unwrap();
      console.log(
        "setPrimaryImage: Images mises à jour après fetchAllImages:",
        updatedImages
      );

      // Recharger l'utilisateur selon le type
      if (userType.toLowerCase() === "nurse") {
        console.log("setPrimaryImage: Rechargement de selectedNurse");
        await dispatch(fetchNurseById(userId)).unwrap();
        console.log("setPrimaryImage: selectedNurse rechargé");
      } else if (userType.toLowerCase() === "patient") {
        console.log("setPrimaryImage: Rechargement de selectedPatient");
        await dispatch(fetchPatientById(userId)).unwrap();
        console.log("setPrimaryImage: selectedPatient rechargé");
      }

      return { imageId };
    } catch (error: any) {
      console.error(
        "Set Primary Image Error: Response data:",
        error.response?.data,
        "Message:",
        error.message
      );
      const errorMessage =
        error.message === "Image non trouvée dans les images de l'utilisateur" ||
        error.message === "Image non trouvée dans la liste des images de l'utilisateur"
          ? error.message
          : error.response?.data?.error || "Échec de la définition de l'image principale";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fonction pour ajouter les extraReducers spécifiques à manageActions
export const addManageExtraReducers = (
  builder: ActionReducerMapBuilder<ImageState>
) => {
  builder
    .addCase(deleteImage.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteImage.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      if (action.payload.imageId) {
        delete state.images[action.payload.imageId];
        delete state.userImages[action.payload.imageId];
      }
    })
    .addCase(deleteImage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    .addCase(setPrimaryImage.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(setPrimaryImage.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      // Mise à jour locale de l'état pour refléter immédiatement le changement
      const { imageId } = action.payload;
      Object.values(state.images).forEach((image) => {
        image.isPrimary = image.id === imageId;
      });
      Object.values(state.userImages).forEach((image) => {
        image.isPrimary = image.id === imageId;
      });
      console.log(
        "setPrimaryImage: État state.images et state.userImages mis à jour après définition de l'image principale:",
        state.images,
        state.userImages
      );
    })
    .addCase(setPrimaryImage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("setPrimaryImage.rejected: Erreur:", state.error);
    });
};