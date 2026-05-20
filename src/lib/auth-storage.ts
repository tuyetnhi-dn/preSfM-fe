export type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  status: string;
};

export function getAccessToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("accessToken");
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("user");

  if (!user) return null;

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getAccessToken() && getCurrentUser());
}

export function setAuthStorage(data: {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}) {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("user", JSON.stringify(data.user));

  window.dispatchEvent(new Event("auth-changed"));
}

export function clearAuthStorage() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  window.dispatchEvent(new Event("auth-changed"));
}
