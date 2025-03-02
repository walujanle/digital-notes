export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expired: boolean;
  expiresAt: string;
  createdAt: string;
}
