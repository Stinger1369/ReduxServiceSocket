import { createAsyncThunk } from "@reduxjs/toolkit";
import { socketService } from "../../../../../services/socketService";
import { ErrorResponse } from "../userChatTypes";
import { getUserLikes } from "../../../../../services/chatApi/userMethods";

export const likeUserAsync = createAsyncThunk<
  void,
  { userId: string; likerId: string },
  { rejectValue: ErrorResponse }
>("userChat/likeUserAsync", async ({ userId, likerId }, { rejectWithValue }) => {
  try {
    console.log("likeActions: Dispatching likeUserAsync via WebSocket:", { userId, likerId });
    await socketService.user!.likeUser(userId, likerId);
    console.log("likeActions: likeUserAsync completed successfully");
  } catch (error: any) {
    console.error("likeActions: Like user async error:", error);
    const errorResponse: ErrorResponse = {
      error: error.message || "Échec du like de l’utilisateur",
      action: "Veuillez réessayer.",
    };
    return rejectWithValue(errorResponse);
  }
});

export const unlikeUserAsync = createAsyncThunk<
  void,
  { userId: string; likerId: string },
  { rejectValue: ErrorResponse }
>("userChat/unlikeUserAsync", async ({ userId, likerId }, { rejectWithValue }) => {
  try {
    console.log("likeActions: Dispatching unlikeUserAsync via WebSocket:", { userId, likerId });
    await socketService.user!.unlikeUser(userId, likerId);
    console.log("likeActions: unlikeUserAsync completed successfully");
  } catch (error: any) {
    console.error("likeActions: Unlike user async error:", error);
    const errorResponse: ErrorResponse = {
      error: error.message || "Échec du unlike de l’utilisateur",
      action: "Veuillez réessayer.",
    };
    return rejectWithValue(errorResponse);
  }
});

export const dislikeUserAsync = createAsyncThunk<
  void,
  { userId: string; dislikerId: string },
  { rejectValue: ErrorResponse }
>("userChat/dislikeUserAsync", async ({ userId, dislikerId }, { rejectWithValue }) => {
  try {
    console.log("likeActions: Dispatching dislikeUserAsync via WebSocket:", { userId, dislikerId });
    await socketService.user!.dislikeUser(userId, dislikerId);
    console.log("likeActions: dislikeUserAsync completed successfully");
  } catch (error: any) {
    console.error("likeActions: Dislike user async error:", error);
    const errorResponse: ErrorResponse = {
      error: error.message || "Échec du dislike de l’utilisateur",
      action: "Veuillez réessayer.",
    };
    return rejectWithValue(errorResponse);
  }
});

export const fetchUserLikesAsync = createAsyncThunk<
  { userId: string; likes: string[]; likedBy: string[] },
  string,
  { rejectValue: ErrorResponse }
>("userChat/fetchUserLikesAsync", async (userId, { rejectWithValue }) => {
  try {
    console.log("likeActions: Fetching user likes for userId:", userId);
    const response = await getUserLikes(userId);
    console.log("likeActions: fetchUserLikesAsync completed successfully:", response);
    return { userId, likes: response.likes, likedBy: response.likedBy };
  } catch (error: any) {
    console.error("likeActions: Fetch user likes error:", error);
    const errorResponse: ErrorResponse = {
      error: error.message || "Échec de la récupération des likes",
      action: "Veuillez réessayer.",
    };
    return rejectWithValue(errorResponse);
  }
});

export const fetchBatchUserLikesAsync = createAsyncThunk<
  { userId: string; likes: string[]; likedBy: string[] }[],
  string[],
  { rejectValue: ErrorResponse }
>("userChat/fetchBatchUserLikesAsync", async (userIds, { rejectWithValue }) => {
  try {
    console.log("likeActions: Fetching batch user likes for userIds:", userIds);
    const response = await socketService.user!.fetchBatchLikes(userIds);
    console.log("likeActions: fetchBatchUserLikesAsync completed successfully:", response);
    return response;
  } catch (error: any) {
    console.error("likeActions: Fetch batch user likes error:", error);
    const errorResponse: ErrorResponse = {
      error: error.message || "Échec de la récupération des likes en batch",
      action: "Veuillez réessayer.",
    };
    return rejectWithValue(errorResponse);
  }
});

