"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-storage";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  const isPublicProjectDetailRoute = useMemo(() => {
    return new RegExp(`^/${locale}/projects/[^/]+$`).test(pathname);
  }, [locale, pathname]);

  useEffect(() => {
    if (isPublicProjectDetailRoute) {
      setAllowed(true);
      setChecked(true);
      return;
    }

    if (!isAuthenticated()) {
      const redirectUrl = encodeURIComponent(pathname);
      router.replace(`/${locale}/auth/login?redirect=${redirectUrl}`);
      setChecked(true);
      setAllowed(false);
      return;
    }

    setAllowed(true);
    setChecked(true);
  }, [isPublicProjectDetailRoute, locale, pathname, router]);

  if (!checked || !allowed) {
    return null;
  }

  return <>{children}</>;
}
