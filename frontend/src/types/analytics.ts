export type AnalyticsSummary = {
  users_count: number;
  events_count: number;
  teams_count: number;
  challenges_count: number;
};

export type EventStatusStat = {
  status: string;
  count: number;
};

export type TopEvent = {
  id: number;
  title: string;
  status: string | null;
  teams_count: number;
};
