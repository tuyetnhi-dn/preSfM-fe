export type ForgotPasswordRequest = {
  email: string;
  locale?: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type AuthMessageResponse = {
  message?: string;
  success?: boolean;
};
export type CurrentUserDto = {
  id: string;
  email: string;
  fullName: string | null;
  role?: string;
  status?: string;
  createdAt?: string;
};

export type UpdateProfileRequest = {
  fullName: string;
};

export type UpdateProfileResponse = {
  message?: string;
  user: CurrentUserDto;
};
