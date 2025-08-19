
import { createAsyncThunk } from '@reduxjs/toolkit';
import { socketService } from '../../../../services/socketService';
import chatApiClient from '../../../../services/chatApiClient';
import { PostDto, ErrorResponse } from './postChatTypes';
import { addPost } from './postChatSlice';

export const createPostViaSocket = createAsyncThunk<
  PostDto,
  { userId: string; content: string },
  { rejectValue: ErrorResponse }
>(
  'postChat/createPostViaSocket',
  async ({ userId, content }, { rejectWithValue, dispatch }) => {
    try {
      console.log('postUtils: Creating post via WebSocket:', { userId, content });
      if (socketService.isConnected()) {
        console.log('postUtils: Using WebSocket to create post');
        const tempPost: PostDto = {
          _id: `temp_${Date.now()}`,
          userId,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: [],
          dislikes: [],
          comments: [],
        };
        dispatch(addPost(tempPost));
        await socketService.post?.addPost(userId, content);
        console.log('postUtils: Post creation via WebSocket successful, waiting for addPost event');
        return tempPost;
      } else {
        console.log('postUtils: WebSocket not connected, falling back to HTTP');
        const response = await chatApiClient.createPost(userId, content);
        console.log('postUtils: Create post via HTTP successful:', response);
        return response;
      }
    } catch (error: any) {
      console.error('postUtils: Create post error:', error);
      const errorResponse: ErrorResponse = {
        error: error.message || 'Échec de la création du post',
        action: error.action || 'Veuillez réessayer.',
      };
      return rejectWithValue(errorResponse);
    }
  }
);
