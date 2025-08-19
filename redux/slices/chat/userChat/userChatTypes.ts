export interface Report {
  reporterId: string;
  reason: string;
  timestamp: string;
}

export interface UserDto {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  pseudo: string; // Rendre obligatoire
  role: 'NURSE' | 'PATIENT';
  isOnline?: boolean;
  lastConnectedAt?: string | null;
  likes: string[];
  dislikes: string[];
  blockedBy: string[];
  blockedUsers: string[];
  reports: Report[];
  likedBy?: string[];
}

export interface ErrorResponse {
  error: string;
  action: string;
}

export interface DecodedToken {
  sub: string;
}

export interface UserChatState {
  user: UserDto | null;
  users: {
    [key: string]: UserDto;
  };
  blockedInfo: {
    blockedUsers: string[];
    blockedBy: string[];
  } | null;
  loading: boolean;
  error: string | null;
  fetchedUsers: string[];
}

export const decodeJwt = (token: string): DecodedToken => {
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
    console.log('decodeJwt: Decoded JWT:', decoded);
    return decoded;
  } catch (error) {
    console.error('decodeJwt: Failed to decode JWT manually:', error);
    throw new Error('Invalid JWT token');
  }
};