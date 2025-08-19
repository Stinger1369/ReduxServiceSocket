import { Socket } from "socket.io-client";
import { SocketConnection } from "../../socketService";
import { EventHandler } from "../commentTypes";

export class CommentService {
  private connection: SocketConnection;
  private dispatch: any;
  private socket: Socket | null;

  constructor(connection: SocketConnection, dispatch: any) {
    this.connection = connection;
    this.dispatch = dispatch;
    this.socket = this.connection.getSocket();
    console.log("CommentService: Initialized with dispatch:", !!dispatch);
  }

  async emit(event: string, data: any, retries: number = 2, timeoutMs: number = 15000): Promise<void> {
    if (!this.connection.isConnected()) {
      console.log(`CommentService: Socket not connected, attempting to reconnect for ${event}`);
      const state = this.connection.getState();
      if (!state.userId || !state.email || !state.role) {
        console.error("CommentService: User credentials missing");
        throw new Error("User credentials missing");
      }
      await this.connection.initialize(state.userId, state.email, state.firstName, state.lastName, state.role);
      this.socket = this.connection.getSocket();
    }

    if (!this.socket || !this.socket.connected) {
      console.error(`CommentService: Cannot emit ${event}, socket is not connected`);
      throw new Error("Socket is not connected");
    }

    const payload = { ...data };
    console.log(`CommentService: Emitting event: ${event}`, payload);

    // Pour les événements de notification, ne pas attendre de réponse
    if (["commentAdded", "commentLiked", "commentUnliked", "commentDisliked"].includes(event)) {
      this.socket.emit(event, payload);
      console.log(`CommentService: Successfully emitted ${event} without acknowledgment`);
      return Promise.resolve();
    }

    const attemptEmit = (attempt: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error(`CommentService: Timeout waiting for ${event} acknowledgment (attempt ${attempt}/${retries})`);
          if (attempt < retries) {
            console.log(`CommentService: Retrying ${event} (attempt ${attempt + 1})`);
            attemptEmit(attempt + 1).then(resolve).catch(reject);
          } else {
            reject(new Error(`Timeout waiting for ${event} acknowledgment after ${retries} attempts`));
          }
        }, timeoutMs);

        if (event === "addComment") {
          this.socket!.once("commentAdded", (commentData) => {
            if (commentData.postId === payload.postId && commentData.userId === payload.userId && commentData.content === payload.content) {
              console.log(`CommentService: Received commentAdded for ${event}, resolving`);
              clearTimeout(timeout);
              resolve();
            }
          });
        }

