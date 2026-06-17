"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import Loader from "@/components/ui/loader";
import { getCurrentUser, isAuthenticated } from "@/lib/auth-storage";
import { CreateProjectCard } from "../../home/_components/CreateProjectCard";
import { ProjectGrid } from "./_components/list/ProjectGrid";
import { LoadMoreButton } from "./_components/list/LoadMoreButton";
import type { ProjectListItemDto } from "@/types/dtos/project/project.dto";
import { useGetProjectsQuery } from "@/services/project/project.service";

export default function ProjectsPage() {
  const t = useTranslations("projects");
  const locale = useLocale();

  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<ProjectListItemDto[]>([]);

  const currentUser = getCurrentUser();

  const { data, isLoading, isFetching, refetch } = useGetProjectsQuery(
    {
      scope: "mine",
      userId: currentUser?.id,
      page,
      limit: 12,
    },
    {
      skip: !loggedIn || !currentUser?.id,

      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

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

  useEffect(() => {
    if (!data) return;

    setProjects((prev) => {
      if (data.page === 1) return data.items;

      const existed = new Set(prev.map((item) => item.id));
      const next = data.items.filter((item) => !existed.has(item.id));

      return [...prev, ...next];
    });
  }, [data]);

  useEffect(() => {
    setPage(1);
    setProjects([]);
  }, [currentUser?.id]);

  const handleRefresh = () => {
    setProjects([]);

    if (page === 1) {
      void refetch();
      return;
    }

    setPage(1);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-base)]">
              {t("title")}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              {t("subtitle")}
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
      </section>

      {!authChecked ? null : !loggedIn ? (
        <CreateProjectCard isAuthenticated={false} />
      ) : isLoading && projects.length === 0 ? (
        <Loader className="mx-auto w-10 h-10 text-muted-foreground animate-spin" />
      ) : projects.length === 0 ? (
        <CreateProjectCard isAuthenticated />
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-base)]">
                {t("listTitle")}
              </h2>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {t("listDescription")}
              </p>
            </div>
          </div>

          <ProjectGrid
            projects={projects}
            emptyText={
              isFetching ? <Loader className="mx-auto" /> : t("emptyMyProjects")
            }
          />

          <LoadMoreButton
            isFetching={isFetching}
            hasNextPage={data?.hasNextPage}
            onClick={() => setPage((prev) => prev + 1)}
          />
        </section>
      )}
    </main>
  );
}
