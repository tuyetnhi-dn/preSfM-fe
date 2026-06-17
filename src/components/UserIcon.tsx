"use client";

import { ChevronDown, ChevronUp, LogOut, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProfileCoreSmall from "./icons/ProfileCoreSmall";

type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  status: string;
};

function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("user");

  if (!user) return null;

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    return null;
  }
}

function clearAuthStorage() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  window.dispatchEvent(new Event("auth-changed"));
}

export function UserIcon() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("nav");

  const menuRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearAuthStorage();
    setOpen(false);
    router.push(`/${locale}/auth/login`);
  };

  const handleInformation = () => {
    setOpen(false);
    router.push(`/${locale}/profile`);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-steel transition hover:bg-mist dark:text-brand-300 dark:hover:bg-brand-800"
      >
        <User className="h-5 w-5" />
        {!open ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronUp className="h-4 w-4" />
        )}
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-64 border border-border-base bg-bg-base dark:border-border-base dark:bg-bg-brand">
          <p className="mt-1 right-0 px-4 py-1 truncate text-xs text-steel dark:text-text-base">
            {user?.email}
          </p>

          <button
            type="button"
            onClick={handleInformation}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-text-base transition hover:bg-bg-hover dark:hover:bg-bg-hover"
          >
            <User className="h-4 w-4" />
            {t("accountInformation")}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
