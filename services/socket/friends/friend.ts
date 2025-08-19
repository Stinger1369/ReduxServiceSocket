import { Socket } from "socket.io-client";
import { SocketConnection } from "../../socketService";
import { FriendDto, FollowDto, FollowRequest } from "./friendTypes";
import { AppDispatch } from "../../../redux/store";
import { fetchFriends } from "../../../redux/slices/chat/friendSlice/friendSlice";

interface EventHandler {
  event: string;
  action: (data: FriendDto | FollowDto | { userId: string; friendId: string } | FollowRequest) => void;
}

export class FriendService {
  private connection: SocketConnection;
  private dispatch: AppDispatch;
  private socket: Socket | null;

  constructor(connection: SocketConnection, dispatch: AppDispatch) {
    this.connection = connection;
    this.dispatch = dispatch;
    this.socket = this.connection.getSocket();
    console.log("FriendService: Initialized with dispatch:", !!dispatch);
  }

  async emit(event: string, data: { userId: string; friendId: string } | FollowRequest): Promise<void> {
    if (!this.connection.isConnected()) {
      console.log(`FriendService: Socket not connected, attempting to reconnect for ${event}`);
      const state = this.connection.getState();
      if (!state.userId || !state.email || !state.role) {
        console.error("FriendService: User credentials missing");
        throw new Error("User credentials missing");
      }
      await this.connection.initialize(state.userId, state.email, state.firstName, state.lastName, state.role);
      this.socket = this.connection.getSocket();
    }

    if (!this.socket || !this.socket.connected) {
      console.error(`FriendService: Cannot emit ${event}, socket is not connected`);
      throw new Error("Socket is not connected");
    }

    const payload = { ...data };
    console.log(`FriendService: Emitting event: ${event}`, payload);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error(`FriendService: Timeout waiting for ${event} response`);
        reject(new Error(`Timeout waiting for ${event} response`));
      }, 10000);

      this.socket!.emit(event, payload, (response: { error?: string }) => {
        clearTimeout(timeout);
        console.log(`FriendService: Received callback response for ${event}:`, response);
        if (response?.error) {
          console.error(`FriendService: Failed to emit ${event}:`, response.error);
          reject(new Error(response.error));
        } else {
          console.log(`FriendService: Successfully emitted ${event} via callback`);
          resolve();
        }
      });

      if (event === "addFriend") {
        this.socket!.once("friendRequestSent", (data: FriendDto) => {
          clearTimeout(timeout);
          if (data.userId === payload.userId && data.friendId === payload.friendId) {
            console.log(`FriendService: friendRequestSent received for ${event}, resolving promise`);
            resolve();
          }
        });
      } else if (event === "acceptFriend") {
        this.socket!.once("friendAcceptedSuccess", (data: FriendDto) => {
          clearTimeout(timeout);
          if (data.userId === payload.userId && data.friendId === payload.friendId) {
            console.log(`FriendService: friendAcceptedSuccess received for ${event}, resolving promise`);
            resolve();
          }
        });
      } else if (event === "rejectFriend") {
        this.socket!.once("friendRejectedSuccess", (data: { userId: string; friendId: string }) => {
          clearTimeout(timeout);
          if (data.userId === payload.userId && data.friendId === payload.friendId) {
            console.log(`FriendService: friendRejectedSuccess received for ${event}, resolving promise`);
            resolve();
          }
        });
      } else if (event === "removeFriend") {
        this.socket!.once("friendRemovedSuccess", (data: { userId: string; friendId: string }) => {
          clearTimeout(timeout);
          if (data.userId === payload.userId && data.friendId === payload.friendId) {
            console.log(`FriendService: friendRemovedSuccess received for ${event}, resolving promise`);
            resolve();
          }
        });
      } else if (event === "followUser") {
        this.socket!.once("followUserSuccess", (data: FollowDto) => {
          clearTimeout(timeout);
          if (data.followerId === (payload as FollowRequest).followerId && data.followedId === (payload as FollowRequest).followedId) {
            console.log(`FriendService: followUserSuccess received for ${event}, resolving promise`);
            resolve();
          }
        });
      } else if (event === "unfollowUser") {
        this.socket!.once("unfollowUserSuccess", (data: FollowRequest) => {
          clearTimeout(timeout);
          if (data.followerId === (payload as FollowRequest).followerId && data.followedId === (payload as FollowRequest).followedId) {
            console.log(`FriendService: unfollowUserSuccess received for ${event}, resolving promise`);
            resolve();
          }
        });
      }
    });
  }

  async addFriend(userId: string, friendId: string): Promise<void> {
    console.log("FriendService: Adding friend via WebSocket:", { userId, friendId });
    await this.emit("addFriend", { userId, friendId });
  }

  async acceptFriend(userId: string, friendId: string): Promise<void> {
    console.log("FriendService: Accepting friend via WebSocket:", { userId, friendId });
    await this.emit("acceptFriend", { userId, friendId });
  }

  async rejectFriend(userId: string, friendId: string): Promise<void> {
    console.log("FriendService: Rejecting friend via WebSocket:", { userId, friendId });
    await this.emit("rejectFriend", { userId, friendId });
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    console.log("FriendService: Removing friend via WebSocket:", { userId, friendId });
    await this.emit("removeFriend", { userId, friendId });
  }

  async blockFriend(userId: string, friendId: string): Promise<void> {
    console.log("FriendService: Blocking friend via WebSocket:", { userId, friendId });
    await this.emit("blockFriend", { userId, friendId });
  }

  async followUser(followerId: string, followedId: string): Promise<void> {
    console.log("FriendService: Following user via WebSocket:", { followerId, followedId });
    await this.emit("followUser", { followerId, followedId });
  }

  async unfollowUser(followerId: string, followedId: string): Promise<void> {
    console.log("FriendService: Unfollowing user via WebSocket:", { followerId, followedId });
    await this.emit("unfollowUser", { followerId, followedId });
  }

  setupEventHandlers() {
    this.socket = this.connection.getSocket();
    if (!this.socket) {
      console.error("FriendService: Socket is not initialized");
      return;
    }

    const eventHandlers: EventHandler[] = [
      {
        event: "friendRequest",
        action: (data: FriendDto) => {
          if (!data.userId || !data.friendId) {
            console.error("FriendService: Invalid friendRequest event, missing userId or friendId:", data);
            return;
          }
          console.log("FriendService: Received friendRequest event:", data);
          this.dispatch({ type: "friends/receiveFriendRequest", payload: data });
          console.log("FriendService: Dispatched receiveFriendRequest:", data);
        },
      },
      {
        event: "friendRequestSent",
        action: (data: FriendDto) => {
          if (!data.userId || !data.friendId) {
            console.error("FriendService: Invalid friendRequestSent event, missing userId or friendId:", data);
            return;
          }
          console.log("FriendService: Received friendRequestSent event:", data);
          this.dispatch({ type: "friends/receiveFriendRequestSent", payload: data });
          console.log("FriendService: Dispatched receiveFriendRequestSent:", data);
        },
      },
      {
        event: "friendAccepted",
        action: (data: FriendDto) => {
          if (!data.userId || !data.friendId) {
            console.error("FriendService: Invalid friendAccepted event, missing userId or friendId:", data);
            return;
          }
          console.log("FriendService: Received friendAccepted event:", data);
          this.dispatch({ type: "friends/receiveFriendAccepted", payload: data });
          console.log("FriendService: Dispatched receiveFriendAccepted:", data);
        },
      },
      {
        event: "friendAcceptedSuccess",
        action: (data: FriendDto) => {
          if (!data.userId || !data.friendId) {
            console.error("FriendService: Invalid friendAcceptedSuccess event, missing userId or friendId:", data);
            return;
          }
          console.log("FriendService: Received friendAcceptedSuccess event:", data);
          this.dispatch({ type: "friends/receiveFriendAcceptedSuccess", payload: data });
          console.log("FriendService: Dispatched receiveFriendAcceptedSuccess:", data);
          this.dispatch(fetchFriends(data.friendId)); // Synchroniser l'état de l'autre utilisateur
        },
      },
      {
        event: "friendRejected",
        action: (data: { userId: string; friendId: string }) => {
          if (!data.userId || !data.friendId) {
            console.error("FriendService: Invalid friendRejected event, missing userId or friendId:", data);
            return;
          }
          console.log("FriendService: Received friendRejected event:", data);
          this.dispatch({ type: "friends/receiveFriendRejected", payload: data });
          console.log("FriendService: Dispatched receiveFriendRejected:", data);
          this.dispatch(fetchFriends(data.friendId)); // Synchroniser l'état de l'expéditeur
        },
      },
      {
        event: "friendRejectedSuccess",
        action: (data: { userId: string; friendId: string }) => {
          if (!data.userId || !data.friendId) {
            console.error("FriendService: Invalid friendRejectedSuccess event, missing userId or friendId:", data);
            return;
          }
          console.log("FriendService: Received friendRejectedSuccess event:", data);
          this.dispatch({ type: "friends/receiveFriendRejectedSuccess", payload: data });
          console.log("FriendService: Dispatched receiveFriendRejectedSuccess:", data);
          this.dispatch(fetchFriends(data.friendId)); // Synchroniser l'état de l'expéditeur
        },
      },
      {
        event: "friendRemoved",
        action: (data: { userId: string; friendId: string }) => {
          if (!data.userId || !data.friendId) {
            console.error("FriendService: Invalid friendRemoved event, missing userId or friendId:", data);
            return;
          }
          console.log("FriendService: Received friendRemoved event:", data);
          this.dispatch({ type: "friends/receiveFriendRemoved", payload: data });
          console.log("FriendService: Dispatched receiveFriendRemoved:", data);
        },
      },
      {
        event: "friendRemovedSuccess",
        action: (data: { userId: string; friendId: string }) => {
          if (!data.userId || !data.friendId) {
            console.error("FriendService: Invalid friendRemovedSuccess event, missing userId or friendId:", data);
            return;
          }
          console.log("FriendService: Received friendRemovedSuccess event:", data);
          this.dispatch({ type: "friends/receiveFriendRemovedSuccess", payload: data });
          console.log("FriendService: Dispatched receiveFriendRemovedSuccess:", data);
        },
      },
      {
        event: "friendBlocked",
        action: (data: { userId: string; friendId: string }) => {
          if (!data.userId || !data.friendId) {
            console.error("FriendService: Invalid friendBlocked event, missing userId or friendId:", data);
            return;
          }
          console.log("FriendService: Received friendBlocked event:", data);
          this.dispatch({ type: "friends/receiveFriendBlocked", payload: data });
          console.log("FriendService: Dispatched receiveFriendBlocked:", data);
        },
      },
      {
        event: "friendBlockedSuccess",
        action: (data: { userId: string; friendId: string }) => {
          if (!data.userId || !data.friendId) {
            console.error("FriendService: Invalid friendBlockedSuccess event, missing userId or friendId:", data);
            return;
          }
          console.log("FriendService: Received friendBlockedSuccess event:", data);
          this.dispatch({ type: "friends/receiveFriendBlockedSuccess", payload: data });
          console.log("FriendService: Dispatched receiveFriendBlockedSuccess:", data);
        },
      },
      {
        event: "followUser",
        action: (data: FollowDto) => {
          if (!data.followerId || !data.followedId) {
            console.error("FriendService: Invalid followUser event, missing followerId or followedId:", data);
            return;
          }
          console.log("FriendService: Received followUser event:", data);
          this.dispatch({ type: "friends/receiveFollowUser", payload: data });
          console.log("FriendService: Dispatched receiveFollowUser:", data);
        },
      },
      {
        event: "followUserSuccess",
        action: (data: FollowDto) => {
          if (!data.followerId || !data.followedId) {
            console.error("FriendService: Invalid followUserSuccess event, missing followerId or followedId:", data);
            return;
          }
          console.log("FriendService: Received followUserSuccess event:", data);
          this.dispatch({ type: "friends/receiveFollowUserSuccess", payload: data });
          console.log("FriendService: Dispatched receiveFollowUserSuccess:", data);
        },
      },
      {
        event: "unfollowUser",
        action: (data: FollowRequest) => {
          if (!data.followerId || !data.followedId) {
            console.error("FriendService: Invalid unfollowUser event, missing followerId or followedId:", data);
            return;
          }
          console.log("FriendService: Received unfollowUser event:", data);
          this.dispatch({ type: "friends/receiveUnfollowUser", payload: data });
          console.log("FriendService: Dispatched receiveUnfollowUser:", data);
        },
      },
      {
        event: "unfollowUserSuccess",
        action: (data: FollowRequest) => {
          if (!data.followerId || !data.followedId) {
            console.error("FriendService: Invalid unfollowUserSuccess event, missing followerId or followedId:", data);
            return;
          }
          console.log("FriendService: Received unfollowUserSuccess event:", data);
          this.dispatch({ type: "friends/receiveUnfollowUserSuccess", payload: data });
          console.log("FriendService: Dispatched receiveUnfollowUserSuccess:", data);
        },
      },
    ];

    eventHandlers.forEach(({ event, action }) => {
      this.socket!.off(event);
      this.socket!.on(event, action);
      console.log(`FriendService: Registered event handler for ${event}`);
    });
  }
}