export interface Post {
  _id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: string[];
  dislikes: string[];
  comments: string[];
}

export interface EventHandler {
  event: string;
  action: (data : any) => void;
}
