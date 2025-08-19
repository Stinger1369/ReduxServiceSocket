import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import {
  CHAT_SERVICE_URL,
  SOCKET_RECONNECTION_ATTEMPTS,
  SOCKET_RECONNECTION_DELAY,
  SOCKET_RECONNECTION_DELAY_MAX,
  SOCKET_TIMEOUT,
} from './config';
import { UserDto } from './socket/types';
import { ChatService } from './socket/chat/chat';
import { FriendService } from './socket/friends/friend';
import { UserService } from './socket/user/user';
import { PostService } from './socket/post/post';
import { CommentService } from './socket/comments/comment';
import { NotificationService } from './socket/notification/notification';

interface UserConnectionAction {
  type: 'userChat/updateUserConnectionStatus';
  payload: {
    userId: string;
    isOnline: boolean;
    lastConnectedAt: string;
  };
}

interface SocketErrorAction {
  type: 'socket/error';
  payload: string;
}

type Action = UserConnectionAction | SocketErrorAction;

interface Dispatch<T = Action> {
  (action: T): void;
}

interface SocketState {
  socket: Socket | null;
  userId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: 'NURSE' | 'PATIENT' | null;
  isConnecting: boolean;
  connectionPromise: Promise<void> | null;
  isInitialized: boolean;
  retryCount: number;
}

interface DecodedToken {
  sub: string;
  iat?: number;
  exp?: number;
}

const decodeJwt = (token: string): DecodedToken => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    console.log('SocketConnection: Decoded JWT payload:', decoded);
    return decoded;
  } catch (error) {
    console.error('SocketConnection: Failed to decode JWT token:', error);
    throw new Error('Failed to decode JWT token');
  }
};

export class SocketConnection {
  private state: SocketState;
  private dispatch: Dispatch | null;

  constructor(state: SocketState, dispatch: Dispatch | null) {
    this.state = state;
    this.dispatch = dispatch;
    console.log('SocketConnection: Constructor called');
  }

