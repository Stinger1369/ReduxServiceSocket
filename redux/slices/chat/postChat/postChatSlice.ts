
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import chatApiClient from '../../../../services/chatApiClient';

interface PostDto {
  _id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: string[];
  dislikes: string[];
  comments: string[];
}

interface ErrorResponse {
  error: string;
  action: string;
}

interface PostChatState {
  posts: PostDto[];
  loading: boolean;
  error: string | null;
}

const initialState: PostChatState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchAllPosts = createAsyncThunk<
  PostDto[],
  void,
  { rejectValue: ErrorResponse }
>(
  'postChat/fetchAllPosts',
  async (_, { rejectWithValue }) => {
    try {
      console.log('postChatSlice: Fetching all posts');
      const response = await chatApiClient.getAllPosts();
      console.log('postChatSlice: Fetch all posts response:', response);
      return response;
    } catch (error: any) {
      console.error('postChatSlice: Fetch all posts error:', error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec de la récupération des posts',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const fetchNursePosts = createAsyncThunk<
  PostDto[],
  void,
  { rejectValue: ErrorResponse }
>(
  'postChat/fetchNursePosts',
  async (_, { rejectValue }) => {
    try {
      console.log('postChatSlice: Fetching nurse posts');
      const response = await chatApiClient.getNursePosts();
      console.log('postChatSlice: Fetch nurse posts response:', response);
      return response;
    } catch (error: any) {
      console.error('postChatSlice: Fetch nurse posts error:', error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec de la récupération des posts des infirmiers',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const fetchPostById = createAsyncThunk<
  PostDto,
  string,
  { rejectValue: ErrorResponse }
>(
  'postChat/fetchPostById',
  async (postId, { rejectWithValue }) => {
    try {
      console.log('postChatSlice: Fetching post by ID:', postId);
      const response = await chatApiClient.getPostById(postId);
      console.log('postChatSlice: Fetch post by ID response:', response);
      return response;
    } catch (error: any) {
      console.error('postChatSlice: Fetch post by ID error:', error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec de la récupération du post',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const updatePost = createAsyncThunk<
  PostDto,
  { postId: string; userId: string; content: string },
  { rejectValue: ErrorResponse }
>(
  'postChat/updatePost',
  async ({ postId, userId, content }, { rejectValue }) => {
    try {
      console.log('postChatSlice: Updating post:', { postId, userId, content });
      const response = await chatApiClient.updatePost(postId, userId, content);
      console.log('postChatSlice: Update post response:', response);
      return response;
    } catch (error: any) {
      console.error('postChatSlice: Update post error:', error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec de la mise à jour du post',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const deletePost = createAsyncThunk<
  void,
  { postId: string; userId: string },
  { rejectValue: ErrorResponse }
>(
  'postChat/deletePost',
  async ({ postId, userId }, { rejectValue }) => {
    try {
      console.log('postChatSlice: Deleting post:', { postId, userId });
      await chatApiClient.deletePost(postId, userId);
      console.log('postChatSlice: Delete post successful');
    } catch (error: any) {
      console.error('postChatSlice: Delete post error:', error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec de la suppression du post',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const likePost = createAsyncThunk<
  PostDto,
  { postId: string; userId: string },
  { rejectValue: ErrorResponse }
>(
  'postChat/likePost',
  async ({ postId, userId }, { rejectValue }) => {
    try {
      console.log('postChatSlice: Liking post via REST:', { postId, userId });
      const response = await chatApiClient.likePost(postId, userId);
      console.log('postChatSlice: Like post response:', response);
      return response;
    } catch (error: any) {
      console.error('postChatSlice: Like post error:', error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec du like du post',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const unlikePost = createAsyncThunk<
  PostDto,
  { postId: string; userId: string },
  { rejectValue: ErrorResponse }
>(
  'postChat/unlikePost',
  async ({ postId, userId }, { rejectValue }) => {
    try {
      console.log('postChatSlice: Unliking post via REST:', { postId, userId });
      const response = await chatApiClient.unlikePost(postId, userId);
      console.log('postChatSlice: Unlike post response:', response);
      return response;
    } catch (error: any) {
      console.error('postChatSlice: Unlike post error:', error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec de l’unlike du post',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

export const dislikePost = createAsyncThunk<
  PostDto,
  { postId: string; userId: string },
  { rejectValue: ErrorResponse }
>(
  'postChat/dislikePost',
  async ({ postId, userId }, { rejectValue }) => {
    try {
      console.log('postChatSlice: Disliking post via REST:', { postId, userId });
      const response = await chatApiClient.dislikePost(postId, userId);
      console.log('postChatSlice: Dislike post response:', response);
      return response;
    } catch (error: any) {
      console.error('postChatSlice: Dislike post error:', error);
      const errorResponse: ErrorResponse = {
        error: error.error || 'Échec du dislike du post',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);

const postChatSlice = createSlice({
  name: 'postChat',
  initialState,
  reducers: {
    addPost(state, action: PayloadAction<PostDto>) {
      console.log('postChatSlice: Adding post via WebSocket:', action.payload);
      if (!action.payload._id.startsWith('temp_')) {
        state.posts = state.posts.filter((p) => !p._id.startsWith('temp_'));
      }
      if (!state.posts.some((p) => p._id === action.payload._id)) {
        state.posts = [action.payload, ...state.posts];
        console.log('postChatSlice: Post added to state:', action.payload._id, 'new length:', state.posts.length);
      } else {
        console.log('postChatSlice: Post already exists, skipping:', action.payload._id);
      }
    },
    updatePostLikes(state, action: PayloadAction<{ postId: string; likes: string[]; dislikes: string[] }>) {
      console.log('postChatSlice: Updating post likes:', action.payload);
      const { postId, likes, dislikes } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        post.likes = [...new Set(likes)];
        post.dislikes = [...new Set(dislikes)];
      }
    },
    updatePostDislikes(state, action: PayloadAction<{ postId: string; likes: string[]; dislikes: string[] }>) {
      console.log('postChatSlice: Updating post dislikes:', action.payload);
      const { postId, likes, dislikes } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        post.likes = [...new Set(likes)];
        post.dislikes = [...new Set(dislikes)];
      }
    },
    updatePostComments(state, action: PayloadAction<{ postId: string; commentId: string }>) {
      console.log('postChatSlice: Updating post comments:', action.payload);
      const { postId, commentId } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post && !post.comments.includes(commentId)) {
        post.comments.push(commentId);
      }
    },
    setError(state, action: PayloadAction<string>) {
      console.log('postChatSlice: Setting error:', action.payload);
      state.error = action.payload;
    },
    clearError(state) {
      console.log('postChatSlice: Clearing error');
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPosts.pending, (state) => {
        console.log('postChatSlice: fetchAllPosts pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        console.log('postChatSlice: fetchAllPosts fulfilled:', action.payload);
        state.loading = false;
        state.posts = action.payload;
        console.log('postChatSlice: Posts loaded via REST:', state.posts.length);
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        console.log('postChatSlice: fetchAllPosts rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.error || 'Échec de la récupération des posts';
      })
      .addCase(fetchNursePosts.pending, (state) => {
        console.log('postChatSlice: fetchNursePosts pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNursePosts.fulfilled, (state, action) => {
        console.log('postChatSlice: fetchNursePosts fulfilled:', action.payload);
        state.loading = false;
        state.posts = action.payload;
        console.log('postChatSlice: Nurse posts loaded via REST:', state.posts.length);
      })
      .addCase(fetchNursePosts.rejected, (state, action) => {
        console.log('postChatSlice: fetchNursePosts rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.error || 'Échec de la récupération des posts des infirmiers';
      })
      .addCase(fetchPostById.pending, (state) => {
        console.log('postChatSlice: fetchPostById pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        console.log('postChatSlice: fetchPostById fulfilled:', action.payload);
        state.loading = false;
        const post = action.payload;
        const existing = state.posts.find((p) => p._id === post._id);
        if (existing) {
          Object.assign(existing, post);
          console.log('postChatSlice: Post updated:', post._id);
        } else {
          state.posts.push(post);
          console.log('postChatSlice: Post added:', post._id);
        }
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        console.log('postChatSlice: fetchPostById rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.error || 'Échec de la récupération du post';
      })
      .addCase(updatePost.pending, (state) => {
        console.log('postChatSlice: updatePost pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        console.log('postChatSlice: updatePost fulfilled:', action.payload);
        state.loading = false;
        const updatedPost = action.payload;
        const index = state.posts.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
          console.log('postChatSlice: Post updated:', updatedPost._id);
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        console.log('postChatSlice: updatePost rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.error || 'Échec de la mise à jour du post';
      })
      .addCase(deletePost.pending, (state) => {
        console.log('postChatSlice: deletePost pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        console.log('postChatSlice: deletePost fulfilled');
        state.loading = false;
        const { postId } = action.meta.arg;
        state.posts = state.posts.filter((p) => p._id !== postId);
        console.log('postChatSlice: Post deleted:', postId);
      })
      .addCase(deletePost.rejected, (state, action) => {
        console.log('postChatSlice: deletePost rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.error || 'Échec de la suppression du post';
      })
      .addCase(likePost.pending, (state) => {
        console.log('postChatSlice: likePost pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        console.log('postChatSlice: likePost fulfilled:', action.payload);
        state.loading = false;
        const updatedPost = action.payload;
        const index = state.posts.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
          console.log('postChatSlice: Post liked:', updatedPost._id);
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        console.log('postChatSlice: likePost rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.error || 'Échec du like du post';
      })
      .addCase(unlikePost.pending, (state) => {
        console.log('postChatSlice: unlikePost pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        console.log('postChatSlice: unlikePost fulfilled:', action.payload);
        state.loading = false;
        const updatedPost = action.payload;
        const index = state.posts.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
          console.log('postChatSlice: Post unliked:', updatedPost._id);
        }
      })
      .addCase(unlikePost.rejected, (state, action) => {
        console.log('postChatSlice: unlikePost rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.error || 'Échec de l’unlike du post';
      })
      .addCase(dislikePost.pending, (state) => {
        console.log('postChatSlice: dislikePost pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(dislikePost.fulfilled, (state, action) => {
        console.log('postChatSlice: dislikePost fulfilled:', action.payload);
        state.loading = false;
        const updatedPost = action.payload;
        const index = state.posts.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
          console.log('postChatSlice: Post disliked:', updatedPost._id);
        }
      })
      .addCase(dislikePost.rejected, (state, action) => {
        console.log('postChatSlice: dislikePost rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.error || 'Échec du dislike du post';
      });
  },
});

export const { addPost, updatePostLikes, updatePostDislikes, updatePostComments, setError, clearError } = postChatSlice.actions;
export default postChatSlice.reducer;
