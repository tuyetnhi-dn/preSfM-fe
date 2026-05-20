"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { getCurrentUser, isAuthenticated } from "@/lib/auth-storage";
import { useGetVideosQuery } from "@/services/video/video.service";
import { CreateProjectCard } from "./_components/CreateProjectCard";
import { ProjectVideoCard } from "./_components/ProjectVideoCard";
import Loader from "@/components/ui/loader";

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale();

  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const currentUser = getCurrentUser();

  const { data: videos = [], isLoading } = useGetVideosQuery(undefined, {
    skip: !loggedIn,
  });

  const latestVideos = useMemo(() => {
    return videos.slice(0, 5);
  }, [videos]);

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

  const uploaderName =
    currentUser?.fullName || currentUser?.email || t("unknownUploader");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink dark:text-slate-100">
          {t("title")}
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-steel dark:text-slate-300">
          {t("subtitle")}
        </p>
      </section>

      {!authChecked ? null : !loggedIn ? (
        <CreateProjectCard isAuthenticated={false} />
      ) : isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-steel dark:border-slate-800 dark:bg-bg-panel dark:text-slate-300">
          <Loader className="mx-auto" />
        </div>
      ) : latestVideos.length === 0 ? (
        <CreateProjectCard isAuthenticated />
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink dark:text-slate-100">
                {t("recentProjects")}
              </h2>

              <p className="mt-1 text-sm text-steel dark:text-slate-300">
                {t("recentProjectsDescription")}
              </p>
            </div>

            <Link
              href={`/${locale}/projects`}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
            >
              {t("createProjectButton")}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {latestVideos.map((video) => (
              <ProjectVideoCard
                key={video.id}
                video={video}
                uploaderName={uploaderName}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
