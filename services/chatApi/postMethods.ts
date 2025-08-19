import {post, get, put, del} from "./httpMethods";
import {PostDto} from "./types";

export const createPost = async (userId : string, content : string): Promise<PostDto> => {
  console.log("chatApiClient: Creating post:", {userId, content});
  try {
    const response = await post<PostDto>("/posts", {userId, content});
    if (!response._id) {
      throw new Error("Invalid response: post _id missing");
    }
    console.log("chatApiClient: Create post via HTTP successful:", response);
    return response;
  } catch (error) {
    console.error("chatApiClient: Create post failed:", error);
    throw {
      error : error.message || "Échec de la création du post",
      action: error.action || "Veuillez réessayer.",
      status: error.status
    };
  }
};

export const getAllPosts = async (userId? : string): Promise<PostDto[]> => {
  console.log(
    "chatApiClient: Getting all posts", userId
    ? `for user ${userId}`
    : "");
  const endpoint = userId
    ? `/posts?userId=${userId}`
    : "/posts";
  const response = await get<PostDto[]>(endpoint);
  if (!Array.isArray(response)) {
    throw new Error("Invalid response: posts must be an array");
  }
  console.log("chatApiClient: Get all posts successful:", response);
  return response;
};

export const getNursePosts = async (): Promise<PostDto[]> => {
  console.log("chatApiClient: Getting nurse posts");
  const response = await get<PostDto[]>("/posts/nurses");
  if (!Array.isArray(response)) {
    throw new Error("Invalid response: nurse posts must be an array");
  }
  console.log("chatApiClient: Get nurse posts successful:", response);
  return response;
};

export const getPostById = async (postId : string): Promise<PostDto> => {
  console.log("chatApiClient: Getting post by ID:", postId);
  const response = await get<PostDto>(`/posts/${postId}`);
  if (!response._id) {
    throw new Error("Invalid response: post _id missing");
  }
  console.log("chatApiClient: Get post by ID successful:", response);
  return response;
};

export const updatePost = async (postId : string, userId : string, content : string): Promise<PostDto> => {
  console.log("chatApiClient: Updating post:", {postId, userId, content});
  const response = await put<PostDto>(`/posts/${postId}`, {userId, content});
  if (!response._id) {
    throw new Error("Invalid response: post _id missing");
  }
  console.log("chatApiClient: Update post successful:", response);
  return response;
};

export const deletePost = async (postId : string, userId : string): Promise<void> => {
  console.log("chatApiClient: Deleting post:", {postId, userId});
  await del<void>(`/posts/${postId}`, {data: {
      userId
    }});
  console.log("chatApiClient: Delete post successful");
};
