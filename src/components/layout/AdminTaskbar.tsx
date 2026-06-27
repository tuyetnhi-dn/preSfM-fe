"use client";

import { clearAuthStorage } from "@/lib/auth-storage";
import {
  BarChart3,
  FolderKanban,
  LogOut,
  Settings,
  Shield,
  Users,
  Workflow,
} from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { LanguageSwitcher } from "../LanguageSwitcher";

type AdminTaskbarUser = {
  email?: string;
  fullName?: string | null;
  role?: string;
};

type AdminTaskbarProps = {
  children: ReactNode;
  user?: AdminTaskbarUser | null;
};

const adminItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
];

export function AdminTaskbar({ children, user }: AdminTaskbarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearAuthStorage();
    router.replace(`/${locale}/auth/login`);
  };

  const getLocalizedHref = (href: string) => {
    return `/${locale}${href}`;
  };

  const isActiveItem = (href: string) => {
    const localizedHref = getLocalizedHref(href);

    if (href === "/admin") {
      return pathname === localizedHref;
    }

    return (
      pathname === localizedHref || pathname.startsWith(`${localizedHref}/`)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-ink dark:bg-slate-950 dark:text-slate-100 py-0">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <Shield className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold">PreSfM Admin</p>
            <p className="text-xs text-slate-500">Management Console</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {adminItems.map((item) => {
            const href = getLocalizedHref(item.href);
            const active = isActiveItem(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={href}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-brand text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Admin Console</p>
              <p className="text-xs text-slate-500">
                Manage users, projects, pipelines, and system settings.
              </p>
            </div>
            <div className="flex items-right gap-4">
              <LanguageSwitcher />
              <div className="text-right">
                <p className="text-sm font-medium">
                  {user?.fullName || user?.email || "Admin"}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.role || "admin"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
