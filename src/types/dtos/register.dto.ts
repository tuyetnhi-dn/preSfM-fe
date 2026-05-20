export type RegisterBodyType = {
  email: string;
  password: string;
  otp: string;
};

export type RegisterResType = {
  message: string;
  user?: {
    id: string;
    email: string;
  };
  accessToken?: string;
  refreshToken?: string;
};
