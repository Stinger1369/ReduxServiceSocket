import {get, post, put, del} from "./httpMethods";
import {CommentDto} from "./types";

export const createComment = async (comment : {
  postId: string;
  userId: string;
  content: string;
}): Promise<CommentDto> => {
  console.log("chatApiClient: Creating comment:", comment);
  try {
    const response = await post<CommentDto>("/comments", {
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content
    });
    if (!response._id) {
      throw new Error("Invalid response: _id missing");
    }
    console.log("chatApiClient: Create comment successful:", response);
    return response;
  } catch (error) {
    console.error("chatApiClient: Create comment failed:", error);
    throw {
      error : error.message || "Échec de la création du commentaire",
      action: "Veuillez réessayer.",
      status: error.status || 500
    };
  }
};

export const getCommentById = async (commentId : string): Promise<CommentDto> => {
  console.log("chatApiClient: Getting comment by ID:", commentId);
  const response = await get<CommentDto>(`/comments/${commentId}`);
  if (!response._id) {
    throw new Error("Invalid response: _id missing");
  }
  console.log("chatApiClient: Get comment by ID successful:", response);
  return response;
};

export const getCommentsByPost = async (postId : string): Promise<CommentDto[]> => {
  console.log("chatApiClient: Getting comments for post:", postId);
  const response = await get<CommentDto[]>(`/comments/post/${postId}`);
  if (!Array.isArray(response)) {
    throw new Error("Invalid response: comments must be an array");
  }
  console.log("chatApiClient: Get comments by post successful:", response);
  return response;
};

export const updateComment = async (commentId : string, data : {
  userId: string;
  content: string;
}): Promise<CommentDto> => {
  console.log("chatApiClient: Updating comment:", {commentId, data});
  const response = await put<CommentDto>(`/comments/${commentId}`, data);
  if (!response._id) {
    throw new Error("Invalid response: _id missing");
  }
  console.log("chatApiClient: Update comment successful:", response);
  return response;
};

export const deleteComment = async (commentId : string, userId : string): Promise<void> => {
  console.log("chatApiClient: Deleting comment:", {commentId, userId});
  await del<void>(`/comments/${commentId}`, {data: {
      userId
    }});
  console.log("chatApiClient: Delete comment successful");
};
