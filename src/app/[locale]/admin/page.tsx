"use client";

import { useGetAdminStatsQuery } from "@/services/admin/admin.service";
import { Activity, FolderKanban, Loader2, Users, Workflow } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AdminDashboardPage() {
  const t = useTranslations("AdminDashboard");

  const { data, isLoading, isError } = useGetAdminStatsQuery();

  if (isLoading) {
    return (
      <section className="p-6 lg:p-8">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t("loading")}</span>
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="p-6 lg:p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t("errorMessage")}
        </div>
      </section>
    );
  }

  const cards = [
    {
      label: t("cards.totalUsers"),
      value: data.totalUsers,
      icon: Users,
    },
    {
      label: t("cards.totalProjects"),
      value: data.totalProjects,
      icon: FolderKanban,
    },
    {
      label: t("cards.runningPipelines"),
      value: data.runningPipelines,
      icon: Workflow,
    },
    {
      label: t("cards.failedPipelines"),
      value: data.failedPipelines,
      icon: Activity,
    },
  ];

  return (
    <section className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-slate-100">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{card.label}</p>
                <div className="rounded-xl bg-brand/10 p-2 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold dark:text-slate-100">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold dark:text-slate-100">
            {t("topUsers.title")}
          </h2>

          <div className="mt-4 space-y-3">
            {data.topUsers.length === 0 ? (
              <p className="text-sm text-slate-500">{t("topUsers.empty")}</p>
            ) : (
              data.topUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium dark:text-slate-100">
                      {user.fullName || user.email}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <div className="shrink-0 text-right text-sm">
                    <p>
                      {t("topUsers.projects", {
                        count: user.projectCount,
                      })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t("topUsers.runs", {
                        count: user.pipelineRunCount,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold dark:text-slate-100">
            {t("pipelineStatus.title")}
          </h2>

          <div className="mt-4 grid gap-3">
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
              {t("pipelineStatus.completed", {
                count: data.completedPipelines,
              })}
            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-3 text-blue-700">
              {t("pipelineStatus.running", {
                count: data.runningPipelines,
              })}
            </div>

            <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
              {t("pipelineStatus.failed", {
                count: data.failedPipelines,
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
