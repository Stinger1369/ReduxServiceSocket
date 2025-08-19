export interface CommentDto {
  _id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: string[];
  dislikes: string[];
}
