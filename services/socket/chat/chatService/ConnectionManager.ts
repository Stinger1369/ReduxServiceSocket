// ConnectionManager.ts
import { Socket } from 'socket.io-client';
import { SocketConnection } from '../../../socketService';
import { Dispatch } from '../chatTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ConnectionManager {
  private connection: SocketConnection;
  private dispatch: Dispatch | null;
  private socket: Socket | null;
  private messageQueue: { event: string; data: unknown }[] = [];

  constructor(connection: SocketConnection, dispatch: Dispatch | null) {
    this.connection = connection;
    this.dispatch = dispatch;
    this.socket = this.connection.getSocket();
    console.log('ConnectionManager: Constructor called, socket initialized:', !!this.socket);
  }

  async ensureConnection(): Promise<void> {
    if (!this.connection.isConnected()) {
      console.log('ConnectionManager: Socket not connected, attempting to reconnect');
      const state = this.connection.getState();
      if (!state.userId || !state.email || !state.role) {
        console.error('ConnectionManager: User credentials missing', state);
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            throw new Error('No authentication token found');
          }
          const userData = await AsyncStorage.getItem('user');
          if (!userData) {
            throw new Error('User data not found in AsyncStorage');
          }
          const user = JSON.parse(userData);
          const decoded = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
          await this.connection.initialize(
            user._id,
            decoded.sub,
            user.firstName,
            user.lastName,
            user.role
          );
          console.log('ConnectionManager: Recovered user credentials from AsyncStorage');
        } catch (error) {
          console.error('ConnectionManager: Failed to recover user credentials:', error);
          throw new Error('User credentials missing');
        }
      } else {
        await this.connection.initialize(state.userId, state.email, state.firstName, state.lastName, state.role);
      }
      this.socket = this.connection.getSocket();
    }

    if (!this.socket || !this.socket.connected) {
      console.error('ConnectionManager: Socket is not connected');
      throw new Error('Socket is not connected');
    }
  }

  async processQueue(): Promise<void> {
    while (this.messageQueue.length > 0 && this.connection.isConnected()) {
      const { event, data } = this.messageQueue.shift()!;
      try {
        await this.emit(event, data);
        console.log('ConnectionManager: Processed queued event:', event);
      } catch (error) {
        console.error('ConnectionManager: Failed to process queued event:', event, error);
        this.messageQueue.unshift({ event, data });
        break;
      }
    }
  }

  async emit(event: string, data: unknown): Promise<void> {
    console.log('ConnectionManager: emit called, event:', event, 'data:', JSON.stringify(data));
    try {
      await this.ensureConnection();
      await this.processQueue();

      // Événements sans attente de callback
      if (
        event === 'privateMessage' ||
        event === 'joinPrivate' ||
        event === 'markMessagesAsRead' ||
        event === 'typing' ||
        event === 'stopTyping' ||
        event === 'updateMessage' // Ajout de updateMessage
      ) {
        this.socket!.emit(event, data);
        console.log(`ConnectionManager: Event ${event} emitted without waiting for callback`);
        return;
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error(`ConnectionManager: Timeout waiting for response for event: ${event}`);
          reject(new Error(`Timeout waiting for ${event} response`));
        }, 5000);

        this.socket!.emit(event, data, (response: { error?: string; success?: boolean }) => {
          clearTimeout(timeout);
          console.log('ConnectionManager: Callback received for event:', event, 'response:', response);
          if (response?.error) {
            console.error(`ConnectionManager: Failed to emit ${event}:`, response.error);
            if (this.dispatch) {
              this.dispatch({ type: 'chat/setError', payload: response.error });
            }
            reject(new Error(response.error));
          } else {
            console.log(`ConnectionManager: Event ${event} emitted successfully`);
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('ConnectionManager: Error in emit:', error);
      this.messageQueue.push({ event, data });
      if (this.dispatch) {
        this.dispatch({ type: 'chat/setError', payload: (error as Error).message });
      }
      throw error;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  getState() {
    return this.connection.getState();
  }

  isConnected(): boolean {
    return this.connection.isConnected();
  }
}