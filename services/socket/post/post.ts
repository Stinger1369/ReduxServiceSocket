import { Socket } from "socket.io-client";
import { SocketConnection } from "../../socketService";
import { EventHandler } from "./postTypes";
import chatApiClient from "../../../services/chatApiClient";
import { AppDispatch } from "../../../redux/store";
import { addPost as addPostAction } from "../../../redux/slices/chat/postChat/postChatSlice";

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

export class PostService {
  private connection: SocketConnection;
  private dispatch: AppDispatch;
  private socket: Socket | null;

  constructor(connection: SocketConnection, dispatch: AppDispatch) {
    this.connection = connection;
    this.dispatch = dispatch;
    this.socket = this.connection.getSocket();
    console.log("PostService: Initialized with dispatch:", !!dispatch);
    this.setupEventHandlers();
  }

  async addPost(userId: string, content: string): Promise<void> {
    console.log("PostService: Adding post via WebSocket:", { userId, content });
    try {
      await this.emit("addPost", { userId, content });
      console.log("PostService: Add post event emitted");
    } catch (error: any) {
      console.error("PostService: WebSocket addPost failed:", error.message);
      await this.fallbackToRest(userId, content);
    }
  }

  async likePost(postId: string, userId: string): Promise<void> {
    console.log("PostService: Liking post via WebSocket:", { postId, userId });
    try {
      await this.emit("likePost", { postId, userId });
      console.log("PostService: Like post event emitted");
    } catch (error: any) {
      console.error("PostService: Failed to like post:", error.message);
      this.dispatch({ type: "postChat/setError", payload: error.message });
      throw error;
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    console.log("PostService: Unliking post via WebSocket:", { postId, userId });
    try {
      await this.emit("unlikePost", { postId, userId });
      console.log("PostService: Unlike post event emitted");
    } catch (error: any) {
      console.error("PostService: Failed to unlike post:", error.message);
      this.dispatch({ type: "postChat/setError", payload: error.message });
      throw error;
    }
  }

  async dislikePost(postId: string, userId: string): Promise<void> {
    console.log("PostService: Disliking post via WebSocket:", { postId, userId });
    try {
      await this.emit("dislikePost", { postId, userId });
      console.log("PostService: Dislike post event emitted");
    } catch (error: any) {
      console.error("PostService: Failed to dislike post:", error.message);
      this.dispatch({ type: "postChat/setError", payload: error.message });
      throw error;
    }
  }

  private async emit(event: string, data: any): Promise<void> {
    if (!this.connection.isConnected()) {
      console.log(`PostService: Socket not connected, attempting to reconnect for ${event}`);
      const state = this.connection.getState();
      if (!state.userId || !state.email || !state.role) {
        console.error("PostService: User credentials missing");
        throw new Error("User credentials missing");
      }
      await this.connection.initialize(state.userId, state.email, state.firstName, state.lastName, state.role);
      this.socket = this.connection.getSocket();
    }

    if (!this.socket || !this.socket.connected) {
      console.error(`PostService: Cannot emit ${event}, socket is not connected`);
      throw new Error("Socket is not connected");
    }

    const payload = { ...data };
    console.log(`PostService: Emitting event: ${event}`, payload);

    return new Promise((resolve, reject) => {
      this.socket!.emit(event, payload, (response: any) => {
        console.log(`PostService: Received acknowledgment for ${event}:`, response);
        if (response && response.error) {
          console.error(`PostService: Failed to emit ${event}:`, response.error);
          reject(new Error(response.error));
        } else {
          console.log(`PostService: Successfully emitted ${event}`);
          resolve();
        }
      });
    });
  }

  private async fallbackToRest(userId: string, content: string): Promise<void> {
    try {
      console.log("PostService: Falling back to REST for addPost", { userId, content });
      await chatApiClient.createPost(userId, content);
      console.log("PostService: Add post via REST successful");
    } catch (error: any) {
      console.error("PostService: Failed to add post via REST:", error.message);
      this.dispatch({ type: "postChat/setError", payload: error.message });
      throw error;
    }
  }

  setupEventHandlers() {
    this.socket = this.connection.getSocket();
    if (!this.socket) {
      console.error("PostService: Socket is not initialized");
      return;
    }

    const eventHandlers: EventHandler[] = [
      {
        event: "addPost",
        action: (data: any) => {
          console.log("PostService: Processing addPost event with data:", data);
          try {
            const post = data.post ? data.post : data;
            if (!post._id || !post.userId || !post.content) {
              throw new Error("Invalid addPost event, missing required fields");
            }
            console.log("PostService: Received addPost event:", post);
            this.dispatch(addPostAction(post));
            console.log("PostService: Dispatched addPost:", post);
          } catch (error: any) {
            console.error("PostService: Invalid addPost event:", error.message);
          }
        },
      },
      {
        event: "postLiked",
        action: (data: { postId: string; userId: string; likes: string[]; dislikes: string[] }) => {
          if (!data.postId || !data.userId) {
            console.error("PostService: Invalid postLiked event, missing postId or userId:", data);
            return;
          }
          console.log("PostService: Received postLiked event:", data);
          this.dispatch({
            type: "postChat/updatePostLikes",
            payload: { postId: data.postId, likes: data.likes, dislikes: data.dislikes },
          });
        },
      },
      {
        event: "postUnliked",
        action: (data: { postId: string; userId: string; likes: string[]; dislikes: string[] }) => {
          if (!data.postId || !data.userId) {
            console.error("PostService: Invalid postUnliked event, missing postId or userId:", data);
            return;
          }
          console.log("PostService: Received postUnliked event:", data);
          this.dispatch({
            type: "postChat/updatePostLikes",
            payload: { postId: data.postId, likes: data.likes, dislikes: data.dislikes },
          });
        },
      },
      {
        event: "postDisliked",
        action: (data: { postId: string; userId: string; likes: string[]; dislikes: string[] }) => {
          if (!data.postId || !data.userId) {
            console.error("PostService: Invalid postDisliked event, missing postId or userId:", data);
            return;
          }
          console.log("PostService: Received postDisliked event:", data);
          this.dispatch({
            type: "postChat/updatePostDislikes",
            payload: { postId: data.postId, likes: data.likes, dislikes: data.dislikes },
          });
        },
      },
      {
        event: "error",
        action: (error: { message: string }) => {
          console.error("PostService: Received error event:", error);
          this.dispatch({ type: "postChat/setError", payload: error.message });
        },
      },
    ];

    eventHandlers.forEach(({ event, action }) => {
      this.socket!.off(event);
      this.socket!.on(event, (data) => {
        console.log(`PostService: Processing ${event} event with data:`, data);
        try {
          action(data);
        } catch (err) {
          console.error(`PostService: Error processing ${event}:`, err);
        }
      });
      console.log(`PostService: Registered event handler for ${event}`);
    });
  }
}