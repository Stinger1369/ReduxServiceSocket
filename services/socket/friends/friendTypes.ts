export interface FriendDto {
  _id: string;
  userId: string;
  friendId: string;
  status: "pending" | "accepted";
  createdAt: string;
  updatedAt: string;
}

export interface FollowDto {
  _id: string;
  followerId: string;
  followedId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowRequest {
  followerId: string;
  followedId: string;
}

export interface EventHandler {
  event: string;
  action: (data : any) => void;
}