  private async refreshToken(): Promise<string | null> {
    try {
      console.log('SocketConnection: Attempting to refresh token');
      const response = await fetch(`${CHAT_SERVICE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.token) {
        console.log('SocketConnection: New token retrieved:', data.token);
        return data.token;
      }
      console.error('SocketConnection: No token in refresh response');
      return null;
    } catch (error) {
      console.error('SocketConnection: Failed to refresh token:', error);
      return null;
    }
  }

  async initialize(
    userId: string,
    email: string,
    firstName?: string,
    lastName?: string,
    role?: 'NURSE' | 'PATIENT'
  ): Promise<void> {
    if (this.state.isInitialized && this.isConnected() && this.state.userId === userId) {
      console.log('SocketConnection: Already initialized and connected for userId:', userId);
      return;
    }

    if (this.state.isConnecting && this.state.connectionPromise) {
      console.log('SocketConnection: Connection in progress for userId:', userId, 'awaiting');
      return this.state.connectionPromise;
    }

    this.state.isConnecting = true;
    this.state.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('SocketConnection: Starting initialization for userId:', userId);
        let token = await AsyncStorage.getItem('token');
        console.log('SocketConnection: Token retrieved for userId:', userId, 'token:', token ? 'present' : 'null');
        if (!token) {
          throw new Error('No authentication token found');
        }

        let tokenEmail: string;
        try {
          const decoded: DecodedToken = decodeJwt(token);
          tokenEmail = decoded.sub;
          console.log('SocketConnection: Decoded token email:', tokenEmail);
        } catch (error) {
          console.error('SocketConnection: Failed to decode JWT token for userId:', userId, 'error:', error);
          throw new Error('Failed to decode JWT token');
        }

        if (!role) {
          // Tenter de récupérer le rôle depuis AsyncStorage
          const userData = await AsyncStorage.getItem('user');
          if (userData) {
            const parsed = JSON.parse(userData);
            role = parsed.role;
          }
          if (!role) {
            throw new Error('User role is missing');
          }
        }

        if (this.state.socket) {
          console.log('SocketConnection: Disconnecting existing socket for userId:', userId);
          this.disconnect();
        }

        this.state.userId = userId;
        this.state.email = tokenEmail;
        this.state.firstName = firstName || null;
        this.state.lastName = lastName || null;
        this.state.role = role;

        console.log('SocketConnection: Initializing socket with query:', { userId, email: tokenEmail, firstName, lastName, role, token });
        this.state.socket = io(CHAT_SERVICE_URL, {
          query: { userId, email: tokenEmail, firstName, lastName, role, token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: SOCKET_RECONNECTION_ATTEMPTS,
          reconnectionDelay: SOCKET_RECONNECTION_DELAY,
          reconnectionDelayMax: SOCKET_RECONNECTION_DELAY_MAX,
          timeout: SOCKET_TIMEOUT,
          autoConnect: true,
          forceNew: true, // Force a new connection to avoid stale sockets
        });

        this.state.socket.on('connect', () => {
          console.log(`SocketConnection: Connected with userId: ${userId}, role: ${role}, socket ID:`, this.state.socket?.id);
          this.state.isConnecting = false;
          this.state.retryCount = 0;
          this.state.connectionPromise = null;
          this.state.isInitialized = true;
          this.state.socket?.emit('joinRoom', { roomId: userId }, (response: any) => {
            if (response && response.error) {
              console.error('SocketConnection: Failed to join room:', userId, response.error);
            } else {
              console.log('SocketConnection: Successfully joined room:', userId);
            }
          });
          resolve();
        });

        this.state.socket.on('connect_error', (error) => {
          console.error('SocketConnection: Connection error for userId:', userId, 'error:', error.message);
          this.state.retryCount++;
          if (this.state.retryCount >= SOCKET_RECONNECTION_ATTEMPTS) {
            console.error('SocketConnection: Max reconnection attempts reached for userId:', userId);
            this.state.isConnecting = false;
            this.state.connectionPromise = null;
            this.state.isInitialized = false;
            this.resetState();
            reject(new Error('Max reconnection attempts reached'));
          }
        });

        this.state.socket.on('reconnect', (attempt) => {
          console.log('SocketConnection: Reconnected for userId:', userId, 'attempt:', attempt);
          this.state.retryCount = 0;
          this.state.socket?.emit('joinRoom', { roomId: userId }, (response: any) => {
            if (response && response.error) {
              console.error('SocketConnection: Failed to join room after reconnect:', userId, response.error);
            } else {
              console.log('SocketConnection: Successfully joined room after reconnect:', userId);
            }
          });
        });

        this.state.socket.on('reconnect_attempt', () => {
          console.log('SocketConnection: Attempting to reconnect for userId:', userId);
        });

        this.state.socket.on('authenticated', (data) => {
          console.log('SocketConnection: Successfully authenticated for userId:', userId, 'data:', data);
          this.state.socket?.emit('joinRoom', { roomId: userId }, (response: any) => {
            if (response && response.error) {
              console.error('SocketConnection: Failed to join room after authentication:', userId, response.error);
            } else {
              console.log('SocketConnection: Successfully joined room after authentication:', userId);
            }
          });
        });

        this.state.socket.on('disconnect', (reason) => {
          console.log('SocketConnection: Disconnected for userId:', userId, 'reason:', reason);
          this.state.isConnecting = false;
          this.state.connectionPromise = null;
          this.state.isInitialized = false;
          if (this.dispatch) {
            this.dispatch({
              type: 'userChat/updateUserConnectionStatus',
              payload: {
                userId: this.state.userId || userId,
                isOnline: false,
                lastConnectedAt: new Date().toISOString(),
              },
            });
          }
        });

        this.state.socket.on('error', async (error) => {
          console.error('SocketConnection: Server error for userId:', userId, 'error:', error);
          this.state.isConnecting = false;
          this.state.connectionPromise = null;
          this.state.isInitialized = false;

          if (error.message === 'Invalid JWT token') {
            console.log('SocketConnection: Attempting to refresh token for userId:', userId);
            try {
              const newToken = await this.refreshToken();
              if (newToken) {
                await AsyncStorage.setItem('token', newToken);
                console.log('SocketConnection: Retrying initialization with new token for userId:', userId);
                await this.initialize(userId, email, firstName, lastName, role);
                resolve();
                return;
              }
            } catch (refreshError) {
              console.error('SocketConnection: Failed to refresh token for userId:', userId, 'error:', refreshError);
            }
          }

          this.resetState();
          this.dispatch?.({
            type: 'socket/error',
            payload: error.message,
          });
          reject(error);
        });

        this.state.socket.on('joinPrivateSuccess', (data) => {
          console.log('SocketConnection: joinPrivateSuccess received for userId:', userId, 'data:', data);
        });

        this.state.socket.on('privateMessage', (data) => {
          console.log('SocketConnection: privateMessage received for userId:', userId, 'data:', data);
        });
      } catch (error) {
        console.error('SocketConnection: Initialization failed for userId:', userId, 'error:', error);
        this.state.isConnecting = false;
        this.state.connectionPromise = null;
        this.state.isInitialized = false;
        this.resetState();
        reject(error);
      }
    });

    return this.state.connectionPromise;
  }

  disconnect() {
    if (this.state.socket) {
      console.log('SocketConnection: Disconnecting from chat service for userId:', this.state.userId);
      this.state.socket.removeAllListeners();
      try {
        this.state.socket.disconnect();
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('WebSocket is closed before the connection is established')) {
          console.log('SocketConnection: Connection closed before establishing, ignoring warning.');
        } else {
          console.error('SocketConnection: Error during disconnection:', error);
        }
      }
      this.resetState();
      console.log('SocketConnection: Socket fully disconnected and reset');
    } else {
      console.log('SocketConnection: No socket to disconnect');
      this.resetState();
    }
  }

  isConnected(): boolean {
    const connected = this.state.socket !== null && this.state.socket.connected;
    console.log('SocketConnection: isConnected for userId:', this.state.userId, 'connected:', connected);
    return connected;
  }

  getSocket(): Socket | null {
    console.log('SocketConnection: Getting socket for userId:', this.state.userId, 'connected:', this.state.socket?.connected);
    return this.state.socket;
  }

  getState(): SocketState {
    console.log('SocketConnection: Getting state for userId:', this.state.userId);
    return this.state;
  }

  private resetState() {
    console.log('SocketConnection: Resetting state');
    this.state.socket = null;
    this.state.isConnecting = false;
    this.state.connectionPromise = null;
    this.state.isInitialized = false;
    this.state.retryCount = 0;
    // Conserver userId, email, firstName, lastName, role pour éviter l'erreur "User credentials missing"
  }
}

class SocketService {
  private state: SocketState;
  private dispatch: Dispatch | null;
  private connection: SocketConnection;
  public chat: ChatService | null;
  public friend: FriendService | null;
  public user: UserService | null;
  public post: PostService | null;
  public comment: CommentService | null;
  public notification: NotificationService | null;

  constructor() {
    this.state = {
      socket: null,
      userId: null,
      email: null,
      firstName: null,
      lastName: null,
      role: null,
      isConnecting: false,
      connectionPromise: null,
      isInitialized: false,
      retryCount: 0,
    };
    this.dispatch = null;
    this.connection = new SocketConnection(this.state, this.dispatch);
    this.chat = null;
    this.friend = null;
    this.user = null;
    this.post = null;
    this.comment = null;
    this.notification = null;
    console.log('SocketService: Constructor called');
  }

  setDispatch(dispatch: Dispatch) {
    console.log('SocketService: Setting dispatch');
    this.dispatch = dispatch;
    this.connection = new SocketConnection(this.state, this.dispatch);
  }

  initializeServices() {
    console.log('SocketService: Initializing services');
    this.chat = new ChatService(this.connection, this.dispatch);
    this.friend = new FriendService(this.connection, this.dispatch);
    this.user = new UserService(this.connection, this.dispatch);
    this.post = new PostService(this.connection, this.dispatch);
    this.comment = new CommentService(this.connection, this.dispatch);
    this.notification = new NotificationService(this.connection, this.dispatch);
  }

  async initialize(userId: string, email: string, firstName?: string, lastName?: string, role?: 'NURSE' | 'PATIENT'): Promise<void> {
    console.log('SocketService: Initializing with userId:', userId);
    try {
      await this.connection.initialize(userId, email, firstName, lastName, role);
      this.initializeServices();
      this.chat?.setupEventHandlers();
      this.friend?.setupEventHandlers();
      this.user?.setupEventHandlers();
      this.post?.setupEventHandlers();
      this.comment?.setupEventHandlers();
      this.notification?.setupEventHandlers();
      console.log('SocketService: Event handlers set up for all services for userId:', userId);
    } catch (error) {
      console.error('SocketService: Initialization failed:', error);
      // Réessayer après un délai
      setTimeout(() => this.initialize(userId, email, firstName, lastName, role), 5000);
      throw error;
    }
  }

  disconnect() {
    console.log('SocketService: Disconnecting');
    this.connection.disconnect();
    this.chat = null;
    this.friend = null;
    this.user = null;
    this.post = null;
    this.comment = null;
    this.notification = null;
  }

  isConnected(): boolean {
    const connected = this.connection.isConnected();
    console.log('SocketService: isConnected:', connected);
    return connected;
  }

  get socket(): Socket | null {
    return this.connection.getSocket();
  }
}

export const socketService = new SocketService();