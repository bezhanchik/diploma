export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type AuthToken = {
  access_token: string;
  token_type: string;
};
