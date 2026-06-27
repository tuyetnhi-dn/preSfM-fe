"use client";

import { useGetAdminProjectsQuery } from "@/services/admin/admin.service";
import {
  AdminProjectListItemDto,
  GetAdminProjectsParams,
} from "@/types/dtos/admin.dto";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FolderGit2,
  Loader2,
  Search,
} from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
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

function ProjectRow({
  project,
  locale,
}: {
  project: AdminProjectListItemDto;
  locale: string;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800">
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
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {project.owner.fullName || "Unnamed user"}
          </p>

          <p className="text-xs text-slate-500">{project.owner.email}</p>
        </div>
      </td>

      <td className="px-4 py-4">
        <VisibilityBadge visibility={project.visibility} />
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
  );
}

export default function AdminProjectsPage() {
  const locale = useLocale();

  const [searchInput, setSearchInput] = useState("");

  const [params, setParams] = useState<GetAdminProjectsParams>({
    page: 1,
    limit: 12,
    search: "",
    visibility: "all",
    status: "all",
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setParams((current) => ({
        ...current,
        search: searchInput,
        page: 1,
      }));
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError } =
    useGetAdminProjectsQuery(params);

  const setFilter = (next: Partial<GetAdminProjectsParams>) => {
    setParams((current) => ({
      ...current,
      ...next,
      page: 1,
    }));
  };

  const goToPage = (page: number) => {
    setParams((current) => ({
      ...current,
      page,
    }));
  };

  return (
    <section className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand/10 p-2 text-brand">
            <FolderGit2 className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Project Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View all projects in the system and inspect project details.
            </p>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          {data ? `${data.total} projects` : ""}
        </div>
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1.5fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by project name..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <select
          value={params.visibility ?? "all"}
          onChange={(event) =>
            setFilter({
              visibility: event.target.value,
            })
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <option value="all">All</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : isError ? (
          <div className="p-8 text-sm text-red-600">
            Unable to load projects. Please try again later.
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-8 text-sm text-slate-500">No projects found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950">
                  <tr>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Visibility</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {data.items.map((project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      locale={locale}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <span>
                  {data.page} / {data.totalPages || 1}
                </span>

                {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={data.page <= 1}
                  onClick={() => goToPage(data.page - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  disabled={!data.hasNextPage}
                  onClick={() => goToPage(data.page + 1)}
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
