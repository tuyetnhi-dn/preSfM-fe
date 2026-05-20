"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserIcon } from "../UserIcon";

export function Navbar() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const authT = useTranslations("auth");

  const locale = useLocale();
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navItems = [
    { href: `/${locale}/projects`, label: t("projects") },
    { href: `/${locale}/viewer`, label: t("viewer") },
    { href: `/${locale}/dashboard`, label: t("dashboard") },
  ];

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem("accessToken");
      setIsAuthenticated(Boolean(accessToken));
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-changed", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-changed", checkAuth);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-bg-panel">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/home`}
          className="text-xl font-semibold tracking-tight text-ink dark:text-brand-100"
        >
          {tc("appName")}
        </Link>

        <nav className="flex items-center gap-2">
          {isAuthenticated
            ? navItems.map((item) => {
                const active = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      active
                        ? "bg-brand text-white"
                        : "text-steel hover:bg-mist dark:text-brand-300 dark:hover:bg-brand-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })
            : null}

          <LanguageSwitcher />

          <ThemeToggle />

          {isAuthenticated ? (
            <UserIcon />
          ) : (
            <Link
              href={`/${locale}/auth/login`}
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              {authT("login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
