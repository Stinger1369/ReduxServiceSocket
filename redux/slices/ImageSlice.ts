// src/features/image/imageSlice.ts
import {createSlice, createSelector} from "@reduxjs/toolkit";
import {ImageState} from "../types";
import {PURGE} from "redux-persist";
import {addImageExtraReducers, fetchImage, fetchAllImages} from "./features/image/fetchActions";
import {addUploadExtraReducers, uploadImage, updateImage} from "./features/image/uploadActions";
import {addManageExtraReducers, deleteImage, setPrimaryImage} from "./features/image/manageActions";

// Sélecteurs
export const selectImageById = createSelector([
  (state : {
    image: ImageState
  }, imageId : string) => state.image.images[imageId],
  (state : {
    image: ImageState
  }, imageId : string) => state.image.userImages[imageId]
], (image, userImage) => image || userImage || null);

export const selectImagesForUser = createSelector([
  (state : {
    image: ImageState
  }, userId : string) => state.image.images,
  (state : {
    image: ImageState
  }, userId : string) => state.image.userImages,
  (state : {
    image: ImageState
  }, userId : string) => userId
], (images, userImages, userId) => ({
  images: Object.values(images).filter((img) => img.userId === userId),
  userImages: Object.values(userImages).filter((img) => img.userId === userId)
}));

const initialState: ImageState = {
  images: {},
  userImages: {},
  loading: false,
  error: null
};

const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    clearImages(state) {
      state.images = {};
      state.userImages = {};
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    addImageExtraReducers(builder);
    addUploadExtraReducers(builder);
    addManageExtraReducers(builder);
    builder.addCase(PURGE, () => initialState);
  }
});

export const {clearImages} = imageSlice.actions;
export {
  fetchImage,
  fetchAllImages,
  uploadImage,
  updateImage,
  deleteImage,
  setPrimaryImage
};

export default imageSlice.reducer;