        this.socket!.emit(event, payload, (response: any) => {
          console.log(`CommentService: Received acknowledgment for ${event}:`, response);
          clearTimeout(timeout);
          if (response && response.error) {
            console.error(`CommentService: Failed to emit ${event}:`, response.error);
            reject(new Error(response.error));
          } else {
            console.log(`CommentService: Successfully emitted ${event}`);
            resolve();
          }
        });
      });
    };

    try {
      await attemptEmit(1);
    } catch (error) {
      console.error(`CommentService: Failed to emit ${event} after retries:`, error.message);
      throw error;
    }
  }

  async addComment(postId: string, userId: string, content: string): Promise<void> {
    console.log(`CommentService: Adding comment for post ${postId} by user ${userId}`);
    await this.emit("addComment", { postId, userId, content });
    // Déclencher l'événement commentAdded pour la notification
    await this.emit("commentAdded", { postId, userId, content });
    console.log("CommentService: commentAdded event emitted for notification");
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<void> {
    console.log(`CommentService: Updating comment ${commentId} by user ${userId}`);
    await this.emit("updateComment", { commentId, userId, content });
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    console.log(`CommentService: Deleting comment ${commentId} by user ${userId}`);
    await this.emit("deleteComment", { commentId, userId });
  }

  async likeComment(commentId: string, userId: string): Promise<void> {
    console.log(`CommentService: Liking comment ${commentId} by user ${userId}`);
    try {
      await this.emit("likeComment", { commentId, userId });
      // Déclencher l'événement commentLiked pour la notification
      await this.emit("commentLiked", { commentId, userId });
      console.log("CommentService: commentLiked event emitted for notification");
    } catch (error: any) {
      console.error("CommentService: Failed to like comment:", error.message);
      if (this.dispatch) {
        this.dispatch({
          type: "commentChat/setError",
          payload: error.message || "Failed to like comment",
        });
      }
      throw error;
    }
  }

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    console.log(`CommentService: Unliking comment ${commentId} by user ${userId}`);
    try {
      await this.emit("unlikeComment", { commentId, userId });
      // Déclencher l'événement commentUnliked pour la notification
      await this.emit("commentUnliked", { commentId, userId });
      console.log("CommentService: commentUnliked event emitted for notification");
    } catch (error: any) {
      console.error("CommentService: Failed to unlike comment:", error.message);
      if (this.dispatch) {
        this.dispatch({
          type: "commentChat/setError",
          payload: error.message || "Failed to unlike comment",
        });
      }
      throw error;
    }
  }

  async dislikeComment(commentId: string, userId: string): Promise<void> {
    console.log(`CommentService: Disliking comment ${commentId} by user ${userId}`);
    try {
      await this.emit("dislikeComment", { commentId, userId });
      // Déclencher l'événement commentDisliked pour la notification
      await this.emit("commentDisliked", { commentId, userId });
      console.log("CommentService: commentDisliked event emitted for notification");
    } catch (error: any) {
      console.error("CommentService: Failed to dislike comment:", error.message);
      if (this.dispatch) {
        this.dispatch({
          type: "commentChat/setError",
          payload: error.message || "Failed to dislike comment",
        });
      }
      throw error;
    }
  }

  setupEventHandlers() {
    this.socket = this.connection.getSocket();
    if (!this.socket) {
      console.error("CommentService: Socket is not initialized");
      return;
    }

    const eventHandlers: EventHandler[] = [
      {
        event: "commentAdded",
        action: (data: {
          _id: string;
          postId: string;
          userId: string;
          content: string;
          createdAt: string;
          likes: string[];
          dislikes: string[];
        }) => {
          console.log("CommentService: Received commentAdded event:", data);
          if (!data._id || !data.postId || !data.userId) {
            console.error("CommentService: Invalid commentAdded event, missing _id, postId, or userId:", data);
            return;
          }
          if (this.dispatch) {
            this.dispatch({
              type: "commentChat/addComment",
              payload: {
                _id: data._id,
                postId: data.postId,
                userId: data.userId,
                content: data.content,
                createdAt: data.createdAt,
                updatedAt: data.createdAt,
                likes: data.likes || [],
                dislikes: data.dislikes || []
              }
            });
            console.log("CommentService: Dispatched addComment:", data);
          } else {
            console.warn("CommentService: Dispatch not set, skipping commentAdded event");
          }
        }
      },
      {
        event: "commentUpdated",
        action: (data: {
          commentId: string;
          userId: string;
          content: string;
          updatedAt: string;
        }) => {
          console.log("CommentService: Received commentUpdated event:", data);
          if (!data.commentId || !data.userId) {
            console.error("CommentService: Invalid commentUpdated event, missing commentId or userId:", data);
            return;
          }
          if (this.dispatch) {
            this.dispatch({
              type: "commentChat/updateCommentContent",
              payload: {
                commentId: data.commentId,
                content: data.content,
                updatedAt: data.updatedAt
              }
            });
            console.log("CommentService: Dispatched updateCommentContent:", data);
          } else {
            console.warn("CommentService: Dispatch not set, skipping commentUpdated event");
          }
        }
      },
      {
        event: "commentDeleted",
        action: (data: {
          commentId: string;
          userId: string
        }) => {
          console.log("CommentService: Received commentDeleted event:", data);
          if (!data.commentId || !data.userId) {
            console.error("CommentService: Invalid commentDeleted event, missing commentId or userId:", data);
            return;
          }
          if (this.dispatch) {
            this.dispatch({ type: "commentChat/deleteCommentAction", payload: data.commentId });
            console.log("CommentService: Dispatched deleteCommentAction:", data);
          } else {
            console.warn("CommentService: Dispatch not set, skipping commentDeleted event");
          }
        }
      },
      {
        event: "commentLiked",
        action: (data: {
          commentId: string;
          userId: string;
          likes: string[];
          dislikes: string[];
        }) => {
          console.log("CommentService: Received commentLiked event:", data);
          if (!data.commentId || !data.userId) {
            console.error("CommentService: Invalid commentLiked event, missing commentId or userId:", data);
            return;
          }
          if (this.dispatch) {
            this.dispatch({
              type: "commentChat/updateCommentLikesDislikes",
              payload: {
                commentId: data.commentId,
                likes: data.likes,
                dislikes: data.dislikes
              }
            });
            console.log("CommentService: Dispatched updateCommentLikesDislikes:", data);
          } else {
            console.warn("CommentService: Dispatch not set, skipping commentLiked event");
          }
        }
      },
      {
        event: "commentUnliked",
        action: (data: {
          commentId: string;
          userId: string;
          likes: string[];
          dislikes: string[];
        }) => {
          console.log("CommentService: Received commentUnliked event:", data);
          if (!data.commentId || !data.userId) {
            console.error("CommentService: Invalid commentUnliked event, missing commentId or userId:", data);
            return;
          }
          if (this.dispatch) {
            this.dispatch({
              type: "commentChat/updateCommentLikesDislikes",
              payload: {
                commentId: data.commentId,
                likes: data.likes,
                dislikes: data.dislikes
              }
            });
            console.log("CommentService: Dispatched updateCommentLikesDislikes:", data);
          } else {
            console.warn("CommentService: Dispatch not set, skipping commentUnliked event");
          }
        }
      },
      {
        event: "commentDisliked",
        action: (data: {
          commentId: string;
          userId: string;
          likes: string[];
          dislikes: string[];
        }) => {
          console.log("CommentService: Received commentDisliked event:", data);
          if (!data.commentId || !data.userId) {
            console.error("CommentService: Invalid commentDisliked event, missing commentId or userId:", data);
            return;
          }
          if (this.dispatch) {
            this.dispatch({
              type: "commentChat/updateCommentLikesDislikes",
              payload: {
                commentId: data.commentId,
                likes: data.likes,
                dislikes: data.dislikes
              }
            });
            console.log("CommentService: Dispatched updateCommentLikesDislikes:", data);
          } else {
            console.warn("CommentService: Dispatch not set, skipping commentDisliked event");
          }
        }
      },
      {
        event: "error",
        action: (error: { message: string }) => {
          console.error("CommentService: Received error event:", error);
          if (this.dispatch) {
            this.dispatch({ type: "commentChat/setError", payload: error.message });
            console.log("CommentService: Dispatched error:", error.message);
          }
        }
      }
    ];

    eventHandlers.forEach(({ event, action }) => {
      this.socket!.off(event);
      this.socket!.on(event, action);
      console.log(`CommentService: Registered event handler for ${event}`);
    });
  }
}