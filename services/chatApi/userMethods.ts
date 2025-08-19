import AsyncStorage from "@react-native-async-storage/async-storage";
import { get, post, put, del } from "./httpMethods";
import { UserDto, DecodedToken } from "./types";

const decodeJwt = (token: string): DecodedToken => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    console.log("userMethods: Decoded JWT:", decoded);
    return decoded;
  } catch (error) {
    console.error("userMethods: Failed to decode JWT:", error);
    throw new Error("Failed to decode JWT token");
  }
};

export const getUser = async (userId: string): Promise<UserDto> => {
  console.log("userMethods: Fetching user with userId:", userId);
  const response = await get<UserDto>(`/users/${userId}`);
  if (!response.userId) {
    console.error("userMethods: Invalid response: userId missing");
    throw new Error("Invalid response: userId missing");
  }
  return response;
};

export const getUsers = async (userIds: string[]): Promise<UserDto[]> => {
  console.log("userMethods: Fetching users with userIds:", userIds);
  const response = await get<UserDto[]>(`/users/multiple?ids=${userIds.join(",")}`);
  if (!Array.isArray(response) || response.some((user) => !user.userId)) {
    console.error("userMethods: Invalid response: userIds missing");
    throw new Error("Invalid response: userIds missing");
  }
  return response;
};

export const getBlockedUsers = async (userId: string): Promise<{ blockedUsers: string[]; blockedBy: string[] }> => {
  console.log("userMethods: Fetching blocked users for userId:", userId);
  const response = await get<{ blockedUsers: string[]; blockedBy: string[] }>(`/users/${userId}/blocked-info`);
  if (!Array.isArray(response.blockedUsers) || !Array.isArray(response.blockedBy)) {
    console.error("userMethods: Invalid response: expected arrays for blockedUsers and blockedBy");
    throw new Error("Invalid response: expected arrays for blockedUsers and blockedBy");
  }
  console.log(`userMethods: Successfully fetched ${response.blockedUsers.length} blocked users and ${response.blockedBy.length} blockedBy for userId: ${userId}`);
  return response;
};

export const getUserByEmail = async (email: string): Promise<UserDto> => {
  if (!email || typeof email !== "string") {
    console.error("userMethods: Invalid email: email is required");
    throw new Error("Invalid email: email is required");
  }
  console.log("userMethods: Fetching user by email:", email);
  const response = await get<UserDto>(`/users/email/${email}`);
  if (!response.email) {
    console.error("userMethods: Invalid response: email missing");
    throw new Error("Invalid response: email missing");
  }
  return response;
};

export const saveUser = async (userData: Partial<UserDto>): Promise<UserDto> => {
  if (!userData.userId) {
    console.error("userMethods: Invalid user data: userId is required");
    throw new Error("Invalid user data: userId is required");
  }
  const token = await AsyncStorage.getItem("token");
  if (!token) {
    console.error("userMethods: No token found");
    throw new Error("No token found");
  }
  let tokenEmail: string;
  try {
    const decodedToken: DecodedToken = decodeJwt(token);
    tokenEmail = decodedToken.sub;
    console.log("userMethods: Decoded token email:", tokenEmail);
  } catch (error) {
    console.error("userMethods: Failed to decode JWT token:", error);
    throw new Error("Failed to decode JWT token");
  }

  if (userData.email && userData.email !== tokenEmail) {
    console.warn("userMethods: Email mismatch in saveUser", {
      providedEmail: userData.email,
      tokenEmail,
    });
    userData.email = tokenEmail;
  } else if (!userData.email) {
    userData.email = tokenEmail;
  }

  console.log("userMethods: Saving user:", userData);
  const response = await post<UserDto>("/users", userData);
  if (!response.userId) {
    console.error("userMethods: Invalid response: userId missing");
    throw new Error("Invalid response: userId missing");
  }
  return response;
};

export const blockUser = async (userId: string, targetId: string): Promise<void> => {
  console.log("userMethods: Blocking user:", { userId, targetId });
  await post<void>(`/users/${userId}/block/${targetId}`, {});
};

export const unblockUser = async (userId: string, targetId: string): Promise<void> => {
  console.log("userMethods: Unblocking user:", { userId, targetId });
  await post<void>(`/users/${userId}/unblock/${targetId}`, {});
};

export const reportUser = async (reporterId: string, targetId: string, reason: string): Promise<void> => {
  console.log("userMethods: Reporting user:", { reporterId, targetId, reason });
  await post<void>(`/users/${reporterId}/report/${targetId}`, { reason });
};

export const getUserLikes = async (userId: string): Promise<{ likes: string[]; likedBy: string[] }> => {
  console.log(`userMethods: Fetching likes for user ${userId}`);
  try {
    const response = await get<{ likes: string[]; likedBy: string[] }>(`/users/${userId}/likes`);
    if (!response || !Array.isArray(response.likes) || !Array.isArray(response.likedBy)) {
      console.error("userMethods: Invalid response, expected likes and likedBy arrays:", response);
      throw new Error("Invalid response: likes and likedBy must be arrays");
    }
    console.log(`userMethods: Successfully fetched likes for user ${userId}:`, response);
    return response;
  } catch (error) {
    console.error(`userMethods: Failed to fetch likes for user ${userId}:`, error);
    throw error;
  }
};

export const deactivateUser = async (userId: string): Promise<void> => {
  console.log("userMethods: Deactivating user:", userId);
  await put<void>(`/users/${userId}/deactivate`, {});
  console.log(`userMethods: Successfully deactivated user ${userId}`);
};

export const reactivateUser = async (userId: string): Promise<void> => {
  console.log("userMethods: Reactivating user:", userId);
  await put<void>(`/users/${userId}/reactivate`, {});
  console.log(`userMethods: Successfully reactivated user ${userId}`);
};

export const deleteUser = async (userId: string): Promise<void> => {
  console.log("userMethods: Deleting user:", userId);
  await del<void>(`/users/${userId}`);
  console.log(`userMethods: Successfully deleted user ${userId}`);
};