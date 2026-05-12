export type UserRole = 'user' | 'admin';

export type User = {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string;
};

export type UserStats = {
  events_count: number;
  teams_count: number;
  rating: number;
};

export type UpdateProfileData = {
  first_name: string;
  last_name: string;
};
