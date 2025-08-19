import { Socket } from "socket.io-client";
import { SocketConnection } from "../../socketService";
import { Notification, EventHandler } from "./notificationTypes";
import { throttle } from 'lodash';

export class NotificationService {
  private connection: SocketConnection;
  private dispatch: any;
  private socket: Socket | null;
  private processedNotifications: Set<string> = new Set();
  private joinRoomRetries: number = 0;
  private maxJoinRoomRetries: number = 3;

  constructor(connection: SocketConnection, dispatch: any) {
    this.connection = connection;
    this.dispatch = dispatch;
    this.socket = this.connection.getSocket();
    console.log("NotificationService: Initialized with dispatch:", !!dispatch);
  }

  async emit(event: string, data: any): Promise<void> {
    if (!this.connection.isConnected()) {
      console.log(`NotificationService: Socket not connected, attempting to reconnect for ${event}`);
      const state = this.connection.getState();
      if (!state.userId || !state.email || !state.role) {
        console.error("NotificationService: User credentials missing");
        throw new Error("User credentials missing");
      }
      await this.connection.initialize(state.userId, state.email, state.firstName, state.lastName, state.role);
      this.socket = this.connection.getSocket();
    }

    if (!this.socket || !this.socket.connected) {
      console.error(`NotificationService: Cannot emit ${event}, socket is not connected`);
      throw new Error("Socket is not connected");
    }

    const payload = { ...data };
    console.log(`NotificationService: Emitting event: ${event}`, payload);
    return new Promise((resolve, reject) => {
      this.socket!.emit(event, payload, (response: any) => {
        if (response && response.error) {
          console.error(`NotificationService: Failed to emit ${event}:`, response.error);
          reject(new Error(response.error));
        } else {
          console.log(`NotificationService: Successfully emitted ${event}`);
          resolve();
        }
      });
    });
  }

  async getNotifications(userId: string): Promise<void> {
    console.log("NotificationService: Requesting notifications for user:", userId);
    await this.emit("getNotifications", { userId });
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    console.log("NotificationService: Marking notification as read:", notificationId);
    await this.emit("markNotificationAsRead", { notificationId });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    console.log("NotificationService: Deleting notification:", notificationId);
    await this.emit("deleteNotification", { notificationId });
  }

  async deleteAllUserNotifications(userId: string): Promise<void> {
    console.log("NotificationService: Deleting all notifications for user:", userId);
    await this.emit("deleteAllUserNotifications", { userId });
  }

  private async joinRoomWithRetry(currentUserId: string): Promise<void> {
    if (this.joinRoomRetries >= this.maxJoinRoomRetries) {
      console.error("NotificationService: Max retries reached for joining room:", currentUserId);
      return;
    }
    this.joinRoomRetries++;
    console.log(`NotificationService: Attempting to join room (retry ${this.joinRoomRetries}):`, currentUserId);
    return new Promise((resolve, reject) => {
      this.socket!.emit("joinRoom", { roomId: currentUserId }, (response: any) => {
        if (response && response.error) {
          console.error("NotificationService: Failed to join room:", currentUserId, response.error);
          setTimeout(() => this.joinRoomWithRetry(currentUserId), 1000);
          reject(response.error);
        } else {
          console.log("NotificationService: Successfully joined room:", currentUserId);
          this.joinRoomRetries = 0;
          resolve();
        }
      });
    });
  }

