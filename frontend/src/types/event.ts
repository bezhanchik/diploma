export type EventStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export type Event = {
  id: number;
  title: string;
  status: EventStatus | null;
  start_date: string | null;
  end_date: string | null;
  description?: string;
  organization_id?: number | null;
  created_at?: string;
};

export type CreateEventData = {
  title: string;
  status: EventStatus | '';
  start_date?: string;
  end_date?: string;
  organization_id?: number | null;
};

export type TrackWithChallenges = {
  id: number;
  name: string;
  challenges: import('./challenge').Challenge[];
};

export type TeamBrief = {
  id: number;
  name: string;
  captain?: import('./user').User | null;
  members_count: number;
};

export type EventDetail = Event & {
  tracks: TrackWithChallenges[];
  teams: TeamBrief[];
  teams_count: number;
  challenges_count: number;
};

export type ScheduleEvent = {
  id: number;
  title: string;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  teams_count: number;
};
