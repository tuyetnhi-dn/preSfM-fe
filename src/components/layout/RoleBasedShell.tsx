"use client";

import {
  clearAuthStorage,
  getCurrentUser,
  isAuthenticated,
} from "@/lib/auth-storage";
import { useLazyGetMeQuery } from "@/services/auth/auth.service";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AdminTaskbar } from "./AdminTaskbar";
import { Navbar } from "./navbar";

type RoleBasedShellProps = {
  children: ReactNode;
};

type ShellUser = {
  id?: string;
  email?: string;
  fullName?: string | null;
  role?: string;
  status?: string;
};

const AUTH_CHANGED_EVENT = "presfm-auth-changed";

function isManagementRole(role?: string) {
  return role === "admin" || role === "manager";
}

function isUnauthorizedError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  if (!("status" in error)) return false;

  const status = (error as { status?: unknown }).status;

  return status === 401 || status === 403;
}

function RoleBasedShellContent({ children }: RoleBasedShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();

  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [cachedUser, setCachedUser] = useState<ShellUser | null>(null);
  const [verifiedAdminUser, setVerifiedAdminUser] = useState<ShellUser | null>(
    null,
  );
  const [isCheckingAdminAccess, setIsCheckingAdminAccess] = useState(false);

  const [getMe] = useLazyGetMeQuery();

  const isAuthPage = useMemo(() => {
    return pathname.includes("/auth");
  }, [pathname]);

  const isAdminPage = useMemo(() => {
    return (
      pathname === `/${locale}/admin` ||
      pathname.startsWith(`/${locale}/admin/`)
    );
  }, [locale, pathname]);

  const redirectPath = useMemo(() => {
    const currentSearch = searchParams.toString();

    return currentSearch ? `${pathname}?${currentSearch}` : pathname;
  }, [pathname, searchParams]);

  const loginUrl = useMemo(() => {
    return `/${locale}/auth/login?redirect=${encodeURIComponent(redirectPath)}`;
  }, [locale, redirectPath]);

  const refreshAuthSnapshot = useCallback(() => {
    const nextHasToken = isAuthenticated();
    const nextUser = getCurrentUser() as ShellUser | null;

    setHasToken(nextHasToken);
    setCachedUser(nextUser);

    if (!nextHasToken) {
      setVerifiedAdminUser(null);
    }

    return {
      hasToken: nextHasToken,
      user: nextUser,
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshAuthSnapshot();
  }, [refreshAuthSnapshot]);

  useEffect(() => {
    if (!mounted) return;

    refreshAuthSnapshot();
  }, [mounted, pathname, refreshAuthSnapshot]);

  useEffect(() => {
    if (!mounted) return;

    const handleAuthChanged = () => {
      refreshAuthSnapshot();
    };

    const handleStorageChanged = (event: StorageEvent) => {
      if (
        event.key === "accessToken" ||
        event.key === "refreshToken" ||
        event.key === "user"
      ) {
        refreshAuthSnapshot();
      }
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    window.addEventListener("storage", handleStorageChanged);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
      window.removeEventListener("storage", handleStorageChanged);
    };
  }, [mounted, refreshAuthSnapshot]);

  useEffect(() => {
    if (!mounted) return;
    if (isAuthPage) return;

    if (!isAdminPage) {
      setVerifiedAdminUser(null);
      return;
    }

    const currentHasToken = isAuthenticated();

    if (!currentHasToken) {
      clearAuthStorage();

      setHasToken(false);
      setCachedUser(null);
      setVerifiedAdminUser(null);

      router.replace(loginUrl);
      return;
    }

    let cancelled = false;

    const verifyAdminAccess = async () => {
      try {
        setIsCheckingAdminAccess(true);

        const serverUser = await getMe(undefined, false).unwrap();

        if (cancelled) return;

        setHasToken(true);
        setCachedUser(serverUser);
        setVerifiedAdminUser(serverUser);

        if (!isManagementRole(serverUser.role)) {
          router.replace(`/${locale}/home`);
        }
      } catch (error) {
        if (cancelled) return;

        setVerifiedAdminUser(null);

        if (isUnauthorizedError(error)) {
          clearAuthStorage();

          setHasToken(false);
          setCachedUser(null);

          router.replace(loginUrl);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingAdminAccess(false);
        }
      }
    };

    void verifyAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [
    mounted,
    isAuthPage,
    isAdminPage,
    getMe,
    router,
    loginUrl,
    locale,
    pathname,
  ]);

  /**
   * Server render and the first client render must match.
   * Do not render Navbar/AdminTaskbar before mounted.
   */
  if (!mounted) {
    return <>{children}</>;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isAdminPage) {
    if (
      !hasToken ||
      isCheckingAdminAccess ||
      !verifiedAdminUser ||
      !isManagementRole(verifiedAdminUser.role)
    ) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-300">
          Checking access permissions...
        </div>
      );
    }

    return <AdminTaskbar user={verifiedAdminUser}>{children}</AdminTaskbar>;
  }

  const displayUser = cachedUser;
  const isManager = isManagementRole(displayUser?.role);

  if (isManager) {
    return <AdminTaskbar user={displayUser}>{children}</AdminTaskbar>;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
export function RoleBasedShell({ children }: RoleBasedShellProps) {
  return (
    <Suspense fallback={<>{children}</>}>
      <RoleBasedShellContent>{children}</RoleBasedShellContent>
    </Suspense>
  );
}
