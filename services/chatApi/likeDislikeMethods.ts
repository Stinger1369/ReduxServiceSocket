import {post} from "./httpMethods";
import {UserDto, PostDto, CommentDto} from "./types";

export const likeUser = async (userId : string, likerId : string): Promise<UserDto> => {
  return await post<UserDto>(`/likes/user/${userId}/like`, {likerId});
};

export const unlikeUser = async (userId : string, likerId : string): Promise<UserDto> => {
  return await post<UserDto>(`/likes/user/${userId}/unlike`, {likerId});
};

export const dislikeUser = async (userId : string, dislikerId : string): Promise<UserDto> => {
  return await post<UserDto>(`/likes/user/${userId}/dislike`, {dislikerId});
};

export const likePost = async (postId : string, userId : string): Promise<PostDto> => {
  const response = await post<PostDto>(`/likes/post/${postId}/like`, {userId});
  if (!response._id) {
    throw new Error("Invalid response: _id missing");
  }
  return response;
};

export const unlikePost = async (postId : string, userId : string): Promise<PostDto> => {
  const response = await post<PostDto>(`/likes/post/${postId}/unlike`, {userId});
  if (!response._id) {
    throw new Error("Invalid response: _id missing");
  }
  return response;
};

export const dislikePost = async (postId : string, userId : string): Promise<PostDto> => {
  const response = await post<PostDto>(`/likes/post/${postId}/dislike`, {userId});
  if (!response._id) {
    throw new Error("Invalid response: _id missing");
  }
  return response;
};

export const likeComment = async (commentId : string, userId : string): Promise<CommentDto> => {
  const response = await post<CommentDto>(`/likes/comment/${commentId}/like`, {userId});
  if (!response._id) {
    throw new Error("Invalid response: _id missing");
  }
  return response;
};

export const unlikeComment = async (commentId : string, userId : string): Promise<CommentDto> => {
  const response = await post<CommentDto>(`/likes/comment/${commentId}/unlike`, {userId});
  if (!response._id) {
    throw new Error("Invalid response: _id missing");
  }
  return response;
};

export const dislikeComment = async (commentId : string, userId : string): Promise<CommentDto> => {
  const response = await post<CommentDto>(`/likes/comment/${commentId}/dislike`, {userId});
  if (!response._id) {
    throw new Error("Invalid response: _id missing");
  }
  return response;
};

export const likeMessage = async (userId : string, targetId : string): Promise<void> => {
  return await post<void>("/likes", {userId, targetId, targetType: "message"});
};

export const unlikeMessage = async (userId : string, targetId : string): Promise<void> => {
  return await post<void>("/likes/unlike", {userId, targetId, targetType: "message"});
};

export const dislikeMessage = async (userId : string, targetId : string): Promise<void> => {
  return await post<void>("/likes/dislike", {userId, targetId, targetType: "message"});
};
