
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import chatApiClient from '../../../../services/chatApiClient';

interface CommentDto {
  _id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: string[];
  dislikes: string[];
}

interface ErrorResponse {
  error: string;
  action: string;
}

interface CommentChatState {
  comments: { [postId: string]: CommentDto[] };
  loading: { [postId: string]: boolean };
  error: string | null;
  fetchedComments: string[];
}

const initialState: CommentChatState = {
  comments: {},
  loading: {},
  error: null,
  fetchedComments: [],
};

export const createComment = createAsyncThunk<
  CommentDto,
  { postId: string; userId: string; content: string },
  { rejectValue: ErrorResponse }
>(
  'commentChat/createComment',
  async (comment, { rejectWithValue }) => {
    try {
      console.log('commentChatSlice: Creating comment:', comment);
      const response = await chatApiClient.createComment(comment);
      console.log('commentChatSlice: Create comment response:', response);
      return response;
    } catch (error: any) {
      console.error('commentChatSlice: Create comment error:', error);
      const errorResponse: ErrorResponse = {
        error: error.message || 'Échec de la création du commentaire',
        action: 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const fetchCommentById = createAsyncThunk<
  CommentDto,
  string,
  { rejectValue: ErrorResponse }
>(
  'commentChat/fetchCommentById',
  async (commentId, { rejectWithValue }) => {
    try {
      console.log('commentChatSlice: Fetching comment by ID:', commentId);
      const response = await chatApiClient.getCommentById(commentId);
      console.log('commentChatSlice: Fetch comment by ID response:', response);
      return response;
    } catch (error: any) {
      console.error('commentChatSlice: Fetch comment by ID error:', error);
      const errorResponse: ErrorResponse = {
        error: error.message || 'Échec de la récupération du commentaire',
        action: 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const fetchCommentsByPost = createAsyncThunk<
  CommentDto[],
  string,
  { rejectValue: ErrorResponse }
>(
  'commentChat/fetchCommentsByPost',
  async (postId, { rejectWithValue }) => {
    try {
      console.log('commentChatSlice: Fetching comments for post:', postId);
      const response = await chatApiClient.getCommentsByPost(postId);
      console.log('commentChatSlice: Fetch comments by post response:', response);
      return response || [];
    } catch (error: any) {
      console.error('commentChatSlice: Fetch comments by post error:', error);
      const errorResponse: ErrorResponse = {
        error: error.message || 'Échec de la récupération des commentaires',
        action: 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const updateComment = createAsyncThunk<
  CommentDto,
  { commentId: string; userId: string; content: string },
  { rejectValue: ErrorResponse }
>(
  'commentChat/updateComment',
  async ({ commentId, userId, content }, { rejectWithValue }) => {
    try {
      console.log('commentChatSlice: Updating comment:', { commentId, userId, content });
      const response = await chatApiClient.updateComment(commentId, { userId, content });
      console.log('commentChatSlice: Update comment response:', response);
      return response;
    } catch (error: any) {
      console.error('commentChatSlice: Update comment error:', error);
      const errorResponse: ErrorResponse = {
        error: error.message || 'Échec de la mise à jour du commentaire',
        action: 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const deleteComment = createAsyncThunk<
  void,
  { commentId: string; userId: string },
  { rejectValue: ErrorResponse }
>(
  'commentChat/deleteComment',
  async ({ commentId, userId }, { rejectWithValue }) => {
    try {
      console.log('commentChatSlice: Deleting comment:', { commentId, userId });
      await chatApiClient.deleteComment(commentId, userId);
      console.log('commentChatSlice: Delete comment successful');
    } catch (error: any) {
      console.error('commentChatSlice: Delete comment error:', error);
      const errorResponse: ErrorResponse = {
        error: error.message || 'Échec de la suppression du commentaire',
        action: 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const likeComment = createAsyncThunk<
  CommentDto,
  { commentId: string; userId: string },
  { rejectValue: ErrorResponse }
>(
  'commentChat/likeComment',
  async ({ commentId, userId }, { rejectWithValue }) => {
    try {
      console.log('commentChatSlice: Liking comment:', { commentId, userId });
      const response = await chatApiClient.likeComment(commentId, userId);
      console.log('commentChatSlice: Like comment response:', response);
      return response;
    } catch (error: any) {
      console.error('commentChatSlice: Like comment error:', error);
      const errorResponse: ErrorResponse = {
        error: error.message || 'Échec du like du commentaire',
        action: 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const unlikeComment = createAsyncThunk<
  CommentDto,
  { commentId: string; userId: string },
  { rejectValue: ErrorResponse }
>(
  'commentChat/unlikeComment',
  async ({ commentId, userId }, { rejectWithValue }) => {
    try {
      console.log('commentChatSlice: Unliking comment:', { commentId, userId });
      const response = await chatApiClient.unlikeComment(commentId, userId);
      console.log('commentChatSlice: Unlike comment response:', response);
      return response;
    } catch (error: any) {
      console.error('commentChatSlice: Unlike comment error:', error);
      const errorResponse: ErrorResponse = {
        error: error.message || 'Échec de l’unlike du commentaire',
        action: 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const dislikeComment = createAsyncThunk<
  CommentDto,
  { commentId: string; userId: string },
  { rejectValue: ErrorResponse }
>(
  'commentChat/dislikeComment',
  async ({ commentId, userId }, { rejectWithValue }) => {
    try {
      console.log('commentChatSlice: Disliking comment:', { commentId, userId });
      const response = await chatApiClient.dislikeComment(commentId, userId);
      console.log('commentChatSlice: Dislike comment response:', response);
      return response;
    } catch (error: any) {
      console.error('commentChatSlice: Dislike comment error:', error);
      const errorResponse: ErrorResponse = {
        error: error.message || 'Échec du dislike du commentaire',
        action: 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

const commentChatSlice = createSlice({
  name: 'commentChat',
  initialState,
  reducers: {
    addComment(state, action: PayloadAction<CommentDto>) {
      console.log('commentChatSlice: Adding comment:', action.payload);
      const { postId, _id } = action.payload;
      if (!state.comments[postId]) state.comments[postId] = [];
      if (!state.comments[postId].some(c => c._id === _id)) {
        state.comments[postId].push(action.payload);
      }
      if (!state.fetchedComments.includes(postId)) {
        state.fetchedComments.push(postId);
      }
    },
    updateCommentContent(state, action: PayloadAction<{ commentId: string; content: string; updatedAt: string }>) {
      console.log('commentChatSlice: Updating comment content:', action.payload);
      const { commentId, content, updatedAt } = action.payload;
      for (const postId in state.comments) {
        const comment = state.comments[postId].find((c) => c._id === commentId);
        if (comment) {
          comment.content = content;
          comment.updatedAt = updatedAt;
          break;
        }
      }
    },
    updateCommentLikesDislikes(state, action: PayloadAction<{ commentId: string; likes: string[]; dislikes: string[] }>) {
      console.log('commentChatSlice: Updating comment likes/dislikes:', action.payload);
      const { commentId, likes, dislikes } = action.payload;
      for (const postId in state.comments) {
        const comment = state.comments[postId].find((c) => c._id === commentId);
        if (comment) {
          comment.likes = likes;
          comment.dislikes = dislikes;
          break;
        }
      }
    },
    deleteCommentAction(state, action: PayloadAction<string>) {
      console.log('commentChatSlice: Deleting comment:', action.payload);
      const commentId = action.payload;
      for (const postId in state.comments) {
        state.comments[postId] = state.comments[postId].filter((c) => c._id !== commentId);
      }
    },
    setError(state, action: PayloadAction<string>) {
      console.log('commentChatSlice: Setting error:', action.payload);
      state.error = action.payload;
    },
    clearError(state) {
      console.log('commentChatSlice: Clearing error');
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createComment.pending, (state, action) => {
        console.log('commentChatSlice: createComment pending');
        state.loading[action.meta.arg.postId] = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        console.log('commentChatSlice: createComment fulfilled:', action.payload);
        const { postId, _id } = action.payload;
        state.loading[postId] = false;
        if (!state.comments[postId]) state.comments[postId] = [];
        if (!state.comments[postId].some(c => c._id === _id)) {
          state.comments[postId].push(action.payload);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        console.log('commentChatSlice: createComment rejected:', action.payload);
        state.loading[action.meta.arg.postId] = false;
        state.error = action.payload?.error || 'Échec de la création du commentaire';
      })
      .addCase(fetchCommentById.pending, (state) => {
        console.log('commentChatSlice: fetchCommentById pending');
        state.loading['unknown'] = true;
        state.error = null;
      })
      .addCase(fetchCommentById.fulfilled, (state, action) => {
        console.log('commentChatSlice: fetchCommentById fulfilled:', action.payload);
        state.loading['unknown'] = false;
        const comment = action.payload;
        const postId = comment.postId;
        if (!state.comments[postId]) state.comments[postId] = [];
        const existing = state.comments[postId].find((c) => c._id === comment._id);
        if (existing) {
          Object.assign(existing, comment);
        } else {
          state.comments[postId].push(comment);
        }
      })
      .addCase(fetchCommentById.rejected, (state, action) => {
        console.log('commentChatSlice: fetchCommentById rejected:', action.payload);
        state.loading['unknown'] = false;
        state.error = action.payload?.error || 'Échec de la récupération du commentaire';
      })
      .addCase(fetchCommentsByPost.pending, (state, action) => {
        console.log('commentChatSlice: fetchCommentsByPost pending');
        state.loading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(fetchCommentsByPost.fulfilled, (state, action) => {
        console.log('commentChatSlice: fetchCommentsByPost fulfilled:', action.payload);
        const postId = action.meta.arg;
        state.loading[postId] = false;
        state.comments[postId] = action.payload || [];
        if (!state.fetchedComments.includes(postId)) {
          state.fetchedComments.push(postId);
        }
      })
      .addCase(fetchCommentsByPost.rejected, (state, action) => {
        console.log('commentChatSlice: fetchCommentsByPost rejected:', action.payload);
        const postId = action.meta.arg;
        state.loading[postId] = false;
        state.error = action.payload?.error || 'Échec de la récupération des commentaires';
      })
      .addCase(updateComment.pending, (state, action) => {
        console.log('commentChatSlice: updateComment pending');
        state.loading[action.meta.arg.commentId] = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        console.log('commentChatSlice: updateComment fulfilled:', action.payload);
        state.loading[action.payload._id] = false;
        const updatedComment = action.payload;
        const postId = updatedComment.postId;
        if (state.comments[postId]) {
          const index = state.comments[postId].findIndex((c) => c._id === updatedComment._id);
          if (index !== -1) {
            state.comments[postId][index] = updatedComment;
          }
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        console.log('commentChatSlice: updateComment rejected:', action.payload);
        state.loading[action.meta.arg.commentId] = false;
        state.error = action.payload?.error || 'Échec de la mise à jour du commentaire';
      })
      .addCase(deleteComment.pending, (state, action) => {
        console.log('commentChatSlice: deleteComment pending');
        state.loading[action.meta.arg.commentId] = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        console.log('commentChatSlice: deleteComment fulfilled:', action.meta.arg);
        state.loading[action.meta.arg.commentId] = false;
        const { commentId } = action.meta.arg;
        for (const postId in state.comments) {
          state.comments[postId] = state.comments[postId].filter((c) => c._id !== commentId);
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        console.log('commentChatSlice: deleteComment rejected:', action.payload);
        state.loading[action.meta.arg.commentId] = false;
        state.error = action.payload?.error || 'Échec de la suppression du commentaire';
      })
      .addCase(likeComment.pending, (state, action) => {
        console.log('commentChatSlice: likeComment pending');
        state.loading[action.meta.arg.commentId] = true;
        state.error = null;
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        console.log('commentChatSlice: likeComment fulfilled:', action.payload);
        state.loading[action.payload._id] = false;
        const updatedComment = action.payload;
        const postId = updatedComment.postId;
        if (state.comments[postId]) {
          const index = state.comments[postId].findIndex((c) => c._id === updatedComment._id);
          if (index !== -1) {
            state.comments[postId][index] = updatedComment;
          }
        }
      })
      .addCase(likeComment.rejected, (state, action) => {
        console.log('commentChatSlice: likeComment rejected:', action.payload);
        state.loading[action.meta.arg.commentId] = false;
        state.error = action.payload?.error || 'Échec du like du commentaire';
      })
      .addCase(unlikeComment.pending, (state, action) => {
        console.log('commentChatSlice: unlikeComment pending');
        state.loading[action.meta.arg.commentId] = true;
        state.error = null;
      })
      .addCase(unlikeComment.fulfilled, (state, action) => {
        console.log('commentChatSlice: unlikeComment fulfilled:', action.payload);
        state.loading[action.payload._id] = false;
        const updatedComment = action.payload;
        const postId = updatedComment.postId;
        if (state.comments[postId]) {
          const index = state.comments[postId].findIndex((c) => c._id === updatedComment._id);
          if (index !== -1) {
            state.comments[postId][index] = updatedComment;
          }
        }
      })
      .addCase(unlikeComment.rejected, (state, action) => {
        console.log('commentChatSlice: unlikeComment rejected:', action.payload);
        state.loading[action.meta.arg.commentId] = false;
        state.error = action.payload?.error || 'Échec de l’unlike du commentaire';
      })
      .addCase(dislikeComment.pending, (state, action) => {
        console.log('commentChatSlice: dislikeComment pending');
        state.loading[action.meta.arg.commentId] = true;
        state.error = null;
      })
      .addCase(dislikeComment.fulfilled, (state, action) => {
        console.log('commentChatSlice: dislikeComment fulfilled:', action.payload);
        state.loading[action.payload._id] = false;
        const updatedComment = action.payload;
        const postId = updatedComment.postId;
        if (state.comments[postId]) {
          const index = state.comments[postId].findIndex((c) => c._id === updatedComment._id);
          if (index !== -1) {
            state.comments[postId][index] = updatedComment;
          }
        }
      })
      .addCase(dislikeComment.rejected, (state, action) => {
        console.log('commentChatSlice: dislikeComment rejected:', action.payload);
        state.loading[action.meta.arg.commentId] = false;
        state.error = action.payload?.error || 'Échec du dislike du commentaire';
      });
  },
});

export const { addComment, updateCommentContent, updateCommentLikesDislikes, deleteCommentAction, setError, clearError } = commentChatSlice.actions;
export default commentChatSlice.reducer;
