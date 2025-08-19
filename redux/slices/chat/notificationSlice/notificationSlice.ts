import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import chatApiClient from '../../../../services/chatApiClient';
import { Notification } from './NotificationType';

interface ErrorResponse {
  error: string;
  action: string;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk<
  Notification[],
  string,
  { rejectValue: ErrorResponse }
>('notifications/fetchNotifications', async (userId, { rejectWithValue }) => {
  try {
    console.log('notificationSlice: Fetching notifications for user:', userId);
    const response = await chatApiClient.getUserNotifications(userId);
    console.log('notificationSlice: Fetch notifications response:', response);
    return response;
  } catch (error: any) {
    console.error('notificationSlice: Fetch notifications error:', error);
    const errorResponse: ErrorResponse = {
      error: error.message || 'Échec de la récupération des notifications',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

export const markNotificationAsRead = createAsyncThunk<
  void,
  string,
  { rejectValue: ErrorResponse }
>('notifications/markNotificationAsRead', async (notificationId, { rejectWithValue }) => {
  try {
    console.log('notificationSlice: Marking notification as read:', notificationId);
    await chatApiClient.markNotificationAsRead(notificationId);
    console.log('notificationSlice: Mark notification as read successful');
  } catch (error: any) {
    console.error('notificationSlice: Mark notification as read error:', error);
    const errorResponse: ErrorResponse = {
      error: error.message || 'Échec du marquage de la notification comme lue',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

export const deleteNotification = createAsyncThunk<
  void,
  string,
  { rejectValue: ErrorResponse }
>('notifications/deleteNotification', async (notificationId, { rejectWithValue }) => {
  try {
    console.log('notificationSlice: Deleting notification:', notificationId);
    await chatApiClient.deleteNotification(notificationId);
    console.log('notificationSlice: Delete notification successful');
  } catch (error: any) {
    console.error('notificationSlice: Delete notification error:', error);
    const errorResponse: ErrorResponse = {
      error: error.message || 'Échec de la suppression de la notification',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

export const deleteAllUserNotifications = createAsyncThunk<
  void,
  string,
  { rejectValue: ErrorResponse }
>('notifications/deleteAllUserNotifications', async (userId, { rejectWithValue }) => {
  try {
    console.log('notificationSlice: Deleting all notifications for user:', userId);
    await chatApiClient.deleteAllUserNotifications(userId);
    console.log('notificationSlice: Delete all notifications successful');
  } catch (error: any) {
    console.error('notificationSlice: Delete all notifications error:', error);
    const errorResponse: ErrorResponse = {
      error: error.message || 'Échec de la suppression des notifications',
      action: 'Veuillez réessayer.',
    };
    return rejectWithValue(errorResponse);
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      console.log('notificationSlice: Adding notification:', action.payload);
      const notification = action.payload;
      if (!notification.id || !notification.recipientId || !notification.type) {
        console.error('notificationSlice: Invalid notification, missing required fields:', notification);
        return;
      }
      const existing = state.notifications.find((n) => n.id === notification.id);
      if (!existing) {
        // Convertir les chaînes de date en objets Date si nécessaire
        const processedNotification: Notification = {
          ...notification,
          createdAt: notification.createdAt instanceof Date ? notification.createdAt : new Date(notification.createdAt),
          updatedAt: notification.updatedAt instanceof Date ? notification.updatedAt : new Date(notification.updatedAt),
        };
        state.notifications.unshift(processedNotification); // Add to top
        console.log('notificationSlice: Notification added to state:', processedNotification);
      } else {
        console.log('notificationSlice: Notification already exists:', notification.id);
      }
    },
    setNotifications(state, action: PayloadAction<Notification[]>) {
      console.log('notificationSlice: Setting notifications:', action.payload);
      const validNotifications = action.payload.filter((n) => {
        if (!n.id || !n.recipientId || !n.type) {
          console.error('notificationSlice: Invalid notification in setNotifications:', n);
          return false;
        }
        return true;
      });
      // Convertir les chaînes de date en objets Date si nécessaire
      state.notifications = validNotifications.map((n) => ({
        ...n,
        createdAt: n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt),
        updatedAt: n.updatedAt instanceof Date ? n.updatedAt : new Date(n.updatedAt),
      }));
    },
    markNotificationAsRead(state, action: PayloadAction<string>) {
      console.log('notificationSlice: Marking notification as read:', action.payload);
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
        notification.updatedAt = new Date();
      }
    },
    removeNotification(state, action: PayloadAction<string>) {
      console.log('notificationSlice: Removing notification:', action.payload);
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications(state, action: PayloadAction<string>) {
      console.log('notificationSlice: Clearing notifications for user:', action.payload);
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        console.log('notificationSlice: fetchNotifications pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        console.log('notificationSlice: fetchNotifications fulfilled:', action.payload);
        state.loading = false;
        state.notifications = action.payload.filter((n) => {
          if (!n.id || !n.recipientId || !n.type) {
            console.error('notificationSlice: Invalid notification in fetchNotifications:', n);
            return false;
          }
          return true;
        });
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        console.log('notificationSlice: fetchNotifications rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.error || 'Échec de la récupération des notifications';
      })
      .addCase(markNotificationAsRead.pending, (state) => {
        console.log('notificationSlice: markNotificationAsRead pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        console.log('notificationSlice: markNotificationAsRead fulfilled:', action.meta.arg);
        state.loading = false;
        const notificationId = action.meta.arg;
        const notification = state.notifications.find((n) => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
          notification.updatedAt = new Date();
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        console.log('notificationSlice: markNotificationAsRead rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.error || 'Échec du marquage de la notification comme lue';
      })
      .addCase(deleteNotification.pending, (state) => {
        console.log('notificationSlice: deleteNotification pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        console.log('notificationSlice: deleteNotification fulfilled:', action.meta.arg);
        state.loading = false;
        const notificationId = action.meta.arg;
        state.notifications = state.notifications.filter((n) => n.id !== notificationId);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        console.log('notificationSlice: deleteNotification rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.error || 'Échec de la suppression de la notification';
      })
      .addCase(deleteAllUserNotifications.pending, (state) => {
        console.log('notificationSlice: deleteAllUserNotifications pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAllUserNotifications.fulfilled, (state) => {
        console.log('notificationSlice: deleteAllUserNotifications fulfilled');
        state.loading = false;
        state.notifications = [];
      })
      .addCase(deleteAllUserNotifications.rejected, (state, action) => {
        console.log('notificationSlice: deleteAllUserNotifications rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.error || 'Échec de la suppression des notifications';
      });
  },
});

export const {
  addNotification,
  setNotifications,
  markNotificationAsRead: markNotificationAsReadAction,
  removeNotification,
  clearNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;