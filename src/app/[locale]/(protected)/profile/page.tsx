"use client";

import Loader from "@/components/ui/loader";
import { isAuthenticated } from "@/lib/auth-storage";
import {
  useGetMeQuery,
  useUpdateProfileMutation,
} from "@/services/auth/auth.service";
import { CalendarDays, KeyRound, Mail, Shield, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ProfileErrors = {
  fullName?: string;
  form?: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;

    if (typeof data === "object" && data !== null) {
      const message = (data as { message?: unknown }).message;
      const errorMessage = (data as { error?: unknown }).error;

      if (typeof message === "string") return message;
      if (Array.isArray(message)) return message.join(", ");
      if (typeof errorMessage === "string") return errorMessage;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function getInitials(fullName?: string | null, email?: string) {
  const name = fullName?.trim();

  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  return email?.slice(0, 2).toUpperCase() ?? "U";
}

function formatDate(value: string | undefined, locale: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<ProfileErrors>({});

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/${locale}/auth/login?redirect=/${locale}/profile`);
      return;
    }

    setAuthChecked(true);
  }, [locale, router]);

  const {
    data: user,
    isLoading: isUserLoading,
    isFetching,
    error: userError,
  } = useGetMeQuery(undefined, {
    skip: !authChecked,
  });

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "");
    }
  }, [user]);

  useEffect(() => {
    if (!userError) return;

    const status =
      typeof userError === "object" &&
      userError !== null &&
      "status" in userError
        ? userError.status
        : undefined;

    if (status === 401 || status === 403) {
      // User is not authorized, redirect to login page
    }
  }, [locale, router, userError]);

  const initials = useMemo(
    () => getInitials(user?.fullName, user?.email),
    [user?.fullName, user?.email],
  );

  const hasChanged = fullName.trim() !== (user?.fullName ?? "").trim();

  const validateForm = () => {
    const nextErrors: ProfileErrors = {};
    const normalizedFullName = fullName.trim();

    if (!normalizedFullName) {
      nextErrors.fullName = t("fullNameRequired");
    } else if (normalizedFullName.length > 100) {
      nextErrors.fullName = t("fullNameTooLong");
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      await updateProfile({
        fullName: fullName.trim(),
      }).unwrap();

      toast.success(t("updateSuccess"));
    } catch (error) {
      const message = getErrorMessage(error, t("updateFailed"));

      setErrors({
        form: message,
      });

      toast.error(message);
    }
  };

  if (!authChecked || isUserLoading) {
    return (
      <section className="mx-auto max-w-4xl p-6 sm:p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
            <Loader className="h-4 w-4 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-4xl p-6 sm:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {t("loadFailed")}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl p-6 sm:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink dark:text-slate-100">
            {t("title")}
          </h1>

          <p className="mt-2 text-sm text-steel dark:text-slate-300">
            {t("subtitle")}
          </p>
        </div>

        <Link
          href={`/${locale}/profile/change-password`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <KeyRound className="h-4 w-4" />
          {t("changePassword")}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand text-3xl font-bold text-white">
              {initials}
            </div>

            <h2 className="mt-4 text-xl font-semibold text-ink dark:text-slate-100">
              {user.fullName || t("unnamedUser")}
            </h2>

            <p className="mt-1 break-all text-sm text-steel dark:text-slate-300">
              {user.email}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                {user.role || "user"}
              </span>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                {user.status || "active"}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
              <Mail className="h-4 w-4 text-slate-500" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{t("email")}</p>
                <p className="truncate font-medium text-ink dark:text-slate-100">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
              <Shield className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">{t("role")}</p>
                <p className="font-medium text-ink dark:text-slate-100">
                  {user.role || "user"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">{t("createdAt")}</p>
                <p className="font-medium text-ink dark:text-slate-100">
                  {formatDate(user.createdAt, locale)}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-ink dark:text-slate-100">
                {t("profileInfo")}
              </h2>
              <p className="text-sm text-steel dark:text-slate-300">
                {t("profileInfoDescription")}
              </p>
            </div>
          </div>

          {errors.form && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.form}
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
                {t("userId")}
              </label>

              <input
                value={user.id}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
                {t("email")}
              </label>

              <input
                value={user.email}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div>
              <label
                htmlFor="profile-full-name"
                className="mb-2 block text-sm font-medium text-ink dark:text-slate-100"
              >
                {t("fullName")}
              </label>

              <input
                id="profile-full-name"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  setErrors((current) => ({
                    ...current,
                    fullName: undefined,
                    form: undefined,
                  }));
                }}
                placeholder={t("fullNamePlaceholder")}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={
                  errors.fullName ? "profile-full-name-error" : undefined
                }
                className={[
                  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink outline-none dark:bg-slate-950 dark:text-slate-100",
                  errors.fullName
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-brand dark:border-slate-700",
                ].join(" ")}
              />

              {errors.fullName && (
                <p
                  id="profile-full-name-error"
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
                  {t("role")}
                </label>

                <input
                  value={user.role || "user"}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
                  {t("status")}
                </label>

                <input
                  value={user.status || "active"}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setFullName(user.fullName ?? "")}
                disabled={isSaving || !hasChanged}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {t("reset")}
              </button>

              <button
                type="submit"
                disabled={isSaving || isFetching || !hasChanged}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving && <Loader className="h-4 w-4 animate-spin" />}
                <span>{t("save")}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
