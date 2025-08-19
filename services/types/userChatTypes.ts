export interface UserDto {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: 'NURSE' | 'PATIENT';
  imageIds?: string[];
  primaryImageId?: string | null;
  conversations?: string[];
  friendRequests?: string[];
  posts?: string[];
  likes?: string[];
  dislikes?: string[];
  isOnline?: boolean; // Ajout pour refléter l'état de connexion
  lastConnectedAt?: string | null; // Ajout pour refléter la dernière connexion
}

export interface ErrorResponse {
  error: string;
  action: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
}