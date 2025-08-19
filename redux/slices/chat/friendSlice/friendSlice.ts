import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FriendDto, FollowDto, FollowRequest, ErrorResponse } from './friendChatType';
import chatApiClient from '../../../../services/chatApiClient';

interface FriendDto {
  _id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
  createdAt: string;
  updatedAt: string;
  isOnline?: boolean;
  lastConnectedAt?: string;
}

interface FriendState {
  friends: FriendDto[];
  friendRequests: FriendDto[];
  sentFriendRequests: FriendDto[];
  followedUsers: string[];
  followers: string[];
  loading: boolean;
  error: string | null;
}

const initialState: FriendState = {
  friends: [],
  friendRequests: [],
  sentFriendRequests: [],
  followedUsers: [],
  followers: [],
  loading: false,
  error: null,
};

export const fetchFriends = createAsyncThunk<
  FriendDto[],
  string,
  { rejectValue: ErrorResponse }
>('friends/fetchFriends', async (userId: string, { rejectWithValue }) => {
  try {
    const response = await chatApiClient.getFriendsByUserId(userId);
    console.log('friendSlice: fetchFriends response:', response);
    return response;
  } catch (error: unknown) {
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Échec de la récupération des amis',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

export const fetchFollowedUsers = createAsyncThunk<
  string[],
  string,
  { rejectValue: ErrorResponse }
>('friends/fetchFollowedUsers', async (followerId: string, { rejectWithValue }) => {
  try {
    const response = await chatApiClient.getFollowedUsers(followerId);
    return response;
  } catch (error: unknown) {
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Échec de la récupération des utilisateurs suivis',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

export const fetchFollowers = createAsyncThunk<
  string[],
  string,
  { rejectValue: ErrorResponse }
>('friends/fetchFollowers', async (userId: string, { rejectWithValue }) => {
  try {
    const response = await chatApiClient.getFollowers(userId);
    return response;
  } catch (error: unknown) {
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Échec de la récupération des followers',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

export const addFriendAsync = createAsyncThunk<
  void,
  { userId: string; friendId: string },
  { rejectValue: ErrorResponse }
>('friends/addFriendAsync', async ({ userId, friendId }, { dispatch, rejectWithValue }) => {
  try {
    const tempId = `temp-${userId}-${friendId}`;
    dispatch(addFriendOptimistic({ _id: tempId, userId, friendId, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  } catch (error: unknown) {
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Échec de l’ajout de l’ami',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

export const acceptFriendAsync = createAsyncThunk<
  void,
  { userId: string; friendId: string },
  { rejectValue: ErrorResponse }
>('friends/acceptFriendAsync', async ({ userId, friendId }, { dispatch, rejectWithValue }) => {
  try {
    dispatch(acceptFriendOptimistic({ userId, friendId }));
    dispatch(fetchFriends(userId));
  } catch (error: unknown) {
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Échec de l’acceptation de l’ami',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

export const rejectFriendAsync = createAsyncThunk<
  void,
  { userId: string; friendId: string },
  { rejectValue: ErrorResponse }
>('friends/rejectFriendAsync', async ({ userId, friendId }, { dispatch, rejectWithValue }) => {
  try {
    dispatch(removeTempFriendRequest({ userId, friendId }));
    dispatch(fetchFriends(userId));
  } catch (error: unknown) {
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Échec du rejet de l’ami',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

export const removeFriendAsync = createAsyncThunk<
  void,
  { userId: string; friendId: string },
  { rejectValue: ErrorResponse }
>('friends/removeFriendAsync', async ({ userId, friendId }, { dispatch, rejectWithValue }) => {
  try {
    dispatch(removeFriendOptimistic({ userId, friendId }));
    dispatch(fetchFriends(userId));
  } catch (error: unknown) {
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Échec de la suppression de l’ami',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

export const followUserAsync = createAsyncThunk<
  void,
  FollowRequest,
  { rejectValue: ErrorResponse }
>('friends/followUserAsync', async (followRequest, { dispatch, rejectWithValue }) => {
  try {
    dispatch(addFollowOptimistic(followRequest.followedId));
  } catch (error: unknown) {
    dispatch(removeTempFollow(followRequest.followedId));
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Échec du suivi de l’utilisateur',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

export const unfollowUserAsync = createAsyncThunk<
  void,
  FollowRequest,
  { rejectValue: ErrorResponse }
>('friends/unfollowUserAsync', async (followRequest, { rejectWithValue }) => {
  try {
    // La logique WebSocket sera gérée dans le composant
  } catch (error: unknown) {
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Échec de l’arrêt du suivi de l’utilisateur',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

const friendSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    addFriendOptimistic(state, action: PayloadAction<FriendDto>) {
      const friendRequest = action.payload;
      if (friendRequest.status === 'pending') {
        state.sentFriendRequests.push(friendRequest);
      }
    },
    removeTempFriendRequest(state, action: PayloadAction<{ userId: string; friendId: string }>) {
      const { userId, friendId } = action.payload;
      state.sentFriendRequests = state.sentFriendRequests.filter(
        (req) => req.userId !== userId || req.friendId !== friendId
      );
      state.friendRequests = state.friendRequests.filter(
        (req) => req.userId !== friendId || req.friendId !== userId
      );
    },
    acceptFriendOptimistic(state, action: PayloadAction<{ userId: string; friendId: string }>) {
      const { userId, friendId } = action.payload;
      state.friendRequests = state.friendRequests.filter(
        (req) => req.userId !== friendId || req.friendId !== userId
      );
      state.sentFriendRequests = state.sentFriendRequests.filter(
        (req) => req.userId !== userId || req.friendId !== friendId
      );
      state.friends.push({
        _id: `temp-${userId}-${friendId}`,
        userId: friendId,
        friendId: userId,
        status: 'accepted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOnline: false,
        lastConnectedAt: new Date().toISOString(),
      });
    },
    addFollowOptimistic(state, action: PayloadAction<string>) {
      const followedId = action.payload;
      if (!state.followedUsers.includes(followedId)) {
        state.followedUsers.push(followedId);
      }
    },
    removeTempFollow(state, action: PayloadAction<string>) {
      const followedId = action.payload;
      state.followedUsers = state.followedUsers.filter((id) => id !== followedId);
    },
    removeFriendOptimistic(state, action: PayloadAction<{ userId: string; friendId: string }>) {
      const { userId, friendId } = action.payload;
      state.friends = state.friends.filter(
        (friend) =>
          !(friend.userId === userId && friend.friendId === friendId) &&
          !(friend.userId === friendId && friend.friendId === userId)
      );
    },
    receiveFriendRequest(state, action: PayloadAction<FriendDto>) {
      const friendRequest = action.payload;
      if (friendRequest.status === 'pending') {
        state.friendRequests.push(friendRequest);
      }
      console.log('friendSlice: Received friend request:', friendRequest);
    },
    receiveFriendRequestSent(state, action: PayloadAction<FriendDto>) {
      const sentRequest = action.payload;
      if (sentRequest.status === 'pending') {
        state.sentFriendRequests = state.sentFriendRequests.filter(
          (req) => req._id !== `temp-${sentRequest.userId}-${sentRequest.friendId}`
        );
        state.sentFriendRequests.push(sentRequest);
      }
      console.log('friendSlice: Received friend request sent:', sentRequest);
    },
    receiveFriendAccepted(state, action: PayloadAction<FriendDto>) {
      const friendship = action.payload;
      if (friendship.status === 'accepted') {
        state.friends.push(friendship);
        state.friendRequests = state.friendRequests.filter(
          (req) => req._id !== friendship._id
        );
        state.sentFriendRequests = state.sentFriendRequests.filter(
          (req) => req._id !== friendship._id
        );
      }
      console.log('friendSlice: Received friend accepted:', friendship);
    },
    receiveFriendAcceptedSuccess(state, action: PayloadAction<FriendDto>) {
      const friendship = action.payload;
      if (friendship.status === 'accepted') {
        state.friends = state.friends.filter(
          (f) => f._id !== `temp-${friendship.friendId}-${friendship.userId}`
        );
        state.friends.push(friendship);
        state.friendRequests = state.friendRequests.filter(
          (req) => req._id !== friendship._id
        );
        state.sentFriendRequests = state.sentFriendRequests.filter(
          (req) => req._id !== friendship._id
        );
      }
      console.log('friendSlice: Received friend accepted success:', friendship);
    },
    receiveFriendRejected(state, action: PayloadAction<{ userId: string; friendId: string }>) {
      const { userId, friendId } = action.payload;
      state.friendRequests = state.friendRequests.filter(
        (req) => !(req.userId === friendId && req.friendId === userId)
      );
      state.sentFriendRequests = state.sentFriendRequests.filter(
        (req) => !(req.userId === friendId && req.friendId === userId)
      );
      console.log('friendSlice: Received friend rejected:', { userId, friendId });
    },
    receiveFriendRejectedSuccess(state, action: PayloadAction<{ userId: string; friendId: string }>) {
      const { userId, friendId } = action.payload;
      state.friendRequests = state.friendRequests.filter(
        (req) => !(req.userId === friendId && req.friendId === userId)
      );
      state.sentFriendRequests = state.sentFriendRequests.filter(
        (req) => !(req.userId === friendId && req.friendId === userId)
      );
      console.log('friendSlice: Received friend rejected success:', { userId, friendId });
    },
    receiveFriendRemoved(state, action: PayloadAction<{ userId: string; friendId: string }>) {
      const { userId, friendId } = action.payload;
      state.friends = state.friends.filter(
        (friend) =>
          !(friend.userId === userId && friend.friendId === friendId) &&
          !(friend.userId === friendId && friend.friendId === userId)
      );
      console.log('friendSlice: Received friend removed:', { userId, friendId });
    },
    receiveFriendRemovedSuccess(state, action: PayloadAction<{ userId: string; friendId: string }>) {
      const { userId, friendId } = action.payload;
      state.friends = state.friends.filter(
        (friend) =>
          !(friend.userId === userId && friend.friendId === friendId) &&
          !(friend.userId === friendId && friend.friendId === userId)
      );
      console.log('friendSlice: Received friend removed success:', { userId, friendId });
    },
    receiveFollowUser(state, action: PayloadAction<FollowDto>) {
      const follow = action.payload;
      if (!state.followedUsers.includes(follow.followedId)) {
        state.followedUsers.push(follow.followedId);
      }
      if (!state.followers.includes(follow.followerId)) {
        state.followers.push(follow.followerId);
      }
      console.log('friendSlice: Received follow user:', follow);
    },
    receiveFollowUserSuccess(state, action: PayloadAction<FollowDto>) {
      const follow = action.payload;
      if (!state.followedUsers.includes(follow.followedId)) {
        state.followedUsers.push(follow.followedId);
      }
      if (!state.followers.includes(follow.followerId)) {
        state.followers.push(follow.followerId);
      }
      console.log('friendSlice: Received follow user success:', follow);
    },
    receiveUnfollowUser(state, action: PayloadAction<FollowRequest>) {
      const { followerId, followedId } = action.payload;
      state.followedUsers = state.followedUsers.filter((id) => id !== followedId);
      state.followers = state.followers.filter((id) => id !== followerId);
      console.log('friendSlice: Received unfollow user:', { followerId, followedId });
    },
    receiveUnfollowUserSuccess(state, action: PayloadAction<FollowRequest>) {
      const { followerId, followedId } = action.payload;
      state.followedUsers = state.followedUsers.filter((id) => id !== followedId);
      state.followers = state.followers.filter((id) => id !== followerId);
      console.log('friendSlice: Received unfollow user success:', { followerId, followedId });
    },
    updateFriendConnectionStatus(state, action: PayloadAction<{ friendId: string; isOnline: boolean; lastConnectedAt: string }>) {
      const { friendId, isOnline, lastConnectedAt } = action.payload;
      const friend = state.friends.find(
        (f) => f.userId === friendId || f.friendId === friendId
      );
      if (friend) {
        friend.isOnline = isOnline;
        friend.lastConnectedAt = lastConnectedAt;
      }
      const friendRequest = state.friendRequests.find(
        (req) => req.userId === friendId || req.friendId === friendId
      );
      if (friendRequest) {
        friendRequest.isOnline = isOnline;
        friendRequest.lastConnectedAt = lastConnectedAt;
      }
      const sentFriendRequest = state.sentFriendRequests.find(
        (req) => req.userId === friendId || req.friendId === friendId
      );
      if (sentFriendRequest) {
        sentFriendRequest.isOnline = isOnline;
        sentFriendRequest.lastConnectedAt = lastConnectedAt;
      }
      console.log('friendSlice: Updated connection status for friend:', { friendId, isOnline, lastConnectedAt });
    },
    socketError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearFriendsError(state) {
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload.filter((friend) => friend.status === 'accepted');
        // Correction : demandes reçues (où je suis friendId)
        state.friendRequests = action.payload.filter((friend) => friend.status === 'pending' && friend.friendId !== friend.userId);
        // Correction : demandes envoyées (où je suis userId)
        state.sentFriendRequests = action.payload.filter((friend) => friend.status === 'pending' && friend.userId !== friend.friendId);
        console.log('friendSlice: Updated state after fetchFriends:', {
          friends: state.friends,
          friendRequests: state.friendRequests,
          sentFriendRequests: state.sentFriendRequests,
        });
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Échec de la récupération des amis';
      })
      .addCase(fetchFollowedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.followedUsers = action.payload;
      })
      .addCase(fetchFollowedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Échec de la récupération des utilisateurs suivis';
      })
      .addCase(fetchFollowers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Échec de la récupération des followers';
      })
      .addCase(addFriendAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFriendAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addFriendAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Échec de l’ajout de l’ami';
      })
      .addCase(acceptFriendAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptFriendAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(acceptFriendAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Échec de l’acceptation de l’ami';
      })
      .addCase(rejectFriendAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectFriendAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(rejectFriendAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Échec du rejet de l’ami';
      })
      .addCase(removeFriendAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFriendAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFriendAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Échec de la suppression de l’ami';
      })
      .addCase(followUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(followUserAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(followUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Échec du suivi de l’utilisateur';
      })
      .addCase(unfollowUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unfollowUserAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(unfollowUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Échec de l’arrêt du suivi de l’utilisateur';
      });
  },
});

export const {
  addFriendOptimistic,
  removeTempFriendRequest,
  acceptFriendOptimistic,
  addFollowOptimistic,
  removeTempFollow,
  removeFriendOptimistic,
  receiveFriendRequest,
  receiveFriendRequestSent,
  receiveFriendAccepted,
  receiveFriendAcceptedSuccess,
  receiveFriendRejected,
  receiveFriendRejectedSuccess,
  receiveFriendRemoved,
  receiveFriendRemovedSuccess,
  receiveFollowUser,
  receiveFollowUserSuccess,
  receiveUnfollowUser,
  receiveUnfollowUserSuccess,
  updateFriendConnectionStatus,
  socketError,
  clearFriendsError,
} = friendSlice.actions;

export default friendSlice.reducer;