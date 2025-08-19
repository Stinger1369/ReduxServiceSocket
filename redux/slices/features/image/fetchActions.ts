// src/features/image/fetchActions.ts
import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import apiClient from "../../../../api/apiClient";
import { ImageState } from "../../../types";

// Cache pour stocker les images récupérées
const imageCache: { [userId: string]: { images: any[]; timestamp: number } } = {};
// Cache pour suivre les appels en cours
const pendingFetches: { [userId: string]: Promise<any> } = {};
// Durée de validité du cache (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Fetch a single image
export const fetchImage = createAsyncThunk(
  "image/fetchImage",
  async (
    {
      userId,
      userType,
      id,
    }: { userId: string; userType: string; id: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.get(
        `/api/images/${userId}/${userType}/${id}`
      );
      console.log("fetchImage: Response for id:", id, response);
      return {
        key: response.id,
        image: {
          id: response.id,
          url: response.url,
          name: response.name,
          isPrimary: response.isPrimary ?? response.is_primary ?? false,
          userId,
          userType,
        },
      };
    } catch (error: any) {
      console.error(
        "Fetch Image Error for id:",
        id,
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data || "Échec de la récupération de l'image"
      );
    }
  }
);

// Fetch all images
export const fetchAllImages = createAsyncThunk(
  "image/fetchAllImages",
  async (
    { userId, userType }: { userId: string; userType: string },
    { rejectWithValue, getState }
  ) => {
    try {
      // Vérifier le cache
      const cached = imageCache[userId];
      const now = Date.now();
      if (cached && now - cached.timestamp < CACHE_DURATION) {
        console.log(
          `fetchAllImages: Returning cached images for userId: ${userId}`
        );
        const state = getState() as { auth: { user: { _id?: string } } };
        const isUserImage = userId === state.auth.user?._id;
        return {
          userId,
          isUserImage,
          images: cached.images,
        };
      }

      // Vérifier si une requête est déjà en cours
      if (pendingFetches[userId]) {
        console.log(
          `fetchAllImages: Waiting for pending fetch for userId: ${userId}`
        );
        await pendingFetches[userId];
        return imageCache[userId]
          ? {
              userId,
              isUserImage: userId === (getState() as any).auth.user?._id,
              images: imageCache[userId].images,
            }
          : rejectWithValue("No data in cache after pending fetch");
      }

      // Nouvelle requête
      console.log(`fetchAllImages: Fetching images for userId: ${userId}`);
      const fetchPromise = apiClient.get(`/api/images/all/${userId}/${userType}`);
      pendingFetches[userId] = fetchPromise;

      const response = await fetchPromise;
      console.log("fetchAllImages: Raw response for userId:", userId, response);

      if (!response || !Array.isArray(response)) {
        console.error(
          "fetchAllImages: Invalid response format, expected an array:",
          response
        );
        throw new Error("Format de réponse invalide : Un tableau est attendu");
      }

      const state = getState() as { auth: { user: { _id?: string } } };
      const isUserImage = userId === state.auth.user?._id;

      const images = response
        .filter((image: any) => {
          if (!image.id || !image.url || !image.name) {
            console.error(`fetchAllImages: Missing fields in image:`, image);
            return false;
          }
          return true;
        })
        .map((image: any, index: number) => {
          console.log(
            `fetchAllImages: Processing image at index ${index}:`,
            image
          );
          return {
            key: image.id,
            image: {
              id: image.id,
              url: image.url,
              name: image.name,
              isPrimary: image.isPrimary ?? image.is_primary ?? false,
              userId,
              userType,
            },
          };
        });

      console.log("fetchAllImages: Processed images:", images);

      // Mettre à jour le cache
      imageCache[userId] = { images, timestamp: now };
      delete pendingFetches[userId];

      // Vérifier les doublons
      const uniqueImageIds = new Set(images.map((item: any) => item.image.id));
      console.log("fetchAllImages: Nombre d'images uniques:", uniqueImageIds.size);
      if (uniqueImageIds.size !== images.length) {
        console.warn("fetchAllImages: Doublons détectés dans images:", images);
      }

      return {
        userId,
        isUserImage,
        images,
      };
    } catch (error: any) {
      console.error(
        "Fetch All Images Error for userId:",
        userId,
        error.response?.data || error.message
      );
      delete pendingFetches[userId];
      return rejectWithValue(
        error.response?.data || "Échec de la récupération de toutes les images"
      );
    }
  }
);

// Fonction pour ajouter les extraReducers spécifiques à imageActions
export const addImageExtraReducers = (
  builder: ActionReducerMapBuilder<ImageState>
) => {
  builder
    .addCase(fetchImage.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchImage.fulfilled, (state, action) => {
      state.loading = false;
      state.images[action.payload.key] = action.payload.image;
      console.log("fetchImage.fulfilled: Updated state.images:", state.images);
    })
    .addCase(fetchImage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("fetchImage.rejected: Error:", state.error);
    })
    .addCase(fetchAllImages.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchAllImages.fulfilled, (state, action) => {
      state.loading = false;
      const { isUserImage, images } = action.payload;

      // Mettre à jour uniquement les clés modifiées
      const target = isUserImage ? state.userImages : state.images;
      images.forEach((item: { key: string; image: any }) => {
        if (
          !target[item.key] ||
          JSON.stringify(target[item.key]) !== JSON.stringify(item.image)
        ) {
          target[item.key] = item.image;
        }
      });

      console.log(
        `fetchAllImages: Updated ${
          isUserImage ? "state.userImages" : "state.images"
        }:`,
        target
      );
    })
    .addCase(fetchAllImages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log("fetchAllImages.rejected: Error:", state.error);
    });
};