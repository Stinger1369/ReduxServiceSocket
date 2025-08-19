export interface PostDto {
  _id: string;
  userId: string;
  content: string;
  comments: string[];
  likes: string[];
  dislikes: string[];
  createdAt: string;
  updatedAt: string;
}
