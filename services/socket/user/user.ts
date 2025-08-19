import { Socket } from "socket.io-client";
import { SocketConnection } from "../../socketService";
import { UserDto, EventHandler } from "./userTypes";
import { handleUserDeletion } from "../../../redux/slices/chat/userChat/userChatSlice";

export class UserService {
  private connection: SocketConnection;
  private dispatch: any;
  private socket: Socket | null;

  constructor(connection: SocketConnection, dispatch: any) {
    this.connection = connection;
    this.dispatch = dispatch;
    this.socket = this.connection.getSocket();
    console.log("UserService: Initialized with dispatch:", !!dispatch);
  }

  async emit(event: string, data: any): Promise<void> {
    if (!this.connection.isConnected()) {
      console.log(`UserService: Socket not connected, attempting to reconnect for ${event}`);
      const state = this.connection.getState();
      if (!state.userId || !state.email || !state.role) {
        console.error("UserService: User credentials missing");
        throw new Error("User credentials missing");
      }
      await this.connection.initialize(state.userId, state.email, state.firstName ?? undefined, state.lastName ?? undefined, state.role);
      this.socket = this.connection.getSocket();
    }

    if (!this.socket || !this.socket.connected) {
      console.error(`UserService: Cannot emit ${event}, socket is not connected`);
      throw new Error("Socket is not connected");
    }

    const payload = { event, data };
    console.log(`UserService: Emitting event: ${event}`, payload);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error(`UserService: Timeout waiting for ${event} response`);
        reject(new Error(`Timeout waiting for ${event} response`));
      }, 30000);

      this.socket!.once("error", (error: { message: string }) => {
        clearTimeout(timeout);
        console.error(`UserService: Received error for ${event}:`, error.message);
        if (error.message === "Your account has been deleted or deactivated") {
          this.dispatch(handleUserDeletion());
          resolve();
        } else {
          reject(new Error(error.message || `Failed to process ${event}`));
        }
      });

      console.log(`UserService: Sending ${event} with callback`);
      this.socket!.emit(event, payload, (response: { error?: string; success?: boolean }) => {
        clearTimeout(timeout);
        console.log(`UserService: Received callback response for ${event}:`, response);
        if (response?.error) {
          console.error(`UserService: Failed to emit ${event}:`, response.error);
          reject(new Error(response.error));
        } else {
          console.log(`UserService: Successfully emitted ${event}`);
          resolve();
        }
      });

      if (event === "userLiked") {
        this.socket!.once("userLiked", (data: { userId: string; likerId: string }) => {
          if (data.userId === payload.data.userId && data.likerId === payload.data.likerId) {
            clearTimeout(timeout);
            console.log(`UserService: userLiked event received for ${event}, resolving promise`);
            resolve();
          }
        });
      } else if (event === "userUnliked") {
        this.socket!.once("userUnliked", (data: { userId: string; likerId: string }) => {
          if (data.userId === payload.data.userId && data.likerId === payload.data.likerId) {
            clearTimeout(timeout);
            console.log(`UserService: userUnliked event received for ${event}, resolving promise`);
            resolve();
          }
        });
      } else if (event === "userDisliked") {
        this.socket!.once("userDisliked", (data: { userId: string; dislikerId: string }) => {
          if (data.userId === payload.data.userId && data.dislikerId === payload.data.dislikerId) {
            clearTimeout(timeout);
            console.log(`UserService: userDisliked event received for ${event}, resolving promise`);
            resolve();
          }
        });
      } else if (event === "blockUser") {
        this.socket!.once("userBlockedSuccess", (data: { targetId: string }) => {
          if (data.targetId === payload.data.targetId) {
            clearTimeout(timeout);
            console.log(`UserService: userBlockedSuccess received for ${event}, resolving promise`);
            resolve();
          }
        });
      } else if (event === "unblockUser") {
        this.socket!.once("userUnblockedSuccess", (data: { targetId: string }) => {
          if (data.targetId === payload.data.targetId) {
            clearTimeout(timeout);
            console.log(`UserService: userUnblockedSuccess received for ${event}, resolving promise`);
            resolve();
          }
        });
      } else if (event === "reportUser") {
        this.socket!.once("userReportedSuccess", (data: { targetId: string }) => {
          if (data.targetId === payload.data.targetId) {
            clearTimeout(timeout);
            console.log(`UserService: userReportedSuccess received for ${event}, resolving promise`);
            resolve();
          }
        });
      }
    });
  }

  async getBlockedUsers(userId: string): Promise<{ blockedUsers: string[]; blockedBy: string[] }> {
    console.log("UserService: Fetching blocked users via WebSocket for userId:", userId);
    return new Promise((resolve, reject) => {
      if (!this.connection.isConnected()) {
        console.log("UserService: Socket not connected, attempting to reconnect for getBlockedUsers");
        const state = this.connection.getState();
        if (!state.userId || !state.email || !state.role) {
          console.error("UserService: User credentials missing");
          reject(new Error("User credentials missing"));
          return;
        }
        this.connection
          .initialize(state.userId, state.email, state.firstName, state.lastName, state.role)
          .then(() => {
            this.socket = this.connection.getSocket();
            if (!this.socket || !this.socket.connected) {
              console.error("UserService: Cannot emit getBlockedUsers, socket is not connected");
              reject(new Error("Socket is not connected"));
              return;
            }
            this.emitBlockedUsers(userId, resolve, reject);
          })
          .catch((error) => {
            console.error("UserService: Failed to reconnect for getBlockedUsers:", error);
            reject(error);
          });
      } else {
        this.emitBlockedUsers(userId, resolve, reject);
      }
    });
  }

  private emitBlockedUsers(
    userId: string,
    resolve: (value: { blockedUsers: string[]; blockedBy: string[] }) => void,
    reject: (reason?: any) => void
  ) {
    const timeout = setTimeout(() => {
      console.error("UserService: Timeout waiting for getBlockedUsers response");
      reject(new Error("Timeout waiting for getBlockedUsers response"));
    }, 30000);

    this.socket!.once("blockedUsers", (blockedInfo: { blockedUsers: string[]; blockedBy: string[] }) => {
      clearTimeout(timeout);
      console.log("UserService: Received blockedUsers event:", blockedInfo);
      resolve(blockedInfo);
    });

    this.socket!.once("error", (error: { message: string }) => {
      clearTimeout(timeout);
      console.error("UserService: Received error for getBlockedUsers:", error.message);
      if (error.message === "Your account has been deleted or deactivated") {
        this.dispatch(handleUserDeletion());
        resolve({ blockedUsers: [], blockedBy: [] });
      } else {
        reject(new Error(error.message || "Failed to fetch blocked users"));
      }
    });

    this.socket!.emit("getBlockedUsers", { userId });
    console.log("UserService: Emitted getBlockedUsers for userId:", userId);
  }

  async fetchBatchLikes(userIds: string[]): Promise<{ userId: string; likes: string[]; likedBy: string[] }[]> {
    console.log("UserService: Fetching batch likes via WebSocket for userIds:", userIds);
    return new Promise((resolve, reject) => {
      if (!this.connection.isConnected()) {
        console.log("UserService: Socket not connected, attempting to reconnect for getBatchLikes");
        const state = this.connection.getState();
        if (!state.userId || !state.email || !state.role) {
          console.error("UserService: User credentials missing");
          reject(new Error("User credentials missing"));
          return;
        }
        this.connection
          .initialize(state.userId, state.email, state.firstName, state.lastName, state.role)
          .then(() => {
            this.socket = this.connection.getSocket();
            if (!this.socket || !this.socket.connected) {
              console.error("UserService: Cannot emit getBatchLikes, socket is not connected");
              reject(new Error("Socket is not connected"));
              return;
            }
            this.emitBatchLikes(userIds, resolve, reject);
          })
          .catch((error) => {
            console.error("UserService: Failed to reconnect for getBatchLikes:", error);
            reject(error);
          });
      } else {
        this.emitBatchLikes(userIds, resolve, reject);
      }
    });
  }

  private emitBatchLikes(
    userIds: string[],
    resolve: (value: { userId: string; likes: string[]; likedBy: string[] }[]) => void,
    reject: (reason?: any) => void
  ) {
    const timeout = setTimeout(() => {
      console.error("UserService: Timeout waiting for getBatchLikes response");
      reject(new Error("Timeout waiting for getBatchLikes response"));
    }, 30000);

    this.socket!.once("batchLikesResponse", (likesData: { userId: string; likes: string[]; likedBy: string[] }[]) => {
      clearTimeout(timeout);
      console.log("UserService: Received batchLikesResponse event:", likesData);
      resolve(likesData);
    });

    this.socket!.once("batchLikesError", (error: { message: string }) => {
      clearTimeout(timeout);
      console.error("UserService: Received error for getBatchLikes:", error.message);
      if (error.message === "Your account has been deleted or deactivated") {
        this.dispatch(handleUserDeletion());
        resolve([]);
      } else {
        reject(new Error(error.message || "Failed to fetch batch likes"));
      }
    });

    this.socket!.emit("getBatchLikes", { userIds });
    console.log("UserService: Emitted getBatchLikes for userIds:", userIds);
  }

  async sendUserUpdate(userDto: {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: "NURSE" | "PATIENT";
    isOnline?: boolean;
    lastConnectedAt?: string | null;
  }): Promise<void> {
    console.log("UserService: Sending user update:", userDto);
    await this.emit("updateUser", userDto);
  }

  async likeUser(userId: string, likerId: string): Promise<void> {
    console.log("UserService: Liking user via WebSocket:", { userId, likerId });
    await this.emit("userLiked", { userId, likerId });
  }

  async unlikeUser(userId: string, likerId: string): Promise<void> {
    console.log("UserService: Unliking user via WebSocket:", { userId, likerId });
    await this.emit("userUnliked", { userId, likerId });
  }

  async dislikeUser(userId: string, dislikerId: string): Promise<void> {
    console.log("UserService: Disliking user via WebSocket:", { userId, dislikerId });
    await this.emit("userDisliked", { userId, dislikerId });
  }

  async blockUser(userId: string, targetId: string): Promise<void> {
    console.log("UserService: Blocking user via WebSocket:", { userId, targetId });
    try {
      await this.emit("blockUser", { userId, targetId });
    } catch (error) {
      console.error("UserService: Failed to block user:", error);
      if (error.message.includes("not found")) {
        console.warn(`UserService: Target user ${targetId} not found, dispatching removal`);
        if (this.dispatch) {
          this.dispatch({
            type: "userChat/removeInvalidUser",
            payload: { userId: targetId },
          });
        }
      }
      throw error;
    }
  }

  async unblockUser(userId: string, targetId: string): Promise<void> {
    console.log("UserService: Unblocking user via WebSocket:", { userId, targetId });
    try {
      await this.emit("unblockUser", { userId, targetId });
    } catch (error) {
      console.error("UserService: Failed to unblock user:", error);
      if (error.message.includes("not found")) {
        console.warn(`UserService: Target user ${targetId} not found, dispatching removal`);
        if (this.dispatch) {
          this.dispatch({
            type: "userChat/removeInvalidUser",
            payload: { userId: targetId },
          });
        }
      }
      throw error;
    }
  }

  async reportUser(reporterId: string, targetId: string, reason: string): Promise<void> {
    console.log("UserService: Reporting user via WebSocket:", { reporterId, targetId, reason });
    try {
      await this.emit("reportUser", { reporterId, targetId, reason });
    } catch (error) {
      console.error("UserService: Failed to report user:", error);
      if (error.message.includes("not found")) {
        console.warn(`UserService: Target user ${targetId} not found, dispatching removal`);
        if (this.dispatch) {
          this.dispatch({
            type: "userChat/removeInvalidUser",
            payload: { userId: targetId },
          });
        }
      }
      throw error;
    }
  }

  setupEventHandlers() {
    this.socket = this.connection.getSocket();
    if (!this.socket) {
      console.error("UserService: Socket is not initialized");
      return;
    }

    const eventHandlers: EventHandler[] = [
      {
        event: "userUpdated",
        action: (updatedUser: UserDto) => {
          if (!updatedUser.userId) {
            console.error("UserService: Invalid user update, missing userId:", updatedUser);
            return;
          }
          console.log("UserService: Received userUpdated event:", updatedUser);
          if (this.dispatch) {
            this.dispatch({ type: "userChat/receiveUserUpdate", payload: updatedUser });
          } else {
            console.warn("UserService: Dispatch not set, skipping userUpdated event");
          }
        },
      },
      {
        event: "blockedUsers",
        action: (blockedInfo: { blockedUsers: string[]; blockedBy: string[] }) => {
          console.log("UserService: Received blockedUsers event:", blockedInfo);
          if (this.dispatch) {
            this.dispatch({ type: "userChat/receiveBlockedUsers", payload: blockedInfo });
          } else {
            console.warn("UserService: Dispatch not set, skipping blockedUsers event");
          }
        },
      },
      {
        event: "userConnected",
        action: (data: { userId: string }) => {
          if (!data.userId) {
            console.error("UserService: Invalid userConnected event, missing userId:", data);
            return;
          }
          console.log("UserService: Received userConnected event:", data);
          if (this.dispatch) {
            this.dispatch({
              type: "userChat/updateUserConnectionStatus",
              payload: {
                userId: data.userId,
                isOnline: true,
                lastConnectedAt: new Date().toISOString(),
              },
            });
          } else {
            console.warn("UserService: Dispatch not set, skipping userConnected event");
          }
        },
      },
      {
        event: "userDisconnected",
        action: (data: { userId: string }) => {
          if (!data.userId) {
            console.error("UserService: Invalid userDisconnected event, missing userId:", data);
            return;
          }
          console.log("UserService: Received userDisconnected event:", data);
          if (this.dispatch) {
            this.dispatch({
              type: "userChat/updateUserConnectionStatus",
              payload: {
                userId: data.userId,
                isOnline: false,
                lastConnectedAt: new Date().toISOString(),
              },
            });
          } else {
            console.warn("UserService: Dispatch not set, skipping userDisconnected event");
          }
        },
      },
      {
        event: "userLiked",
        action: (data: { userId: string; likerId: string; likes: string[]; dislikes: string[]; likedBy: string[] }) => {
          if (!data.userId || !data.likerId) {
            console.error("UserService: Invalid userLiked event, missing userId or likerId:", data);
            return;
          }
          console.log("UserService: Received userLiked event:", data);
          if (this.dispatch) {
            this.dispatch({
              type: "userChat/updateUserLikesDislikes",
              payload: {
                userId: data.userId,
                likes: data.likes,
                dislikes: data.dislikes,
                likedBy: data.likedBy,
              },
            });
          } else {
            console.warn("UserService: Dispatch not set, skipping userLiked event");
          }
        },
      },
      {
        event: "userUnliked",
        action: (data: { userId: string; likerId: string; likes: string[]; dislikes: string[]; likedBy: string[] }) => {
          if (!data.userId || !data.likerId) {
            console.error("UserService: Invalid userUnliked event, missing userId or likerId:", data);
            return;
          }
          console.log("UserService: Received userUnliked event:", data);
          if (this.dispatch) {
            this.dispatch({
              type: "userChat/updateUserLikesDislikes",
              payload: {
                userId: data.userId,
                likes: data.likes,
                dislikes: data.dislikes,
                likedBy: data.likedBy,
              },
            });
          } else {
            console.warn("UserService: Dispatch not set, skipping userUnliked event");
          }
        },
      },
      {
        event: "userDisliked",
        action: (data: { userId: string; dislikerId: string; likes: string[]; dislikes: string[]; likedBy: string[] }) => {
          if (!data.userId || !data.dislikerId) {
            console.error("UserService: Invalid userDisliked event, missing userId or dislikerId:", data);
            return;
          }
          console.log("UserService: Received userDisliked event:", data);
          if (this.dispatch) {
            this.dispatch({
              type: "userChat/updateUserLikesDislikes",
              payload: {
                userId: data.userId,
                likes: data.likes,
                dislikes: data.dislikes,
                likedBy: data.likedBy,
              },
            });
          } else {
            console.warn("UserService: Dispatch not set, skipping userDisliked event");
          }
        },
      },
      {
        event: "userBlocked",
        action: (data: { blockerId: string }) => {
          if (!data.blockerId) {
            console.error("UserService: Invalid userBlocked event, missing blockerId:", data);
            return;
          }
          console.log("UserService: Received userBlocked event:", data);
          if (this.dispatch) {
            this.dispatch({
              type: "userChat/updateUserBlocked",
              payload: { blockerId: data.blockerId },
            });
          } else {
            console.warn("UserService: Dispatch not set, skipping userBlocked event");
          }
        },
      },
      {
        event: "userBlockedSuccess",
        action: (data: { targetId: string }) => {
          if (!data.targetId) {
            console.error("UserService: Invalid userBlockedSuccess event, missing targetId:", data);
            return;
          }
          console.log("UserService: Received userBlockedSuccess event:", data);
          if (this.dispatch) {
            this.dispatch({
              type: "userChat/updateUserBlockedSuccess",
              payload: { targetId: data.targetId },
            });
          } else {
            console.warn("UserService: Dispatch not set, skipping userBlockedSuccess event");
          }
        },
      },
      {
        event: "userUnblocked",
        action: (data: { unblockerId: string }) => {
          if (!data.unblockerId) {
            console.error("UserService: Invalid userUnblocked event, missing unblockerId:", data);
            return;
          }
          console.log("UserService: Received userUnblocked event:", data);
          if (this.dispatch) {
            this.dispatch({
              type: "userChat/updateUserUnblocked",
              payload: { unblockerId: data.unblockerId },
            });
          } else {
            console.warn("UserService: Dispatch not set, skipping userUnblocked event");
          }
        },
      },
      {
        event: "userUnblockedSuccess",
        action: (data: { targetId: string }) => {
          if (!data.targetId) {
            console.error("UserService: Invalid userUnblockedSuccess event, missing targetId:", data);
            return;
          }
          console.log("UserService: Received userUnblockedSuccess event:", data);
          if (this.dispatch) {
            this.dispatch({
              type: "userChat/updateUserUnblockedSuccess",
              payload: { targetId: data.targetId },
            });
          } else {
            console.warn("UserService: Dispatch not set, skipping userUnblockedSuccess event");
          }
        },
      },
      {
        event: "userReported",
        action: (data: { reporterId: string; targetId: string; reason: string }) => {
          if (!data.reporterId || !data.targetId || !data.reason) {
            console.error("UserService: Invalid userReported event, missing required fields:", data);
            return;
          }
          console.log("UserService: Received userReported event:", data);
          if (this.dispatch) {
            this.dispatch({
              type: "userChat/updateUserReported",
              payload: {
                reporterId: data.reporterId,
                targetId: data.targetId,
                reason: data.reason,
              },
            });
          } else {
            console.warn("UserService: Dispatch not set, skipping userReported event");
          }
        },
      },
      {
        event: "userReportedSuccess",
        action: (data: { targetId: string }) => {
          if (!data.targetId) {
            console.error("UserService: Invalid userReportedSuccess event, missing targetId:", data);
            return;
          }
          console.log("UserService: Received userReportedSuccess event:", data);
          if (this.dispatch) {
            this.dispatch({
              type: "userChat/updateUserReportedSuccess",
              payload: { targetId: data.targetId },
            });
          } else {
            console.warn("UserService: Dispatch not set, skipping userReportedSuccess event");
          }
        },
      },
      {
        event: "userLikesUpdated",
        action: (data: { userId: string; likerId?: string; dislikerId?: string; likes: string[]; likedBy?: string[]; dislikes?: string[] }) => {
          if (!data.userId) {
            console.error("UserService: Invalid userLikesUpdated event, missing userId:", data);
            return;
          }
          console.log("UserService: Received userLikesUpdated event:", data);
          if (this.dispatch) {
            this.dispatch({
              type: "userChat/updateUserLikesDislikes",
              payload: {
                userId: data.userId,
                likes: data.likes,
                dislikes: data.dislikes || [],
                ...(data.likedBy && { likedBy: data.likedBy }),
              },
            });
          } else {
            console.warn("UserService: Dispatch not set, skipping userLikesUpdated event");
          }
        },
      },
      {
        event: "error",
        action: (data: { message: string }) => {
          console.log("UserService: Received error event:", data);
          if (data.message === "Your account has been deleted or deactivated") {
            console.log("UserService: Account deleted, dispatching handleUserDeletion");
            if (this.dispatch) {
              this.dispatch(handleUserDeletion());
            }
          }
        },
      },
    ];

    eventHandlers.forEach(({ event, action }) => {
      this.socket!.off(event);
      this.socket!.on(event, action);
      console.log(`UserService: Registered event handler for ${event}`);
    });
  }
}