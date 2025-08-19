export interface ErrorResponse {
  error: string;
  action: string;
  status?: number;
}

export interface UserDto {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  pseudo?: string;
  role: "NURSE" | "PATIENT";
  isOnline?: boolean;
  lastConnectedAt?: string | null;
  likes: string[];
  dislikes: string[];
}

export interface PostDto {
  _id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDto {
  _id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDto {
  conversationId: string;
  participants: string[];
  messages: ChatMessageDto[];
  isGroup: boolean;
  groupName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DecodedToken {
  sub: string;
}

// Manual JWT decoding function
export const decodeJwt = (token : string): DecodedToken => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(atob(base64).split("").map((c) => "%" + (
    "00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT manually:", error);
    throw new Error("Invalid JWT token");
  }
};