export const addLikeActionsExtraReducers = (builder: any) => {
  builder
    .addCase(likeUserAsync.pending, (state: any) => {
      state.loading = true;
      state.error = null;
      console.log("likeActions: likeUserAsync pending");
    })
    .addCase(likeUserAsync.fulfilled, (state: any) => {
      state.loading = false;
      console.log("likeActions: likeUserAsync fulfilled");
    })
    .addCase(likeUserAsync.rejected, (state: any, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Failed to like user';
      console.error("likeActions: likeUserAsync rejected:", action.payload);
    })
    .addCase(unlikeUserAsync.pending, (state: any) => {
      state.loading = true;
      state.error = null;
      console.log("likeActions: unlikeUserAsync pending");
    })
    .addCase(unlikeUserAsync.fulfilled, (state: any) => {
      state.loading = false;
      console.log("likeActions: unlikeUserAsync fulfilled");
    })
    .addCase(unlikeUserAsync.rejected, (state: any, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Failed to unlike user';
      console.error("likeActions: unlikeUserAsync rejected:", action.payload);
    })
    .addCase(dislikeUserAsync.pending, (state: any) => {
      state.loading = true;
      state.error = null;
      console.log("likeActions: dislikeUserAsync pending");
    })
    .addCase(dislikeUserAsync.fulfilled, (state: any) => {
      state.loading = false;
      console.log("likeActions: dislikeUserAsync fulfilled");
    })
    .addCase(dislikeUserAsync.rejected, (state: any, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Failed to dislike user';
      console.error("likeActions: dislikeUserAsync rejected:", action.payload);
    })
    .addCase(fetchUserLikesAsync.pending, (state: any) => {
      state.loading = true;
      state.error = null;
      console.log("likeActions: fetchUserLikesAsync pending");
    })
    .addCase(fetchUserLikesAsync.fulfilled, (state: any, action: any) => {
      state.loading = false;
      const { userId, likes, likedBy } = action.payload;
      if (!state.users[userId]) {
        state.users[userId] = {
          userId,
          email: '',
          likes,
          likedBy,
          dislikes: [],
          blockedUsers: [],
          blockedBy: [],
          reports: [],
        };
      } else {
        state.users[userId].likes = likes;
        state.users[userId].likedBy = likedBy;
      }
      if (state.user && state.user.userId === userId) {
        state.user.likes = likes;
        state.user.likedBy = likedBy;
      }
      console.log("likeActions: fetchUserLikesAsync fulfilled for userId:", userId);
    })
    .addCase(fetchUserLikesAsync.rejected, (state: any, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Failed to fetch user likes';
      console.error("likeActions: fetchUserLikesAsync rejected:", action.payload);
    })
    .addCase(fetchBatchUserLikesAsync.pending, (state: any) => {
      state.loading = true;
      state.error = null;
      console.log("likeActions: fetchBatchUserLikesAsync pending");
    })
    .addCase(fetchBatchUserLikesAsync.fulfilled, (state: any, action: any) => {
      state.loading = false;
      action.payload.forEach(({ userId, likes, likedBy }: { userId: string; likes: string[]; likedBy: string[] }) => {
        if (!state.users[userId]) {
          state.users[userId] = {
            userId,
            email: '',
            likes,
            likedBy,
            dislikes: [],
            blockedUsers: [],
            blockedBy: [],
            reports: [],
          };
        } else {
          state.users[userId].likes = likes;
          state.users[userId].likedBy = likedBy;
        }
        if (state.user && state.user.userId === userId) {
          state.user.likes = likes;
          state.user.likedBy = likedBy;
        }
      });
      console.log("likeActions: fetchBatchUserLikesAsync fulfilled for userIds:", action.payload.map((item: any) => item.userId));
    })
    .addCase(fetchBatchUserLikesAsync.rejected, (state: any, action: any) => {
      state.loading = false;
      state.error = action.payload?.error || 'Failed to fetch batch user likes';
      console.error("likeActions: fetchBatchUserLikesAsync rejected:", action.payload);
    });
};