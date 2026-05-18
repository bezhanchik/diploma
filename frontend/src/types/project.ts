export type Submission = {
  id: number;
  version: number;
  repository_url: string | null;
  created_at: string;
};

export type Project = {
  id: number;
  team_id: number | null;
  challenge_id: number | null;
  title: string | null;
  description: string | null;
  submissions: Submission[];
};

export type SubmitSolutionData = {
  teamId: number;
  challengeId: number;
  projectTitle: string;
  projectDescription?: string;
  repositoryUrl?: string;
  file?: File;
};
