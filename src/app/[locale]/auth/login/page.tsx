"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { useLoginMutation } from "@/services/auth/auth.service";

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

  return "Đã xảy ra lỗi khi đăng nhập.";
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const [loginMutate, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError("");

    try {
      const res = await loginMutate({
        email,
        password,
      }).unwrap();

      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.user));

      window.dispatchEvent(new Event("auth-changed"));

      router.push(`/${locale}/projects`);
    } catch (error) {
      setLoginError(getErrorMessage(error));
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

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("email")}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />

        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("password")}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />

        {loginError ? (
          <p className="text-sm text-red-600">{loginError}</p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-brand dark:bg-brand px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {isLoading ? t("signingIn") : t("login")}
        </button>
      </form>

      <p className="mt-4 text-sm text-steel dark:text-slate-300">
        {t("newUser")}{" "}
        <Link
          href={`/${locale}/auth/register`}
          className="font-medium text-ocean"
        >
          {t("registerWithOtp")}
        </Link>
      </p>
    </div>
  );
}
