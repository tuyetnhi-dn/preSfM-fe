"use client";

import { ReactNode, useEffect, useState } from "react";
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

  useEffect(() => {
    if (!isAuthenticated()) {
      const redirectUrl = encodeURIComponent(pathname);
      router.replace(`/${locale}/auth/login?redirect=${redirectUrl}`);
      setChecked(true);
      setAllowed(false);
      return;
    }

    setAllowed(true);
    setChecked(true);
  }, [locale, pathname, router]);

  if (!checked || !allowed) {
    return null;
  }

  return <>{children}</>;
}
