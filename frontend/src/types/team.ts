import type { User } from './user';

export type TeamMemberRole = 'captain' | 'member';

export type TeamMember = {
  user_id: number;
  user?: User;
  role: TeamMemberRole;
};

export type Team = {
  id: number;
  name: string;
  event_id: number | null;
  track_id: number | null;
  captain_id: number | null;
  captain?: User;
  members?: TeamMember[];
};

export type CreateTeamData = {
  name: string;
  event_id?: number | null;
  track_id?: number | null;
};

export type AddMemberData = {
  user_id: number;
  role?: TeamMemberRole;
};
