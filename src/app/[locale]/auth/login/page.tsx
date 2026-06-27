"use client";

import { PasswordField } from "@/components/PasswordInput";
import Loader from "@/components/ui/loader";
import { setAuthStorage } from "@/lib/auth-storage";
import { useLoginMutation } from "@/services/auth/auth.service";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

type LoginErrors = {
  email?: string;
  password?: string;
  form?: string;
};

function getErrorMessage(error: unknown): string {
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

  return "Login failed. Please try again.";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isManagementRole(role?: string) {
  return role === "admin" || role === "manager";
}

function getSafeRedirect(input: {
  redirect: string | null;
  fallback: string;
  locale: string;
  role?: string;
}) {
  const { redirect, fallback, locale, role } = input;

  if (!redirect) return fallback;

  if (!redirect.startsWith("/")) return fallback;
  if (redirect.startsWith("//")) return fallback;

  const localePrefix = `/${locale}`;

  if (!redirect.startsWith(`${localePrefix}/`)) {
    return fallback;
  }

  if (redirect.startsWith(`${localePrefix}/auth`)) {
    return fallback;
  }

  const isRedirectToAdminPage =
    redirect === `${localePrefix}/admin` ||
    redirect.startsWith(`${localePrefix}/admin/`);

  if (isRedirectToAdminPage && !isManagementRole(role)) {
    return `/${locale}/home`;
  }

  return redirect;
}

function LoginPageContent() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loginMutate, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<LoginErrors>({});

  const validateForm = () => {
    const nextErrors: LoginErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextErrors.email = t("emailRequired");
    } else if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = t("emailInvalid");
    }

    if (!password) {
      nextErrors.password = t("passwordRequired");
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
      const res = await loginMutate({
        email: email.trim(),
        password,
      }).unwrap();

      setAuthStorage({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
      });

      const redirect = searchParams.get("redirect");

      const fallbackPath = isManagementRole(res.user?.role)
        ? `/${locale}/admin`
        : `/${locale}/home`;

      const targetPath = getSafeRedirect({
        redirect,
        fallback: fallbackPath,
        locale,
        role: res.user?.role,
      });

      router.replace(targetPath);
      console.log("TOKEN AFTER SAVE", localStorage.getItem("accessToken"));
    } catch (error) {
      setErrors({
        form: getErrorMessage(error),
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-md card p-6 sm:p-8">
      <h1 className="text-2xl font-semibold dark:text-slate-100">
        {t("loginTitle")}
      </h1>

      <p className="mt-2 text-sm text-steel dark:text-slate-300">
        {t("loginSubtitle")}
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({
                ...current,
                email: undefined,
                form: undefined,
              }));
            }}
            placeholder={t("email")}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className={[
              "w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none dark:bg-slate-900 dark:text-slate-100",
              errors.email
                ? "border-red-500 focus:border-red-500"
                : "border-slate-300 focus:border-ocean dark:border-slate-700",
            ].join(" ")}
          />

          {errors.email && (
            <p id="login-email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <PasswordField
          id="login-password"
          value={password}
          onValueChange={(value) => {
            setPassword(value);
            setErrors((current) => ({
              ...current,
              password: undefined,
              form: undefined,
            }));
          }}
          placeholder={t("password")}
          error={errors.password}
          autoComplete="current-password"
          className="rounded-xl bg-white px-4 py-3 pr-11 text-ink focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />

        {errors.form && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.form}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-center font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand"
        >
          {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : t("login")}
        </button>
      </form>

      <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-steel dark:text-slate-300">
        <span>{t("newUser")}</span>

        <Link
          href={`/${locale}/auth/register`}
          className="font-medium text-ocean"
        >
          {t("registerWithOtp")}
        </Link>

        <span className="text-slate-300 dark:text-slate-600">|</span>

        <Link
          href={`/${locale}/auth/forgot-password`}
          className="font-medium text-ocean"
        >
          {t("forgotPassword")}
        </Link>
      </p>
    </div>
  );
}
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
