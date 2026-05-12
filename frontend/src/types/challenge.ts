export type Challenge = {
  id: number;
  title: string;
  description: string | null;
  track_id: number;
  track_name?: string;
};

export type ChallengeDetail = Challenge & {
  track_name: string | null;
  related: Challenge[];
};
