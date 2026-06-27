"use client";

import { useGetAdminUserDetailQuery } from "@/services/admin/admin.service";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  FolderGit2,
  Loader2,
  User,
  Video,
} from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

function getRouteParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  const isBlocked = status === "blocked";
  const isFailed = status === "failed";

  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        isActive
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
          : isBlocked || isFailed
            ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200"
            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  const isPublic = visibility === "public";

  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        isPublic
          ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      ].join(" ")}
    >
      {visibility}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-brand/10 p-2 text-brand">{icon}</div>
      </div>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const locale = useLocale();
  const params = useParams<{ id?: string | string[] }>();
  const userId = getRouteParam(params.id);

  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isFetching, isError } = useGetAdminUserDetailQuery(
    {
      userId,
      page,
      limit,
    },
    {
      skip: !userId,
    },
  );

  if (isLoading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading user detail...
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="p-6 lg:p-8">
        <Link
          href={`/${locale}/admin/users`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Unable to load user detail.
        </div>
      </section>
    );
  }

  const { user, projects } = data;

  return (
    <section className="p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href={`/${locale}/admin/users`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-brand/10 p-3 text-brand">
              <User className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {user.fullName || "Unnamed user"}
              </h1>

              <p className="mt-1 text-sm text-slate-500">{user.email}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                  {user.role}
                </span>

                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-500 dark:text-slate-400 lg:text-right">
            <p>Created: {formatDate(user.createdAt)}</p>
            <p className="mt-1">Updated: {formatDate(user.updatedAt)}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Projects"
          value={user.projectCount}
          icon={<FolderGit2 className="h-5 w-5" />}
        />

        <StatCard
          label="Failed"
          value={user.failedPipelineCount}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              User Projects
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              All projects created by this user.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {projects.total} projects
          </div>
        </div>

        {projects.items.length === 0 ? (
          <div className="p-8 text-sm text-slate-500">No projects found.</div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950">
                  <tr>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Visibility</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.items.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800 "
                    >
                      <td className="px-4 py-4">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {project.name}
                          </p>
                          <p className="line-clamp-1 text-xs text-slate-500">
                            {project.description || "No description"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <VisibilityBadge visibility={project.visibility} />
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={project.status} />
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-500">
                        {formatDate(project.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        <Link
                          href={`/${locale}/admin/projects/${project.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <span>
                  Page {projects.page} / {projects.totalPages || 1}
                </span>
                {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={projects.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  disabled={!projects.hasNextPage}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
