export type LoginBodyType = {
  email: string;
  password: string;
};

export type LoginResType = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: "user" | "admin";
    status: "active" | "inactive" | "suspended";
  };
};
