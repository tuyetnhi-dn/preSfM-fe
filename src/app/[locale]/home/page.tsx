"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { isAuthenticated } from "@/lib/auth-storage";
import { CreateProjectCard } from "./_components/CreateProjectCard";
import Loader from "@/components/ui/loader";
import { ProjectGrid } from "../(protected)/projects/_components/list/ProjectGrid";
import { useGetProjectsQuery } from "@/services/project/project.service";

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale();

  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const { data, isLoading } = useGetProjectsQuery({
    scope: "public",
    page: 1,
    limit: 12,
  });

  const latestProjects = data?.items.slice(0, 5) ?? [];

  useEffect(() => {
    const checkAuth = () => {
      setLoggedIn(isAuthenticated());
      setAuthChecked(true);
    };

    checkAuth();

    window.addEventListener("auth-changed", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("auth-changed", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-base)]">
          {t("title")}
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          {t("subtitle")}
        </p>
      </section>

      {!authChecked ? null : !loggedIn ? (
        <CreateProjectCard isAuthenticated={false} />
      ) : isLoading ? (
        <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)] p-6 text-sm text-[var(--text-muted)]">
          <Loader className="mx-auto" />
        </div>
      ) : latestProjects.length === 0 ? (
        <CreateProjectCard isAuthenticated={loggedIn} />
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-base)]">
                {t("publicProjectsTitle")}
              </h2>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {t("publicProjectsDescription")}
              </p>
            </div>

            {loggedIn ? (
              <Link
                href={`/${locale}/projects/create`}
                className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-[var(--brand-text)] transition hover:bg-[var(--brand-hover)] active:bg-[var(--brand-active)]"
              >
                {t("createProjectButton")}
              </Link>
            ) : null}
          </div>

          <ProjectGrid
            projects={latestProjects}
            emptyText={t("emptyPublicProjects")}
          />
        </section>
      )}
    </main>
  );
}
