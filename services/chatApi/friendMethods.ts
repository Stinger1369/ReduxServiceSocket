import {post, get, del} from "./httpMethods";
import {FriendDto, FollowDto, FollowRequest} from "../socket/types";

export const getFriendsByUserId = async (userId : string): Promise<FriendDto[]> => {
  console.log("friendMethods: Fetching friends for userId:", userId);
  const response = await get<FriendDto[]>(`/friends/user/${userId}`);
  return response;
};

export const getFollowedUsers = async (followerId : string): Promise<string[]> => {
  console.log("friendMethods: Fetching followed users for followerId:", followerId);
  const response = await get<string[]>(`/friends/followed/${followerId}`);
  return response;
};

export const getFollowers = async (userId : string): Promise<string[]> => {
  console.log("friendMethods: Fetching followers for userId:", userId);
  const response = await get<string[]>(`/friends/followers/${userId}`);
  return response;
};

export const addFriend = async (userId : string, friendId : string): Promise<FriendDto> => {
  console.log("friendMethods: Adding friend:", {userId, friendId});
  const response = await post<FriendDto>("/friends/add", {userId, friendId});
  if (!response._id) {
    console.error("friendMethods: Invalid response: _id missing");
    throw new Error("Invalid response: _id missing");
  }
  return response;
};

export const acceptFriend = async (userId : string, friendId : string): Promise<FriendDto> => {
  console.log("friendMethods: Accepting friend:", {userId, friendId});
  const response = await post<FriendDto>("/friends/accept", {userId, friendId});
  if (!response._id) {
    console.error("friendMethods: Invalid response: _id missing");
    throw new Error("Invalid response: _id missing");
  }
  return response;
};

export const rejectFriend = async (userId : string, friendId : string): Promise<void> => {
  console.log("friendMethods: Rejecting friend:", {userId, friendId});
  await post<void>("/friends/reject", {userId, friendId});
};

export const removeFriend = async (userId : string, friendId : string): Promise<void> => {
  console.log("friendMethods: Removing friend:", {userId, friendId});
  await post<void>("/friends/remove", {userId, friendId});
};

export const followUser = async (followRequest : FollowRequest): Promise<FollowDto> => {
  console.log("friendMethods: Following user:", followRequest);
  const response = await post<FollowDto>("/friends/follow", followRequest);
  if (!response._id) {
    console.error("friendMethods: Invalid response: _id missing");
    throw new Error("Invalid response: _id missing");
  }
  return response;
};

export const unfollowUser = async (followRequest : FollowRequest): Promise<void> => {
  console.log("friendMethods: Unfollowing user:", followRequest);
  await del<void>("/friends/unfollow", { data: followRequest });
};
