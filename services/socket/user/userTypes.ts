export interface UserDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  pseudo: string;
  role: "NURSE" | "PATIENT";
  conversations: string[];
  friendRequests: string[];
  sentFriendRequests: string[];
  posts: string[];
  likes: string[];
  dislikes: string[];
  notifications: string[];
  followers: string[];
  blockedBy: string[];
  isOnline: boolean;
  lastConnectedAt: Date | null;
}

export interface EventHandler {
  event: string;
  action: (data : any) => void;
}
