"use client";

import {
  useGetAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
} from "@/services/admin/admin.service";
import {
  AdminUserListItemDto,
  GetAdminUsersParams,
} from "@/types/dtos/admin.dto";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Lock,
  Search,
  Unlock,
  Users,
} from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US");
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string | string[] } }).data;

    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(", ");
  }

  return fallback;
}

function UserStatusBadge({ status }: { status: string }) {
  const isActive = status === "active";

  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        isActive
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
          : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-700 dark:bg-blue-950 dark:text-blue-200">
      {role}
    </span>
  );
}

function UserRow({
  user,
  updatingUserId,
  onToggleStatus,
  locale: string,
}: {
  user: AdminUserListItemDto;
  updatingUserId: string | null;
  onToggleStatus: (user: AdminUserListItemDto) => void;
  locale: string;
}) {
  const isBlocked = user.status === "blocked";
  const isUpdating = updatingUserId === user.id;
  const locale = useLocale();

  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <td className="px-4 py-4">
        <div className="min-w-0">
          <p className="font-medium text-ink dark:text-slate-100">
            {user.fullName || "Unnamed user"}
          </p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </td>

      <td className="px-4 py-4">
        <RoleBadge role={user.role} />
      </td>

      <td className="px-4 py-4">
        <UserStatusBadge status={user.status} />
      </td>

      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
        {user.projectCount}
      </td>

      <td className="px-4 py-4 text-sm text-slate-500">
        {formatDate(user.createdAt)}
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/users/${user.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Eye className="h-4 w-4" />
          </Link>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onToggleStatus(user)}
            className={[
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60",
              isBlocked
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
            ].join(" ")}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isBlocked ? (
              <Unlock className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const [emailInput, setEmailInput] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const locale = useLocale();

  const [params, setParams] = useState<GetAdminUsersParams>({
    page: 1,
    limit: 12,
    email: "",
    role: "all",
    status: "all",
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setParams((current) => ({
        ...current,
        email: emailInput,
        page: 1,
      }));
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [emailInput]);

  const { data, isLoading, isFetching, isError } =
    useGetAdminUsersQuery(params);

  const [updateUserStatus] = useUpdateAdminUserStatusMutation();

  const setFilter = (next: Partial<GetAdminUsersParams>) => {
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

  const toggleUserStatus = async (user: AdminUserListItemDto) => {
    const nextStatus = user.status === "blocked" ? "active" : "blocked";

    const confirmed = window.confirm(
      nextStatus === "blocked"
        ? `Lock account ${user.email}?`
        : `Unlock account ${user.email}?`,
    );

    if (!confirmed) return;

    try {
      setUpdatingUserId(user.id);

      await updateUserStatus({
        userId: user.id,
        status: nextStatus,
      }).unwrap();

      toast.success(
        nextStatus === "blocked"
          ? "User account has been locked."
          : "User account has been unlocked.",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update account status."));
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <section className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand/10 p-2 text-brand">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold dark:text-slate-100">
              User Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Search users by email and filter by role or account status.
            </p>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          {data ? `${data.total} users` : ""}
        </div>
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            placeholder="Search by email..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <select
          value={params.role ?? "all"}
          onChange={(event) =>
            setFilter({
              role: event.target.value,
            })
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <option value="all">All</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={params.status ?? "all"}
          onChange={(event) =>
            setFilter({
              status: event.target.value,
            })
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading users...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-sm text-red-600">
            Unable to load users. Please try again later.
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-8 text-sm text-slate-500">No users found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Projects</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {data.items.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      locale={locale}
                      updatingUserId={updatingUserId}
                      onToggleStatus={toggleUserStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <span>
                  Page {data.page} / {data.totalPages || 1}
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
