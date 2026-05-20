"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Plus, UploadCloud } from "lucide-react";

type CreateProjectCardProps = {
  isAuthenticated: boolean;
};

export function CreateProjectCard({ isAuthenticated }: CreateProjectCardProps) {
  const locale = useLocale();
  const t = useTranslations("home");

  const href = isAuthenticated
    ? `/${locale}/projects`
    : `/${locale}/auth/login?redirect=/${locale}/projects`;

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-white/5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
        <UploadCloud className="h-7 w-7" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-ink dark:text-slate-100">
        {t("createProjectTitle")}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-steel dark:text-slate-300">
        {t("createProjectDescription")}
      </p>

      <Link
        href={href}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-dark"
      >
        <Plus className="h-4 w-4" />
        {t("createProjectButton")}
      </Link>
    </div>
  );
}