  setupEventHandlers() {
    this.socket = this.connection.getSocket();
    if (!this.socket) {
      console.error("NotificationService: Socket is not initialized");
      return;
    }

    const state = this.connection.getState();
    const currentUserId = state.userId;

    if (!currentUserId) {
      console.error("NotificationService: Current user ID is missing, cannot setup event handlers");
      return;
    }

    this.joinRoomWithRetry(currentUserId).catch((error) => {
      console.error("NotificationService: Failed to join room after retries:", error);
    });

    const throttledDispatchNotification = throttle((notification: Notification) => {
      if (this.dispatch) {
        this.dispatch({ type: "notifications/addNotification", payload: notification });
        console.log("NotificationService: Dispatched addNotification:", notification.id, "Type:", notification.type);
      }
    }, 1000);

    const throttledDispatchNotifications = throttle((notifications: Notification[]) => {
      if (this.dispatch) {
        this.dispatch({ type: "notifications/setNotifications", payload: notifications });
        console.log("NotificationService: Dispatched setNotifications:", notifications.length);
      }
    }, 1000);

    const eventHandlers: EventHandler[] = [
      {
        event: "notification",
        action: (notification: Notification) => {
          console.log("NotificationService: Received notification event:", JSON.stringify(notification));
          if (!notification.id || !notification.recipientId || !notification.type || !notification.senderId) {
            console.error("NotificationService: Invalid notification event, missing required fields:", notification);
            return;
          }
          if (notification.recipientId !== currentUserId) {
            console.warn("NotificationService: Received notification for different user, ignoring:", notification.recipientId, "Expected:", currentUserId);
            return;
          }
          if (this.processedNotifications.has(notification.id)) {
            console.log("NotificationService: Notification already processed, ignoring:", notification.id);
            return;
          }
          this.processedNotifications.add(notification.id);
          const processedNotification: Notification = {
            ...notification,
            createdAt: notification.createdAt instanceof Date ? notification.createdAt : new Date(notification.createdAt),
            updatedAt: notification.updatedAt instanceof Date ? notification.updatedAt : new Date(notification.updatedAt),
          };
          console.log(`NotificationService: Processing ${notification.type} notification:`, processedNotification);
          throttledDispatchNotification(processedNotification);
        },
      },
      {
        event: "notifications",
        action: (notifications: Notification[]) => {
          console.log("NotificationService: Received notifications event:", notifications.length, "notifications");
          if (!Array.isArray(notifications)) {
            console.error("NotificationService: Invalid notifications event, not an array:", notifications);
            return;
          }
          const userNotifications = notifications.filter((n) => {
            const matches = n.recipientId === currentUserId;
            if (!matches) {
              console.warn("NotificationService: Filtering out notification for different user:", n.recipientId, "Expected:", currentUserId);
            }
            return matches;
          });
          console.log("NotificationService: Filtered notifications for user", currentUserId, ":", userNotifications.length);
          const processedNotifications = userNotifications.map((n) => ({
            ...n,
            createdAt: n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt),
            updatedAt: n.updatedAt instanceof Date ? n.updatedAt : new Date(n.updatedAt),
          }));
          processedNotifications.forEach((n) => {
            if (!this.processedNotifications.has(n.id)) {
              this.processedNotifications.add(n.id);
            }
          });
          throttledDispatchNotifications(processedNotifications);
        },
      },
      {
        event: "notificationRead",
        action: ({ notificationId }: { notificationId: string }) => {
          console.log("NotificationService: Received notificationRead event:", notificationId);
          if (this.dispatch) {
            this.dispatch({ type: "notifications/markNotificationAsRead", payload: notificationId });
            console.log("NotificationService: Dispatched markNotificationAsRead:", notificationId);
          } else {
            console.warn("NotificationService: Dispatch not set, skipping notificationRead event");
          }
        },
      },
      {
        event: "notificationDeleted",
        action: ({ notificationId }: { notificationId: string }) => {
          console.log("NotificationService: Received notificationDeleted event:", notificationId);
          if (this.dispatch) {
            this.dispatch({ type: "notifications/removeNotification", payload: notificationId });
            console.log("NotificationService: Dispatched removeNotification:", notificationId);
            this.processedNotifications.delete(notificationId);
          } else {
            console.warn("NotificationService: Dispatch not set, skipping notificationDeleted event");
          }
        },
      },
      {
        event: "allNotificationsDeleted",
        action: ({ userId }: { userId: string }) => {
          console.log("NotificationService: Received allNotificationsDeleted event for user:", userId);
          if (userId !== currentUserId) {
            console.warn("NotificationService: allNotificationsDeleted for different user, ignoring:", userId, "Expected:", currentUserId);
            return;
          }
          if (this.dispatch) {
            this.dispatch({ type: "notifications/clearNotifications", payload: userId });
            console.log("NotificationService: Dispatched clearNotifications for user:", userId);
            this.processedNotifications.clear();
          } else {
            console.warn("NotificationService: Dispatch not set, skipping allNotificationsDeleted event");
          }
        },
      },
    ];

    eventHandlers.forEach(({ event, action }) => {
      this.socket!.off(event);
      this.socket!.on(event, action);
      console.log(`NotificationService: Registered event handler for ${event}`);
    });

    this.socket.on("connect", () => {
      console.log("NotificationService: Socket reconnected, rejoining room:", currentUserId);
      this.joinRoomWithRetry(currentUserId).catch((error) => {
        console.error("NotificationService: Failed to rejoin room after reconnect:", error);
      });
      this.getNotifications(currentUserId);
    });
  }
}