"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import Loader from "@/components/ui/loader";
import { getCurrentUser, isAuthenticated } from "@/lib/auth-storage";
import { CreateProjectCard } from "../../home/_components/CreateProjectCard";
import { ProjectGrid } from "./_components/list/ProjectGrid";
import { LoadMoreButton } from "./_components/list/LoadMoreButton";
import { ProjectListItemDto } from "@/types/dtos/project/project.dto";
import { useGetProjectsQuery } from "@/services/project/project.service";

export default function ProjectsPage() {
  const t = useTranslations("home");
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
      pollingInterval: loggedIn ? 5000 : 0,
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

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink dark:text-slate-100">
              Project của tôi
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-steel dark:text-slate-300">
              Quản lý các project đã tạo, theo dõi trạng thái pipeline và mở lại
              kết quả sau khi đăng nhập.
            </p>
          </div>

          {loggedIn ? (
            <Link
              href={`/${locale}/projects/create`}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
            >
              Tạo project mới
            </Link>
          ) : null}
        </div>
      </section>

      {!authChecked ? null : !loggedIn ? (
        <CreateProjectCard isAuthenticated={false} />
      ) : isLoading && projects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-steel dark:border-slate-800 dark:bg-bg-panel dark:text-slate-300">
          <Loader className="mx-auto" />
        </div>
      ) : projects.length === 0 ? (
        <CreateProjectCard isAuthenticated />
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink dark:text-slate-100">
                Danh sách project
              </h2>

              <p className="mt-1 text-sm text-steel dark:text-slate-300">
                Hiển thị tối đa 12 project mỗi lần. Danh sách tự cập nhật trạng
                thái pipeline mỗi 5 giây.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPage(1);
                refetch();
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-ink transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Làm mới
            </button>
          </div>

          <ProjectGrid
            projects={projects}
            emptyText={
              isFetching ? "Đang tải project..." : "Bạn chưa có project nào."
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
