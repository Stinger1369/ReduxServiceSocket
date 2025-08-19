import {get, post, del} from "./httpMethods";
import {Notification} from "../socket/notification/notificationTypes";

export const getUserNotifications = async (userId : string): Promise<Notification[]> => {
  console.log(`notificationMethods: Fetching notifications for user ${userId}`);
  const response = await get<Notification[]>(`/notifications/user/${userId}`);
  if (!Array.isArray(response)) {
    console.error("notificationMethods: Invalid response, expected array:", response);
    throw new Error("Invalid response: notifications must be an array");
  }
  // Convertir les chaînes de date en objets Date
  const processedResponse = response.map((n) => ({
    ...n,
    createdAt: new Date(n.createdAt),
    updatedAt: new Date(n.updatedAt)
  }));
  console.log(`notificationMethods: Fetched ${processedResponse.length} notifications for user ${userId}`);
  return processedResponse;
};

export const markNotificationAsRead = async (notificationId : string): Promise<void> => {
  console.log(`notificationMethods: Marking notification ${notificationId} as read`);
  await post<void>(`/notifications/${notificationId}/read`, {});
  console.log(`notificationMethods: Successfully marked notification ${notificationId} as read`);
};

export const deleteNotification = async (notificationId : string): Promise<void> => {
  console.log(`notificationMethods: Deleting notification ${notificationId}`);
  await del<void>(`/notifications/${notificationId}`);
  console.log(`notificationMethods: Successfully deleted notification ${notificationId}`);
};

export const deleteAllUserNotifications = async (userId : string): Promise<void> => {
  console.log(`notificationMethods: Deleting all notifications for user ${userId}`);
  await del<void>(`/notifications/user/${userId}`);
  console.log(`notificationMethods: Successfully deleted all notifications for user ${userId}`);
};
